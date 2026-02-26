import { describe, expect, it } from 'vitest'

import { parseGroveYaml } from '../parser'

describe('parseGroveYaml', () => {
  it('parses a valid minimal .grove.yaml', () => {
    const result = parseGroveYaml('grove:\n  intent: "A test project."')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.declaration.intent).toBe('A test project.')
      expect(result.declaration.horizon).toBeUndefined()
      expect(result.declaration.role).toBeUndefined()
      expect(result.declaration.phase).toBeUndefined()
      expect(result.declaration.steward).toBeUndefined()
      expect(result.declaration.consolidation_interval_days).toBeUndefined()
    }
  })

  it('parses a fully-declared .grove.yaml', () => {
    const yaml = `
grove:
  intent: "Embeddable storage substrate."
  horizon: generational
  role: infrastructure
  phase: consolidating
  steward: Andrew
  consolidation_interval_days: 180
`
    const result = parseGroveYaml(yaml)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.declaration).toEqual({
        intent: 'Embeddable storage substrate.',
        horizon: 'generational',
        role: 'infrastructure',
        phase: 'consolidating',
        steward: 'Andrew',
        consolidation_interval_days: 180,
      })
    }
  })

  it('rejects missing intent', () => {
    const result = parseGroveYaml('grove:\n  horizon: perennial')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('intent')
    }
  })

  it('rejects empty intent', () => {
    const result = parseGroveYaml('grove:\n  intent: ""')
    expect(result.ok).toBe(false)
  })

  it('rejects invalid horizon enum', () => {
    const result = parseGroveYaml(
      'grove:\n  intent: "Test"\n  horizon: forever',
    )
    expect(result.ok).toBe(false)
  })

  it('rejects invalid phase enum', () => {
    const result = parseGroveYaml(
      'grove:\n  intent: "Test"\n  phase: dormant',
    )
    expect(result.ok).toBe(false)
  })

  it('rejects invalid role enum', () => {
    const result = parseGroveYaml(
      'grove:\n  intent: "Test"\n  role: platform',
    )
    expect(result.ok).toBe(false)
  })

  it('rejects negative consolidation_interval_days', () => {
    const result = parseGroveYaml(
      'grove:\n  intent: "Test"\n  consolidation_interval_days: -5',
    )
    expect(result.ok).toBe(false)
  })

  it('rejects non-integer consolidation_interval_days', () => {
    const result = parseGroveYaml(
      'grove:\n  intent: "Test"\n  consolidation_interval_days: 30.5',
    )
    expect(result.ok).toBe(false)
  })

  it('passes through unrecognized fields without error', () => {
    const yaml = `
grove:
  intent: "Test"
  custom_field: hello
  another: 42
`
    const result = parseGroveYaml(yaml)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.declaration.intent).toBe('Test')
      // Unrecognized fields not included in declaration
      expect(
        (result.declaration as unknown as Record<string, unknown>)
          .custom_field,
      ).toBeUndefined()
    }
  })

  it('rejects invalid YAML syntax', () => {
    const result = parseGroveYaml(':::invalid yaml{{{')
    expect(result.ok).toBe(false)
  })

  it('rejects empty YAML document', () => {
    const result = parseGroveYaml('')
    expect(result.ok).toBe(false)
  })

  it('rejects YAML without grove key', () => {
    const result = parseGroveYaml('other:\n  intent: "Test"')
    expect(result.ok).toBe(false)
  })
})
