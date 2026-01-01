import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type Sequelize,
  type NonAttribute,
} from 'sequelize';
import type { User } from './User.js';

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare content: string | null;
  declare published: CreationOptional<boolean>;
  declare authorId: ForeignKey<User['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare author?: NonAttribute<User>;

  static initialize(sequelize: Sequelize): void {
    Post.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        published: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        authorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'posts',
        timestamps: true,
      }
    );
  }

  static associate(): void {
    // Import here to avoid circular dependency
    const { User } = require('./User.js');
    Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  }
}
