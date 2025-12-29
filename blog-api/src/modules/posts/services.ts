import Post from './model';
import Comment from '@/modules/comments/model';
import User from '@/modules/users/model';
import { CreatePostRequest, UpdatePostRequest, PostResponse } from './types';

export class PostService {
  private postModel: typeof Post;

  constructor(postModel?: typeof Post) {
    this.postModel = postModel || Post;
  }

  async getAllPosts(userId?: number): Promise<PostResponse[]> {
    const whereClause = userId ? { userId } : {};

    const posts = await this.postModel.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'userId', 'createdAt'],
        },
      ],
    });

    return posts.map((post) => post.toJSON());
  }

  async getPostById(postId: number): Promise<PostResponse | null> {
    const post = await this.postModel.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'userId', 'createdAt'],
        },
      ],
    });

    return post ? post.toJSON() : null;
  }

  async getAllPostsByUser(userId: number): Promise<PostResponse[]> {
    return this.getAllPosts(userId);
  }

  async createPost(userId: number, data: CreatePostRequest): Promise<PostResponse> {
    const post = await this.postModel.create({
      ...data,
      userId,
    });

    return post.toJSON();
  }

  async updatePost(
    postId: number,
    userId: number,
    data: UpdatePostRequest,
  ): Promise<PostResponse | null> {
    const post = await this.postModel.findOne({
      where: { id: postId, userId },
    });

    if (!post) {
      return null;
    }

    await post.update(data);
    return post.toJSON();
  }

  async deletePost(postId: number, userId: number): Promise<boolean> {
    const post = await this.postModel.findOne({
      where: { id: postId, userId },
    });

    if (!post) {
      return false;
    }

    await post.destroy();
    return true;
  }

  async deleteAllPostsByUser(userId: number): Promise<number> {
    const count = await this.postModel.destroy({ where: { userId } });
    return count;
  }
}
