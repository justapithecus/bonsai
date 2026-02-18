import type { ConsolidationObservation } from './types'

/**
 * Observe consolidation interval status.
 * Pure observation: no judgment, no urgency.
 * Returns undefined if inputs are insufficient.
 */
export function observeConsolidationInterval(
  intervalDays: number | undefined,
  lastActivityDate: Date | undefined,
  now: Date = new Date(),
): ConsolidationObservation | undefined {
  if (intervalDays === undefined || lastActivityDate === undefined) {
    return undefined
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceActivity = Math.floor(
    (now.getTime() - lastActivityDate.getTime()) / msPerDay,
  )

  return {
    intervalDays,
    daysSinceActivity,
    elapsed: daysSinceActivity >= intervalDays,
  }
}
