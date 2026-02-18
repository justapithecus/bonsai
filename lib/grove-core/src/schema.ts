import { z } from 'zod'

import { HORIZONS, PHASES, ROLES } from './types'

const groveFieldsSchema = z
  .object({
    intent: z.string().min(1, 'Intent must be a non-empty string'),
    horizon: z.enum(HORIZONS).optional(),
    role: z.enum(ROLES).optional(),
    phase: z.enum(PHASES).optional(),
    steward: z.string().min(1).optional(),
    consolidation_interval_days: z.number().int().positive().optional(),
  })
  .passthrough()

export const groveYamlSchema = z
  .object({
    grove: groveFieldsSchema,
  })
  .passthrough()

export type GroveYamlInput = z.infer<typeof groveYamlSchema>
