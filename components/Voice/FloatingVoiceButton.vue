<template>
  <div class="fixed bottom-6 right-6 z-40">
    <!-- Main FAB -->
    <Button
      :variant="isRecording ? 'destructive' : 'default'"
      size="icon"
      class="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
      :class="{
        'animate-pulse ring-4 ring-destructive/30': isRecording,
      }"
      @click="handleFabClick"
    >
      <Loader2 v-if="isProcessing" class="h-6 w-6 animate-spin" />
      <Square v-else-if="isRecording" class="h-6 w-6" />
      <Mic v-else class="h-6 w-6" />
    </Button>

    <!-- Recording duration overlay -->
    <div
      v-if="isRecording"
      class="absolute -top-8 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-mono shadow-lg"
    >
      {{ formattedDuration }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mic, Square, Loader2 } from 'lucide-vue-next'

interface Emits {
  (e: 'open-modal'): void
  (e: 'quick-record-complete', audioBlob: Blob): void
}

const emit = defineEmits<Emits>()

const isProcessing = ref(false)

const {
  isRecording,
  formattedDuration,
  startRecording,
  stopRecording,
} = useVoiceRecorder({ maxDuration: 60 })

function handleFabClick() {
  if (isRecording.value) {
    // Stop recording and emit
    const blob = stopRecording()
    if (blob) {
      emit('quick-record-complete', blob)
    }
  } else {
    // Open modal for full experience
    emit('open-modal')
  }
}
</script>
