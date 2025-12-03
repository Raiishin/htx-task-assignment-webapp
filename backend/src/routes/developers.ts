import express from 'express';
import { Developer, Skill, Task } from '../models';

const router = express.Router();

// GET /api/developers - Get all developers
router.get('/', async (req, res, next) => {
  try {
    const developers = await Developer.findAll({
      include: [
        { model: Skill, as: 'skills' },
        {
          model: Task,
          as: 'tasks',
          include: [{ model: Skill, as: 'skills' }],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json(developers);
  } catch (error) {
    next(error);
  }
});

// GET /api/developers/:id - Get single developer
router.get('/:id', async (req, res, next) => {
  try {
    const developerId = parseInt(req.params.id);

    const developer = await Developer.findByPk(developerId, {
      include: [
        { model: Skill, as: 'skills' },
        {
          model: Task,
          as: 'tasks',
          include: [{ model: Skill, as: 'skills' }],
        },
      ],
    });

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json(developer);
  } catch (error) {
    next(error);
  }
});

export default router;
