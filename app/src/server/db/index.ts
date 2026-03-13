export { createDb, getDb } from './client'
export type { GroveDb } from './client'

export {
  getCurrentClimate,
  getClimateHistory,
  persistClimate,
} from './climate-store'

export {
  acceptProposal,
  dismissProposal,
  getActiveProposal,
  persistProposal,
  withdrawActiveProposal,
} from './proposal-store'
export type { ProposalStatus, StoredProposal } from './proposal-store'

export {
  getDeclarationHistory,
  getLatestDeclaration,
  recordDeclarationIfChanged,
} from './declarations'

export {
  getLatestSnapshot,
  getPortfolioSnapshotWindow,
  getSnapshotHistory,
  recordSnapshot,
  recordSnapshotBatch,
  upsertRepositories,
  upsertRepository,
} from './snapshots'
