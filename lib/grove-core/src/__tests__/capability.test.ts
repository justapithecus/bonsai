import { describe, expect, it } from 'vitest'

import { observeCapability } from '../capability'
import type { GroveDeclaration, StructuralSignals } from '../types'

function makeSignals(
  overrides: Partial<StructuralSignals> = {},
): StructuralSignals {
  return {
    observedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

describe('observeCapability', () => {
  it('returns undefined when no capability infrastructure observed', () => {
    expect(observeCapability(makeSignals())).toBeUndefined()
  })

  it('returns undefined when all fields are undefined', () => {
    expect(
      observeCapability(
        makeSignals({
          ciConfigPresent: undefined,
          testDirectoryPresent: undefined,
        }),
      ),
    ).toBeUndefined()
  })

  it('surfaces CI and test infrastructure together', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: true,
        dependencyManifestsObserved: ['package.json'],
      }),
    )

    expect(result).toBeDefined()
    expect(result!.observedInfrastructure).toContain('CI/CD configuration')
    expect(result!.observedInfrastructure).toContain('Test directory')
    expect(result!.observedInfrastructure).toContain('Dependency manifest')
    expect(
      result!.descriptions.some((d) =>
        d.includes('automated verification path'),
      ),
    ).toBe(true)
  })

  it('surfaces CI without tests', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: false,
        testFilePatternsObserved: false,
        dependencyManifestsObserved: ['package.json'],
      }),
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('No test infrastructure was observed'),
      ),
    ).toBe(true)
  })

  it('surfaces test directory without CI', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: false,
        testDirectoryPresent: true,
        dependencyManifestsObserved: ['package.json'],
      }),
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('A test directory is present') &&
        d.includes('No CI configuration was observed'),
      ),
    ).toBe(true)
  })

  it('surfaces co-located test files without CI', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: false,
        testDirectoryPresent: false,
        testFilePatternsObserved: true,
        dependencyManifestsObserved: ['go.mod'],
      }),
    )

    expect(result!.observedInfrastructure).toContain('Co-located test files')
    expect(
      result!.descriptions.some((d) =>
        d.includes('Co-located test files are present'),
      ),
    ).toBe(true)
  })

  it('surfaces CI with co-located test files as automated verification path', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: false,
        testFilePatternsObserved: true,
        dependencyManifestsObserved: ['go.mod'],
      }),
    )

    expect(result!.observedInfrastructure).toContain('CI/CD configuration')
    expect(result!.observedInfrastructure).toContain('Co-located test files')
    expect(
      result!.descriptions.some((d) =>
        d.includes('automated verification path'),
      ),
    ).toBe(true)
  })

  it('surfaces manifests alone when no CI or tests', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: false,
        testDirectoryPresent: false,
        testFilePatternsObserved: false,
        dependencyManifestsObserved: ['package.json'],
      }),
    )

    expect(result).toBeDefined()
    expect(result!.observedInfrastructure).toEqual(['Dependency manifest'])
    expect(
      result!.descriptions.some((d) =>
        d.includes('no CI or test infrastructure'),
      ),
    ).toBe(true)
  })

  it('notes library role without any test infrastructure', () => {
    const declaration: GroveDeclaration = {
      intent: 'A utility library',
      role: 'library',
      phase: 'expanding',
    }

    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: false,
        testFilePatternsObserved: false,
        dependencyManifestsObserved: ['package.json'],
      }),
      declaration,
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('declares a library role') &&
        d.includes('No test infrastructure was observed'),
      ),
    ).toBe(true)
  })

  it('does not note library role when test directory is present', () => {
    const declaration: GroveDeclaration = {
      intent: 'A utility library',
      role: 'library',
      phase: 'expanding',
    }

    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: true,
        dependencyManifestsObserved: ['package.json'],
      }),
      declaration,
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('declares a library role'),
      ),
    ).toBe(false)
  })

  it('does not note library role when co-located test files are present', () => {
    const declaration: GroveDeclaration = {
      intent: 'A Go library',
      role: 'library',
      phase: 'expanding',
    }

    const result = observeCapability(
      makeSignals({
        ciConfigPresent: true,
        testDirectoryPresent: false,
        testFilePatternsObserved: true,
        dependencyManifestsObserved: ['go.mod'],
      }),
      declaration,
    )

    expect(
      result!.descriptions.some((d) =>
        d.includes('declares a library role'),
      ),
    ).toBe(false)
  })

  it('does not use forbidden vocabulary', () => {
    const result = observeCapability(
      makeSignals({
        ciConfigPresent: false,
        testDirectoryPresent: false,
        dependencyManifestsObserved: ['package.json'],
      }),
    )

    const allText = result!.descriptions.join(' ')
    expect(allText).not.toContain('working')
    expect(allText).not.toContain('broken')
    expect(allText).not.toContain('pass')
    expect(allText).not.toContain('fail')
    expect(allText).not.toContain('healthy')
  })
})
