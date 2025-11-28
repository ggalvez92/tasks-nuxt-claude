<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Gestión de Categorías</h1>
            <p class="text-sm text-muted-foreground">
              Organiza tus tareas por categorías
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button variant="outline" @click="goBack">
              <ArrowLeft class="h-4 w-4 mr-2" />
              Volver a Tareas
            </Button>
            <Button @click="showCreateModal = true">
              <Plus class="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="category in categories" 
          :key="category.id"
          class="p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div 
                class="w-6 h-6 rounded-full"
                :style="{ backgroundColor: category.color }"
              ></div>
              <h3 class="font-semibold">{{ category.name }}</h3>
            </div>
            <div class="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                @click="editCategory(category)"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                @click="deleteCategory(category.id)"
                class="text-destructive hover:text-destructive"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p v-if="category.description" class="text-sm text-muted-foreground mb-4">
            {{ category.description }}
          </p>
          
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">
              {{ getTaskCount(category.id) }} tareas
            </span>
            <span class="text-muted-foreground">
              Creada {{ formatRelativeDate(category.createdAt) }}
            </span>
          </div>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Category Modal -->
    <div v-if="showCreateModal || editingCategory" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">
              {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
            <Button variant="ghost" size="sm" @click="closeModal">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nombre *</label>
              <Input
                v-model="form.name"
                placeholder="Nombre de la categoría"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Color *</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.color"
                  type="color"
                  class="w-12 h-10 rounded border border-input"
                  required
                />
                <Input
                  v-model="form.color"
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Descripción</label>
              <textarea
                v-model="form.description"
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descripción de la categoría (opcional)"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" @click="closeModal">
                Cancelar
              </Button>
              <Button type="submit">
                {{ editingCategory ? 'Actualizar' : 'Crear' }} Categoría
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-vue-next'
import { formatRelativeDate } from '~/shared/utils'
import type { Category } from '~/shared/types'

definePageMeta({
  middleware: ['auth']
})

const categoriesStore = useCategoriesStore()
const tasksStore = useTasksStore()

const { categories } = storeToRefs(categoriesStore)
const { taskStats } = storeToRefs(tasksStore)

// Initialize stores - cargar datos desde el backend
onMounted(async () => {
  await categoriesStore.initialize()
  await tasksStore.initialize()
})

const showCreateModal = ref(false)
const editingCategory = ref<Category | null>(null)

const form = reactive({
  name: '',
  color: '#3b82f6',
  description: ''
})

function goBack() {
  navigateTo('/')
}

function editCategory(category: Category) {
  editingCategory.value = category
  form.name = category.name
  form.color = category.color
  form.description = category.description || ''
}

function closeModal() {
  showCreateModal.value = false
  editingCategory.value = null
  resetForm()
}

function resetForm() {
  form.name = ''
  form.color = '#3b82f6'
  form.description = ''
}

async function handleSubmit() {
  if (editingCategory.value) {
    await categoriesStore.updateCategory(editingCategory.value.id, {
      name: form.name,
      color: form.color,
      description: form.description || undefined
    })
  } else {
    await categoriesStore.createCategory({
      name: form.name,
      color: form.color,
      description: form.description || undefined
    })
  }

  closeModal()
}

async function deleteCategory(id: string) {
  if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
    await categoriesStore.deleteCategory(id)
  }
}

function getTaskCount(categoryId: string): number {
  return taskStats.value.byCategory[categoryId] || 0
}
</script>