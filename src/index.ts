import { Hono } from 'hono'
import { ZodError } from 'zod'
import { analysisSchema, requestSchema } from './contract'
import { analyzeGenerative, GenerativeOutputError, type AiBinding } from './generative'
import { analyzeTraditional } from './traditional'

interface Bindings {
  AI: AiBinding
  AI_GATEWAY_ID: string
  AI_MODEL: string
}

export const app = new Hono<{ Bindings: Bindings }>()

app.post('/api/analyze', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'El cuerpo debe ser JSON válido' }, 400)
  }
  const request = requestSchema.safeParse(body)
  if (!request.success) return c.json({ error: 'Solicitud inválida', details: request.error.flatten() }, 400)

  try {
    const result = request.data.mode === 'traditional'
      ? analyzeTraditional(request.data.message)
      : await analyzeGenerative({ message: request.data.message, ai: c.env.AI, model: c.env.AI_MODEL, gatewayId: c.env.AI_GATEWAY_ID })
    const response = analysisSchema.parse(result)
    return c.json(response)
  } catch (error) {
    const reason = error instanceof GenerativeOutputError ? error.reason : error instanceof ZodError ? 'invalid_response_contract' : 'provider_error'
    console.error(JSON.stringify({ event: 'generative_analysis_failed', reason }))
    const message = error instanceof GenerativeOutputError || error instanceof ZodError
      ? 'El proveedor devolvió una salida con formato inválido'
      : 'No fue posible completar el análisis generativo'
    return c.json({ error: message }, 502)
  }
})

app.get('/health', (c) => c.json({ ok: true }))

export default app
