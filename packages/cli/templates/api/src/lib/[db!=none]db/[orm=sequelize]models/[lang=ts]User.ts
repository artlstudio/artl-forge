import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type Sequelize,
  type NonAttribute,
} from 'sequelize';
import type { Post } from './Post.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare name: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare posts?: NonAttribute<Post[]>;

  static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
      }
    );
  }

  static associate(): void {
    // Import here to avoid circular dependency
    const { Post } = require('./Post.js');
    User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  }
}
