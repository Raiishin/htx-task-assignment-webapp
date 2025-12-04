import request from 'supertest';
import express from 'express';
import { sequelize } from '../../src/models';
import skillRoutes from '../../src/routes/skills';
import Skill from '../../src/models/Skill';

const app = express();
app.use(express.json());
app.use('/api/skills', skillRoutes);

describe('Skill Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Skill.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/skills', () => {
    it('should return empty array when no skills exist', async () => {
      const response = await request(app)
        .get('/api/skills')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all skills', async () => {
      await Skill.create({ name: 'Frontend' });
      await Skill.create({ name: 'Backend' });

      const response = await request(app)
        .get('/api/skills')
        .expect(200);

      expect(response.body).toHaveLength(2);
      const names = response.body.map((s: any) => s.name).sort();
      expect(names).toEqual(['Backend', 'Frontend']);
    });
  });

  describe('GET /api/skills/:id', () => {
    it('should return a specific skill', async () => {
      const skill = await Skill.create({ name: 'Frontend' });

      const response = await request(app)
        .get(`/api/skills/${skill.id}`)
        .expect(200);

      expect(response.body.id).toBe(skill.id);
      expect(response.body.name).toBe('Frontend');
    });

    it('should return 404 for non-existent skill', async () => {
      await request(app)
        .get('/api/skills/99999')
        .expect(404);
    });
  });
});
