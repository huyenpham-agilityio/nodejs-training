import { isValidEmail, isValidPassword } from '../validations';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email address', () => {
      const validEmails = 'test@example.com';

      expect(isValidEmail(validEmails)).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@.com',
        'invalid@domain',
        'invalid @example.com',
        'invalid@exam ple.com',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should return false for emails with only whitespace', () => {
      expect(isValidEmail('   ')).toBe(false);
    });

    it('should return false for emails with leading or trailing spaces', () => {
      expect(isValidEmail(' test@example.com')).toBe(false);
      expect(isValidEmail('test@example.com ')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    describe('with default minimum length (6)', () => {
      it('should return true for passwords with 6 or more characters', () => {
        expect(isValidPassword('Pass123!')).toBe(true);
        expect(isValidPassword('123456')).toBe(true);
      });

      it('should return false for passwords with less than 6 characters', () => {
        expect(isValidPassword('12345')).toBe(false);
      });
    });

    describe('with custom minimum length', () => {
      it('should return true for passwords meeting custom minimum length', () => {
        expect(isValidPassword('12345678', 8)).toBe(true);
        expect(isValidPassword('password123', 10)).toBe(true);
        expect(isValidPassword('abc', 3)).toBe(true);
      });

      it('should return false for passwords not meeting custom minimum length', () => {
        expect(isValidPassword('1234567', 8)).toBe(false);
      });
    });

    it('should handle passwords with special characters', () => {
      expect(isValidPassword('P@ssw0rd!')).toBe(true);
      expect(isValidPassword('test#123$%')).toBe(true);
      expect(isValidPassword('!@#$%^')).toBe(true);
    });

    it('should handle passwords with spaces', () => {
      expect(isValidPassword('pass word')).toBe(true);
      expect(isValidPassword('      ')).toBe(true);
    });

    it('should handle passwords with unicode characters', () => {
      expect(isValidPassword('café123')).toBe(true);
    });
  });
});
