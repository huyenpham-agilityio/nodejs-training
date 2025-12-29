import { Optional } from 'sequelize';

export interface IComment {
  id: number;
  content: string;
  postId: number;
  userId: number;
}

export interface CommentCreation extends Optional<IComment, 'id'> {}

export interface CreateCommentRequest {
  content: string;
  postId: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
