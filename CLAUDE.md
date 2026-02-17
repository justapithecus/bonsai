# CLAUDE.md

## Purpose

Grove is a stewardship engine for long-running software ecosystems.

It exists to make structural integrity, declared intent, and long-horizon care visible — without prescribing action, creating urgency, or scoring outcomes.

Grove is not a productivity tool. It is not a dashboard. It is an observatory.

---

## Core Invariants

The following must always hold. No role, feature, or extension may violate them.

- **No ranking.** Grove does not order repositories or people by desirability.
- **No scoring.** Grove does not collapse observations into single values, grades, or verdicts.
- **No prescriptive engines.** Grove does not recommend actions, next steps, or priorities. Grove may suggest stewardship rituals — structured, reflective checkpoints that shape rhythm without imposing authority.
- **No gamification.** Grove does not use streaks, badges, leaderboards, or achievement systems.
- **No alert culture.** Grove does not demand attention, create urgency, or require frequent visits.
- **No intent inference.** Intent is declared by humans, never derived from code, activity, or popularity.
- **Inaction is first-class.** Doing nothing is a valid and often correct outcome.

---

## Stewardship Framing

Grove surfaces:
- tension between declared intent and observed structure
- drift over time
- disproportion
- periods of rest and consolidation
- rhythm and seasonal atmosphere
- quiet completion
- absence and ambiguity

Grove never surfaces:
- judgments of merit or blame
- comparisons without shared intent context
- urgency or time-sensitive obligation
- recommendations disguised as observations

Language must be observational and calm. Grove describes conditions; it does not evaluate them.

---

## Language Constraints

### Preferred vocabulary

- observe
- notice
- surface
- suggest consideration
- indicate tension
- appears aligned / misaligned
- invite reflection
- suggest ritual consideration

### Forbidden vocabulary

- success / failure
- good / bad
- healthy / unhealthy (without explicit observed context)
- underperforming
- productivity
- efficiency
- velocity
- optimize

---

## UX Discipline

- White space, clarity, calm typography.
- No KPI layouts. No traffic-light indicators. No progress bars implying completion.
- The interface is an observatory, not a control panel.
- Information density serves reflection, not reaction.
- Every screen must remain useful if visited only a few times per year.
- Seasonal atmosphere may influence visual tone — color temperature, typography weight, spatial density — but must never encode urgency, judgment, or ranking.

---

## Architectural Discipline

- Single-stack v1: TanStack Start.
- Separation: `grove-core` (pure TypeScript logic) and `grove-web` (application layer).
- No premature platformization. No plugin systems. No extensibility APIs.
- No hidden automation. All computation is explicit and reversible.
- Modules remain explicit and independently legible.

---

## Growth Model

Features emerge organically. Before adding any feature, it must pass this gate:

1. Which stewardship question does it support? (Must map to `docs/QUESTIONS.md`)
2. Which contract constrains it? (Must reference `docs/contracts/`)
3. Does it require frequent attention to remain useful? (If yes, it does not belong.)
4. Does it collapse observations into judgments? (If yes, it does not belong.)
5. Can it be removed without breaking the system? (If no, reconsider.)

---

## AI Agent Interaction Model

Agents working in this repository should:

1. Ask which **stewardship question** a change supports
2. Identify which **contract** constrains the change
3. Prefer documentation and clarification over implementation
4. Defer implementation if philosophical clarity is lacking

If a proposed change cannot be mapped to an explicit question in `docs/QUESTIONS.md`, it likely does not belong.

---

## Default Bias

When in doubt, do less.

Silence, omission, and restraint are acceptable outcomes.

---

## Rituals and Rhythm

Grove defines a closed vocabulary of four foundational rituals — structured, reflective checkpoints that shape stewardship rhythm without imposing authority:

- **Consolidation** — reflective review of structural integrity and alignment with declared intent
- **Stewardship Reaffirmation** — reflective checkpoint on the steward's relationship to a project
- **Intent Re-Declaration** — revisiting declared intent to confirm or update it
- **Ecosystem Balance** — portfolio-level reflection on proportion and distribution

Rituals are **invitations, not obligations**. They:

- Do not produce tasks, deadlines, or notifications
- Have no completion state — they are not "done" or "undone"
- Have no metrics — participation and frequency are not tracked
- Use a closed vocabulary — no additional rituals without amending `docs/designs/rituals.md`
- May be declined, ignored, or postponed with zero consequences

---

## Seasons and Climate

**Season** is a presentation-layer atmosphere derived from a project's declared phase. It is never stored as a data field and never independently declared.

| Phase | Season |
|---|---|
| `emerging`, `expanding` | Expansion |
| `consolidating` | Consolidation |
| `pruning` | Pruning |
| `resting`, `archival` | Dormancy |

Dormancy has two contextual modes — **Hibernation** (resting, still-living) and **Survival** (archival, preserved) — which are presentation-layer annotations, not phase values.

**Climate** is an ecosystem-level declaration describing the overall atmospheric state of a steward's portfolio. It uses the same seasonal vocabulary. Climate is:

- Manually declared by the steward — never inferred
- Portfolio-wide — not per-repository
- Not stored in `.grove.yaml`

When climate and season diverge, Grove surfaces the tension as observation. It does not enforce alignment, recommend changes, or create urgency.

---

## Future: Cosmology Layer

An optional projection layer derived from ecological observation. It models long-horizon trajectories — not predictions.

This layer is:
- derived from ecology primitives, never manually curated
- optional and never required for core functionality
- subject to all invariants above

It does not exist yet. This is acceptable.

---

## Authority

This file is the normative authority for Grove.

All contracts in `docs/contracts/` elaborate specific invariants defined here.
All role definitions in `AGENTS.md` operate within the constraints defined here.
No role, agent, or implementation may override the invariants in this document.

Conflict resolution: `CLAUDE.md` > `docs/contracts/` > `AGENTS.md` > code.
