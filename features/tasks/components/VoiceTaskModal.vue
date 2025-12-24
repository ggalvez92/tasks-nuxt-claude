<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <Card class="w-full max-w-lg">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Nueva Tarea por Voz</h2>
          <Button variant="ghost" size="sm" @click="handleClose">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Recording State -->
        <div v-if="state === 'recording'" class="text-center py-8">
          <div class="relative inline-flex mb-6">
            <div
              class="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center"
              :class="{ 'animate-pulse': isRecording }"
            >
              <Mic class="h-12 w-12 text-destructive" />
            </div>
            <!-- Pulse rings -->
            <div v-if="isRecording" class="absolute inset-0 rounded-full border-4 border-destructive animate-ping opacity-20" />
          </div>

          <p class="text-2xl font-mono mb-2">{{ formattedDuration }}</p>
          <p class="text-muted-foreground mb-6">
            {{ isRecording ? 'Grabando... Habla claramente' : 'Presiona para comenzar' }}
          </p>

          <div class="flex justify-center gap-4">
            <Button
              v-if="!isRecording"
              @click="handleStartRecording"
              size="lg"
            >
              <Mic class="h-5 w-5 mr-2" />
              Comenzar a grabar
            </Button>
            <template v-else>
              <Button
                variant="destructive"
                size="lg"
                @click="finishRecording"
              >
                <Square class="h-5 w-5 mr-2" />
                Detener
              </Button>
              <Button
                variant="outline"
                size="lg"
                @click="cancelCurrentRecording"
              >
                Cancelar
              </Button>
            </template>
          </div>
        </div>

        <!-- Processing State -->
        <div v-else-if="state === 'processing'" class="text-center py-12">
          <Loader2 class="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p class="text-muted-foreground">{{ processingMessage }}</p>
        </div>

        <!-- Preview State -->
        <div v-else-if="state === 'preview'" class="space-y-4">
          <!-- Transcription -->
          <div class="p-4 bg-muted rounded-lg">
            <p class="text-sm text-muted-foreground mb-1">Transcripcion:</p>
            <p class="italic">"{{ transcription }}"</p>
          </div>

          <!-- Parsed Fields Preview -->
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium">Titulo</label>
              <Input v-model="editableTask.title" />
            </div>

            <div v-if="editableTask.description">
              <label class="text-sm font-medium">Descripcion</label>
              <Input v-model="editableTask.description" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium">Prioridad</label>
                <select
                  v-model="editableTask.priority"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium">Categoria</label>
                <select
                  v-model="editableTask.categoryId"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Confidence indicator -->
            <div v-if="confidence < 0.7" class="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle class="h-4 w-4" />
              <span>Confianza baja - por favor revisa los campos</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" @click="resetToRecording">
              <RotateCcw class="h-4 w-4 mr-2" />
              Grabar de nuevo
            </Button>
            <Button @click="confirmTask" :disabled="!editableTask.title || !editableTask.categoryId">
              <Check class="h-4 w-4 mr-2" />
              Crear Tarea
            </Button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="state === 'error'" class="text-center py-8">
          <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
          <p class="text-destructive mb-4">{{ errorMessage }}</p>
          <Button @click="resetToRecording">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  X, Mic, Square, Loader2, Check,
  RotateCcw, AlertCircle, AlertTriangle
} from 'lucide-vue-next'
import type { CreateTaskInput, TaskPriority } from '~/shared/types'

type ModalState = 'recording' | 'processing' | 'preview' | 'error'

interface Emits {
  (e: 'close'): void
  (e: 'task-created', task: CreateTaskInput): void
}

const emit = defineEmits<Emits>()
const open = defineModel<boolean>('open', { required: true })

const categoriesStore = useCategoriesStore()
const { categories } = storeToRefs(categoriesStore)
const voiceTaskApi = useVoiceTaskApi()

const state = ref<ModalState>('recording')
const processingMessage = ref('')
const errorMessage = ref('')
const transcription = ref('')
const confidence = ref(1)

const editableTask = reactive({
  title: '',
  description: '',
  priority: 'MEDIA' as TaskPriority,
  categoryId: '',
  dueDate: undefined as Date | undefined,
  tags: [] as string[],
  estimatedTime: undefined as number | undefined,
})

const {
  isRecording,
  formattedDuration,
  audioBlob,
  startRecording,
  stopRecording,
  cancelRecording,
  error: recorderError,
} = useVoiceRecorder({ maxDuration: 60 })

async function handleStartRecording() {
  await startRecording()
}

async function finishRecording() {
  const blob = await stopRecording()
  if (blob) {
    await processRecording(blob)
  }
}

function cancelCurrentRecording() {
  cancelRecording()
  resetToRecording()
}

async function processRecording(blob: Blob) {
  state.value = 'processing'

  try {
    processingMessage.value = 'Transcribiendo audio...'
    const result = await voiceTaskApi.processVoiceToTask(blob, categories.value)

    transcription.value = result.transcription.text
    confidence.value = result.parsedTask.confidence

    // Populate editable task
    editableTask.title = result.parsedTask.title
    editableTask.description = result.parsedTask.description || ''
    editableTask.priority = result.parsedTask.priority
    editableTask.tags = result.parsedTask.tags || []
    editableTask.estimatedTime = result.parsedTask.estimatedTime

    // Try to match category by name
    if (result.parsedTask.categoryName) {
      const matchedCategory = categories.value.find(
        c => c.name.toLowerCase() === result.parsedTask.categoryName?.toLowerCase()
      )
      editableTask.categoryId = matchedCategory?.id || ''
    }

    // Parse due date if provided
    if (result.parsedTask.dueDate) {
      editableTask.dueDate = new Date(result.parsedTask.dueDate)
    }

    state.value = 'preview'
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al procesar la grabacion'
    state.value = 'error'
  }
}

function resetToRecording() {
  state.value = 'recording'
  transcription.value = ''
  editableTask.title = ''
  editableTask.description = ''
  editableTask.priority = 'MEDIA'
  editableTask.categoryId = ''
  editableTask.dueDate = undefined
  editableTask.tags = []
  editableTask.estimatedTime = undefined
}

function confirmTask() {
  const taskData: CreateTaskInput = {
    title: editableTask.title,
    description: editableTask.description || undefined,
    priority: editableTask.priority,
    categoryId: editableTask.categoryId,
    dueDate: editableTask.dueDate,
    tags: editableTask.tags.length > 0 ? editableTask.tags : undefined,
    estimatedTime: editableTask.estimatedTime,
  }

  emit('task-created', taskData)
  handleClose()
}

function handleClose() {
  cancelRecording()
  resetToRecording()
  emit('close')
  open.value = false
}

// Watch for recorder errors
watch(recorderError, (err) => {
  if (err) {
    errorMessage.value = err
    state.value = 'error'
  }
})
</script>
