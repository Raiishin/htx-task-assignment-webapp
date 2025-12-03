'use client';

import { useEffect, useState } from 'react';
import { Task, Developer } from '@/lib/types';
import { api } from '@/lib/api';

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, developersData] = await Promise.all([
        api.getTasks(),
        api.getDevelopers(),
      ]);
      setTasks(tasksData);
      setDevelopers(developersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, status: string) => {
    try {
      await api.updateTask(taskId, { status: status as any });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeveloperChange = async (taskId: number, developerId: string) => {
    try {
      const devId = developerId === '' ? null : parseInt(developerId);
      await api.updateTask(taskId, { developerId: devId });
      await loadData();
    } catch (err) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

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

      {rootTasks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No tasks found. Create your first task!</p>
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
  );
}
