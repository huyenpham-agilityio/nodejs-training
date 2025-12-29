declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      createdAt: Date;
      updatedAt: Date;
      validatePassword(password: string): Promise<boolean>;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
