# MODEL.md

## Purpose

This document defines the canonical conceptual model used by Grove.

The model specifies:
- the entities Grove observes
- the dimensions along which observation occurs
- the boundaries of interpretation
- what Grove can and cannot conclude

All implementation, metrics, presentation, and future extensions must conform to this model.

---

## Core Model

Grove evaluates software projects using a fixed sequence of conceptual dimensions:

Intent → Shape → Motion → Accessibility → Capability → Fit → (In)Action

Each dimension is defined independently and must not collapse into another.

### Quantification Without Normative Collapse

Quantitative structure is permitted within the model, so long as it does not collapse into normative conclusions.

Grove may use:
- explicit metrics
- feature vectors
- coefficients and ratios
- distances, similarities, and divergences
- envelopes and constraints

Grove must not:
- aggregate dimensions into a single scalar
- imply ordering of repositories or people
- encode “closer is better” semantics
- hide assumptions inside composite metrics

---

## 1. Intent

**Intent** is the human-declared purpose and expectations of a project.

Intent describes what a project claims to be, not what it currently is.

### Intent is:
- explicit
- human-authored
- contextual
- normative

### Intent includes (non-exhaustive):
- purpose
- intended audience
- expected lifespan
- acceptable complexity
- expected rate of change
- tolerance for instability or breakage

### Intent is NOT:
- inferred from code
- inferred from activity
- inferred from popularity
- inferred from historical behavior

Grove treats intent as authoritative input.

If intent is missing or ambiguous, Grove must surface that absence rather than compensate for it.

---

## 2. Shape

**Shape** describes the static structural characteristics of a project at a point in time.

Shape answers: *what exists*.

### Shape includes:
- lines of code
- file counts
- directory structure
- language composition
- dependency surface
- distribution of complexity

### Shape does NOT include:
- judgments about quality
- assessments of correctness
- evaluations of necessity

Shape is descriptive only.

---

## 3. Motion

**Motion** describes how a project changes over time.

Motion answers: *how change flows*.

### Motion includes:
- commit cadence
- churn (additions vs deletions)
- burstiness vs steadiness
- periods of inactivity
- contributor concentration over time

### Motion does NOT include:
- progress
- activity expectations
- outcome judgments

Low motion is not inherently problematic.
High motion is not inherently positive.

---

## 4. Accessibility

**Accessibility** describes the cognitive effort required to understand, set up, or meaningfully engage with a project.

Accessibility answers: *how legible the project makes itself relative to its intent*.

### Accessibility includes:
- setup legibility
- clarity of prerequisites
- ordering of required steps
- locality of required context
- error-path friendliness
- clarity of conceptual boundaries

### Accessibility is:
- contextual
- audience-dependent
- relative to declared intent

### Accessibility is NOT:
- simplicity
- ease
- user-friendliness in the abstract

High cognitive friction may be appropriate for some intents and inappropriate for others.

---

## 5. Capability

**Capability** describes what a project demonstrably does at a given point in time.

Capability answers: *what behaviors can be observed today*.

### Capability includes:
- whether the project can be built, run, or exercised
- whether documented behaviors manifest
- whether example workflows execute
- how errors present themselves

### Capability observations are:
- time-bound
- environment-dependent
- non-binary

### Capability does NOT include:
- judgments of merit
- guarantees of correctness
- predictions of future behavior

A project may be historically important, conceptually sound, and currently non-capable.

These states may coexist.

---

## 6. Fit

**Fit** describes the alignment or tension between Intent and the observed dimensions.

Fit answers: *does this project resemble what it claims to be, given its current state?*

### Fit is derived from relationships between:
- Intent and Shape
- Intent and Motion
- Intent and Accessibility
- Intent and Capability

Fit is comparative and contextual.

Fit is NOT:
- a score
- a ranking
- a verdict

Fit surfaces *tension*, not judgment.

Fit is computed as constraint satisfaction, not scoring.
It indicates where observed conditions fall outside declared intent envelopes.

---

## 7. (In)Action

**(In)Action** represents the set of possible responses a human steward may consider.

Grove does not decide actions.

Possible actions include:
- pruning
- preservation
- freezing
- splitting
- archival
- continued observation
- deliberate inaction

Inaction is a valid and often correct outcome.

---

## Interpretation Boundary

Grove enforces a strict boundary between **observation** and **interpretation**.

Grove may:
- surface patterns
- indicate misalignment
- highlight disproportion
- reveal absence or ambiguity

Grove may not:
- prescribe action
- create urgency
- assert intent
- declare outcomes as favorable or unfavorable

All interpretation beyond surfaced observations is the responsibility of the human steward.

---

## Computational Boundary

Grove is not a decision engine.
It is an instrument for making constraints and tensions legible.

The system computes:
- observations
- relations
- constraints
- tensions
- unknowns

The system does not compute:
- decisions
- priorities
- actions
- value judgments

---

## Model Invariants

The following invariants must always hold:

- Intent is authoritative and human-declared
- Observations are descriptive, not evaluative
- Metrics are contextual signals, not scores
- Comparison requires shared intent context
- Inaction is first-class
- Slowness is intentional

Any implementation that violates these invariants is non-conforming.

---

## Model Stability

This model is expected to evolve slowly.

Changes to this document constitute foundational shifts and must be treated as such.

Downstream artifacts (contracts, measures, UI, implementation) must be updated to remain consistent with this model.
