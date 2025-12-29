/**
 * Check if a value is a valid email
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a value is a valid password (minimum length)
 * @param password - Password string to validate
 * @param minLength - Minimum password length (default: 6)
 * @returns True if valid password
 */
export const isValidPassword = (password: string, minLength = 6): boolean => {
  return password && password.length >= minLength;
};
