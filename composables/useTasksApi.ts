/**
 * Tasks API Composable
 * Wrapper para todas las llamadas al backend de tasks
 */

import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilter, TaskStats } from '~/shared/types';

export const useTasksApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.backendApiUrl;

  // Helper para manejar errores de forma consistente
  const handleError = (error: any): never => {
    if (error.data) {
      throw new Error(error.data.message || 'An error occurred');
    }
    throw new Error(error.message || 'An unexpected error occurred');
  };

  /**
   * TASKS ENDPOINTS
   */

  const getTasks = async (filters?: TaskFilter): Promise<Task[]> => {
    try {
      // Construir query params desde los filtros
      const params: any = {};

      if (filters?.status?.length) {
        params.status = filters.status.join(',');
      }
      if (filters?.priority?.length) {
        params.priority = filters.priority.join(',');
      }
      if (filters?.categoryId?.length) {
        params.categoryId = filters.categoryId.join(',');
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.tags?.length) {
        params.tags = filters.tags.join(',');
      }
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start.toISOString();
        params.endDate = filters.dateRange.end.toISOString();
      }

      const data = await $fetch<Task[]>('/api/backend/tasks', {
        method: 'GET',
        params,
        credentials: 'include',
      });

      console.log('🔍 [COMPOSABLE] Response type:', typeof data, 'Is array:', Array.isArray(data));

      // Verificar que sea un array
      if (!Array.isArray(data)) {
        console.error('❌ [COMPOSABLE] Data is not an array:', data);
        return [];
      }

      // Convertir fechas de string a Date
      return data.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
    } catch (error: any) {
      console.error('❌ [COMPOSABLE] Error in getTasks:', error);
      return handleError(error);
    }
  };

  const getTask = async (id: string): Promise<Task> => {
    try {
      const data = await $fetch<Task>(`/api/backend/tasks/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    try {
      const data = await $fetch<Task>('/api/backend/tasks', {
        method: 'POST',
        body: input,
        credentials: 'include',
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
    try {
      const data = await $fetch<Task>(`/api/backend/tasks/${id}`, {
        method: 'PATCH',
        body: input,
        credentials: 'include',
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
    try {
      const data = await $fetch<Task>(`/api/backend/tasks/${id}/status`, {
        method: 'PATCH',
        body: { status },
        credentials: 'include',
      });

      // Convertir fechas de string a Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      await $fetch(`/api/backend/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error: any) {
      return handleError(error);
    }
  };

  const getTaskStats = async (startDate?: Date, endDate?: Date): Promise<TaskStats> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const data = await $fetch<TaskStats>('/api/backend/tasks/stats', {
        method: 'GET',
        params,
        credentials: 'include',
      });

      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  return {
    getTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats,
  };
};
