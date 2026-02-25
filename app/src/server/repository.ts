import {
  observeConsolidationInterval,
  observeStructuralDensity,
  surfaceRitualInvitations,
} from '@grove/core'
import type {
  ConsolidationObservation,
  RepositoryEcology,
  RitualInvitation,
} from '@grove/core'
import {
  classifyRepository,
  fetchRepository,
  fetchStructuralSignals,
} from '@grove/github'
import { createServerFn } from '@tanstack/react-start'

import {
  getDeclarationHistory,
  getSnapshotHistory,
  recordDeclarationIfChanged,
  recordSnapshot,
  upsertRepository,
} from './db'
import { getStewardIdentity } from './identity'
import type { TimelineEntry } from './timeline'
import { buildTimeline } from './timeline'

export interface RepositoryDetail {
  ecology: RepositoryEcology
  consolidation?: ConsolidationObservation
  ritualInvitations: RitualInvitation[]
  timeline: TimelineEntry[]
}

export const loadRepository = createServerFn({ method: 'GET' })
  .inputValidator((data: { owner: string; name: string }) => data)
  .handler(async ({ data }): Promise<RepositoryDetail> => {
    const identity = await getStewardIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const token = identity.token

    const fullName = `${data.owner}/${data.name}`
    const repo = await fetchRepository(token, fullName)

    // Classify and fetch structural signals in parallel.
    // Entanglement (ecosystemRepoNames) is omitted here: it is a
    // portfolio-level signal that requires fetching all user repos,
    // which would add N-page pagination cost per detail page load.
    // The entanglement factor is weighted at 0.15 — omitting it may
    // produce a slightly lower tier than the portfolio view in rare
    // cases, but avoids disproportionate API cost for a single-repo view.
    const [ecology, signals] = await Promise.all([
      classifyRepository(token, repo),
      fetchStructuralSignals(token, fullName, repo.default_branch),
    ])

    // Observe consolidation interval
    const lastActivityDate = repo.pushed_at
      ? new Date(repo.pushed_at)
      : undefined
    const consolidation = observeConsolidationInterval(
      ecology.declaration?.consolidation_interval_days,
      lastActivityDate,
    )

    // Derive density from structural signals
    const density = observeStructuralDensity(signals, consolidation)

    // Surface ritual invitations
    const ritualInvitations = surfaceRitualInvitations(
      ecology.declaration,
      consolidation,
    )

    // Phase 2: Persist observations to SQLite
    upsertRepository({
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      pushedAt: repo.pushed_at,
      sizeKb: repo.size,
    })

    const enrichedEcology = { ...ecology, density }
    const snapshotWasRecorded = recordSnapshot(enrichedEcology, signals, density)
    recordDeclarationIfChanged(
      ecology.fullName,
      ecology.declaration,
      ecology.classified,
    )

    // Build structural timeline from persisted history
    const snapshots = getSnapshotHistory(fullName, 50)
    const declarations = getDeclarationHistory(fullName, 50)
    const timeline = buildTimeline(snapshots, declarations, snapshotWasRecorded)

    return {
      ecology: enrichedEcology,
      consolidation,
      ritualInvitations,
      timeline,
    }
  })
