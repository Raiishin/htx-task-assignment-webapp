import request from 'supertest';
import express from 'express';
import { sequelize } from '../../src/models';
import taskRoutes from '../../src/routes/tasks';
import Task, { TaskStatus } from '../../src/models/Task';
import Skill from '../../src/models/Skill';
import Developer from '../../src/models/Developer';
import { TaskSkill } from '../../src/models';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Mock the LLM service to avoid API calls
jest.mock('../../src/services/llm', () => ({
  detectSkillsFromTitle: jest.fn().mockResolvedValue(['Frontend', 'Backend']),
}));

describe('Task Routes', () => {
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

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      await Task.create({
        title: 'Test Task',
        status: TaskStatus.TODO,
      });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Task');
    });

    it('should return tasks with skills', async () => {
      const task = await Task.create({
        title: 'Full Stack Task',
        status: TaskStatus.TODO,
      });

      const skill1 = await Skill.create({ name: 'Frontend' });
      const skill2 = await Skill.create({ name: 'Backend' });

      // Use junction table to create associations
      await TaskSkill.create({ taskId: task.id, skillId: skill1.id });
      await TaskSkill.create({ taskId: task.id, skillId: skill2.id });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].skills).toBeDefined();
      expect(response.body[0].skills.length).toBe(2);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task without skillIds', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('New Task');
    });

    it('should create task and detect skills from title using LLM', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'As a user, I want to update my profile',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.skills).toBeDefined();
      // LLM is mocked to return both skills
    });

    it('should fail to create task without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should create task with explicit skillIds', async () => {
      const skill = await Skill.create({ name: 'Frontend' });

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Frontend Task',
          skillIds: [skill.id],
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.skills).toBeDefined();
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task', async () => {
      const task = await Task.create({
        title: 'Specific Task',
        status: TaskStatus.TODO,
      });

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(200);

      expect(response.body.id).toBe(task.id);
      expect(response.body.title).toBe('Specific Task');
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/api/tasks/99999')
        .expect(404);
    });
  });
});
