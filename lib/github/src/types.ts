// Minimal GitHub repository type — only what Grove needs
export interface GitHubRepo {
  full_name: string
  html_url: string
  default_branch: string
  pushed_at: string | null
}
