import { Task, Developer, Skill, CreateTaskData, UpdateTaskData, PaginatedTasksResponse, TaskFilters } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Tasks
  async getTasks(page: number = 1, filters?: TaskFilters): Promise<PaginatedTasksResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');

    if (filters?.status) params.append('status', filters.status);
    if (filters?.developerId) params.append('developerId', filters.developerId.toString());
    if (filters?.skillIds?.length) {
      filters.skillIds.forEach(id => params.append('skillIds[]', id.toString()));
    }
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_URL}/tasks?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getTask(id: number): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }
    return response.json();
  },

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update task');
    }
    return response.json();
  },

  // Developers
  async getDevelopers(): Promise<Developer[]> {
    const response = await fetch(`${API_URL}/developers`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch developers');
    return response.json();
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    const response = await fetch(`${API_URL}/skills`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },
};
