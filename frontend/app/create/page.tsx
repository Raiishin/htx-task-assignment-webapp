'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skill, CreateTaskData } from '@/lib/types';
import { api } from '@/lib/api';

interface TaskFormData {
  title: string;
  skillIds: number[];
  subtasks: TaskFormData[];
}

interface TaskComponentProps {
  taskData: TaskFormData;
  onChange: (data: TaskFormData) => void;
  onRemove?: () => void;
  skills: Skill[];
  depth: number;
}

function TaskComponent({ taskData, onChange, onRemove, skills, depth }: TaskComponentProps) {
  const handleTitleChange = (title: string) => {
    onChange({ ...taskData, title });
  };

  const handleSkillToggle = (skillId: number) => {
    const newSkillIds = taskData.skillIds.includes(skillId)
      ? taskData.skillIds.filter(id => id !== skillId)
      : [...taskData.skillIds, skillId];
    onChange({ ...taskData, skillIds: newSkillIds });
  };

  const addSubtask = () => {
    onChange({
      ...taskData,
      subtasks: [...taskData.subtasks, { title: '', skillIds: [], subtasks: [] }],
    });
  };

  const updateSubtask = (index: number, subtask: TaskFormData) => {
    const newSubtasks = [...taskData.subtasks];
    newSubtasks[index] = subtask;
    onChange({ ...taskData, subtasks: newSubtasks });
  };

  const removeSubtask = (index: number) => {
    onChange({
      ...taskData,
      subtasks: taskData.subtasks.filter((_, i) => i !== index),
    });
  };

  const paddingLeft = depth * 20;

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4" style={{ marginLeft: `${paddingLeft}px` }}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          {depth === 0 ? 'Main Task' : `Subtask Level ${depth}`}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <textarea
            value={taskData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter task description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills (optional - will be auto-detected if not specified)
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <label key={skill.id} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={taskData.skillIds.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>

        {depth < 3 && (
          <div>
            <button
              type="button"
              onClick={addSubtask}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Subtask
            </button>
          </div>
        )}
      </div>

      {taskData.subtasks.length > 0 && (
        <div className="mt-4 space-y-2">
          {taskData.subtasks.map((subtask, index) => (
            <TaskComponent
              key={index}
              taskData={subtask}
              onChange={(data) => updateSubtask(index, data)}
              onRemove={() => removeSubtask(index)}
              skills={skills}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taskData, setTaskData] = useState<TaskFormData>({
    title: '',
    skillIds: [],
    subtasks: [],
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skillsData = await api.getSkills();
      setSkills(skillsData);
    } catch (err) {
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const createTaskRecursively = async (
    taskFormData: TaskFormData,
    parentTaskId?: number
  ): Promise<void> => {
    const taskPayload: CreateTaskData = {
      title: taskFormData.title,
      skillIds: taskFormData.skillIds.length > 0 ? taskFormData.skillIds : undefined,
      parentTaskId,
    };

    const createdTask = await api.createTask(taskPayload);

    // Create subtasks recursively
    for (const subtask of taskFormData.subtasks) {
      await createTaskRecursively(subtask, createdTask.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createTaskRecursively(taskData);

      alert('Task created successfully!');
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Task</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new task with optional subtasks. Skills will be automatically detected if not specified.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <TaskComponent
          taskData={taskData}
          onChange={setTaskData}
          skills={skills}
          depth={0}
        />

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
