import { NotificationProvider } from './notification.provider';
import { NotificationContext, NotificationProviderType } from '../notification.types';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

export class EmailNotificationProvider extends NotificationProvider {
  name = NotificationProviderType.EMAIL;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    super();
    this.initializeTransporter();
  }

  initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Only create transporter if all required config is present
    if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
      try {
        this.transporter = nodemailer.createTransport(emailConfig);
        this.log('success', 'Email transporter initialized successfully');
      } catch (error) {
        this.log('error', 'Failed to initialize email transporter:', error);
      }
    } else {
      this.log(
        'info',
        'Email provider not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.'
      );
    }
  }

  async send(context: NotificationContext): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    const formattedDate = dayjs(context.scheduled_at).format('MMMM D, YYYY [at] h:mm A');

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: context.user_email,
      subject: `⏰ Reminder: ${context.title}`,
      html: this.buildEmailTemplate(context, formattedDate),
      text: this.buildTextEmail(context, formattedDate),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.log('success', `Email sent to ${context.user_email}`, `Message ID: ${info.messageId}`);
    } catch (error) {
      this.log('error', `Failed to send email to ${context.user_email}:`, error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  private buildEmailTemplate(context: NotificationContext, formattedDate: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      margin: 0;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #667eea;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .icon-wrapper {
      background-color: rgba(255, 255, 255, 0.2);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      backdrop-filter: blur(10px);
      border: 3px solid rgba(255, 255, 255, 0.3);
    }
    .icon {
      font-size: 40px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    .reminder-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }
    .reminder-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    }
    .reminder-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 16px 0;
      padding-left: 20px;
    }
    .description {
      color: #4a5568;
      margin: 0 0 20px 0;
      line-height: 1.7;
      font-size: 15px;
      padding-left: 20px;
    }
    .time-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
      margin-left: 20px;
    }
    .time-icon {
      font-size: 16px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 30px 0;
    }
    .info-box {
      background-color: #f7fafc;
      border-left: 3px solid #667eea;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .info-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-content {
      font-size: 14px;
      color: #4a5568;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      color: #718096;
      font-size: 13px;
      margin: 0 0 12px 0;
      line-height: 1.6;
    }
    .footer-brand {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
      font-size: 14px;
    }
    .footer-links {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-link {
      color: #a0aec0;
      text-decoration: none;
      font-size: 12px;
      margin: 0 12px;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      .header {
        padding: 30px 20px;
      }
      .title {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .reminder-title {
        font-size: 20px;
      }
      .time-badge {
        padding: 10px 16px;
        font-size: 13px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header"> 
        <h1 class="title">H-Reminders</h1>
        <p class="subtitle">You have an upcoming reminder</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <!-- Reminder Card -->
        <div class="reminder-card">
          <h2 class="reminder-title">${context.title}</h2>
          ${
            context.description
              ? `<p class="description">${context.description.replace(/\n/g, '<br>')}</p>`
              : ''
          }
          <div class="time-badge">
            <span class="time-icon">📅</span>
            <span>${formattedDate}</span>
          </div>
        </div>
        
        
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          This is an automated reminder notification from<br>
          <a href="#" class="footer-brand">H-Reminders</a>
        </p>
        <p class="footer-text" style="font-size: 12px; color: #a0aec0;">
          You're receiving this because you set up a reminder in your account.
        </p>
     
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private buildTextEmail(context: NotificationContext, formattedDate: string): string {
    return `
╔════════════════════════════════════════════════════════════════╗
║                      ⏰ REMINDER ALERT                         ║
║                  You have an upcoming reminder                 ║
╚════════════════════════════════════════════════════════════════╝

📌 REMINDER TITLE:
${context.title}

${context.description ? `📝 DESCRIPTION:\n${context.description}\n` : ''}
📅 SCHEDULED FOR:
${formattedDate}

─────────────────────────────────────────────────────────────────

👤 REMINDER DETAILS:
• Recipient: ${context.user_name || context.user_email}
• Status: ● Active

─────────────────────────────────────────────────────────────────

This is an automated reminder notification from Reminders App.
You're receiving this because you set up a reminder in your account.

Manage Reminders | Settings | Help
    `.trim();
  }
}
