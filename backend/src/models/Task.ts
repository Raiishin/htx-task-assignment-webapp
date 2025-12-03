import { DataTypes, Model, Optional, NonAttribute, BelongsToManyGetAssociationsMixin, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import type Skill from './Skill';
import type Developer from './Developer';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

interface TaskAttributes {
  id: number;
  title: string;
  status: TaskStatus;
  parentTaskId: number | null;
  developerId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'status' | 'parentTaskId' | 'developerId' | 'createdAt' | 'updatedAt'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public status!: TaskStatus;
  public parentTaskId!: number | null;
  public developerId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public skills?: NonAttribute<Skill[]>;
  public developer?: NonAttribute<Developer>;
  public subtasks?: NonAttribute<Task[]>;
  public parentTask?: NonAttribute<Task>;

  // Association methods
  public getSkills!: BelongsToManyGetAssociationsMixin<Skill>;
  public getDeveloper!: BelongsToGetAssociationMixin<Developer>;
  public getSubtasks!: HasManyGetAssociationsMixin<Task>;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.TODO,
    },
    parentTaskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    developerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'developers',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
  }
);

export default Task;
