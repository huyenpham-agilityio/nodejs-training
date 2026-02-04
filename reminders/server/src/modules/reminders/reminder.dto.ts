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
  is_completed?: boolean;
}

export interface ReminderResponseDTO {
  id: number;
  title: string;
  description: string;
  scheduled_at: Date;
  status: string;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReminderStatsDTO {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}
