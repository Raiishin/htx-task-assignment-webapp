import { sequelize } from '../../src/models';
import Developer from '../../src/models/Developer';
import Skill from '../../src/models/Skill';
import { DeveloperSkill } from '../../src/models';

describe('Developer Model', () => {
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

  describe('Creation', () => {
    it('should create a developer with valid name', async () => {
      const developer = await Developer.create({ name: 'John Doe' });

      expect(developer.id).toBeDefined();
      expect(developer.name).toBe('John Doe');
      expect(developer.createdAt).toBeDefined();
      expect(developer.updatedAt).toBeDefined();
    });

    it('should fail to create developer with null name', async () => {
      await expect(Developer.create({ name: null } as any))
        .rejects
        .toThrow();
    });
  });

  describe('Associations', () => {
    it('should associate developer with skills via DeveloperSkill junction table', async () => {
      const developer = await Developer.create({ name: 'Jane Doe' });
      const skill1 = await Skill.create({ name: 'Frontend' });
      const skill2 = await Skill.create({ name: 'Backend' });

      // Use junction table to create associations
      await DeveloperSkill.create({ developerId: developer.id, skillId: skill1.id });
      await DeveloperSkill.create({ developerId: developer.id, skillId: skill2.id });

      const skills = await developer.getSkills();

      expect(skills).toHaveLength(2);
      expect(skills.map(s => s.name)).toContain('Frontend');
      expect(skills.map(s => s.name)).toContain('Backend');
    });
  });
});
