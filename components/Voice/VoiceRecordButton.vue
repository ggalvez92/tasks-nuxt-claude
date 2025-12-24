<template>
  <div class="relative inline-flex items-center">
    <!-- Main Record Button -->
    <UiButton
      :variant="isRecording ? 'destructive' : variant"
      :size="size"
      :disabled="isProcessing || !isSupported"
      @click="handleClick"
      :class="cn(
        'relative transition-all duration-200',
        isRecording && 'animate-pulse ring-2 ring-destructive ring-offset-2',
        buttonClass
      )"
    >
      <!-- Icon states -->
      <Loader2 v-if="isProcessing" class="h-4 w-4 animate-spin" />
      <MicOff v-else-if="!isSupported" class="h-4 w-4" />
      <Square v-else-if="isRecording" class="h-4 w-4" />
      <Mic v-else class="h-4 w-4" />

      <!-- Duration display when recording -->
      <span v-if="isRecording && showDuration" class="ml-2 font-mono text-sm">
        {{ formattedDuration }}
      </span>

      <!-- Slot for additional content -->
      <slot />
    </UiButton>

    <!-- Recording indicator pulse -->
    <span
      v-if="isRecording"
      class="absolute -top-1 -right-1 h-3 w-3"
    >
      <span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>

    <!-- Error tooltip -->
    <div
      v-if="error"
      class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-destructive text-destructive-foreground text-xs rounded-md whitespace-nowrap z-50"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mic, MicOff, Square, Loader2 } from 'lucide-vue-next'
import { cn } from '~/shared/utils'

interface Props {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showDuration?: boolean
  buttonClass?: string
}

interface Emits {
  (e: 'recording-complete', audioBlob: Blob): void
  (e: 'recording-start'): void
  (e: 'recording-cancel'): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outline',
  size: 'default',
  showDuration: true,
})

const emit = defineEmits<Emits>()

const isProcessing = ref(false)

const {
  isRecording,
  formattedDuration,
  error,
  audioBlob,
  isSupported,
  startRecording,
  stopRecording,
  cancelRecording,
} = useVoiceRecorder({
  maxDuration: 60,
})

async function handleClick() {
  if (isRecording.value) {
    // Stop and emit the recording
    const blob = stopRecording()
    if (blob) {
      emit('recording-complete', blob)
    }
  } else {
    // Start recording
    const started = await startRecording()
    if (started) {
      emit('recording-start')
    } else if (error.value) {
      emit('error', error.value)
    }
  }
}

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})

// Expose methods for parent control
defineExpose({
  isRecording,
  isProcessing,
  startRecording,
  stopRecording,
  cancelRecording,
})
</script>
