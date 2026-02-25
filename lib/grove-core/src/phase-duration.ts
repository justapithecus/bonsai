import type { Horizon, Phase, PhaseDurationObservation } from './types'

/**
 * Observe how long the current phase has been declared.
 * Pure observation: no judgment, no urgency.
 * Returns undefined if inputs are insufficient.
 */
export function observePhaseDuration(
  currentPhase: Phase | undefined,
  phaseLastDeclaredAt: string | undefined,
  horizon: Horizon | undefined,
  now: Date = new Date(),
): PhaseDurationObservation | undefined {
  if (!currentPhase || !phaseLastDeclaredAt) {
    return undefined
  }

  const declaredDate = new Date(phaseLastDeclaredAt)
  if (isNaN(declaredDate.getTime())) {
    return undefined
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceDeclared = Math.floor(
    (now.getTime() - declaredDate.getTime()) / msPerDay,
  )

  return {
    phase: currentPhase,
    declaredAt: phaseLastDeclaredAt,
    daysSinceDeclared,
    ...(horizon !== undefined && { horizon }),
  }
}

/**
 * Horizon-proportional thresholds (in days) for stewardship reaffirmation.
 * Ephemeral projects never trigger — per rituals.md:
 * "An ephemeral project may never encounter a Stewardship Reaffirmation ritual."
 */
const REAFFIRMATION_THRESHOLDS: Record<Horizon, number | null> = {
  ephemeral: null, // never triggers
  seasonal: 180,
  perennial: 365,
  civilizational: 730,
}

const DEFAULT_THRESHOLD_DAYS = 365

/**
 * Determine whether phase duration suggests a stewardship reaffirmation invitation.
 * Returns true when the observation exceeds the horizon-proportional threshold.
 *
 * Special case: resting phase with a declared consolidation interval triggers
 * when daysSinceDeclared >= consolidationIntervalDays (per rituals.md).
 */
export function suggestsReaffirmation(
  observation: PhaseDurationObservation,
  consolidationIntervalDays?: number,
): boolean {
  // Special case: resting phase with consolidation interval
  if (
    observation.phase === 'resting' &&
    consolidationIntervalDays !== undefined
  ) {
    return observation.daysSinceDeclared >= consolidationIntervalDays
  }

  // Horizon-proportional threshold
  const threshold = observation.horizon
    ? REAFFIRMATION_THRESHOLDS[observation.horizon]
    : DEFAULT_THRESHOLD_DAYS

  // null threshold means never triggers (ephemeral)
  if (threshold === null) {
    return false
  }

  return observation.daysSinceDeclared >= threshold
}
