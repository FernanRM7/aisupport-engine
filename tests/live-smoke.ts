import { analysisSchema } from '../src/contract'

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8787'
const response = await fetch(`${baseUrl}/api/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Encontré una vulnerabilidad de inyección que permite consultar datos de otros usuarios sin permiso.',
    mode: 'generative',
  }),
})

if (!response.ok) throw new Error(`El endpoint respondió HTTP ${response.status}: ${await response.text()}`)
const result = analysisSchema.parse(await response.json())
if (result.mode !== 'generative' || result.category !== 'SECURITY' || !result.requiresHumanReview) {
  throw new Error(`El smoke test no cumplió el comportamiento esperado: ${JSON.stringify(result)}`)
}

console.log(JSON.stringify({ ok: true, category: result.category, priority: result.priority, requiresHumanReview: result.requiresHumanReview }, null, 2))
