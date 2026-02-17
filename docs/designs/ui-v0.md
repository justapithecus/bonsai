# Phase 1 UI Implementation Handoff

Self-contained specification for Grove's first web interface.

This document is designed to be read by a fresh implementation session. It contains all context needed to begin building.

---

## Normative References

Read these before writing any code. They are listed in authority order.

1. `CLAUDE.md` — Constitutional constraints and invariants. Highest authority.
2. `docs/contracts/CONTRACT_READ_ONLY.md` — Read-only constraint.
3. `docs/contracts/CONTRACT_OBSERVATIONAL.md` — Observation-only display.
4. `docs/contracts/CONTRACT_NON_PRESCRIPTIVE.md` — No prescriptive output.
5. `docs/contracts/CONTRACT_INTENT_DECLARATION.md` — Intent is declared, not inferred.
6. `docs/contracts/CONTRACT_CAPABILITY_OBSERVATION.md` — Capability observation constraints.
7. `docs/contracts/CONTRACT_ACCESSIBILITY.md` — Accessibility observation constraints.
8. `docs/ecology.md` — Observation vocabulary (horizon, phase, role, steward, cadence, dependency load, ritual, season, climate).
9. `docs/designs/rituals.md` — Ritual, season, and climate specification.
10. `docs/designs/grove-yaml-spec.md` — `.grove.yaml` format and validation.
11. `docs/ARCH_INDEX.md` — Repository architecture and data flow.
12. `docs/roadmap.md` — Phase definitions and exit criteria.
13. `docs/design_principles.md` — UI design guardrails.

---

## Scope

From `docs/roadmap.md` Phase 1:

- TanStack Start application
- GitHub OAuth integration
- `.grove.yaml` parsing via `grove-core`
- Live repository fetching (no persistence)
- Ecology primitive display
- Seasonal atmosphere overlay derived from declared phase
- Basic ritual scaffolding (invitation display, closed vocabulary)

---

## Project Structure

From `docs/ARCH_INDEX.md`:

```
/lib/grove-core/   — .grove.yaml parsing, phase-to-season derivation, ecology types,
                     consolidation interval checking, ritual eligibility
/lib/github/       — GitHub API client, repo listing, .grove.yaml fetching
/app/
  routes/          — Portfolio overview, repo detail, auth callback
  components/      — Header, RepoCard, ClimateBand, PhaseIndicator, RitualInvitation
  styles/          — Global styles, seasonal atmosphere tokens
/server/
  auth/            — GitHub OAuth flow
  sync/            — Repository loading, classification
```

---

## Views

### Portfolio Overview

**Displayed:**
- Repository list (vertical stack, max two columns on wide displays)
- Each repo: name, declared intent, phase, season (derived), horizon, role, steward
- Repos without `.grove.yaml`: "Unclassified"
- Declared climate at portfolio level (steward-set via explicit action)
- Climate/season tension surfaced as observation where applicable
- Seasonal atmosphere: subtle visual tone shift based on portfolio climate

**Not displayed:**
- Ranking or ordering by desirability
- Scores or grades
- Activity metrics (stars, forks, commit counts)
- Progress bars or completion indicators

### Repository Detail

- All ecology primitives from `.grove.yaml`
- Season derived from phase (derivation visible)
- Consolidation interval and elapsed time since last consolidation
- Dependency load (observed, contextual)
- Fit observations: tension between intent and shape/motion
- Ritual invitations (if eligible based on cadence/phase)

### Authentication

- GitHub OAuth, minimal scope (read repos + file contents)
- Auth callback route

---

## Visual Direction

Guidance for atmospheric tone. These are not rigid requirements.

- **Repo cards:** Grounded, quiet — generous padding, no hover animations that imply action
- **Header:** "Grove" in serif or weighted sans, subtitle muted. Climate displayed subtly beneath.
- **Climate band:** Thin atmospheric element, not labeled aggressively
- **Phase display:** Text only, no badges or color-coded chips
- **Consolidation eligibility:** Muted signal (e.g., "Consolidation review available"), never red/amber
- **Empty state:** "Select repositories to begin stewardship." + "Connect GitHub" button. No wizard.

---

## Seasonal Atmosphere Tokens

| Season | Source Phase | Atmospheric Quality |
|---|---|---|
| Expansion | `emerging`, `expanding` | Warmth, openness, light density |
| Consolidation | `consolidating` | Neutrality, clarity, moderate density |
| Pruning | `pruning` | Coolness, reduction, focused density |
| Dormancy | `resting`, `archival` | Stillness, muted tones, minimal density |

Implementation: CSS custom properties / design tokens. Derived at render time from declared phase. Never stored.

---

## Climate Display — Invariant

- Climate is always human-declared. Never inferred, never derived.
- Set by steward through explicit UI action with confirmation.
- Options: Expansion, Consolidation, Pruning, Dormancy.
- Divergence from individual project seasons surfaced as observation.
- Climate is portfolio-wide, not per-repository.
- Not stored in `.grove.yaml`.

---

## Ritual Display

- Closed vocabulary: Consolidation, Stewardship Reaffirmation, Intent Re-Declaration, Ecosystem Balance
- Surfaced as invitations, not tasks or alerts
- No completion state, no tracking
- Reflective language: "This project may be ready for a consolidation review"
- Dismissable with zero consequences
- No participation metrics

---

## Explicit Non-Goals for v0

- No persistence / database
- No density heuristic (deferred)
- No climate inference or derivation
- No cosmology projection
- No background sync
- No notifications, alerts, or reminders
- No write operations to repositories

---

## Data Flow

```
.grove.yaml → grove-core (parse, derive season, check cadence) → grove-web (render)
GitHub API  ↗ (repo list, file fetch)
```

No persistence. Session-scoped.

---

## Exit Criteria

From `docs/roadmap.md` Phase 1:

- Steward can view portfolio through declared ecology primitives
- Seasonal atmosphere visible, derived from phase
- Ritual invitations surfaced without tracking or compliance
- No scoring, ranking, or prescriptive output
