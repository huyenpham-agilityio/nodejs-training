import { NotificationProvider } from './notification.provider';
import { NotificationContext } from '../notification.types';
import dayjs from 'dayjs';
import { WebClient } from '@slack/web-api';

export class SlackNotificationProvider extends NotificationProvider {
  name = 'slack';
  private client: WebClient | null = null;
  private channelId: string | null = null;

  constructor() {
    super();
    this.initializeClient();
  }

  initializeClient() {
    const token = process.env.SLACK_BOT_TOKEN;
    this.channelId = process.env.SLACK_CHANNEL_ID || null;

    if (token && this.channelId) {
      try {
        this.client = new WebClient(token);
        this.log('success', 'Slack client initialized successfully');
      } catch (error) {
        this.log('error', 'Failed to initialize Slack client:', error);
      }
    } else {
      this.log(
        'info',
        'Slack provider not configured. Set SLACK_BOT_TOKEN and SLACK_CHANNEL_ID environment variables.'
      );
    }
  }

  async send(context: NotificationContext): Promise<void> {
    if (!this.client || !this.channelId) {
      throw new Error('Slack client not configured');
    }

    const formattedDate = dayjs(context.scheduled_at).format('MMMM D, YYYY [at] h:mm A');

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⏰ Reminder',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Title:*\n${context.title}`,
          },
          {
            type: 'mrkdwn',
            text: `*Scheduled:*\n${formattedDate}`,
          },
        ],
      },
      ...(context.description
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Description:*\n${context.description}`,
              },
            },
          ]
        : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `From: ${context.user_name} (${context.user_email})`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Reminder ID: #${context.reminder_id}`,
          },
        ],
      },
    ];

    try {
      const result = await this.client.chat.postMessage({
        channel: this.channelId,
        text: `⏰ Reminder: ${context.title}`, // Fallback text for notifications
        blocks: blocks,
      });

      if (result.ok) {
        this.log('success', `Slack notification sent for reminder #${context.reminder_id}`);
      } else {
        throw new Error(`Slack API error: ${result.error}`);
      }
    } catch (error) {
      this.log('error', `Failed to send Slack notification:`, error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.channelId !== null;
  }
}
