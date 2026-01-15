// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_time: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_time: string;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  reminder_time?: string;
  is_completed?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_URL}/api/${API_VERSION}${endpoint}`, {
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
    return data.data;
  },

  // Update reminder
  async update(
    token: string,
    id: number,
    updates: UpdateReminderData
  ): Promise<Reminder> {
    const data = await fetchWithAuth(`/reminders/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data;
  },

  // Delete reminder
  async delete(token: string, id: number): Promise<void> {
    await fetchWithAuth(`/reminders/${id}`, token, {
      method: "DELETE",
    });
  },
};
