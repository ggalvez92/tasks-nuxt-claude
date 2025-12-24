/**
 * Voice Recorder Composable
 * Handles microphone access and audio recording using MediaRecorder API
 */

export interface UseVoiceRecorderOptions {
  maxDuration?: number // Maximum recording duration in seconds
  onDurationUpdate?: (duration: number) => void
}

export const useVoiceRecorder = (options: UseVoiceRecorderOptions = {}) => {
  const { maxDuration = 60, onDurationUpdate } = options

  const isRecording = ref(false)
  const isPaused = ref(false)
  const duration = ref(0)
  const error = ref<string | null>(null)
  const audioBlob = ref<Blob | null>(null)
  const hasPermission = ref<boolean | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let durationInterval: ReturnType<typeof setInterval> | null = null
  let stream: MediaStream | null = null

  // Check if browser supports required APIs
  const isSupported = computed(() => {
    if (import.meta.server) return false
    return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
  })

  // Request microphone permission
  async function requestPermission(): Promise<boolean> {
    if (!isSupported.value) {
      error.value = 'Tu navegador no soporta grabación de audio'
      return false
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      hasPermission.value = true
      error.value = null
      return true
    } catch (err: any) {
      hasPermission.value = false
      if (err.name === 'NotAllowedError') {
        error.value = 'Permiso de micrófono denegado. Por favor habilítalo en la configuración del navegador.'
      } else if (err.name === 'NotFoundError') {
        error.value = 'No se encontró micrófono. Por favor conecta uno.'
      } else {
        error.value = 'Error al acceder al micrófono: ' + err.message
      }
      return false
    }
  }

  // Start recording
  async function startRecording(): Promise<boolean> {
    error.value = null
    audioBlob.value = null
    audioChunks = []
    duration.value = 0

    // Ensure we have permission
    if (!stream) {
      const permitted = await requestPermission()
      if (!permitted) return false
    }

    try {
      // Determine best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      mediaRecorder = new MediaRecorder(stream!, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        audioBlob.value = new Blob(audioChunks, { type: mediaRecorder?.mimeType })
        isRecording.value = false
        stopDurationTimer()
      }

      mediaRecorder.onerror = (event: any) => {
        error.value = 'Error durante la grabación: ' + event.error?.message
        stopRecording()
      }

      mediaRecorder.start(1000) // Collect data every second
      isRecording.value = true
      startDurationTimer()

      return true
    } catch (err: any) {
      error.value = 'No se pudo iniciar la grabación: ' + err.message
      return false
    }
  }

  // Stop recording - returns Promise that resolves with the blob
  function stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (mediaRecorder && isRecording.value) {
        // Store original onstop and wrap it
        const originalOnStop = mediaRecorder.onstop
        mediaRecorder.onstop = (event) => {
          if (originalOnStop) {
            originalOnStop.call(mediaRecorder, event)
          }
          // Resolve with the blob after it's created
          resolve(audioBlob.value)
        }
        mediaRecorder.stop()
        stopDurationTimer()
      } else {
        resolve(audioBlob.value)
      }
    })
  }

  // Cancel recording without saving
  function cancelRecording(): void {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
    audioChunks = []
    audioBlob.value = null
    isRecording.value = false
    duration.value = 0
    stopDurationTimer()
  }

  // Duration timer helpers
  function startDurationTimer(): void {
    durationInterval = setInterval(() => {
      duration.value++
      onDurationUpdate?.(duration.value)

      // Auto-stop at max duration
      if (duration.value >= maxDuration) {
        stopRecording()
      }
    }, 1000)
  }

  function stopDurationTimer(): void {
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
  }

  // Cleanup on unmount
  function cleanup(): void {
    cancelRecording()
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
  }

  // Format duration as MM:SS
  const formattedDuration = computed(() => {
    const mins = Math.floor(duration.value / 60)
    const secs = duration.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  onUnmounted(cleanup)

  return {
    // State
    isRecording: readonly(isRecording),
    isPaused: readonly(isPaused),
    duration: readonly(duration),
    formattedDuration,
    error: readonly(error),
    audioBlob: readonly(audioBlob),
    hasPermission: readonly(hasPermission),
    isSupported,
    maxDuration,

    // Actions
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    cleanup,
  }
}
