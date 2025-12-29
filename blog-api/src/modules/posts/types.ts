import { Optional } from 'sequelize';

export interface IPost {
  id: number;
  title: string;
  content: string;
  userId: number;
}

export interface PostCreation extends Optional<IPost, 'id'> {}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
