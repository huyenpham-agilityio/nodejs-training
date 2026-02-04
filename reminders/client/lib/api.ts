// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";

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
  const response = await fetch(`${API_URL}${endpoint}`, {
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
  // Get all reminders
  async getAll(token: string): Promise<Reminder[]> {
    const data = await fetchWithAuth("/reminders", token);
    return data.data?.reminders || [];
  },

  // Get reminder by ID
  async getById(token: string, id: number): Promise<Reminder> {
    const data = await fetchWithAuth(`/reminders/${id}`, token);
    return data.data;
  },

  // Create reminder
  async create(token: string, reminder: CreateReminderData): Promise<Reminder> {
    const data = await fetchWithAuth("/reminders", token, {
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
    const data = await fetchWithAuth(`/reminders/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data?.reminder || data.data;
  },

  // Toggle reminder completion
  async toggleComplete(token: string, id: number): Promise<Reminder> {
    const data = await fetchWithAuth(`/reminders/${id}/toggle`, token, {
      method: "PATCH",
    });
    return data.data?.reminder || data.data;
  },

  // Get statistics
  async getStats(token: string): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  }> {
    const data = await fetchWithAuth("/reminders/stats", token);
    return data.data?.stats || data.data;
  },

  // Delete reminder
  async delete(token: string, id: number): Promise<void> {
    await fetchWithAuth(`/reminders/${id}`, token, {
      method: "DELETE",
    });
  },
};

export const userApi = {
  // Get current user profile
  async getMe(token: string): Promise<User> {
    const data = await fetchWithAuth("/users/me", token);
    return data.data?.user || data.data;
  },

  // Update user profile
  async updateProfile(token: string, updates: UpdateUserData): Promise<User> {
    const data = await fetchWithAuth("/users/me", token, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data?.user || data.data;
  },
};
