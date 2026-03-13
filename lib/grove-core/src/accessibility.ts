import type {
  AccessibilityObservation,
  GroveDeclaration,
  StructuralSignals,
} from './types'

/**
 * Map of dependency manifest filenames to the prerequisites they imply.
 * These are observable facts — "package.json was observed" implies
 * "a Node.js runtime is a prerequisite for setup."
 */
const MANIFEST_PREREQUISITES: Record<string, string> = {
  'package.json': 'Node.js runtime',
  'go.mod': 'Go toolchain',
  'Cargo.toml': 'Rust toolchain',
  'pyproject.toml': 'Python runtime',
  'requirements.txt': 'Python runtime',
  'Gemfile': 'Ruby runtime',
  'pom.xml': 'Java runtime and Maven',
  'build.gradle': 'Java runtime and Gradle',
  'build.gradle.kts': 'Kotlin/Java runtime and Gradle',
  'composer.json': 'PHP runtime and Composer',
  'mix.exs': 'Elixir/Erlang runtime',
  'pubspec.yaml': 'Dart/Flutter SDK',
  'Package.swift': 'Swift toolchain',
}

/** Documentation artifacts that contribute to setup legibility */
const DOCUMENTATION_ARTIFACTS = [
  { key: 'readme', label: 'README', signalField: 'readmePresent' as const },
  { key: 'contributing', label: 'CONTRIBUTING guide', signalField: 'contributingPresent' as const },
  { key: 'license', label: 'LICENSE', signalField: 'licensePresent' as const },
  { key: 'docs', label: 'Documentation directory', signalField: 'docsDirectoryPresent' as const },
]

/**
 * Observe accessibility signals for a repository.
 *
 * Surfaces:
 * - Q9: Prerequisites implied by observed dependency manifests
 * - Q10: Documentation artifacts present/absent relative to declared intent
 * - Q11: External context requirements implied by manifest types
 *
 * Returns undefined when no signals are available to observe.
 * Silence is valid — CONTRACT_ACCESSIBILITY.md prohibits labeling
 * without observed evidence.
 */
export function observeAccessibility(
  signals: StructuralSignals,
  declaration?: GroveDeclaration,
): AccessibilityObservation | undefined {
  const impliedPrerequisites: string[] = []
  const presentArtifacts: string[] = []
  const absentArtifacts: string[] = []
  const descriptions: string[] = []

  // Derive prerequisites from observed manifests
  if (signals.dependencyManifestsObserved) {
    const seen = new Set<string>()
    for (const manifest of signals.dependencyManifestsObserved) {
      const prerequisite = MANIFEST_PREREQUISITES[manifest]
      if (prerequisite && !seen.has(prerequisite)) {
        seen.add(prerequisite)
        impliedPrerequisites.push(prerequisite)
      }
    }
  }

  // Observe documentation artifact presence/absence
  for (const artifact of DOCUMENTATION_ARTIFACTS) {
    const present = signals[artifact.signalField]
    if (present === true) {
      presentArtifacts.push(artifact.label)
    } else if (present === false) {
      absentArtifacts.push(artifact.label)
    }
    // undefined = not observed, not reported either way
  }

  // If nothing was observed, return undefined — silence is valid
  if (
    impliedPrerequisites.length === 0 &&
    presentArtifacts.length === 0 &&
    absentArtifacts.length === 0
  ) {
    return undefined
  }

  // Build observational descriptions
  if (impliedPrerequisites.length > 0) {
    descriptions.push(
      `Setup appears to require: ${impliedPrerequisites.join(', ')}.`,
    )
  }

  if (absentArtifacts.length > 0 && declaration?.intent) {
    // Only note absence when intent is declared — absence relative to
    // declared purpose is meaningful, absence without context is not.
    descriptions.push(
      `Not observed in the repository: ${absentArtifacts.join(', ')}.`,
    )
  }

  if (
    impliedPrerequisites.length > 1 &&
    signals.readmePresent === false
  ) {
    descriptions.push(
      'Multiple runtime prerequisites are implied but no README was observed to document setup ordering.',
    )
  }

  return {
    impliedPrerequisites,
    presentArtifacts,
    absentArtifacts,
    descriptions,
  }
}
