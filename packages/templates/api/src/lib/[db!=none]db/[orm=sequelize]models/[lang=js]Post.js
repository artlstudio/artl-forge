import { DataTypes, Model } from 'sequelize';

export class Post extends Model {
  static initialize(sequelize) {
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

  static associate() {
    // Import here to avoid circular dependency
    const { User } = require('./User.js');
    Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  }
}
