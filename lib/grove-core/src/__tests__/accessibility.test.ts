import { describe, expect, it } from 'vitest'

import { observeAccessibility } from '../accessibility'
import type { GroveDeclaration, StructuralSignals } from '../types'

function makeSignals(
  overrides: Partial<StructuralSignals> = {},
): StructuralSignals {
  return {
    observedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

const DECLARATION: GroveDeclaration = {
  intent: 'A test project',
  phase: 'expanding',
}

describe('observeAccessibility', () => {
  it('returns undefined when no signals are available', () => {
    expect(observeAccessibility(makeSignals())).toBeUndefined()
  })

  it('returns undefined when all fields are undefined (not false)', () => {
    // undefined means "not observed" — distinct from false ("observed as absent")
    expect(
      observeAccessibility(
        makeSignals({
          readmePresent: undefined,
          licensePresent: undefined,
        }),
      ),
    ).toBeUndefined()
  })

  it('surfaces implied prerequisites from manifests', () => {
    const result = observeAccessibility(
      makeSignals({
        dependencyManifestsObserved: ['package.json', 'go.mod'],
      }),
    )

    expect(result).toBeDefined()
    expect(result!.impliedPrerequisites).toContain('Node.js runtime')
    expect(result!.impliedPrerequisites).toContain('Go toolchain')
    expect(result!.descriptions.some((d) => d.includes('Setup appears to require'))).toBe(true)
  })

  it('deduplicates prerequisites from multiple manifests for same runtime', () => {
    const result = observeAccessibility(
      makeSignals({
        dependencyManifestsObserved: ['pyproject.toml', 'requirements.txt'],
      }),
    )

    expect(result!.impliedPrerequisites).toEqual(['Python runtime'])
  })

  it('surfaces present documentation artifacts', () => {
    const result = observeAccessibility(
      makeSignals({
        readmePresent: true,
        licensePresent: true,
        contributingPresent: false,
        docsDirectoryPresent: false,
      }),
    )

    expect(result!.presentArtifacts).toContain('README')
    expect(result!.presentArtifacts).toContain('LICENSE')
  })

  it('surfaces absent artifacts', () => {
    const result = observeAccessibility(
      makeSignals({
        readmePresent: false,
        contributingPresent: false,
        licensePresent: true,
        docsDirectoryPresent: false,
      }),
    )

    expect(result!.absentArtifacts).toContain('README')
    expect(result!.absentArtifacts).toContain('CONTRIBUTING guide')
    expect(result!.absentArtifacts).toContain('Documentation directory')
    expect(result!.absentArtifacts).not.toContain('LICENSE')
  })

  it('only notes absent artifacts when intent is declared', () => {
    const result = observeAccessibility(
      makeSignals({
        readmePresent: false,
        contributingPresent: false,
      }),
      // No declaration
    )

    // Absent artifacts are listed but no description about them
    expect(result!.absentArtifacts).toContain('README')
    expect(
      result!.descriptions.some((d) => d.includes('Not observed')),
    ).toBe(false)
  })

  it('notes absent artifacts with description when intent is declared', () => {
    const result = observeAccessibility(
      makeSignals({
        readmePresent: false,
        contributingPresent: false,
      }),
      DECLARATION,
    )

    expect(
      result!.descriptions.some((d) => d.includes('Not observed')),
    ).toBe(true)
  })

  it('notes missing README when multiple prerequisites implied', () => {
    const result = observeAccessibility(
      makeSignals({
        dependencyManifestsObserved: ['package.json', 'go.mod'],
        readmePresent: false,
      }),
      DECLARATION,
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('Multiple runtime prerequisites'),
      ),
    ).toBe(true)
  })

  it('does not use forbidden vocabulary', () => {
    const result = observeAccessibility(
      makeSignals({
        dependencyManifestsObserved: ['package.json'],
        readmePresent: false,
        contributingPresent: false,
        licensePresent: false,
        docsDirectoryPresent: false,
      }),
      DECLARATION,
    )

    const allText = result!.descriptions.join(' ')
    expect(allText).not.toContain('good')
    expect(allText).not.toContain('bad')
    expect(allText).not.toContain('should')
    expect(allText).not.toContain('must')
    expect(allText).not.toContain('clear')
    expect(allText).not.toContain('unclear')
  })
})
