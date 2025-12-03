import express from 'express';
import { z } from 'zod';
import { Op, QueryTypes } from 'sequelize';
import { Task, Developer, Skill, TaskSkill, DeveloperSkill } from '../models';
import { TaskStatus } from '../models/Task';
import { detectSkillsFromTitle } from '../services/llm';
import sequelize from '../config/database';

const router = express.Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  skillIds: z.array(z.number()).optional(),
  parentTaskId: z.number().optional(),
});

const updateTaskSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  developerId: z.number().nullable().optional(),
});

// Helper function to check if all subtasks are done
async function canMarkTaskAsDone(taskId: number): Promise<boolean> {
  const subtasks = await Task.findAll({
    where: { parentTaskId: taskId },
  });

  // If no subtasks, can mark as done
  if (subtasks.length === 0) {
    return true;
  }

  // Check if all subtasks are done
  return subtasks.every(subtask => subtask.status === TaskStatus.DONE);
}

// Helper function to validate developer has required skills
async function validateDeveloperSkills(
  developerId: number,
  taskId: number
): Promise<boolean> {
  const developer = await Developer.findByPk(developerId, {
    include: [{ model: Skill, as: 'skills' }],
  });

  const task = await Task.findByPk(taskId, {
    include: [{ model: Skill, as: 'skills' }],
  });

  if (!developer || !task) {
    return false;
  }

  const developerSkills = developer.skills as Skill[];
  const requiredSkills = task.skills as Skill[];

  const developerSkillNames = developerSkills.map(s => s.name);
  const requiredSkillNames = requiredSkills.map(s => s.name);

  // Developer must have all required skills
  return requiredSkillNames.every(skillName =>
    developerSkillNames.includes(skillName)
  );
}

// Helper function to recursively load subtasks
async function loadTaskWithSubtasks(task: Task): Promise<any> {
  const taskData = task.toJSON();
  
  const skills = await task.getSkills();
  const developer = await task.getDeveloper();
  let developerWithSkills = null;

  if (developer) {
    const devSkills = await developer.getSkills();
    developerWithSkills = {
      ...developer.toJSON(),
      skills: devSkills,
    };
  }

  const subtasks = await Task.findAll({
    where: { parentTaskId: task.id },
    include: [
      { model: Skill, as: 'skills' },
      { model: Developer, as: 'developer' },
    ],
  });

  const subtasksWithNested = await Promise.all(
    subtasks.map(subtask => loadTaskWithSubtasks(subtask))
  );

  return {
    ...taskData,
    skills,
    developer: developerWithSkills,
    subtasks: subtasksWithNested,
  };
}

// GET /api/tasks - Get all tasks with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as TaskStatus | undefined;
    const developerId = req.query.developerId ? parseInt(req.query.developerId as string) : undefined;
    const skillIdsParam = req.query['skillIds[]'] || req.query.skillIds;
    const skillIds = skillIdsParam
      ? (Array.isArray(skillIdsParam)
          ? skillIdsParam.map(id => parseInt(id as string))
          : [parseInt(skillIdsParam as string)])
      : undefined;
    const search = req.query.search as string | undefined;

    // Build dynamic WHERE clause
    const where: any = { parentTaskId: null };
    if (status) where.status = status;
    if (developerId) where.developerId = developerId;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    // Handle skill filtering with AND logic using subquery
    if (skillIds?.length) {
      // Add subquery to filter tasks that have ALL of the specified skills
      // Use GROUP BY and HAVING COUNT to ensure all skills are present
      const taskIdsWithSkills = await sequelize.query(
        `SELECT "taskId"
         FROM task_skills
         WHERE "skillId" IN (:skillIds)
         GROUP BY "taskId"
         HAVING COUNT(DISTINCT "skillId") = :skillCount`,
        {
          replacements: { skillIds, skillCount: skillIds.length },
          type: QueryTypes.SELECT
        }
      ) as any[];

      const taskIds = taskIdsWithSkills.map((row: any) => row.taskId);

      if (taskIds.length > 0) {
        where.id = { [Op.in]: taskIds };
      } else {
        // No tasks match the skill filter
        where.id = -1; // Impossible ID to return no results
      }
    }

    // Count total matching records
    const totalCount = await Task.count({
      where,
      distinct: true
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const tasks = await Task.findAll({
      where,
      include: [
        { model: Skill, as: 'skills' },
        {
          model: Developer,
          as: 'developer',
          include: [{ model: Skill, as: 'skills' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Load subtasks recursively
    const tasksWithSubtasks = await Promise.all(
      tasks.map(task => loadTaskWithSubtasks(task))
    );

    // Return paginated response
    res.json({
      tasks: tasksWithSubtasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        pageSize: limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await Task.findByPk(taskId, {
      include: [
        { model: Skill, as: 'skills' },
        {
          model: Developer,
          as: 'developer',
          include: [{ model: Skill, as: 'skills' }],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskWithSubtasks = await loadTaskWithSubtasks(task);

    res.json(taskWithSubtasks);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const { title, skillIds, parentTaskId } = validatedData;

    let finalSkillIds = skillIds;

    // If no skills specified, use LLM to detect them
    if (!skillIds || skillIds.length === 0) {
      console.log('No skills specified, using LLM to detect...');
      const detectedSkillNames = await detectSkillsFromTitle(title);

      // Get skill IDs from names
      const skills = await Skill.findAll({
        where: { name: detectedSkillNames },
      });

      finalSkillIds = skills.map(s => s.id);
      console.log('Detected skill IDs:', finalSkillIds);
    }

    // Create task
    const task = await Task.create({
      title,
      parentTaskId: parentTaskId || null,
      status: TaskStatus.TODO,
    });

    // Assign skills to task
    if (finalSkillIds && finalSkillIds.length > 0) {
      await Promise.all(
        finalSkillIds.map(skillId =>
          TaskSkill.create({ taskId: task.id, skillId })
        )
      );
    }

    // Fetch the created task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: Skill, as: 'skills' },
        { model: Developer, as: 'developer' },
      ],
    });

    res.status(201).json(createdTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const validatedData = updateTaskSchema.parse(req.body);
    const { status, developerId } = validatedData;

    // Check if task exists
    const existingTask = await Task.findByPk(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate status change to DONE
    if (status === 'DONE') {
      const canMarkDone = await canMarkTaskAsDone(taskId);
      if (!canMarkDone) {
        return res.status(400).json({
          error: 'Cannot mark task as done. All subtasks must be completed first.',
        });
      }
    }

    // Validate developer assignment
    if (developerId !== undefined && developerId !== null) {
      const hasRequiredSkills = await validateDeveloperSkills(developerId, taskId);
      if (!hasRequiredSkills) {
        return res.status(400).json({
          error: 'Developer does not have the required skills for this task.',
        });
      }
    }

    // Update task
    const updateData: any = {};
    if (status !== undefined) updateData.status = status as TaskStatus;
    if (developerId !== undefined) updateData.developerId = developerId;

    await existingTask.update(updateData);

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        { model: Skill, as: 'skills' },
        {
          model: Developer,
          as: 'developer',
          include: [{ model: Skill, as: 'skills' }],
        },
      ],
    });

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

export default router;
