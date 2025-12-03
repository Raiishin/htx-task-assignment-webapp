import sequelize from '../config/database';
import Developer from './Developer';
import Skill from './Skill';
import Task from './Task';
import DeveloperSkill from './DeveloperSkill';
import TaskSkill from './TaskSkill';

// Developer <-> Skill (many-to-many)
Developer.belongsToMany(Skill, {
  through: DeveloperSkill,
  foreignKey: 'developerId',
  as: 'skills',
});

Skill.belongsToMany(Developer, {
  through: DeveloperSkill,
  foreignKey: 'skillId',
  as: 'developers',
});

// Task <-> Skill (many-to-many)
Task.belongsToMany(Skill, {
  through: TaskSkill,
  foreignKey: 'taskId',
  as: 'skills',
});

Skill.belongsToMany(Task, {
  through: TaskSkill,
  foreignKey: 'skillId',
  as: 'tasks',
});

// Task -> Developer (many-to-one)
Task.belongsTo(Developer, {
  foreignKey: 'developerId',
  as: 'developer',
});

Developer.hasMany(Task, {
  foreignKey: 'developerId',
  as: 'tasks',
});

// Task -> Task (self-referential for subtasks)
Task.hasMany(Task, {
  foreignKey: 'parentTaskId',
  as: 'subtasks',
});

Task.belongsTo(Task, {
  foreignKey: 'parentTaskId',
  as: 'parentTask',
});

export { sequelize, Developer, Skill, Task, DeveloperSkill, TaskSkill };
