/**
 * Data Transfer Objects for Reminder endpoints
 */

export interface CreateReminderDTO {
  title: string;
  description?: string;
  scheduled_at: Date | string;
}

export interface UpdateReminderDTO {
  title?: string;
  description?: string;
  scheduled_at?: Date | string;
  status?: string;
}

export interface ReminderResponseDTO {
  id: number;
  title: string;
  description: string;
  scheduled_at: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReminderStatsDTO {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}
