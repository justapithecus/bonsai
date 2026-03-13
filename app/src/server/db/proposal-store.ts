import type { Climate, ClimateProposal, ProposalBasis } from '@grove/core'
import { desc, eq } from 'drizzle-orm'

import type { GroveDb } from './client'
import { getDb } from './client'
import { climateProposals } from './schema'

export type ProposalStatus = 'active' | 'accepted' | 'dismissed' | 'withdrawn'

export interface StoredProposal {
  id: number
  climate: Climate
  basis: ProposalBasis
  triggerType: string
  observedSeason: string | null
  observation: string
  status: ProposalStatus
  proposedAt: string
  respondedAt: string | null
  stewardId: number | null
}

/**
 * Get the current active proposal, if one exists.
 * §2.3 — Only one active proposal may exist at a time.
 */
export function getActiveProposal(
  db: GroveDb = getDb(),
): StoredProposal | undefined {
  const row = db
    .select()
    .from(climateProposals)
    .where(eq(climateProposals.status, 'active'))
    .orderBy(desc(climateProposals.id))
    .limit(1)
    .get()

  return row as StoredProposal | undefined
}

/**
 * Persist a new climate proposal. Withdraws any existing active proposal first.
 * §2.3 — Only one active proposal may exist at a time.
 */
export function persistProposal(
  proposal: ClimateProposal,
  observation: string,
  stewardId: number,
  db: GroveDb = getDb(),
) {
  db.transaction((tx) => {
    // Withdraw any existing active proposal
    const existing = tx
      .select({ id: climateProposals.id })
      .from(climateProposals)
      .where(eq(climateProposals.status, 'active'))
      .all()

    for (const row of existing) {
      tx.update(climateProposals)
        .set({
          status: 'withdrawn',
          respondedAt: new Date().toISOString(),
        })
        .where(eq(climateProposals.id, row.id))
        .run()
    }

    tx.insert(climateProposals)
      .values({
        climate: proposal.climate,
        basis: proposal.basis,
        triggerType: proposal.triggerType,
        observedSeason: proposal.observedSeason ?? null,
        observation,
        status: 'active',
        proposedAt: new Date().toISOString(),
        stewardId,
      })
      .run()
  })
}

/**
 * Accept a proposal — steward confirms the suggested climate.
 */
export function acceptProposal(
  proposalId: number,
  db: GroveDb = getDb(),
) {
  db.update(climateProposals)
    .set({
      status: 'accepted',
      respondedAt: new Date().toISOString(),
    })
    .where(eq(climateProposals.id, proposalId))
    .run()
}

/**
 * Dismiss a proposal — steward declines the suggestion.
 */
export function dismissProposal(
  proposalId: number,
  db: GroveDb = getDb(),
) {
  db.update(climateProposals)
    .set({
      status: 'dismissed',
      respondedAt: new Date().toISOString(),
    })
    .where(eq(climateProposals.id, proposalId))
    .run()
}

/**
 * §2.3 — Withdraw a proposal when the underlying pattern reverses.
 */
export function withdrawActiveProposal(
  db: GroveDb = getDb(),
) {
  const active = getActiveProposal(db)
  if (!active) return

  db.update(climateProposals)
    .set({
      status: 'withdrawn',
      respondedAt: new Date().toISOString(),
    })
    .where(eq(climateProposals.id, active.id))
    .run()
}
