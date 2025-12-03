import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface TaskSkillAttributes {
  taskId: number;
  skillId: number;
}

class TaskSkill extends Model<TaskSkillAttributes> implements TaskSkillAttributes {
  public taskId!: number;
  public skillId!: number;
}

TaskSkill.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
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
    tableName: 'task_skills',
    timestamps: false,
  }
);

export default TaskSkill;
