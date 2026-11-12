import { describe, expect, it } from 'vitest'
import { app } from '../src/index'

describe('POST /api/analyze traditional', () => {
  it('returns valid classification and forces human review for security', async () => {
    const response = await app.request('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Encontré una vulnerabilidad', mode: 'traditional' }),
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ category: 'SECURITY', priority: 'HIGH', requiresHumanReview: true, mode: 'traditional' })
  })

  it('rejects invalid input', async () => {
    const response = await app.request('/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '', mode: 'unknown' }),
    })
    expect(response.status).toBe(400)
  })
})
