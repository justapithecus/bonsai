# Rituals, Seasons, and Climate

Design specification for Grove's temporal and rhythmic vocabulary.

---

## 1. Purpose

Grove's founding doctrine is observational and non-prescriptive. It surfaces conditions; it does not direct action.

But pure observation, absent any temporal structure, risks becoming sterile — data without rhythm, visibility without engagement. The space between "here is what we see" and "here is what you must do" is not empty. It contains **ritual**: structured, reflective, repeating checkpoints that shape behavior through rhythm without imposing authority.

Rituals are the bridge between passive observation and coercive prescription. They are invitations to reflect, not instructions to act. They provide temporal shape to stewardship without creating deadlines, tasks, or obligations.

---

## 2. Definitions

### Ritual

A structured, reflective checkpoint that recurs on a declared or suggested cadence. Rituals shape attention through rhythm. They do not produce tasks, scores, deadlines, or compliance artifacts.

A ritual is an **invitation**, never an obligation. Declining or ignoring a ritual has zero consequences within Grove.

### Season

A presentation-layer atmosphere derived from a project's declared phase. Seasons are never stored as data fields. They exist only as vocabulary for describing the current feel of a project's lifecycle state.

Seasons map from phases; they are not independently declared.

### Climate

An ecosystem-level declaration that describes the overall atmospheric state of a portfolio. Climate is always set by the steward, applies across repositories, and uses the same seasonal vocabulary. Climate is never changed by inference; review may be prompted by observation of activity patterns.

---

## 3. Foundational Rituals

Grove defines a closed vocabulary of four foundational rituals. No additional rituals may be added without amending this specification.

### Consolidation

**What it is:** A reflective review of a project's structural integrity — its shape, proportion, and alignment with declared intent.

**Suggested cadence:** Aligned with the project's `consolidation_interval_days`, or quarterly if undeclared.

**What it surfaces:**
- Structural drift since the last consolidation
- Disproportion between intent and observed shape
- Dependency load changes
- Areas of repeated churn without sustained change

**What it never produces:**
- Tasks, action items, or to-do lists
- Scores or grades
- Deadlines for remediation
- Notifications or alerts

### Stewardship Reaffirmation

**What it is:** A reflective checkpoint where the steward considers whether they remain the appropriate steward for a project, and whether their relationship to it has changed.

**Suggested cadence:** Annually, or when a project has been in `resting` phase for longer than its declared consolidation interval.

**What it surfaces:**
- Duration of current stewardship
- Phase stability or transitions
- Activity patterns relative to declared intent
- Whether stewardship feels like care or obligation

**What it never produces:**
- Succession recommendations
- Performance assessments
- Urgency to transfer or act
- Participation tracking

### Intent Re-Declaration

**What it is:** A reflective checkpoint for revisiting a project's declared intent — not to optimize it, but to confirm or update it.

**Suggested cadence:** When phase changes, or annually for long-lived projects.

**What it surfaces:**
- Current declared intent and when it was last updated
- Tension between declared intent and observed shape, motion, or capability
- Missing or ambiguous intent fields

**What it never produces:**
- Prescriptive suggestions for what intent should be
- Urgency to update
- Comparisons with other projects' intents
- Compliance tracking

### Ecosystem Balance

**What it is:** A portfolio-level reflective checkpoint for considering the proportion and distribution of attention, phase states, and declared intents across all observed projects.

**Suggested cadence:** Semi-annually, or when climate is re-declared.

**What it surfaces:**
- Distribution of projects across phases and seasons
- Concentration of activity or neglect
- Tension between declared climate and observed seasonal distribution
- Projects with prolonged absence of engagement

**What it never produces:**
- Portfolio optimization recommendations
- Rebalancing suggestions
- Urgency to address imbalances
- Rankings or prioritizations

---

## 4. Ritual Constraints

The following constraints apply to all rituals, foundational or otherwise:

- Rituals do not produce tasks, to-do lists, or action items.
- Rituals do not create deadlines or time-sensitive obligations.
- Rituals do not generate notifications, alerts, or reminders that demand attention.
- Rituals have no completion state. They are not "done" or "undone."
- Rituals have no metrics. Participation, frequency, and duration are not tracked.
- Rituals use a closed vocabulary. Only the four foundational rituals defined in this specification are valid.
- Declining, ignoring, or postponing a ritual has zero consequences within Grove.
- No participation tracking, adherence scoring, or compliance measurement.
- Rituals are surfaced as invitations. The language must be reflective, not directive.

---

## 5. Season Model

### Phase-to-Season Mapping

| Declared Phase | Season | Atmospheric Quality |
|---|---|---|
| `emerging` | Expansion | New growth, fluid structure, potential |
| `expanding` | Expansion | Active growth, increasing surface area |
| `consolidating` | Consolidation | Tightening, strengthening, reducing excess |
| `pruning` | Pruning | Deliberate removal, reshaping, reduction |
| `resting` | Dormancy | Intentional stillness, preservation |
| `archival` | Dormancy | Completed rest, reference state |

### Season as Atmosphere, Not Data

Seasons are a **presentation-layer vocabulary**. They are derived from the declared phase and exist to provide atmospheric context in the UI and in reflective language. They are:

- Never stored as a field in `.grove.yaml` or any data model
- Never independently declared or overridden
- Never used as filter criteria, sort keys, or grouping dimensions in data queries
- Always derived at presentation time from the current declared phase

### Dormancy Modes

Dormancy has two contextual modes that provide atmospheric nuance within the presentation layer:

- **Hibernation** — The project rests with the expectation of future re-engagement. The steward considers the project still-living but intentionally still. Applies when phase is `resting`.
- **Survival** — The project persists in a minimal state. It is preserved but not expected to resume active development. Applies when phase is `archival`.

These modes are presentation-layer annotations. They are not phase values, not stored fields, and not independently declared. They derive from the phase and provide atmospheric context only.

### UI Overlay Concept

Seasons may influence the visual atmosphere of project and portfolio views — color temperature, typography weight, illustration tone, spatial density. These overlays are subtle and non-informational. They shape mood, not decisions. They must never encode urgency, judgment, or ranking.

---

## 6. Climate Model

### Definition

Climate is a portfolio-level declaration that describes the overall atmospheric state of a steward's ecosystem. It uses the same seasonal vocabulary: Expansion, Consolidation, Pruning, Dormancy.

### Properties

- Climate is **always set by the steward**. It is never changed by inference or automation.
- Climate applies across the entire portfolio, not per-repository.
- Climate is not stored in `.grove.yaml` (which is per-repo). It is an ecosystem-level configuration.
- Climate changes should be **rare** — quarterly at most — and require **explicit confirmation**.
- Climate may differ from the predominant season of individual projects. This tension is surfaced, not enforced.

### Climate/Season Tension

When the declared climate differs from a project's derived season, Grove may surface this as an observation. Examples of valid tension:

- Climate is Consolidation, but several projects remain in Expansion season.
- Climate is Dormancy, but a project shows recent active motion.
- Climate is Pruning, but no projects are in pruning phase.

Tension is **surfaced as observation**. It is never accompanied by recommendations, urgency, or corrective suggestions.

---

## 7. Inference Boundary

Grove may suggest that a ritual might be relevant based on observable conditions:

- Consolidation cadence has elapsed
- Phase has been stable for an extended period
- Intent has not been updated in a long time
- Ecosystem balance has not been reviewed recently
- Activity tempo has shifted notably across the portfolio

Grove may **never**:

- Automatically initiate or trigger a ritual
- Change project state based on ritual engagement or non-engagement
- Change climate or any declared value
- Create notifications, alerts, or persistent reminders for rituals
- Track whether a ritual was accepted, declined, or ignored

Inference suggests review. It never changes state.

The suggested window for ritual relevance is **quarterly**. This is a suggestion cadence, not a schedule.

### Inference Types

v1 inference types — patterns Grove may observe to suggest review:

- **Activity tempo** — Shifts in commit frequency, PR cadence, or engagement patterns across the portfolio.
- **Consolidation neglect** — A project's consolidation interval has elapsed without a consolidation ritual being surfaced or engaged.
- **Dependency gravity** — Changes in dependency load that shift the structural weight of a project within the portfolio.

### Future Inference Types

The following inference types are deferred. They are recorded here for boundary-setting, not for implementation.

- **Epistemic drift** — Divergence between a project's documented knowledge and its observed behavior. Requires capability probes and accessibility analysis not yet available.
- **Agency creep** — A system begins making decisions or prescribing actions beyond its declared scope. Relevant to Grove's own self-observation. Requires meta-observational infrastructure not yet available.

---

## 8. Relationship to Existing Primitives

### Phase

Rituals connect to phase through the season model. Phase remains the declared data field in `.grove.yaml`. Season is derived from phase. Phase gains one new value: `pruning`.

### Consolidation Cadence

The Consolidation ritual aligns naturally with the existing `consolidation_interval_days` primitive. The cadence declared there serves as the suggested rhythm for the Consolidation ritual.

### Horizon

Horizon influences which rituals feel relevant. An `ephemeral` project may never encounter a Stewardship Reaffirmation ritual. A `civilizational` project may encounter one frequently. This is contextual, not enforced.

### Fit

Rituals may surface fit-related observations — tension between intent and shape, or between climate and season. Rituals do not compute fit; they provide a temporal context for reflecting on it.

---

## 9. Anti-Patterns

The following patterns indicate drift away from the ritual model's intent:

- **Ritual Completion Tracking** — Recording whether rituals were "completed" or measuring completion rates.
- **Ritual Adherence Scoring** — Scoring stewards based on ritual engagement frequency or consistency.
- **Seasonal Urgency** — Using seasonal transitions to create time pressure or deadline-like framing.
- **Climate Enforcement** — Using the declared climate to prescribe phase changes or prioritize projects.
- **Rhythm Optimization** — Analyzing ritual cadences to suggest "optimal" timing or frequency.
- **Ritual Metrics** — Any quantitative measurement of ritual participation, duration, or outcomes.
- **Seasonal Comparison** — Ranking projects or stewards based on seasonal state or transition patterns.
- **Automatic Climate Change** — Changing the declared climate based on inference, aggregate data, or observed patterns without explicit steward confirmation.

---

## 10. Contract References

This specification interacts with the following contracts:

- **CONTRACT_NON_PRESCRIPTIVE.md** — Rituals must conform to non-prescriptive constraints. They are invitations, not recommendations. The Ritual Boundary subsection of that contract governs.
- **CONTRACT_OBSERVATIONAL.md** — Seasonal state is an observation derived from declared phase. Climate/season tension is surfaced as observation.
- **CONTRACT_INTENT_DECLARATION.md** — Climate is a declared field, consistent with Grove's requirement that intent and state are human-declared. Season is derived, not declared, and therefore not subject to intent declaration constraints.
