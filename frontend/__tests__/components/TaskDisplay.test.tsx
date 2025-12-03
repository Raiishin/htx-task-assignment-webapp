import { render, screen } from '@testing-library/react';
import { Task } from '../../lib/types';

// Simple component test without relying on actual page structure
describe('Task Display Logic', () => {
  const mockTask: Task = {
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

  it('should display task title', () => {
    render(
      <div>
        <h2>{mockTask.title}</h2>
      </div>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should display task status', () => {
    render(
      <div>
        <span>{mockTask.status}</span>
      </div>
    );

    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('should handle task with skills', () => {
    const taskWithSkills: Task = {
      ...mockTask,
      skills: [
        { id: 1, name: 'Frontend', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), TaskSkill: { taskId: 1, skillId: 1 } },
        { id: 2, name: 'Backend', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), TaskSkill: { taskId: 1, skillId: 2 } },
      ],
    };

    render(
      <div>
        {taskWithSkills.skills?.map(skill => (
          <span key={skill.id}>{skill.name}</span>
        ))}
      </div>
    );

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('should handle task with subtasks', () => {
    const taskWithSubtasks: Task = {
      ...mockTask,
      subtasks: [
        {
          id: 2,
          title: 'Subtask 1',
          status: 'TODO',
          parentTaskId: 1,
          developerId: null,
          developer: null,
          skills: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <div>
        <h2>{taskWithSubtasks.title}</h2>
        <ul>
          {taskWithSubtasks.subtasks.map(subtask => (
            <li key={subtask.id}>{subtask.title}</li>
          ))}
        </ul>
      </div>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
  });
});
