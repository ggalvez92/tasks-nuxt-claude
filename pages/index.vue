<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Gestor de Tareas</h1>
            <p class="text-sm text-muted-foreground">
              Mostrando {{ filteredTasks.length }} tareas
              <span v-if="todayTasks.length > 0" class="text-muted-foreground/80">
                ({{ todayTasks.length }} para hoy)
              </span>
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline" size="sm" @click="debugCookies">
              🐛 Debug
            </Button>
            <Button variant="outline" @click="goToCategories">
              <FolderOpen class="h-4 w-4 mr-2" />
              Categorías
            </Button>
            <Button variant="outline" @click="goToReports">
              <BarChart3 class="h-4 w-4 mr-2" />
              Reportes
            </Button>
            <Button @click="showCreateTaskModal = true">
              <Plus class="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
            <Button variant="destructive" size="sm" @click="handleLogout">
              <LogOut class="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Date Navigation -->
    <div class="border-b bg-background">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="outline" size="sm" @click="previousDay">
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <div class="text-center">
              <h2 class="font-semibold">{{ formatDate(selectedDate, 'EEEE, dd MMMM yyyy') }}</h2>
            </div>
            <Button variant="outline" size="sm" @click="nextDay">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            @click="goToToday"
            :disabled="isToday(selectedDate)"
          >
            Hoy
          </Button>
        </div>
      </div>
    </div>

    <!-- Task Statistics -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total</p>
              <p class="text-2xl font-bold">{{ filteredTasks.length }}</p>
            </div>
            <ListTodo class="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Completadas</p>
              <p class="text-2xl font-bold text-green-600">
                {{ filteredTasks.filter(t => t.status === 'COMPLETADA').length }}
              </p>
            </div>
            <CheckCircle class="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">En Progreso</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ filteredTasks.filter(t => t.status === 'EN_PROGRESO').length }}
              </p>
            </div>
            <Clock class="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Pendientes</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ filteredTasks.filter(t => t.status === 'PENDIENTE').length }}
              </p>
            </div>
            <Circle class="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      <!-- Task List -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Mis Tareas</h3>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="showFilterModal = true">
              <Filter class="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <p class="text-muted-foreground">Cargando tareas...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">Error: {{ error }}</p>
          <Button @click="tasksStore.fetchTasks()" variant="outline" class="mt-4">
            Reintentar
          </Button>
        </div>

        <div v-else-if="filteredTasks.length === 0" class="text-center py-8">
          <Circle class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground">No tienes tareas aún</p>
          <Button @click="showCreateTaskModal = true" class="mt-4">
            Crear primera tarea
          </Button>
        </div>

        <div v-else class="space-y-3">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @update="updateTask"
            @update-status="updateTaskStatus"
            @delete="deleteTask"
            @edit="editTask"
          />
        </div>
      </Card>
    </div>

    <!-- Create/Edit Task Modal -->
    <TaskModal
      v-model:open="showCreateTaskModal"
      :task="editingTask"
      @save="handleSaveTask"
      @close="closeTaskModal"
    />

    <!-- Filter Modal -->
    <FilterModal
      v-model:open="showFilterModal"
      :current-filter="currentFilter"
      @apply="handleApplyFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronLeft, ChevronRight, ListTodo, CheckCircle, Clock, Circle, Filter, BarChart3, FolderOpen, LogOut } from 'lucide-vue-next'
import { formatDate, formatRelativeDate } from '~/shared/utils'
import { isToday } from 'date-fns'
import type { Task, TaskFilter, UpdateTaskInput, TaskStatus } from '~/shared/types'

definePageMeta({
  middleware: ['auth']
})

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const { logout } = useAuthService()

// Initialize stores - cargar datos desde el backend
onMounted(async () => {
  await tasksStore.initialize()
})

// Reactive state
const { filteredTasks, currentFilter, selectedDate, todayTasks, loading, error } = storeToRefs(tasksStore)
const showCreateTaskModal = ref(false)
const showFilterModal = ref(false)
const editingTask = ref<Task | null>(null)

// Date navigation
function previousDay() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() - 1)
  tasksStore.setSelectedDate(newDate)
}

function nextDay() {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 1)
  tasksStore.setSelectedDate(newDate)
}

function goToToday() {
  tasksStore.setSelectedDate(new Date())
}

// Task operations
async function updateTask(id: string, updates: UpdateTaskInput) {
  await tasksStore.updateTask(id, updates)
}

async function updateTaskStatus(id: string, status: TaskStatus) {
  await tasksStore.updateTaskStatus(id, status)
}

async function deleteTask(id: string) {
  await tasksStore.deleteTask(id)
}

function editTask(task: Task) {
  editingTask.value = task
  showCreateTaskModal.value = true
}

async function handleSaveTask(taskData: any) {
  if (editingTask.value) {
    await tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    await tasksStore.createTask(taskData)
  }
  closeTaskModal()
}

function closeTaskModal() {
  showCreateTaskModal.value = false
  editingTask.value = null
}

async function handleApplyFilter(filter: TaskFilter) {
  await tasksStore.setFilter(filter)
  showFilterModal.value = false
}

function goToReports() {
  navigateTo('/reports')
}

function goToCategories() {
  navigateTo('/categories')
}

async function debugCookies() {
  try {
    const result = await $fetch('/api/debug/cookies')
    console.log('🍪 Cookie Debug Info:', result)
    alert(`Cookies disponibles:\n${JSON.stringify(result, null, 2)}`)
  } catch (error) {
    console.error('Error getting cookie info:', error)
    alert('Error al obtener info de cookies - revisa la consola')
  }
}

async function handleLogout() {
  try {
    await logout()
    navigateTo('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}
</script>
