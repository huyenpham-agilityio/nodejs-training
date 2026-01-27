/**
 * Data Transfer Objects for Reminder endpoints
 */

export interface CreateReminder {
  title: string;
  description?: string;
  scheduled_at: Date | string;
}

export interface UpdateReminder {
  title?: string;
  description?: string;
  scheduled_at?: Date | string;
}

export interface UserData {
  email: string;
  name: string;
}

export interface ReminderResponse {
  id: number;
  title: string;
  description: string;
  scheduled_at: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReminderStats {
  total: number;
  active: number;
  completed: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  reminders: T[];
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
