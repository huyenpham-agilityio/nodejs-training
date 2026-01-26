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

export interface PaginationParams {
  page?: number;
  limit?: number;
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
