import { DataTypes, Model, Optional, NonAttribute, BelongsToManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import type Skill from './Skill';
import type Task from './Task';

interface DeveloperAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeveloperCreationAttributes extends Optional<DeveloperAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Developer extends Model<DeveloperAttributes, DeveloperCreationAttributes> implements DeveloperAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public skills?: NonAttribute<Skill[]>;
  public tasks?: NonAttribute<Task[]>;

  // Association methods
  public getSkills!: BelongsToManyGetAssociationsMixin<Skill>;
}

Developer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'developers',
    timestamps: true,
  }
);

export default Developer;
