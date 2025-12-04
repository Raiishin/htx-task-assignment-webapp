import request from 'supertest';
import express from 'express';
import { sequelize } from '../../src/models';
import developerRoutes from '../../src/routes/developers';
import Developer from '../../src/models/Developer';
import Skill from '../../src/models/Skill';

const app = express();
app.use(express.json());
app.use('/api/developers', developerRoutes);

describe('Developer Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Developer.destroy({ where: {}, truncate: true, cascade: true });
    await Skill.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/developers', () => {
    it('should return empty array when no developers exist', async () => {
      const response = await request(app)
        .get('/api/developers')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all developers', async () => {
      await Developer.create({ name: 'John Doe' });
      await Developer.create({ name: 'Jane Smith' });

      const response = await request(app)
        .get('/api/developers')
        .expect(200);

      expect(response.body).toHaveLength(2);
      const names = response.body.map((d: any) => d.name).sort();
      expect(names).toEqual(['Jane Smith', 'John Doe']);
    });

    it('should return developers with their skills', async () => {
      const developer = await Developer.create({ name: 'John Doe' });
      const skill1 = await Skill.create({ name: 'Frontend' });
      const skill2 = await Skill.create({ name: 'Backend' });

      const DeveloperSkill = sequelize.models.DeveloperSkill;
      await DeveloperSkill.create({
        developerId: developer.id,
        skillId: skill1.id
      });
      await DeveloperSkill.create({
        developerId: developer.id,
        skillId: skill2.id
      });

      const response = await request(app)
        .get('/api/developers')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].skills).toBeDefined();
      expect(response.body[0].skills).toHaveLength(2);
    });
  });

  describe('GET /api/developers/:id', () => {
    it('should return a specific developer', async () => {
      const developer = await Developer.create({ name: 'John Doe' });

      const response = await request(app)
        .get(`/api/developers/${developer.id}`)
        .expect(200);

      expect(response.body.id).toBe(developer.id);
      expect(response.body.name).toBe('John Doe');
    });

    it('should return 404 for non-existent developer', async () => {
      await request(app)
        .get('/api/developers/99999')
        .expect(404);
    });
  });
});
