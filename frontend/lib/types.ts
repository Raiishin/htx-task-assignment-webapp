export interface Skill {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeveloperSkill extends Skill {
  DeveloperSkill?: {
    developerId: number;
    skillId: number;
  };
}

export interface Developer {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  skills: DeveloperSkill[];
}

export interface TaskSkill extends Skill {
  TaskSkill?: {
    taskId: number;
    skillId: number;
  };
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  parentTaskId: number | null;
  developerId: number | null;
  developer: Developer | null;
  skills: TaskSkill[];
  subtasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  skillIds?: number[];
  parentTaskId?: number;
}

export interface UpdateTaskData {
  status?: TaskStatus;
  developerId?: number | null;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface PaginatedTasksResponse {
  tasks: Task[];
  pagination: PaginationMeta;
}

export interface TaskFilters {
  status?: TaskStatus;
  developerId?: number;
  skillIds?: number[];
  search?: string;
}
