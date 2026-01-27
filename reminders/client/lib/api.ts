// API configuration
import { API_BASE_URL, ENDPOINTS } from "@/constants/endpoints";

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  scheduled_at: string;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  scheduled_at?: string;
}

export interface User {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {},
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new ApiError(response.status, error.message || "Request failed");
  }

  return response.json();
}

export const reminderApi = {
  // Get all reminders with optional filters
  async getAll(
    token: string,
    search?: string,
    status?: string,
  ): Promise<Reminder[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.REMINDERS.BASE}?${queryString}`
      : ENDPOINTS.REMINDERS.BASE;

    const data = await fetchWithAuth(endpoint, token);
    return data.data?.reminders || [];
  },

  // Get reminders with pagination
  async getAllPaginated(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ reminders: Reminder[]; pagination: PaginationMetadata }> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const endpoint = `${ENDPOINTS.REMINDERS.BASE}?${params.toString()}`;
    const data = await fetchWithAuth(endpoint, token);

    return {
      reminders: data.data?.reminders || [],
      pagination: data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  // Get reminder by ID
  async getById(token: string, id: number): Promise<Reminder> {
    const data = await fetchWithAuth(ENDPOINTS.REMINDERS.BY_ID(id), token);
    return data.data;
  },

  // Create reminder
  async create(token: string, reminder: CreateReminderData): Promise<Reminder> {
    const data = await fetchWithAuth(ENDPOINTS.REMINDERS.BASE, token, {
      method: "POST",
      body: JSON.stringify(reminder),
    });
    return data.data?.reminder || data.data;
  },

  // Update reminder
  async update(
    token: string,
    id: number,
    updates: UpdateReminderData,
  ): Promise<Reminder> {
    const data = await fetchWithAuth(ENDPOINTS.REMINDERS.BY_ID(id), token, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data?.reminder || data.data;
  },

  // Get statistics
  async getStats(token: string): Promise<{
    total: number;
    active: number;
    completed: number;
  }> {
    const data = await fetchWithAuth(ENDPOINTS.REMINDERS.STATS, token);
    return data.data?.stats || data.data;
  },

  // Delete reminder
  async delete(token: string, id: number): Promise<void> {
    await fetchWithAuth(ENDPOINTS.REMINDERS.BY_ID(id), token, {
      method: "DELETE",
    });
  },
};

export const userApi = {
  // Get current user profile
  async getMe(token: string): Promise<User> {
    const data = await fetchWithAuth(ENDPOINTS.USERS.ME, token);
    return data.data?.user || data.data;
  },

  // Update user profile
  async updateProfile(token: string, updates: UpdateUserData): Promise<User> {
    const data = await fetchWithAuth(ENDPOINTS.USERS.ME, token, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data?.user || data.data;
  },
};
