<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Reportes de Tareas</h1>
            <p class="text-sm text-muted-foreground">
              Análisis y estadísticas de tu productividad
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline" @click="goBack">
              <ArrowLeft class="h-4 w-4 mr-2" />
              Volver a Tareas
            </Button>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6 space-y-6">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total de Tareas</p>
              <p class="text-3xl font-bold">{{ taskStats.total }}</p>
            </div>
            <ListTodo class="h-10 w-10 text-muted-foreground" />
          </div>
        </Card>
        
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Tasa de Completación</p>
              <p class="text-3xl font-bold text-green-600">{{ Math.round(taskStats.completionRate) }}%</p>
            </div>
            <TrendingUp class="h-10 w-10 text-green-600" />
          </div>
        </Card>
        
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Completadas</p>
              <p class="text-3xl font-bold text-green-600">{{ taskStats.completed }}</p>
            </div>
            <CheckCircle class="h-10 w-10 text-green-600" />
          </div>
        </Card>
        
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">En Progreso</p>
              <p class="text-3xl font-bold text-blue-600">{{ taskStats.inProgress }}</p>
            </div>
            <Clock class="h-10 w-10 text-blue-600" />
          </div>
        </Card>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tasks by Status -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Distribución por Estado</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span class="text-sm">Completadas</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.completed }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500" 
                    :style="{ width: `${(taskStats.completed / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span class="text-sm">En Progreso</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.inProgress }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-blue-500" 
                    :style="{ width: `${(taskStats.inProgress / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                <span class="text-sm">Pendientes</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.pending }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-yellow-500" 
                    :style="{ width: `${(taskStats.pending / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-500 rounded"></div>
                <span class="text-sm">Canceladas</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.cancelled }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-red-500" 
                    :style="{ width: `${(taskStats.cancelled / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Tasks by Priority -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4">Distribución por Prioridad</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-600 rounded"></div>
                <span class="text-sm">Urgente</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.byPriority.URGENTE || 0 }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-red-600"
                    :style="{ width: `${((taskStats.byPriority.URGENTE || 0) / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-orange-500 rounded"></div>
                <span class="text-sm">Alta</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.byPriority.ALTA || 0 }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-500"
                    :style="{ width: `${((taskStats.byPriority.ALTA || 0) / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                <span class="text-sm">Media</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.byPriority.MEDIA || 0 }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-yellow-500"
                    :style="{ width: `${((taskStats.byPriority.MEDIA || 0) / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span class="text-sm">Baja</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ taskStats.byPriority.BAJA || 0 }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500"
                    :style="{ width: `${((taskStats.byPriority.BAJA || 0) / taskStats.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Tasks by Category -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Tareas por Categoría</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(count, categoryId) in taskStats.byCategory" 
            :key="categoryId"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: getCategoryColor(categoryId) }"
              ></div>
              <span class="font-medium">{{ getCategoryName(categoryId) }}</span>
            </div>
            <Badge variant="secondary">{{ count }}</Badge>
          </div>
        </div>
      </Card>

      <!-- Recent Activity -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div class="space-y-4">
          <div 
            v-for="task in recentTasks" 
            :key="task.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                :class="cn(
                  'w-2 h-2 rounded-full',
                  task.status === 'COMPLETADA' ? 'bg-green-500' :
                  task.status === 'EN_PROGRESO' ? 'bg-blue-500' :
                  task.status === 'PENDIENTE' ? 'bg-yellow-500' : 'bg-red-500'
                )"
              ></div>
              <div>
                <p class="font-medium">{{ task.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ getCategoryName(task.categoryId) }} • {{ formatRelativeDate(task.updatedAt) }}
                </p>
              </div>
            </div>
            <Badge 
              :variant="getStatusVariant(task.status)"
              class="text-xs"
            >
              {{ getStatusLabel(task.status) }}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ListTodo, TrendingUp, CheckCircle, Clock } from 'lucide-vue-next'
import { cn, formatRelativeDate } from '~/shared/utils'
import type { TaskStatus } from '~/shared/types'

definePageMeta({
  middleware: ['auth']
})

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()

const { taskStats, tasks } = storeToRefs(tasksStore)
const { categories } = storeToRefs(categoriesStore)

// Initialize stores - cargar datos desde el backend
onMounted(async () => {
  await categoriesStore.initialize()
  await tasksStore.initialize()
})

const recentTasks = computed(() => {
  return tasks.value
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
})

function goBack() {
  navigateTo('/')
}

function getCategoryName(categoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Sin categoría'
}

function getCategoryColor(categoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.color || '#gray'
}

function getStatusLabel(status: TaskStatus): string {
  const labels = {
    PENDIENTE: 'Pendiente',
    EN_PROGRESO: 'En Progreso',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada'
  }
  return labels[status]
}

function getStatusVariant(status: TaskStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants = {
    PENDIENTE: 'outline' as const,
    EN_PROGRESO: 'default' as const,
    COMPLETADA: 'secondary' as const,
    CANCELADA: 'destructive' as const
  }
  return variants[status]
}
</script>