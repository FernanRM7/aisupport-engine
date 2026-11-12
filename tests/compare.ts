import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { z } from 'zod'
import { analysisSchema, categorySchema, prioritySchema } from '../src/contract'

const casesSchema = z.array(z.object({ id: z.string(), message: z.string(), category: categorySchema, priority: prioritySchema }))
const cases = casesSchema.parse(JSON.parse(await readFile(new URL('./dataset.json', import.meta.url), 'utf8')))
const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8787'
const rows: Array<Record<string, unknown>> = []

for (const testCase of cases) {
  for (const mode of ['traditional', 'generative'] as const) {
    let result: unknown
    let httpStatus: number | null = null
    let validFormat = false
    try {
      const response = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testCase.message, mode }),
      })
      httpStatus = response.status
      result = await response.json()
      validFormat = response.ok && analysisSchema.safeParse(result).success
    } catch (error) {
      result = { error: error instanceof Error ? error.message : 'unknown error' }
    }
    const data = analysisSchema.safeParse(result)
    rows.push({
      id: testCase.id,
      mode,
      expectedCategory: testCase.category,
      expectedPriority: testCase.priority,
      httpStatus,
      category: data.success ? data.data.category : null,
      priority: data.success ? data.data.priority : null,
      validFormat,
      correct: data.success && data.data.category === testCase.category && data.data.priority === testCase.priority,
    })
  }
}

await mkdir(new URL('../evidence/', import.meta.url), { recursive: true })
const summary = (mode: string) => {
  const group = rows.filter((row) => row.mode === mode)
  const correct = group.filter((row) => row.correct).length
  return { mode, correct, total: group.length, accuracyPercent: Math.round((correct / group.length) * 10000) / 100 }
}
const report = { generatedAt: new Date().toISOString(), results: rows, summary: [summary('traditional'), summary('generative')] }
await writeFile(new URL('../evidence/comparison.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report.summary, null, 2))
if (report.summary.some((item) => item.mode === 'generative' && item.correct === 0)) process.exitCode = 1
