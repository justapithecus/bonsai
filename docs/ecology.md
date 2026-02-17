# Ecology Primitives

v0 definitions for Grove's observation vocabulary.

These primitives are declared per-repository via `.grove.yaml`. They are not inferred, scored, or ranked.

---

## Horizon

The declared temporal scope of a project.

| Value | Meaning |
|---|---|
| `ephemeral` | Expected to exist briefly. Experiments, spikes, throwaway prototypes. |
| `seasonal` | Tied to a bounded period. Conference demos, course projects, contract work. |
| `perennial` | Intended to persist and evolve across years. Libraries, tools, infrastructure. |
| `civilizational` | Intended to outlast its creator. Standards, protocols, foundational substrates. |

Horizon is declared by the steward. It may change over time. Changes should be deliberate and recorded.

---

## Phase

The current lifecycle state of a project.

| Value | Meaning |
|---|---|
| `emerging` | Early formation. Structure is fluid. Intent may still be solidifying. |
| `expanding` | Active growth. New capabilities, new surface area. |
| `consolidating` | Tightening structure. Reducing excess. Strengthening boundaries. |
| `pruning` | Deliberate removal. Reshaping scope. Reducing surface area with intent. |
| `resting` | Intentional inactivity. The project is not abandoned — it is still. |
| `archival` | No further changes expected. Preserved for reference. |

Phase is declared, not computed. A project in `resting` is not failing.

---

## Role

The declared function of a project within a portfolio.

| Value | Meaning |
|---|---|
| `infrastructure` | Foundational substrate. Depended upon by other projects. |
| `application` | User-facing software. Serves a specific audience or workflow. |
| `library` | Reusable module. Consumed by other codebases. |
| `experiment` | Exploratory work. May not persist. |
| `documentation` | Knowledge artifact. Guides, references, specifications. |
| `stewardship` | Meta-observational system. Observes other projects or the ecosystem itself. |

---

## Steward

The named human responsible for stewardship of the project.

Steward is a person, not a team or organization. If stewardship is shared, one person is still named as primary.

Stewardship is visible and explicit. An unnamed steward is surfaced as unknown.

---

## Consolidation cadence

The declared interval at which the steward intends to review the project's structural integrity.

Expressed in days (e.g., `consolidation_interval_days: 180`).

This is not a deadline or obligation. It is a declared rhythm. Grove may surface when the interval has elapsed, but it does not create urgency.

---

## Dependency load

The observed count and surface area of external dependencies.

Unlike the other primitives, dependency load is **observed**, not declared. It is derived from package manifests, lock files, and import graphs.

Dependency load is a contextual signal. A high count is not inherently problematic. A low count is not inherently virtuous. Interpretation requires intent context.

---

## Ritual

A structured, reflective checkpoint that recurs on a declared or suggested cadence. Rituals shape attention through rhythm. They do not produce tasks, scores, deadlines, or compliance artifacts.

Grove defines a closed vocabulary of four foundational rituals:

| Ritual | Purpose |
|---|---|
| `consolidation` | Reflective review of structural integrity and alignment with declared intent. |
| `stewardship_reaffirmation` | Reflective checkpoint on the steward's relationship to the project. |
| `intent_redeclaration` | Revisiting declared intent to confirm or update it. |
| `ecosystem_balance` | Portfolio-level reflection on proportion and distribution across projects. |

Rituals are invitations, not obligations. They are not tracked, scored, or measured. Declining a ritual has zero consequences.

See [`docs/designs/rituals.md`](designs/rituals.md) for the full specification.

---

## Season

A presentation-layer atmosphere derived from a project's declared phase. Seasons are never stored as data fields and never independently declared.

| Declared Phase | Season |
|---|---|
| `emerging` | Expansion |
| `expanding` | Expansion |
| `consolidating` | Consolidation |
| `pruning` | Pruning |
| `resting` | Dormancy |
| `archival` | Dormancy |

Dormancy has two contextual modes — **Hibernation** (resting, with expectation of re-engagement) and **Survival** (archival, preserved but not expected to resume) — which are presentation-layer annotations, not phase values.

Season exists to provide atmospheric vocabulary for the UI and reflective language. It is derived at presentation time and must not appear in `.grove.yaml` or any data model.

---

## Climate

An ecosystem-level declaration describing the overall atmospheric state of a steward's portfolio. Climate uses the same seasonal vocabulary: Expansion, Consolidation, Pruning, Dormancy.

Climate is:
- **always set by the steward** — never changed by inference or automation
- **portfolio-wide** — not per-repository
- **not stored in `.grove.yaml`** — it is an ecosystem-level configuration
- **rare to change** — quarterly at most, requiring explicit confirmation

Grove may observe activity patterns across the portfolio that suggest a climate review — shifts in tempo, prolonged consolidation neglect, or gravitational changes in dependency structure. These observations are invitations to reflect, not prompts to act. They never change the declared climate value.

When the declared climate differs from a project's derived season, Grove surfaces this as an observation. Climate/season tension is never accompanied by recommendations, urgency, or corrective suggestions.

See [`docs/designs/rituals.md`](designs/rituals.md) for the full specification.
