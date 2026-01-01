import { DataTypes, Model } from 'sequelize';

export class User extends Model {
  static initialize(sequelize) {
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

  static associate() {
    // Import here to avoid circular dependency
    const { Post } = require('./Post.js');
    User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  }
}
