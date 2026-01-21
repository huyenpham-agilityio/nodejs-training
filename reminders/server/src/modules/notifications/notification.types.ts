export interface NotificationContext {
  reminder_id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  description?: string;
  scheduled_at: Date;
}

export interface NotificationJobData {
  reminder_id: number;
  user_id: number;
  title: string;
  scheduled_at: Date;
  attempts?: number;
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  error?: string;
}
