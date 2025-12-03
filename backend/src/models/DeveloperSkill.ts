import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface DeveloperSkillAttributes {
  developerId: number;
  skillId: number;
}

class DeveloperSkill extends Model<DeveloperSkillAttributes> implements DeveloperSkillAttributes {
  public developerId!: number;
  public skillId!: number;
}

DeveloperSkill.init(
  {
    developerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'developers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skills',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'developer_skills',
    timestamps: false,
  }
);

export default DeveloperSkill;
