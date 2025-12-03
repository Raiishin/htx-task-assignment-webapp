import express from 'express';
import { Skill, Developer, Task } from '../models';

const router = express.Router();

// GET /api/skills - Get all skills
router.get('/', async (req, res, next) => {
  try {
    const skills = await Skill.findAll({
      include: [
        { model: Developer, as: 'developers' },
        { model: Task, as: 'tasks' },
      ],
      order: [['name', 'ASC']],
    });

    res.json(skills);
  } catch (error) {
    next(error);
  }
});

// GET /api/skills/:id - Get single skill
router.get('/:id', async (req, res, next) => {
  try {
    const skillId = parseInt(req.params.id);

    const skill = await Skill.findByPk(skillId, {
      include: [
        { model: Developer, as: 'developers' },
        { model: Task, as: 'tasks' },
      ],
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    next(error);
  }
});

export default router;
