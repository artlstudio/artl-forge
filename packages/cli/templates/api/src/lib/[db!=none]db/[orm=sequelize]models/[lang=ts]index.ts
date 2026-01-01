import type { Sequelize } from 'sequelize';
import { User } from './User.js';
import { Post } from './Post.js';

export { User, Post };

export function initializeModels(sequelize: Sequelize): void {
  // Initialize all models
  User.initialize(sequelize);
  Post.initialize(sequelize);

  // Setup associations
  User.associate();
  Post.associate();
}
