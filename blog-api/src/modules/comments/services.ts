import Comment from './model';
import User from '@/modules/users/model';
import { CreateCommentRequest, UpdateCommentRequest, CommentResponse } from './types';

export class CommentService {
  private commentModel: typeof Comment;

  constructor(commentModel?: typeof Comment) {
    this.commentModel = commentModel || Comment;
  }

  async getAllComments(postId?: number): Promise<CommentResponse[]> {
    const whereClause = postId ? { postId } : {};

    const comments = await this.commentModel.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return comments.map((comment) => comment.toJSON());
  }

  async getCommentById(commentId: number): Promise<CommentResponse | null> {
    const comment = await this.commentModel.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    return comment ? comment.toJSON() : null;
  }

  async getAllCommentsByPost(postId: number): Promise<CommentResponse[]> {
    return this.getAllComments(postId);
  }

  async createComment(
    postId: number,
    userId: number,
    data: CreateCommentRequest,
  ): Promise<CommentResponse> {
    const comment = await this.commentModel.create({
      content: data.content,
      postId,
      userId,
    });

    return comment.toJSON();
  }

  async updateComment(
    commentId: number,
    userId: number,
    data: UpdateCommentRequest,
  ): Promise<CommentResponse | null> {
    const comment = await this.commentModel.findOne({
      where: { id: commentId, userId },
    });

    if (!comment) {
      return null;
    }

    await comment.update(data);
    return comment.toJSON();
  }

  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      where: { id: commentId, userId },
    });

    if (!comment) {
      return false;
    }

    await comment.destroy();
    return true;
  }

  async deleteAllCommentsByPost(postId: number, userId: number): Promise<number> {
    // Only delete comments that belong to the user
    const count = await this.commentModel.destroy({ where: { postId, userId } });
    return count;
  }
}
