import User from './model';
import Post from '@/modules/posts/model';
import Comment from '@/modules/comments/model';
import { UpdateUserRequest, UserResponse } from './types';
import { isValidEmail } from '@/utils/validations';
import { MESSAGES } from '@/constants/messages';

export class UserService {
  private userModel: typeof User;

  constructor(userModel?: typeof User) {
    this.userModel = userModel || User;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userModel.findAll({
      attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    });
    return users.map((user) => user.toJSON());
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await this.userModel.findByPk(id, {
      attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'content', 'createdAt'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'postId', 'createdAt'],
        },
      ],
    });

    return user ? user.toJSON() : null;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse | null> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      return null;
    }

    // Validate email format if email is being updated
    if (data.email && !isValidEmail(data.email)) {
      throw new Error(MESSAGES.AUTH.INVALID_EMAIL_UPDATE);
    }

    await user.update(data);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      return false;
    }

    await user.destroy();
    return true;
  }

  async deleteAllUsers(): Promise<number> {
    const count = await this.userModel.destroy({ where: {}, truncate: true });
    return count;
  }
}
