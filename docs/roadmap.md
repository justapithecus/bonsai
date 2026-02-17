# Roadmap

Grove evolves slowly and deliberately.

Each phase exists to enable specific stewardship questions, not to deliver features. Progress is measured by clarity gained, not surface area shipped.

---

## Phase 0 — Doctrine and Contracts

*Current phase.*

Establish the philosophical and epistemic constraints that govern Grove. No code is written.

**Deliverables:**
- `CLAUDE.md`, `AGENTS.md`, `docs/ARCH_INDEX.md`
- Intent, model, questions, measures, anti-patterns
- Contracts: read-only, observational, non-prescriptive, intent declaration, capability observation, accessibility

**Exit criteria:**
- Grove's model can be applied to a repository on paper
- All terms are defined and non-overlapping
- Contracts clearly forbid common failure modes

---

## Phase 1 — Ecology Engine + Web UI

Build the first observation layer and a read-only interface.

**Scope:**
- TanStack Start application
- GitHub OAuth integration
- `.grove.yaml` parsing via `grove-core`
- Live repository fetching (no persistence)
- Ecology primitive display

**Exit criteria:**
- A steward can view their portfolio through declared ecology primitives
- No scoring, ranking, or prescriptive output

---

## Phase 2 — Persistence Layer

Introduce durable storage for observation snapshots.

**Scope:**
- SQLite or Postgres storage
- Snapshot history per repository
- Timestamped ecology state

**Exit criteria:**
- Observations persist across sessions
- Historical comparison is possible

---

## Phase 3 — Drift Detection and Consolidation Tracking

Surface structural drift relative to declared intent.

**Scope:**
- Consolidation cadence tracking
- Shape and motion drift indicators
- Elapsed-interval surfacing (without urgency)

**Exit criteria:**
- Drift is visible without being alarming
- Consolidation reminders feel like gentle observation, not obligation

---

## Phase 4 — Cosmology Projection Layer

Optional long-horizon projection derived from ecology primitives.

**Scope:**
- Trajectory modeling
- Manifold-based projection (experimental)

**Exit criteria:**
- Projections derive from observed data, not manual curation
- The layer is optional and removable

---

## Phase 5 — Optional Generalization

Explore team or organizational use without violating core constraints.

This phase is optional and not required for project success.

---

Later phases may not be reached. This is acceptable.
