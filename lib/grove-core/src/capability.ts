import type {
  CapabilityObservation,
  GroveDeclaration,
  StructuralSignals,
} from './types'

/**
 * Observe capability infrastructure for a repository.
 *
 * Surfaces:
 * - Q13: Observable infrastructure for exercising the project
 * - Q15: Environmental assumptions implied by observed infrastructure
 *
 * This is the pre-probe layer — it reports what capability infrastructure
 * is present in the tree without attempting to exercise it. Full capability
 * probing (Q14: do documented behaviors manifest?) requires runtime
 * execution and is deferred to a future phase.
 *
 * Returns undefined when no capability infrastructure is observed.
 * CONTRACT_CAPABILITY_OBSERVATION.md prohibits pass/fail framing.
 */
export function observeCapability(
  signals: StructuralSignals,
  declaration?: GroveDeclaration,
): CapabilityObservation | undefined {
  const observedInfrastructure: string[] = []
  const descriptions: string[] = []

  // CI/CD configuration
  if (signals.ciConfigPresent === true) {
    observedInfrastructure.push('CI/CD configuration')
  }

  // Test infrastructure
  if (signals.testDirectoryPresent === true) {
    observedInfrastructure.push('Test directory')
  }

  // Dependency manifests imply build/install paths
  if (
    signals.dependencyManifestsObserved &&
    signals.dependencyManifestsObserved.length > 0
  ) {
    observedInfrastructure.push('Dependency manifest')
  }

  // If nothing was observed, return undefined
  if (observedInfrastructure.length === 0) {
    return undefined
  }

  // Build observational descriptions
  if (signals.ciConfigPresent && signals.testDirectoryPresent) {
    descriptions.push(
      'Both CI configuration and a test directory are present, suggesting an automated verification path exists.',
    )
  } else if (signals.ciConfigPresent) {
    descriptions.push(
      'CI configuration is present. No dedicated test directory was observed.',
    )
  } else if (signals.testDirectoryPresent) {
    descriptions.push(
      'A test directory is present. No CI configuration was observed.',
    )
  }

  if (
    signals.dependencyManifestsObserved &&
    signals.dependencyManifestsObserved.length > 0 &&
    !signals.ciConfigPresent &&
    !signals.testDirectoryPresent
  ) {
    descriptions.push(
      'Dependency manifests are present but no CI or test infrastructure was observed.',
    )
  }

  // Surface tension between declared role and observed infrastructure
  if (declaration?.role === 'library') {
    if (!signals.testDirectoryPresent) {
      descriptions.push(
        'This project declares a library role. No test directory was observed.',
      )
    }
  }

  return {
    observedInfrastructure,
    descriptions,
  }
}
