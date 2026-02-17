# `.grove.yaml` Specification

v0 — Per-repository stewardship declaration.

---

## Purpose

`.grove.yaml` is a file placed at the root of a repository to declare its stewardship context. It tells Grove what the project intends to be, who is responsible for it, and how it should be observed.

Repositories without a `.grove.yaml` are shown as **Unclassified** in Grove.

---

## Format

YAML. Single top-level `grove` key.

---

## Example

```yaml
grove:
  intent: "Embeddable storage substrate for future systems."
  horizon: "civilizational"
  role: "infrastructure"
  phase: "consolidating"
  steward: "Andrew"
  consolidation_interval_days: 180
```

---

## Fields

### `intent` (required)

A human-written statement of purpose. Free-form string.

This is the only required field. All other fields are optional.

Intent is declared, never inferred. See [`docs/INTENT.md`](../INTENT.md).

### `horizon` (optional)

Declared temporal scope. One of:
- `ephemeral`
- `seasonal`
- `perennial`
- `civilizational`

See [Horizon](../ecology.md#horizon) in ecology primitives.

### `role` (optional)

Declared function within a portfolio. One of:
- `infrastructure`
- `application`
- `library`
- `experiment`
- `documentation`

See [Role](../ecology.md#role) in ecology primitives.

### `phase` (optional)

Current lifecycle state. One of:
- `emerging`
- `expanding`
- `consolidating`
- `pruning`
- `resting`
- `archival`

See [Phase](../ecology.md#phase) in ecology primitives.

### `steward` (optional)

Name of the human responsible for stewardship. Free-form string.

See [Steward](../ecology.md#steward) in ecology primitives.

### `consolidation_interval_days` (optional)

Declared interval in days between structural reviews. Positive integer.

See [Consolidation cadence](../ecology.md#consolidation-cadence) in ecology primitives.

---

## Absent Fields

Missing optional fields are treated as **unknown**, not as defaults. Grove surfaces unknowns without creating urgency to fill them.

---

## Absent File

A repository without `.grove.yaml` is displayed as **Unclassified**. It is still observable but has no declared stewardship context.

---

## Validation

- `intent` must be a non-empty string.
- `horizon`, `role`, and `phase` must be one of their enumerated values if present.
- `consolidation_interval_days` must be a positive integer if present.
- `steward` must be a non-empty string if present.
- Unrecognized fields under `grove:` are ignored.

---

## Ecosystem-Level Configuration

The following concepts are explicitly **not** part of `.grove.yaml`:

- **Season** is derived from the declared `phase` at presentation time. It is never stored as a field. See [`docs/ecology.md`](../ecology.md#season).
- **Climate** is an ecosystem-level declaration that applies across the entire portfolio. It is not per-repository and is not stored in `.grove.yaml`. See [`docs/ecology.md`](../ecology.md#climate).

These exclusions are by design. `.grove.yaml` declares per-repository stewardship context. Portfolio-level and presentation-layer concepts belong elsewhere.
