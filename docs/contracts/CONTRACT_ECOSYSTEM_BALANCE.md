# CONTRACT_ECOSYSTEM_BALANCE.md

## Purpose

Define how ecosystem balance observations are derived, triggered, and presented.

All logic is structural, categorical, and persistence-based.
No numeric weighting, majority voting, or aggregate scoring is permitted.

---

## Scope

Portfolio-level ecosystem balance ritual invitations and climate proposal observations.

---

## 1. Domain Types

### 1.1 RoleClass

A categorical grouping derived from declared `role` in `.grove.yaml`.

```ts
type RoleClass = "foundational" | "system" | "domain"
```

| Declared Role    | RoleClass       |
|------------------|-----------------|
| `infrastructure` | `foundational`  |
| `civilizational` | `foundational`  |
| `stewardship`    | `system`        |
| `library`        | `system`        |
| `application`    | `domain`        |
| `experiment`     | `domain`        |
| `documentation`  | `domain`        |

Undeclared role maps to no RoleClass. Repos without a declared role do not participate in strata classification.

### 1.2 ClimateRelation

The categorical relationship between a repo's derived season and the declared climate.

```ts
type ClimateRelation = "aligned" | "divergent" | "orthogonal"
```

- **Aligned** — season matches climate. No tension.
- **Divergent** — season conflicts with climate. Structural tension.
- **Orthogonal** — season is an acceptable neighbor. Not tension, not alignment.

### 1.3 Relation Mapping

Relation is determined by `relation(repo.season, ecosystem.climate)`.

| Climate \ Season | expansion   | consolidation | pruning     | dormancy    |
|------------------|-------------|---------------|-------------|-------------|
| `expansion`      | aligned     | orthogonal    | divergent   | divergent   |
| `consolidation`  | orthogonal  | aligned       | orthogonal  | divergent   |
| `pruning`        | divergent   | orthogonal    | aligned     | orthogonal  |
| `dormancy`       | divergent   | divergent     | orthogonal  | aligned     |

This mapping is deterministic. No interpolation or fuzzy matching.

---

## 2. Climate State

### 2.1 ClimateState

```ts
type ClimateState =
  | { kind: "undefined" }
  | { kind: "declared"; climate: Climate }
  | { kind: "proposed"; climate: Climate; basis: ProposalBasis }
```

- **undefined** — Insufficient data or no declaration. Computational start state.
- **declared** — Steward-set. Authoritative. Only a steward action may set this.
- **proposed** — Observational suggestion from Grove. Not binding.

Grove never transitions from `proposed` to `declared` automatically.
Only a steward action (`declareClimate`) may confirm a proposal.

### 2.2 ProposalBasis

Categorical reason for a climate proposal. No numeric confidence.

```ts
type ProposalBasis =
  | "sustained_core_divergence"
  | "long_arc_alignment"
  | "density_drift_upward"
  | "density_drift_downward"
  | "mixed_transition"
```

| Basis                        | Meaning |
|------------------------------|---------|
| `sustained_core_divergence`  | Structural core repos persistently diverge from declared climate. |
| `long_arc_alignment`         | Long-horizon domain repos converge on a season that differs from climate. |
| `density_drift_upward`       | Sustained increase in structural density across the portfolio. |
| `density_drift_downward`     | Sustained decrease in structural density across the portfolio. |
| `mixed_transition`           | No single season dominates, but the portfolio has moved away from the declared climate. |

### 2.3 Proposal Constraints

Grove may only propose a climate when:

- At least 21 days of snapshot history exist.
- At least 3 repos are present in the portfolio.
- At least one repo in Set A exists (structural core presence).
- The pattern persists across the snapshot window.

Grove may re-propose if a pattern persists after a steward declines.
Grove must withdraw a proposal if the underlying pattern reverses.

Only one active proposal may exist at a time. If patterns do not converge on a single climate, Grove surfaces the mixed state as an observation without proposing.

### 2.4 Undefined Behavior

When `ClimateState.kind == "undefined"`:

- Ecosystem balance observations do not fire.
- Repos are not classified as aligned, divergent, or orthogonal.
- Climate proposals may still be generated once proposal constraints are met.

---

## 3. Structural Strata

Repos are partitioned into categorical strata based on declared horizon and derived RoleClass.

### Set A — Structural Core

Projects that are both load-bearing and long-lived. Their divergence from the declared climate carries structural significance because they form the substrate of the portfolio. Long-horizon system projects (libraries, stewardship tools) belong here because they exert structural gravity across the ecosystem.

```
horizon ∈ {perennial, generational}
AND roleClass ∈ {foundational, system}
```

Declaration governs membership. A foundational repo declared ephemeral is not structurally core — its horizon excludes it.

### Set B — Long-Arc Domain

Projects with long-horizon intent that serve specific purposes within the portfolio. Their divergence is directionally meaningful — it suggests where the portfolio's energy is moving. They matter, but they do not anchor.

```
horizon ∈ {perennial, generational}
AND roleClass == "domain"
```

### Set C — Ephemeral Field

Projects declared as ephemeral, irrespective of role.

```
horizon == "ephemeral"
```

### Seasonal Horizon

Repos with `seasonal` horizon do not belong to any stratum. They are observed but do not contribute to trigger evaluation. Their bounded timeframe makes them structurally ambiguous for climate-level assessment.

### Unclassified

Repos without a declared horizon or without a declared role do not participate in strata classification. They are observed but do not contribute to trigger evaluation.

---

## 4. Persistence Contract

### 4.1 Snapshot Cadence

Daily. At most one baseline snapshot per repo per 24-hour period.

Daily gives sufficient resolution for drift detection without the noise of hourly observation. It aligns with the multi-week emergence timeline of climate-level patterns.

### 4.2 Persistent Divergence

A repo is "persistently divergent" if:

- In the last 14 daily snapshots,
- It is classified as `divergent` in at least 9 snapshots.

Two weeks is enough to indicate direction. Nine of fourteen establishes consistency without requiring unanimity. A single transient divergence does not trigger observations.

### 4.3 Persistent Alignment

A repo is "persistently aligned" if:

- In the last 14 daily snapshots,
- It is classified as `aligned` in at least 9 snapshots.

---

## 5. Trigger Contracts

Ecosystem balance observation fires if any of the following hold. All triggers require `ClimateState.kind == "declared"`.

### 5.1 Core Divergence

At least one repo in Set A is persistently divergent.

**Observation language:** Surfaces the specific repo(s) and their divergent season relative to the declared climate.

### 5.2 Core Split

In Set A:

- At least one repo is persistently aligned,
- AND at least one repo is persistently divergent,
- across the same snapshot window.

**Observation language:** Surfaces the split as structural tension within the core.

### 5.3 Long-Arc Drift

In Set B:

- At least two repos are persistently divergent,
- divergence direction is coherent (same divergent season),
- divergence persists across the snapshot window.

**Observation language:** Surfaces the shared directional drift among long-arc domain projects.

### 5.4 Climate Misfit Escalation

If a trigger condition (5.1, 5.2, or 5.3) persists across two consecutive 14-day evaluation windows (~28 days of sustained structural tension):

- Observation language strengthens in tone (still non-prescriptive, still observational).
- Grove may generate a climate proposal if proposal constraints (§2.3) are met.

Escalation does not unlock additional UI affordances. The climate declaration path already exists. Escalation changes wording only.

---

## 6. Ephemeral Participation Contract

Set C (ephemeral) repos:

- Never independently trigger ecosystem balance observations.
- May modify observation language if their divergence patterns reinforce a trigger from Set A or Set B.
- Must not be ignored in descriptive output — their state is observed and reported.

---

## 7. Output Contract

All ecosystem balance observations must:

- Be descriptive and time-bound.
- Avoid urgency, ranking, and corrective commands.
- Avoid quantitative language (percentages, ratios, counts used as thresholds).
- Name specific repos or strata when describing tension.
- Reference the declared climate and observed seasons explicitly.

### Permitted language

- "Structural core projects appear in tension with the declared climate."
- "Long-horizon domain projects share a seasonal direction that diverges from the declared climate."
- "The portfolio shows divergent seasonal patterns without a clear directional trend."
- "Observed structural drift suggests {season} climate."

### Forbidden language

- Majority/minority framing ("most repos", "N of M")
- Quantitative thresholds exposed to the user
- Urgency or corrective framing
- Any vocabulary prohibited by `CLAUDE.md`

---

## 8. Prohibited Mechanisms

The following are explicitly disallowed in ecosystem balance evaluation:

- Numeric weighting of repositories
- Percentage thresholds
- Aggregate scoring or composite values
- Health indices
- Majority-vote logic
- Implicit ranking by surface size, commit count, or dependency count

---

## 9. Contract References

This contract interacts with:

- **CONTRACT_OBSERVATIONAL.md** — All outputs must conform to observational constraints.
- **CONTRACT_NON_PRESCRIPTIVE.md** — Observations and proposals are invitations, not recommendations. The Ritual Boundary governs.
- **CONTRACT_INTENT_DECLARATION.md** — Climate proposals suggest; only steward declarations are authoritative. Grove never transitions proposed to declared automatically.
- **docs/designs/rituals.md** — Ecosystem Balance ritual definition. Trigger contracts here elaborate the conditions under which that ritual is surfaced.
