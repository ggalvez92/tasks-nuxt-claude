/**
 * Task Parsing Endpoint
 * Uses GPT-4 to extract structured task fields from transcribed text
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenAI API key not configured',
    })
  }

  try {
    await requireAccessToken(event)

    const body = await readBody(event)
    const { text, categories } = body

    if (!text) {
      throw createError({
        statusCode: 400,
        message: 'No text provided for parsing',
      })
    }

    // Build category list for context
    const categoryList = categories?.map((c: any) => c.name).join(', ') || 'General'

    const systemPrompt = `Eres un asistente que extrae información de tareas a partir de comandos de voz en español.

Extrae los siguientes campos del texto del usuario:
- title: El título principal de la tarea (requerido)
- description: Descripción adicional si la hay
- priority: La prioridad (BAJA, MEDIA, ALTA, URGENTE). Por defecto MEDIA.
- categoryName: Categoría que mejor coincida de: ${categoryList}
- dueDate: Fecha/hora límite en formato ISO si se menciona (interpreta "mañana", "próximo lunes", etc.)
- tags: Array de etiquetas relevantes si se mencionan
- estimatedTime: Tiempo estimado en minutos si se menciona
- confidence: Tu nivel de confianza en la extracción (0.0 a 1.0)

Responde SOLO con un objeto JSON válido, sin markdown ni explicaciones.

Ejemplos de interpretación:
- "urgente" o "cuanto antes" -> URGENTE
- "importante" o "alta prioridad" -> ALTA
- "cuando pueda" o "baja prioridad" -> BAJA
- "para mañana a las 3" -> dueDate con fecha de mañana a las 15:00
- "en una hora" -> dueDate con hora actual + 1 hora

Fecha actual: ${new Date().toISOString()}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.openaiModel || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || 'GPT parsing failed',
      })
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    // Parse JSON response
    try {
      const parsed = JSON.parse(content)
      return {
        title: parsed.title || text.substring(0, 50),
        description: parsed.description,
        priority: parsed.priority || 'MEDIA',
        categoryName: parsed.categoryName,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
        estimatedTime: parsed.estimatedTime,
        confidence: parsed.confidence || 0.7,
      }
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: text.substring(0, 100),
        priority: 'MEDIA',
        confidence: 0.3,
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to parse task',
    })
  }
})
