import type { StructuralSignals } from '@grove/core'

const GITHUB_API = 'https://api.github.com'

/** Known dependency manifest filenames */
const KNOWN_MANIFESTS = new Set([
  'package.json',
  'go.mod',
  'Cargo.toml',
  'pyproject.toml',
  'requirements.txt',
  'Gemfile',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'composer.json',
  'mix.exs',
  'pubspec.yaml',
  'Package.swift',
])

/**
 * Fetch structural signals from GitHub for a single repository.
 * Uses Git Trees API and Commit Activity Stats API.
 * Partial signals are always valid — absence is not an error.
 */
export async function fetchStructuralSignals(
  token: string,
  fullName: string,
  defaultBranch: string,
  ecosystemRepoNames?: string[],
): Promise<StructuralSignals> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }

  const observedAt = new Date().toISOString()

  // Parallel API calls — partial results always valid
  const [treeResult, commitResult] = await Promise.allSettled([
    fetchTreeSignals(fullName, defaultBranch, headers),
    fetchCommitSignals(fullName, headers),
  ])

  const tree =
    treeResult.status === 'fulfilled' ? treeResult.value : undefined
  const commits =
    commitResult.status === 'fulfilled' ? commitResult.value : undefined

  // Entanglement: inspect root package.json if tree found one
  let ecosystemDependencyCount: number | undefined
  if (tree?.hasRootPackageJson && ecosystemRepoNames?.length) {
    ecosystemDependencyCount = await fetchEcosystemDependencyCount(
      fullName,
      defaultBranch,
      headers,
      ecosystemRepoNames,
    )
  }

  return {
    fileCount: tree?.fileCount,
    commitsLast30d: commits?.commitsLast30d,
    commitsLast90d: commits?.commitsLast90d,
    dependencyManifestsObserved: tree?.manifests,
    ecosystemDependencyCount,
    observedAt,
  }
}

interface TreeSignals {
  fileCount: number | undefined
  manifests: string[]
  hasRootPackageJson: boolean
}

async function fetchTreeSignals(
  fullName: string,
  defaultBranch: string,
  headers: Record<string, string>,
): Promise<TreeSignals> {
  const response = await fetch(
    `${GITHUB_API}/repos/${fullName}/git/trees/${defaultBranch}?recursive=1`,
    { headers },
  )

  if (!response.ok) {
    throw new Error(`Tree API: ${response.status}`)
  }

  const data = await response.json()
  const tree: Array<{ path: string; type: string }> = data.tree ?? []

  // GitHub truncates recursive trees for very large repos.
  // When truncated, fileCount would be an undercount — drop it to avoid
  // presenting partial data as complete observation.
  const truncated: boolean = data.truncated === true

  let fileCount = 0
  const manifests: string[] = []
  let hasRootPackageJson = false

  for (const entry of tree) {
    if (entry.type === 'blob') {
      fileCount++

      // Check root-level manifests only (no / in path)
      const fileName = entry.path.includes('/')
        ? undefined
        : entry.path

      if (fileName && KNOWN_MANIFESTS.has(fileName)) {
        manifests.push(fileName)
        if (fileName === 'package.json') {
          hasRootPackageJson = true
        }
      }
    }
  }

  return {
    fileCount: truncated ? undefined : fileCount,
    manifests,
    hasRootPackageJson,
  }
}

interface CommitSignals {
  commitsLast30d: number
  commitsLast90d: number
}

async function fetchCommitSignals(
  fullName: string,
  headers: Record<string, string>,
): Promise<CommitSignals | undefined> {
  const response = await fetch(
    `${GITHUB_API}/repos/${fullName}/stats/commit_activity`,
    { headers },
  )

  // 202 means GitHub is computing stats — not yet available
  if (response.status === 202) {
    return undefined
  }

  if (!response.ok) {
    throw new Error(`Commit stats API: ${response.status}`)
  }

  const weeks: Array<{ total: number }> = await response.json()

  if (!Array.isArray(weeks) || weeks.length === 0) {
    return undefined
  }

  // weeks is 52 entries, most recent last
  // ~4 weeks ≈ 30 days, ~13 weeks ≈ 90 days
  const last4 = weeks.slice(-4)
  const last13 = weeks.slice(-13)

  const commitsLast30d = last4.reduce((sum, w) => sum + w.total, 0)
  const commitsLast90d = last13.reduce((sum, w) => sum + w.total, 0)

  return { commitsLast30d, commitsLast90d }
}

async function fetchEcosystemDependencyCount(
  fullName: string,
  defaultBranch: string,
  headers: Record<string, string>,
  ecosystemRepoNames: string[],
): Promise<number | undefined> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${fullName}/contents/package.json?ref=${defaultBranch}`,
      {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.raw+json',
        },
      },
    )

    if (!response.ok) return undefined

    const content = await response.text()
    const pkg = JSON.parse(content)

    // Collect all dependency names
    const allDeps = new Set<string>([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ])

    // Build a set of ecosystem repo short names for exact matching
    // e.g. "justapithecus/lode" → "lode"
    const ecosystemShortNames = new Set(
      ecosystemRepoNames.map((name) => {
        const parts = name.split('/')
        return parts[parts.length - 1]!.toLowerCase()
      }),
    )

    let count = 0
    for (const dep of allDeps) {
      // Extract the package's short name:
      // "@scope/pkg" → "pkg", "some-lib" → "some-lib"
      const depShortName = dep.includes('/')
        ? dep.split('/').pop()!.toLowerCase()
        : dep.toLowerCase()

      if (ecosystemShortNames.has(depShortName)) {
        count++
      }
    }

    return count
  } catch {
    return undefined
  }
}
