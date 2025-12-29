import { Model, Optional } from 'sequelize';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface UserCreation extends Optional<IUser, 'id'> {}

export interface UserInstance extends Model<IUser, UserCreation>, IUser {
  validatePassword(password: string): Promise<boolean>;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
