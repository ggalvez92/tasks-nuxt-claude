export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'

export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export interface Category {
  id: string
  name: string
  color: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  categoryId: string
  category?: Category
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  estimatedTime?: number // minutos
  actualTime?: number // minutos
  userId?: string
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  categoryId?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  search?: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  cancelled: number
  byCategory: Record<string, number>
  byPriority: Record<TaskPriority, number>
  completionRate: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
  categoryId: string
  dueDate?: Date
  tags?: string[]
  estimatedTime?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  categoryId?: string
  dueDate?: Date
  tags?: string[]
  estimatedTime?: number
  actualTime?: number
}