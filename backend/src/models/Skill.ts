import { DataTypes, Model, Optional, NonAttribute } from 'sequelize';
import sequelize from '../config/database';
import type Developer from './Developer';
import type Task from './Task';

interface SkillAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SkillCreationAttributes extends Optional<SkillAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Skill extends Model<SkillAttributes, SkillCreationAttributes> implements SkillAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Reverse associations
  public developers?: NonAttribute<Developer[]>;
  public tasks?: NonAttribute<Task[]>;
}

Skill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'skills',
    timestamps: true,
  }
);

export default Skill;
