/**
 * Voice Task API Composable
 * Handles communication with voice transcription and parsing endpoints
 */

import type { VoiceTranscription, ParsedTaskData, VoiceTaskResult, Category } from '~/shared/types'

export const useVoiceTaskApi = () => {
  // Helper for consistent error handling (matching existing pattern)
  const handleError = (error: any): never => {
    if (error.data) {
      throw new Error(error.data.message || 'An error occurred')
    }
    throw new Error(error.message || 'An unexpected error occurred')
  }

  /**
   * Transcribe audio file to text using Whisper API
   */
  const transcribeAudio = async (audioBlob: Blob): Promise<VoiceTranscription> => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const data = await $fetch<VoiceTranscription>('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      return data
    } catch (error: any) {
      return handleError(error)
    }
  }

  /**
   * Parse transcribed text to extract task fields using GPT-4
   */
  const parseTaskFromText = async (
    text: string,
    categories: Category[]
  ): Promise<ParsedTaskData> => {
    try {
      const data = await $fetch<ParsedTaskData>('/api/voice/parse-task', {
        method: 'POST',
        body: { text, categories },
        credentials: 'include',
      })

      return data
    } catch (error: any) {
      return handleError(error)
    }
  }

  /**
   * Full pipeline: transcribe audio and parse to task
   */
  const processVoiceToTask = async (
    audioBlob: Blob,
    categories: Category[]
  ): Promise<VoiceTaskResult> => {
    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(audioBlob)

    if (!transcription.text?.trim()) {
      throw new Error('No se pudo transcribir el audio. Por favor intenta de nuevo.')
    }

    // Step 2: Parse transcription to task fields
    const parsedTask = await parseTaskFromText(transcription.text, categories)

    return {
      transcription,
      parsedTask,
    }
  }

  return {
    transcribeAudio,
    parseTaskFromText,
    processVoiceToTask,
  }
}
