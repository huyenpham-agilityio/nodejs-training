export const MESSAGES = {
  // Common messages
  UNAUTHORIZED: 'Unauthorized',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_ID: 'Invalid ID',

  // Auth messages
  AUTH: {
    SIGNUP_REQUIRED_FIELDS: 'Username, email, and password are required',
    SIGNIN_REQUIRED_FIELDS: 'Email and password are required',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_EMAIL: 'Invalid email format',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
    INVALID_EMAIL_UPDATE: 'Invalid email format',
  },

  // User messages
  USER: {
    INVALID_ID: 'Invalid user ID',
    NOT_FOUND: 'User not found',
    RETRIEVE_FAILED: 'Failed to retrieve users',
    RETRIEVE_ONE_FAILED: 'Failed to retrieve user',
    UPDATE_FAILED: 'Failed to update user',
    DELETE_FAILED: 'Failed to delete user',
    DELETE_ALL_FAILED: 'Failed to delete users',
    DELETED_SUCCESS: (count: number) => `Deleted ${count} users`,
  },

  // Post messages
  POST: {
    INVALID_ID: 'Invalid post ID',
    REQUIRED_FIELDS: 'Title and content are required',
    NOT_FOUND: 'Post not found or you do not have permission to update it',
    NOT_FOUND_DELETE: 'Post not found or you do not have permission to delete it',
    RETRIEVE_FAILED: 'Failed to retrieve posts',
    CREATE_FAILED: 'Failed to create post',
    UPDATE_FAILED: 'Failed to update post',
    DELETE_FAILED: 'Failed to delete post',
    DELETE_ALL_FAILED: 'Failed to delete posts',
    DELETED_SUCCESS: (count: number) => `Deleted ${count} posts`,
  },

  // Comment messages
  COMMENT: {
    INVALID_ID: 'Invalid comment ID',
    REQUIRED_FIELDS: 'Content and postId are required',
    NOT_FOUND: 'Comment not found or you do not have permission to update it',
    NOT_FOUND_DELETE: 'Comment not found or you do not have permission to delete it',
    RETRIEVE_FAILED: 'Failed to retrieve comments',
    CREATE_FAILED: 'Failed to create comment',
    UPDATE_FAILED: 'Failed to update comment',
    DELETE_FAILED: 'Failed to delete comment',
    DELETE_ALL_FAILED: 'Failed to delete comments',
    DELETED_SUCCESS: (count: number) => `Deleted ${count} comments`,
  },
} as const;
