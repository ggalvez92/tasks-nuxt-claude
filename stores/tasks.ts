import { defineStore } from 'pinia'
import type { Task, TaskFilter, TaskStats, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from '~/shared/types'
import { getTodayRange, getDateRange } from '~/shared/utils'

export const useTasksStore = defineStore('tasks', () => {
  const tasksApi = useTasksApi()

  const tasks = ref<Task[]>([])
  const selectedDate = ref<Date>(new Date())
  // Inicializar el filtro con el rango de fecha del día actual
  const currentFilter = ref<TaskFilter>({
    dateRange: getDateRange(new Date())
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters computed
  const filteredTasks = computed(() => {
    let filtered = tasks.value
    console.log('🔍 Total de tareas en store:', tasks.value.length)

    // Filtro por fecha - SOLO filtrar si hay un dateRange explícito
    if (currentFilter.value.dateRange) {
      filtered = filtered.filter(task => {
        const taskDate = task.dueDate || task.createdAt
        return taskDate >= currentFilter.value.dateRange!.start &&
               taskDate <= currentFilter.value.dateRange!.end
      })
      console.log('📅 Después de filtro de fecha:', filtered.length)
    }
    // Si NO hay filtro de fecha, mostrar TODAS las tareas

    // Filtro por estado
    if (currentFilter.value.status?.length) {
      filtered = filtered.filter(task => 
        currentFilter.value.status!.includes(task.status)
      )
    }

    // Filtro por prioridad
    if (currentFilter.value.priority?.length) {
      filtered = filtered.filter(task => 
        currentFilter.value.priority!.includes(task.priority)
      )
    }

    // Filtro por categoría
    if (currentFilter.value.categoryId?.length) {
      filtered = filtered.filter(task => 
        currentFilter.value.categoryId!.includes(task.categoryId)
      )
    }

    // Filtro por búsqueda
    if (currentFilter.value.search) {
      const search = currentFilter.value.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        task.tags?.some(tag => tag.toLowerCase().includes(search))
      )
    }

    // Filtro por tags
    if (currentFilter.value.tags?.length) {
      filtered = filtered.filter(task =>
        task.tags?.some(tag => currentFilter.value.tags!.includes(tag))
      )
    }

    console.log('✅ Tareas después de todos los filtros:', filtered.length)
    return filtered
  })

  const taskStats = computed((): TaskStats => {
    const allTasks = tasks.value
    const total = allTasks.length
    const completed = allTasks.filter(t => t.status === 'COMPLETADA').length
    const pending = allTasks.filter(t => t.status === 'PENDIENTE').length
    const inProgress = allTasks.filter(t => t.status === 'EN_PROGRESO').length
    const cancelled = allTasks.filter(t => t.status === 'CANCELADA').length

    const byCategory = allTasks.reduce((acc, task) => {
      acc[task.categoryId] = (acc[task.categoryId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = allTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<TaskPriority, number>)

    return {
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      byCategory,
      byPriority,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  })

  const todayTasks = computed(() => {
    const { start, end } = getTodayRange()
    return tasks.value.filter(task => {
      const taskDate = task.dueDate || task.createdAt
      return taskDate >= start && taskDate <= end
    })
  })

  // Actions

  /**
   * Cargar todas las tareas desde el backend con filtros opcionales
   */
  async function fetchTasks(filters?: TaskFilter): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const data = await tasksApi.getTasks(filters || currentFilter.value)
      console.log('📥 Tareas recibidas del backend:', data.length)
      console.log('📋 Datos de tareas:', data)
      tasks.value = data
      initialized.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      console.error('❌ Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nueva tarea en el backend
   */
  async function createTask(input: CreateTaskInput): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const task = await tasksApi.createTask(input)
      tasks.value.push(task)
      return task
    } catch (err: any) {
      error.value = err.message || 'Failed to create task'
      console.error('Error creating task:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar tarea en el backend
   */
  async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const updatedTask = await tasksApi.updateTask(id, input)
      const index = tasks.value.findIndex(t => t.id === id)

      if (index !== -1) {
        tasks.value[index] = updatedTask
      }

      return updatedTask
    } catch (err: any) {
      error.value = err.message || 'Failed to update task'
      console.error('Error updating task:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar solo el estado de una tarea
   */
  async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    error.value = null

    // Optimistic update: actualizar UI primero
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return null

    const previousTask = { ...tasks.value[index] }
    tasks.value[index] = { ...previousTask, status, updatedAt: new Date() }

    try {
      // Luego sincronizar con el servidor
      const updatedTask = await tasksApi.updateTaskStatus(id, status)
      tasks.value[index] = updatedTask
      return updatedTask
    } catch (err: any) {
      // Si falla, revertir al estado anterior
      tasks.value[index] = previousTask
      error.value = err.message || 'Failed to update task status'
      console.error('Error updating task status:', err)
      return null
    }
  }

  /**
   * Eliminar tarea del backend
   */
  async function deleteTask(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await tasksApi.deleteTask(id)
      const index = tasks.value.findIndex(t => t.id === id)

      if (index !== -1) {
        tasks.value.splice(index, 1)
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task'
      console.error('Error deleting task:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener una tarea por ID (del estado local o del backend si no está)
   */
  async function getTask(id: string): Promise<Task | null> {
    // Primero buscar en el estado local
    const localTask = tasks.value.find(t => t.id === id)
    if (localTask) return localTask

    // Si no está, buscar en el backend
    loading.value = true
    error.value = null

    try {
      const task = await tasksApi.getTask(id)
      return task
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
      console.error('Error fetching task:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Establecer filtros y recargar tareas
   */
  async function setFilter(filter: TaskFilter): Promise<void> {
    currentFilter.value = filter
    await fetchTasks(filter)
  }

  /**
   * Limpiar filtros y recargar tareas
   */
  async function clearFilter(): Promise<void> {
    const today = new Date()
    selectedDate.value = today
    // Mantener el filtro de fecha actual al limpiar otros filtros
    currentFilter.value = {
      dateRange: getDateRange(today)
    }
    await fetchTasks()
  }

  /**
   * Establecer fecha seleccionada y actualizar el filtro de fecha
   */
  function setSelectedDate(date: Date): void {
    selectedDate.value = date
    // Actualizar el filtro para mostrar tareas de la fecha seleccionada
    const dateRange = getDateRange(date)
    currentFilter.value = {
      ...currentFilter.value,
      dateRange
    }
  }

  /**
   * Inicializar store (cargar tareas y categorías)
   */
  async function initialize(): Promise<void> {
    if (!initialized.value) {
      // Inicializar categorías primero
      const categoriesStore = useCategoriesStore()
      await categoriesStore.initialize()
      // Luego cargar tareas
      await fetchTasks()
    }
  }

  /**
   * Limpiar state (útil para logout)
   */
  function clear(): void {
    tasks.value = []
    const today = new Date()
    selectedDate.value = today
    currentFilter.value = {
      dateRange: getDateRange(today)
    }
    initialized.value = false
    error.value = null
    loading.value = false
  }

  return {
    // State
    tasks,
    currentFilter,
    selectedDate,
    loading,
    error,
    initialized,

    // Getters
    filteredTasks,
    taskStats,
    todayTasks,

    // Actions
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTask,
    setFilter,
    clearFilter,
    setSelectedDate,
    initialize,
    clear
  }
})