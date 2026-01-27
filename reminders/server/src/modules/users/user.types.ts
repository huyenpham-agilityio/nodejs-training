export interface UpdateNotificationPreferences {
  email_notifications_enabled?: boolean;
  slack_notifications_enabled?: boolean;
}

export interface UserProfile {
  id: number;
  clerk_user_id: string;
  name: string;
  email: string;
  email_notifications_enabled: boolean;
  slack_notifications_enabled: boolean;
  console_notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
