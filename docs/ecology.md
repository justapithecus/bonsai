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
