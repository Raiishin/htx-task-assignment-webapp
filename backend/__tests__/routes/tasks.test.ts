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

      expect(response.body.tasks).toEqual([]);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalCount).toBe(0);
    });

    it('should return all tasks', async () => {
      await Task.create({
        title: 'Test Task',
        status: TaskStatus.TODO,
      });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe('Test Task');
      expect(response.body.pagination.totalCount).toBe(1);
      expect(response.body.pagination.currentPage).toBe(1);
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

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].skills).toBeDefined();
      expect(response.body.tasks[0].skills.length).toBe(2);
    });

    it('should support pagination', async () => {
      // Create 25 tasks
      for (let i = 1; i <= 25; i++) {
        await Task.create({
          title: `Task ${i}`,
          status: TaskStatus.TODO,
        });
      }

      // Page 1
      const page1 = await request(app)
        .get('/api/tasks?page=1&limit=10')
        .expect(200);

      expect(page1.body.tasks).toHaveLength(10);
      expect(page1.body.pagination.currentPage).toBe(1);
      expect(page1.body.pagination.totalPages).toBe(3);
      expect(page1.body.pagination.totalCount).toBe(25);

      // Page 2
      const page2 = await request(app)
        .get('/api/tasks?page=2&limit=10')
        .expect(200);

      expect(page2.body.tasks).toHaveLength(10);
      expect(page2.body.pagination.currentPage).toBe(2);
    });

    it('should filter tasks by status', async () => {
      await Task.create({ title: 'Todo Task', status: TaskStatus.TODO });
      await Task.create({ title: 'In Progress Task', status: TaskStatus.IN_PROGRESS });
      await Task.create({ title: 'Done Task', status: TaskStatus.DONE });

      const response = await request(app)
        .get('/api/tasks?status=TODO')
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe(TaskStatus.TODO);
    });

    it('should filter tasks by developer', async () => {
      const developer = await Developer.create({ name: 'John Doe' });

      await Task.create({ title: 'Task 1', status: TaskStatus.TODO, developerId: developer.id });
      await Task.create({ title: 'Task 2', status: TaskStatus.TODO });

      const response = await request(app)
        .get(`/api/tasks?developerId=${developer.id}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].developerId).toBe(developer.id);
    });

    it('should filter tasks by skills (AND logic)', async () => {
      const frontendSkill = await Skill.create({ name: 'Frontend' });
      const backendSkill = await Skill.create({ name: 'Backend' });

      const task1 = await Task.create({ title: 'Frontend Only', status: TaskStatus.TODO });
      await TaskSkill.create({ taskId: task1.id, skillId: frontendSkill.id });

      const task2 = await Task.create({ title: 'Full Stack', status: TaskStatus.TODO });
      await TaskSkill.create({ taskId: task2.id, skillId: frontendSkill.id });
      await TaskSkill.create({ taskId: task2.id, skillId: backendSkill.id });

      // Filter for tasks with BOTH Frontend AND Backend
      const response = await request(app)
        .get(`/api/tasks?skillIds[]=${frontendSkill.id}&skillIds[]=${backendSkill.id}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe('Full Stack');
    });

    it('should search tasks by title', async () => {
      await Task.create({ title: 'Build login page', status: TaskStatus.TODO });
      await Task.create({ title: 'Create dashboard', status: TaskStatus.TODO });

      const response = await request(app)
        .get('/api/tasks?search=login')
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toContain('login');
    });

    it('should only return root tasks (not subtasks)', async () => {
      const parentTask = await Task.create({ title: 'Parent', status: TaskStatus.TODO });
      await Task.create({ title: 'Subtask', status: TaskStatus.TODO, parentTaskId: parentTask.id });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe('Parent');
      expect(response.body.tasks[0].subtasks).toHaveLength(1);
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

  describe('PATCH /api/tasks/:id', () => {
    describe('Status updates', () => {
      it('should update task status', async () => {
        const task = await Task.create({
          title: 'Test Task',
          status: TaskStatus.TODO,
        });

        const response = await request(app)
          .patch(`/api/tasks/${task.id}`)
          .send({ status: TaskStatus.IN_PROGRESS })
          .expect(200);

        expect(response.body.status).toBe(TaskStatus.IN_PROGRESS);
      });

      it('should allow marking task as DONE when no subtasks exist', async () => {
        const task = await Task.create({
          title: 'Test Task',
          status: TaskStatus.IN_PROGRESS,
        });

        const response = await request(app)
          .patch(`/api/tasks/${task.id}`)
          .send({ status: TaskStatus.DONE })
          .expect(200);

        expect(response.body.status).toBe(TaskStatus.DONE);
      });

      it('should allow marking task as DONE when all subtasks are DONE', async () => {
        const parentTask = await Task.create({
          title: 'Parent Task',
          status: TaskStatus.IN_PROGRESS,
        });

        await Task.create({
          title: 'Subtask 1',
          status: TaskStatus.DONE,
          parentTaskId: parentTask.id,
        });

        await Task.create({
          title: 'Subtask 2',
          status: TaskStatus.DONE,
          parentTaskId: parentTask.id,
        });

        const response = await request(app)
          .patch(`/api/tasks/${parentTask.id}`)
          .send({ status: TaskStatus.DONE })
          .expect(200);

        expect(response.body.status).toBe(TaskStatus.DONE);
      });

      it('should prevent marking task as DONE when subtasks are not all DONE', async () => {
        const parentTask = await Task.create({
          title: 'Parent Task',
          status: TaskStatus.IN_PROGRESS,
        });

        await Task.create({
          title: 'Subtask 1',
          status: TaskStatus.DONE,
          parentTaskId: parentTask.id,
        });

        await Task.create({
          title: 'Subtask 2',
          status: TaskStatus.IN_PROGRESS,
          parentTaskId: parentTask.id,
        });

        const response = await request(app)
          .patch(`/api/tasks/${parentTask.id}`)
          .send({ status: TaskStatus.DONE })
          .expect(400);

        expect(response.body.error).toContain('All subtasks must be completed');
      });
    });

    describe('Developer assignment', () => {
      it('should assign developer with required skills', async () => {
        const skill = await Skill.create({ name: 'Frontend' });
        const developer = await Developer.create({ name: 'John Doe' });

        // Associate developer with skill using DeveloperSkill
        const DeveloperSkill = sequelize.models.DeveloperSkill;
        await DeveloperSkill.create({
          developerId: developer.id,
          skillId: skill.id
        });

        const task = await Task.create({
          title: 'Frontend Task',
          status: TaskStatus.TODO,
        });

        await TaskSkill.create({ taskId: task.id, skillId: skill.id });

        const response = await request(app)
          .patch(`/api/tasks/${task.id}`)
          .send({ developerId: developer.id })
          .expect(200);

        expect(response.body.developerId).toBe(developer.id);
      });

      it('should prevent assigning developer without required skills', async () => {
        const frontendSkill = await Skill.create({ name: 'Frontend' });
        const backendSkill = await Skill.create({ name: 'Backend' });
        const developer = await Developer.create({ name: 'John Doe' });

        // Developer only has Frontend skill
        const DeveloperSkill = sequelize.models.DeveloperSkill;
        await DeveloperSkill.create({
          developerId: developer.id,
          skillId: frontendSkill.id
        });

        const task = await Task.create({
          title: 'Backend Task',
          status: TaskStatus.TODO,
        });

        // Task requires Backend skill
        await TaskSkill.create({ taskId: task.id, skillId: backendSkill.id });

        const response = await request(app)
          .patch(`/api/tasks/${task.id}`)
          .send({ developerId: developer.id })
          .expect(400);

        expect(response.body.error).toContain('does not have the required skills');
      });

      it('should allow unassigning developer', async () => {
        const skill = await Skill.create({ name: 'Frontend' });
        const developer = await Developer.create({ name: 'John Doe' });

        const DeveloperSkill = sequelize.models.DeveloperSkill;
        await DeveloperSkill.create({
          developerId: developer.id,
          skillId: skill.id
        });

        const task = await Task.create({
          title: 'Frontend Task',
          status: TaskStatus.TODO,
          developerId: developer.id,
        });

        await TaskSkill.create({ taskId: task.id, skillId: skill.id });

        const response = await request(app)
          .patch(`/api/tasks/${task.id}`)
          .send({ developerId: null })
          .expect(200);

        expect(response.body.developerId).toBeNull();
      });
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .patch('/api/tasks/99999')
        .send({ status: TaskStatus.DONE })
        .expect(404);
    });
  });
});
