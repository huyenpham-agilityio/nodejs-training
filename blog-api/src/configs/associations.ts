import User from '@/modules/users/model';
import Post from '@/modules/posts/model';
import Comment from '@/modules/comments/model';

// User associations
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts',
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
});

// Post associations
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
});

// Comment associations
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
});

export { User, Post, Comment };
