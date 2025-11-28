<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">
            {{ isEditing ? 'Editar Tarea' : 'Nueva Tarea' }}
          </h2>
          <Button variant="ghost" size="sm" @click="$emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Title -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Título *</label>
            <Input
              v-model="form.title"
              placeholder="Ingresa el título de la tarea"
              required
            />
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Descripción</label>
            <textarea
              v-model="form.description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe la tarea (opcional)"
            />
          </div>

          <!-- Category and Priority Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Categoría *</label>
              <select
                v-model="form.categoryId"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Selecciona una categoría</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Prioridad *</label>
              <select
                v-model="form.priority"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>

          <!-- Due Date and Estimated Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Fecha límite</label>
              <Input
                v-model="dueDateInput"
                type="datetime-local"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Tiempo estimado (minutos)</label>
              <Input
                v-model.number="form.estimatedTime"
                type="number"
                min="1"
                placeholder="ej: 30"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Etiquetas</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <Badge
                v-for="(tag, index) in form.tags"
                :key="index"
                variant="secondary"
                class="flex items-center gap-1 px-2 py-1"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="hover:text-destructive"
                >
                  <X class="h-3 w-3" />
                </button>
              </Badge>
            </div>
            <div class="flex gap-2">
              <Input
                v-model="newTag"
                placeholder="Agregar etiqueta"
                @keyup.enter="addTag"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addTag"
                :disabled="!newTag.trim()"
              >
                Agregar
              </Button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" @click="$emit('close')">
              Cancelar
            </Button>
            <Button type="submit">
              {{ isEditing ? 'Actualizar' : 'Crear' }} Tarea
            </Button>
          </div>
        </form>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Task, TaskPriority, CreateTaskInput } from '~/shared/types'

interface Props {
  task?: Task | null
}

interface Emits {
  (e: 'save', data: CreateTaskInput): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const open = defineModel<boolean>('open', { required: true })

const categoriesStore = useCategoriesStore()
const { categories } = storeToRefs(categoriesStore)

const isEditing = computed(() => !!props.task)

const form = reactive({
  title: '',
  description: '',
  categoryId: '',
  priority: 'MEDIA' as TaskPriority,
  estimatedTime: undefined as number | undefined,
  tags: [] as string[]
})

const dueDateInput = ref('')
const newTag = ref('')

// Watch for task changes to populate form
watch(() => props.task, (task) => {
  if (task) {
    form.title = task.title
    form.description = task.description || ''
    form.categoryId = task.categoryId
    form.priority = task.priority
    form.estimatedTime = task.estimatedTime
    form.tags = [...(task.tags || [])]
    
    if (task.dueDate) {
      dueDateInput.value = task.dueDate.toISOString().slice(0, 16)
    } else {
      dueDateInput.value = ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.title = ''
  form.description = ''
  form.categoryId = ''
  form.priority = 'MEDIA'
  form.estimatedTime = undefined
  form.tags = []
  dueDateInput.value = ''
  newTag.value = ''
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(index: number) {
  form.tags.splice(index, 1)
}

function handleSubmit() {
  const data: CreateTaskInput = {
    title: form.title,
    description: form.description || undefined,
    categoryId: form.categoryId,
    priority: form.priority,
    estimatedTime: form.estimatedTime,
    tags: form.tags.length > 0 ? form.tags : undefined,
    dueDate: dueDateInput.value ? new Date(dueDateInput.value) : undefined
  }

  emit('save', data)
}

// Close modal when clicking outside
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>