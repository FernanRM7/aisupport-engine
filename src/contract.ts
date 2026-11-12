import { z } from 'zod'

export const categorySchema = z.enum(['ACCESS', 'BUG', 'FEATURE', 'SECURITY'])
export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export const modeSchema = z.enum(['traditional', 'generative'])

export const requestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  mode: modeSchema,
}).strict()

export const analysisSchema = z.object({
  category: categorySchema,
  priority: prioritySchema,
  response: z.string().trim().min(1).max(2000),
  requiresHumanReview: z.boolean(),
  mode: modeSchema,
}).strict()

export type Analysis = z.infer<typeof analysisSchema>
export type Category = z.infer<typeof categorySchema>
export type Priority = z.infer<typeof prioritySchema>
export type Mode = z.infer<typeof modeSchema>

export const modelOutputSchema = analysisSchema.omit({ mode: true, response: true }).extend({
  response: z.string().trim().min(1).max(2000),
})
