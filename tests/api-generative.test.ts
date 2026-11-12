import { describe, expect, it } from 'vitest'
import { app } from '../src/index'
import type { AiBinding } from '../src/generative'

const securityJson = JSON.stringify({
  category: 'SECURITY',
  priority: 'HIGH',
  response: 'El equipo de seguridad revisará el reporte.',
  requiresHumanReview: false,
})

function callGenerative(ai: AiBinding) {
  return app.request('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Encontré acceso no autorizado', mode: 'generative' }),
  }, { AI: ai, AI_GATEWAY_ID: 'default', AI_MODEL: '@cf/openai/gpt-oss-20b' })
}

describe('POST /api/analyze generative', () => {
  it('returns the shared contract and enforces human review for security', async () => {
    const response = await callGenerative({ async run() { return { response: securityJson } } })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      category: 'SECURITY',
      priority: 'HIGH',
      response: 'El equipo de seguridad revisará el reporte.',
      requiresHumanReview: true,
      mode: 'generative',
    })
  })

  it('returns a controlled 502 for invalid model output without leaking provider details', async () => {
    const response = await callGenerative({ async run() { throw new Error('secret provider diagnostic') } })
    expect(response.status).toBe(502)
    const body = await response.text()
    expect(body).toContain('No fue posible completar')
    expect(body).not.toContain('secret provider diagnostic')
  })
})
