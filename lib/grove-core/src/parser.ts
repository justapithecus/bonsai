import { parse as parseYaml } from 'yaml'

import { groveYamlSchema } from './schema'
import type { GroveDeclaration } from './types'

export type ParseResult =
  | { ok: true; declaration: GroveDeclaration }
  | { ok: false; error: string }

export function parseGroveYaml(raw: string): ParseResult {
  let parsed: unknown
  try {
    parsed = parseYaml(raw)
  } catch {
    return { ok: false, error: 'Invalid YAML syntax' }
  }

  if (parsed === null || parsed === undefined) {
    return { ok: false, error: 'Empty YAML document' }
  }

  const result = groveYamlSchema.safeParse(parsed)
  if (!result.success) {
    const issue = result.error.issues[0]
    return {
      ok: false,
      error: issue
        ? `${issue.path.join('.')}: ${issue.message}`
        : 'Invalid .grove.yaml',
    }
  }

  const grove = result.data.grove
  return {
    ok: true,
    declaration: {
      intent: grove.intent,
      horizon: grove.horizon,
      role: grove.role,
      phase: grove.phase,
      steward: grove.steward,
      consolidation_interval_days: grove.consolidation_interval_days,
    },
  }
}
