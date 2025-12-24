import type { TaskPriority } from './task'

export interface VoiceTranscription {
  text: string
  duration?: number
  language?: string
}

export interface ParsedTaskData {
  title: string
  description?: string
  priority: TaskPriority
  categoryName?: string
  dueDate?: string // ISO string
  tags?: string[]
  estimatedTime?: number
  confidence: number // 0-1 confidence score
}

export interface VoiceRecordingState {
  isRecording: boolean
  isProcessing: boolean
  error: string | null
  audioBlob: Blob | null
  duration: number
}

export interface VoiceTaskResult {
  transcription: VoiceTranscription
  parsedTask: ParsedTaskData
}
