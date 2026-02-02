# ARCH_INDEX.md

## Bonsai — Architectural Index

This document provides a concise architectural overview of Bonsai for humans and AI agents.

If you are reading this, assume limited time and context. This file exists to prevent conceptual drift.

---

## What Bonsai Is

Bonsai is a read-only system for observing and stewarding software portfolios over long periods of time.

It models projects not as units of work, but as living systems that require proportion, care, and restraint.

Bonsai does not optimize for activity, velocity, or output.

---

## Conceptual Model

Bonsai operates on a fixed conceptual spine:

Intent → Shape → Motion → Accessibility → Capability → Fit → (In)Action

- Intent: human-declared purpose and audience
- Shape: static structure of the codebase
- Motion: how the code changes over time
- Accessibility: cognitive legibility relative to intent
- Capability: observed, time-bound behavior
- Fit: alignment or tension between the above
- Action: prune, preserve, freeze, split, archive — or do nothing

Inaction is a first-class outcome.

---

## Architectural Subsystems

Bonsai is organized conceptually, not operationally.

1. **Intent Layer**
   - Human-authored declarations
   - Never inferred automatically

2. **Observation Engine**
   - Structural analysis (LoC, files, languages)
   - Temporal analysis (commits, churn)
   - Accessibility probes
   - Capability probes (experimental)

3. **Interpretation Boundary**
   - Governed by contracts
   - Prevents judgment, prescription, or urgency

4. **Presentation Layer**
   - Read-only UI
   - Comparative and contextual
   - Designed to shape attention, not decisions

---

## Contracts

Contracts are the normative authority in Bonsai.

They constrain interpretation, language, and behavior — not runtime APIs.

All implementation must conform to contracts defined in `docs/contracts/`.

---

## Phase Discipline

Bonsai evolves slowly and deliberately.

- Phase 0: Doctrine and contracts
- Phase 1: Observation engine (local-first)
- Phase 2: Read-only UI
- Phase 3: Capability and accessibility probes
- Phase 4: Long-horizon memory
- Phase 5: Optional generalization

Later phases may not be reached. This is acceptable.

---

## Invariant

Bonsai must remain useful even if visited only a few times per year.
