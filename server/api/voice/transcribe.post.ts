/**
 * Voice Transcription Endpoint
 * Receives audio file and returns transcribed text using OpenAI Whisper
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Validate OpenAI API key is configured
  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message:
        "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
    });
  }

  try {
    // Require authentication
    await requireAccessToken(event);

    // Read multipart form data (audio file)
    const formData = await readMultipartFormData(event);
    const audioFile = formData?.find((item) => item.name === "audio");

    if (!audioFile || !audioFile.data) {
      throw createError({
        statusCode: 400,
        message: "No audio file provided",
      });
    }

    // Create FormData for OpenAI API
    const openaiFormData = new FormData();
    const blob = new Blob([new Uint8Array(audioFile.data)], {
      type: audioFile.type || "audio/webm",
    });
    openaiFormData.append("file", blob, audioFile.filename || "recording.webm");
    openaiFormData.append("model", config.openaiWhisperModel || "whisper-1");
    openaiFormData.append("language", "es"); // Spanish as default
    openaiFormData.append("response_format", "json");

    // Call OpenAI Whisper API
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: openaiFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw createError({
        statusCode: response.status,
        message: error.error?.message || "Whisper transcription failed",
      });
    }

    const result = await response.json();

    return {
      text: result.text,
      language: result.language,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      message: error.message || "Failed to transcribe audio",
    });
  }
});
