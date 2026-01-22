export const MESSAGES = {
  // Common messages
  UNAUTHORIZED: 'Unauthorized',
  UNAUTHORIZED_NO_USER_ID: 'Unauthorized - No user ID provided',
  UNAUTHORIZED_AUTH_REQUIRED: 'Unauthorized - Authentication required',
  INTERNAL_SERVER_ERROR: 'Internal server error',

  // Success messages
  SERVER_HEALTHY: 'Server is healthy',
  REMINDER_DELETED_SUCCESS: 'Reminder deleted successfully',

  // Error messages - Reminders
  FAILED_FETCH_REMINDERS: 'Failed to fetch reminders',
  FAILED_FETCH_REMINDER: 'Failed to fetch reminder',
  FAILED_CREATE_REMINDER: 'Failed to create reminder',
  FAILED_UPDATE_REMINDER: 'Failed to update reminder',
  FAILED_DELETE_REMINDER: 'Failed to delete reminder',
  FAILED_FETCH_STATISTICS: 'Failed to fetch statistics',
  REMINDER_NOT_FOUND: 'Reminder not found or access denied',
  REMINDER_TITLE_SCHEDULED_REQUIRED: 'Title and scheduled_at are required',
  REMINDER_FUTURE_DATE_REQUIRED: 'scheduled_at must be a future date and time',

  // Error messages - Users
  FAILED_FETCH_USER_PROFILE: 'Failed to fetch user profile',
  FAILED_FETCH_USER_INFO: 'Failed to fetch user information',
  USER_EMAIL_NOT_FOUND: 'User email not found in Clerk',
  USER_NOT_FOUND: 'User not found',
  FAILED_UPDATE_USER: 'Failed to update user',

  // Error messages - Routes
  ROUTE_NOT_FOUND: 'Route not found',
} as const;
