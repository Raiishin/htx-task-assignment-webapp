import { sequelize } from '../../src/models';
import Task, { TaskStatus } from '../../src/models/Task';
import Skill from '../../src/models/Skill';
import Developer from '../../src/models/Developer';
import { TaskSkill } from '../../src/models';

describe('Task Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await Skill.destroy({ where: {}, truncate: true, cascade: true });
    await Developer.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Creation', () => {
    it('should create a task with required fields', async () => {
      const task = await Task.create({
        title: 'Test Task',
        status: TaskStatus.TODO,
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(TaskStatus.TODO);
    });

    it('should default status to TODO if not provided', async () => {
      const task = await Task.create({
        title: 'Test Task',
      });

      expect(task.status).toBe(TaskStatus.TODO);
    });

    it('should validate status values', async () => {
      await expect(Task.create({
        title: 'Test Task',
        status: 'invalid' as any,
      })).rejects.toThrow();
    });
  });

  describe('Associations', () => {
    it('should associate task with skills via TaskSkill junction table', async () => {
      const task = await Task.create({
        title: 'Full Stack Task',
        status: TaskStatus.TODO,
      });
      const skill1 = await Skill.create({ name: 'Frontend' });
      const skill2 = await Skill.create({ name: 'Backend' });

      // Use junction table to create associations
      await TaskSkill.create({ taskId: task.id, skillId: skill1.id });
      await TaskSkill.create({ taskId: task.id, skillId: skill2.id });

      const skills = await task.getSkills();
      expect(skills).toHaveLength(2);
    });

    it('should associate task with developer', async () => {
      const developer = await Developer.create({ name: 'John Doe' });
      const task = await Task.create({
        title: 'Assigned Task',
        status: TaskStatus.IN_PROGRESS,
        developerId: developer.id,
      });

      const assignedDeveloper = await task.getDeveloper();
      expect(assignedDeveloper?.name).toBe('John Doe');
    });

    it('should support parent-child task relationships', async () => {
      const parentTask = await Task.create({
        title: 'Parent Task',
        status: TaskStatus.TODO,
      });

      const childTask = await Task.create({
        title: 'Child Task',
        status: TaskStatus.TODO,
        parentTaskId: parentTask.id,
      });

      const subtasks = await parentTask.getSubtasks();
      expect(subtasks).toHaveLength(1);
      expect(subtasks[0].title).toBe('Child Task');

      // Load parent through Sequelize find
      const loadedChildTask = await Task.findByPk(childTask.id);
      expect(loadedChildTask?.parentTaskId).toBe(parentTask.id);
    });
  });
});
