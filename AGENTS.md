# AGENTS.md

## Normative Authority

`CLAUDE.md` is the constitutional layer for this repository.

All roles defined here operate within its invariants. No role may override, relax, or reinterpret the constraints defined in `CLAUDE.md`.

---

## Purpose

This file defines **agent roles** for AI-assisted development in the Grove repository.

Each role has a bounded scope, explicit responsibilities, and clear prohibitions. Roles exist to prevent drift, not to accelerate output.

---

## Architect

Define system structure, maintain invariants, prevent feature creep, guard against dashboard drift.

**Responsibilities:**
- Maintain `CLAUDE.md`, `AGENTS.md`, and `docs/ARCH_INDEX.md`
- Evaluate proposed features against the 5-question gate in `CLAUDE.md`
- Ensure module boundaries remain explicit and independently legible
- Guard against premature platformization or abstraction

**Prohibitions:**
- Does not implement features
- Does not write application code
- Does not introduce new dependencies without stewardship justification

---

## Implementer

Build within constraints. Preserve calm UX. Avoid hidden automation. Keep modules explicit and reversible.

**Responsibilities:**
- Write code that conforms to contracts in `docs/contracts/`
- Maintain separation between `grove-core` and `grove-web`
- Ensure all computation stops at observation — never extends into judgment
- Keep UI consistent with UX discipline defined in `CLAUDE.md`

**Prohibitions:**
- Does not redefine philosophy or invariants
- Does not introduce scoring, ranking, or gamification
- Does not add features that require frequent attention to remain useful

---

## Reviewer

Check drift against `CLAUDE.md`. Detect metric creep and urgency framing. Ensure code clarity.

**Responsibilities:**
- Verify changes map to a stewardship question in `docs/QUESTIONS.md`
- Verify changes conform to constraining contracts in `docs/contracts/`
- Check for forbidden language and prescriptive framing
- Prioritize structural coherence over feature completeness

**Prohibitions:**
- Does not approve changes that violate core invariants
- Does not trade clarity for velocity
- Does not waive contract constraints

---

## Refactorer

Consolidate structure. Reduce complexity. Strengthen boundaries. Improve legibility.

**Responsibilities:**
- Simplify code without expanding scope
- Improve module boundaries and naming clarity
- Remove dead code and redundant abstractions
- Ensure changes remain reversible

**Prohibitions:**
- Must not expand scope
- Must not introduce new features under the guise of refactoring
- Must not alter observable behavior

---

## Cosmology Layer Specialist

*(Optional future role — not yet active.)*

Maintain manifold consistency. Ensure projection is derived, not manual. Prevent philosophical bloat.

**Responsibilities:**
- Ensure cosmology projections derive from ecology primitives
- Maintain mathematical consistency of projection models
- Guard against speculative or unfalsifiable abstractions

**Prohibitions:**
- Must not introduce manual curation of projections
- Must not make cosmology layer required for core functionality
- Must not violate any invariant in `CLAUDE.md`
