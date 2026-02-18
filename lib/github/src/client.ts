import type { GitHubRepo } from './types'

const GITHUB_API = 'https://api.github.com'

/**
 * Fetch all repositories accessible to the authenticated user.
 * Paginates through all pages.
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const response = await fetch(
      `${GITHUB_API}/user/repos?per_page=${perPage}&page=${page}&sort=pushed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: GitHubRepo[] = await response.json()
    if (data.length === 0) break

    repos.push(
      ...data.map((r) => ({
        full_name: r.full_name,
        html_url: r.html_url,
        default_branch: r.default_branch,
        pushed_at: r.pushed_at,
      })),
    )

    if (data.length < perPage) break
    page++
  }

  return repos
}

/**
 * Fetch a single repository by full name (owner/name).
 */
export async function fetchRepository(
  token: string,
  fullName: string,
): Promise<GitHubRepo> {
  const response = await fetch(`${GITHUB_API}/repos/${fullName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    )
  }

  const r: GitHubRepo = await response.json()
  return {
    full_name: r.full_name,
    html_url: r.html_url,
    default_branch: r.default_branch,
    pushed_at: r.pushed_at,
  }
}

/**
 * Fetch raw .grove.yaml content from a repository.
 * Returns undefined if the file does not exist (404).
 */
export async function fetchGroveYaml(
  token: string,
  fullName: string,
  defaultBranch: string,
): Promise<string | undefined> {
  const response = await fetch(
    `${GITHUB_API}/repos/${fullName}/contents/.grove.yaml?ref=${defaultBranch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
      },
    },
  )

  if (response.status === 404) return undefined

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    )
  }

  return response.text()
}
