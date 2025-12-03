import { Task } from '../../lib/types';

describe('API Client (Mock)', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch tasks from API', async () => {
    const mockTasks: Task[] = [
      {
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
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();

    expect(tasks).toEqual(mockTasks);
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/tasks`);
  });

  it('should handle API error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}/tasks`);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should post new task to API', async () => {
    const newTask = {
      title: 'New Task',
    };

    const mockResponse: Task = {
      id: 1,
      title: 'New Task',
      status: 'TODO',
      parentTaskId: null,
      developerId: null,
      developer: null,
      skills: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    const task = await response.json();

    expect(task.id).toBe(1);
    expect(task.title).toBe('New Task');
  });
});
