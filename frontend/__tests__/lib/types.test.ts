import { Task, Developer, Skill, TaskStatus } from '../../lib/types';

describe('Type Definitions', () => {
  it('should create valid Task object', () => {
    const task: Task = {
      id: 1,
      title: 'Test Task',
      status: 'TODO',
      parentTaskId: null,
      developerId: null,
      developer: null,
      skills: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(task.id).toBe(1);
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('TODO');
  });

  it('should create valid Developer object', () => {
    const developer: Developer = {
      id: 1,
      name: 'John Doe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: [],
    };

    expect(developer.id).toBe(1);
    expect(developer.name).toBe('John Doe');
  });

  it('should create valid Skill object', () => {
    const skill: Skill = {
      id: 1,
      name: 'Frontend',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(skill.id).toBe(1);
    expect(skill.name).toBe('Frontend');
  });

  it('should accept valid TaskStatus values', () => {
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

    statuses.forEach(status => {
      const task: Task = {
        id: 1,
        title: 'Task',
        status,
        parentTaskId: null,
        developerId: null,
        developer: null,
        skills: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(task.status).toBe(status);
    });
  });
});
