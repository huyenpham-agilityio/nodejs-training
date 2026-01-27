// API Base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Reminder endpoints
export const REMINDER_ENDPOINTS = {
  BASE: "/reminders",
  BY_ID: (id: number) => `/reminders/${id}`,
  STATS: "/reminders/stats",
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  ME: "/users/me",
} as const;

// All endpoints combined
export const ENDPOINTS = {
  REMINDERS: REMINDER_ENDPOINTS,
  USERS: USER_ENDPOINTS,
} as const;
