import jwt from 'jwt-simple';
import User from '@/modules/users/model';
import { appConfig } from '@/configs/appConfig';
import { SignUpRequest, SignInRequest, AuthResponse } from './types';
import { MESSAGES } from '@/constants/messages';
import { isValidEmail, isValidPassword } from '@/utils/validations';

export class AuthService {
  async signUp(payload: SignUpRequest): Promise<AuthResponse> {
    // Validate email format
    if (!isValidEmail(payload.email)) {
      throw new Error(MESSAGES.AUTH.INVALID_EMAIL);
    }

    // Validate password strength
    if (!isValidPassword(payload.password)) {
      throw new Error(MESSAGES.AUTH.WEAK_PASSWORD);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: payload.email } });
    if (existingUser) {
      throw new Error(MESSAGES.AUTH.USER_ALREADY_EXISTS);
    }

    // Create new user
    const user = await User.create(payload);

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Validate password
    const isValidPassword = await user.validatePassword(data.password);
    if (!isValidPassword) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  generateToken(userId: number): string {
    const payload = {
      id: userId,
      iat: Math.floor(Date.now() / 1000),
    };
    return jwt.encode(payload, appConfig.jwtSecret);
  }

  decodeToken(token: string): { id: number; iat: number } {
    return jwt.decode(token, appConfig.jwtSecret);
  }
}
