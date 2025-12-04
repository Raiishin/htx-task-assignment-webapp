'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task, Developer, Skill, PaginationMeta, TaskFilters } from '@/lib/types';
import { api } from '@/lib/api';

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksResponse, developersData, skillsData] = await Promise.all([
        api.getTasks(currentPage, { ...filters, search: debouncedSearch }),
        api.getDevelopers(),
        api.getSkills(),
      ]);
      setTasks(tasksResponse.tasks);
      setPagination(tasksResponse.pagination);
      setDevelopers(developersData);
      setSkills(skillsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId: number, status: string) => {
    // Optimistic update
    const originalTasks = [...tasks];
    const updateTaskInList = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, status: status as any };
        }
        if (task.subtasks?.length) {
          return { ...task, subtasks: updateTaskInList(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(updateTaskInList(tasks));

    try {
      await api.updateTask(taskId, { status: status as any });
      await loadData(); // Refresh to get latest data
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeveloperChange = async (taskId: number, developerId: string) => {
    // Optimistic update
    const originalTasks = [...tasks];
    const devId = developerId === '' ? null : parseInt(developerId);
    const developer = devId ? developers.find(d => d.id === devId) : null;

    const updateTaskInList = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, developerId: devId, developer: developer || null };
        }
        if (task.subtasks?.length) {
          return { ...task, subtasks: updateTaskInList(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(updateTaskInList(tasks));

    try {
      await api.updateTask(taskId, { developerId: devId });
      await loadData(); // Refresh to get latest data
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      alert(err instanceof Error ? err.message : 'Failed to assign developer');
    }
  };

  const getEligibleDevelopers = (task: Task): Developer[] => {
    const requiredSkillNames = task.skills.map(ts => ts.name);

    return developers.filter(dev => {
      const devSkillNames = dev.skills.map(ds => ds.name);
      return requiredSkillNames.every(reqSkill => devSkillNames.includes(reqSkill));
    });
  };

  const renderTask = (task: Task, depth = 0) => {
    const eligibleDevs = getEligibleDevelopers(task);
    const paddingLeft = depth * 40;

    return (
      <div key={task.id}>
        <div
          className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
          style={{ marginLeft: `${paddingLeft}px` }}
        >
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Task Title - 4 columns */}
            <div className="col-span-4">
              <h3 className="font-medium text-gray-900 mb-1">
                {depth > 0 && (
                  <span className="text-gray-400 mr-2">
                    {'└─'.repeat(depth)}
                  </span>
                )}
                {task.title}
              </h3>
              <p className="text-sm text-gray-500">ID: {task.id}</p>
            </div>

            {/* Skills - 2 columns */}
            <div className="col-span-2">
              <div className="flex flex-wrap gap-1">
                {task.skills.map(ts => (
                  <span
                    key={ts.id}
                    className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                  >
                    {ts.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtask Count - 1 column */}
            <div className="col-span-1 text-sm text-gray-500">
              {task.subtasks.length > 0 && (
                <span>
                  {task.subtasks.filter(st => st.status === 'DONE').length}/
                  {task.subtasks.length} done
                </span>
              )}
            </div>

            {/* Status - 2 columns */}
            <div className="col-span-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODO">To-do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Assignee - 3 columns */}
            <div className="col-span-3">
              <select
                value={task.developerId || ''}
                onChange={(e) => handleDeveloperChange(task.id, e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={eligibleDevs.length === 0}
              >
                <option value="">Unassigned</option>
                {eligibleDevs.map(dev => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name}
                  </option>
                ))}
              </select>
              {eligibleDevs.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  No developers with required skills
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Render subtasks recursively */}
        {task.subtasks.map(subtask => renderTask(subtask, depth + 1))}
      </div>
    );
  };

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
            </div>
            <div className="col-span-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="col-span-1">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="col-span-2">
              <div className="h-9 bg-gray-200 rounded"></div>
            </div>
            <div className="col-span-3">
              <div className="h-9 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter to show only root tasks (tasks without a parent)
  const rootTasks = tasks.filter(task => !task.parentTaskId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and assign tasks to developers
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4 bg-white border border-gray-200 rounded-lg p-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Tasks
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by task title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as any || undefined });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Developer Filter */}
          <div>
            <label htmlFor="developer-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Developer
            </label>
            <select
              id="developer-filter"
              value={filters.developerId || ''}
              onChange={(e) => {
                setFilters({ ...filters, developerId: e.target.value ? Number(e.target.value) : undefined });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Developers</option>
              {developers.map((dev) => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({});
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills (tasks must have all selected)
          </label>
          <div className="flex gap-4">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.skillIds?.includes(skill.id) || false}
                  onChange={(e) => {
                    const newSkillIds = e.target.checked
                      ? [...(filters.skillIds || []), skill.id]
                      : (filters.skillIds || []).filter(id => id !== skill.id);
                    setFilters({ ...filters, skillIds: newSkillIds.length ? newSkillIds : undefined });
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="transition-opacity duration-200">
        {loading ? (
          <SkeletonLoader />
        ) : rootTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No tasks found{filters.status || filters.developerId || filters.skillIds?.length || debouncedSearch ? ' matching your filters.' : '. Create your first task!'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Task Title</div>
              <div className="col-span-2">Skills</div>
              <div className="col-span-1">Subtasks</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Assignee</div>
            </div>
            {rootTasks.map(task => renderTask(task))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  Math.abs(pageNum - currentPage) <= 2;

                if (!showPage) {
                  // Show ellipsis for skipped pages
                  if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                    return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>

          {/* Result Count */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {((currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} tasks
          </div>
        </div>
      )}
    </div>
  );
}
