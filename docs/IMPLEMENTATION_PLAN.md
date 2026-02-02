# IMPLEMENTATION_PLAN.md

## Overview

This document defines the phased implementation plan for Bonsai.

Each phase exists to enable specific stewardship questions, not to deliver features.

Progress is measured by clarity gained, not surface area shipped.

---

## Phase 0 — Doctrine and Contracts

### Purpose
Establish the philosophical and epistemic constraints that govern Bonsai.

No code is written in this phase.

### Deliverables

- docs/INTENT.md
- docs/MODEL.md
- docs/QUESTIONS.md
- docs/MEASURES.md
- docs/ANTI_PATTERNS.md

#### Contracts (docs/contracts/)
- CONTRACT_READ_ONLY.md
- CONTRACT_OBSERVATIONAL.md
- CONTRACT_NON_PRESCRIPTIVE.md
- CONTRACT_INTENT_DECLARATION.md
- CONTRACT_CAPABILITY_OBSERVATION.md
- CONTRACT_ACCESSIBILITY.md

### Exit Criteria

- Bonsai’s model can be applied to a repository on paper
- All terms are defined and non-overlapping
- Contracts clearly forbid common failure modes

---

## Phase 1 — Observation Engine (Local)

### Purpose
Generate factual observations without interpretation or recommendation.

### Scope

- Local git repositories only
- Deterministic, repeatable analysis
- JSON output

### Observations

- LoC, files, languages
- Directory and dependency structure
- Commit cadence and churn
- Accessibility signals (setup legibility, context locality)

### Explicit Non-Goals

- No scoring
- No alerts
- No recommendations

### Exit Criteria

- Questions 6–20 in QUESTIONS.md can be answered from outputs
- Observations are clearly separated from interpretation

---

## Phase 2 — Read-only UI

### Purpose
Change perception through presentation alone.

### Scope

- Portfolio overview
- Repo detail views
- Comparative views by intent class

### Constraints

- No editing
- No notifications
- No calls to action

### Exit Criteria

- Viewing the UI alters how the user thinks about their portfolio
- No new data sources are required

---

## Phase 3 — Capability and Accessibility Probes (Experimental)

### Purpose
Observe behavior and cognitive friction without judgment.

### Scope

- Clone and basic setup attempts
- Runnable probes where safe
- Documentation gap detection

### Constraints

- Time-bound observations
- No public shaming
- No binary pass/fail

### Exit Criteria

- Capability observations feel informative, not accusatory
- Low-popularity projects can demonstrate trustworthiness

---

## Phase 4 — Long-Horizon Memory

### Purpose
Support slow reflection over quarters and years.

### Scope

- Snapshot comparison
- Intent change history
- Before/after stewardship actions

### Exit Criteria

- Bonsai remains calm and non-demanding
- Memory aids reflection, not urgency

---

## Phase 5 — Optional Generalization

### Purpose
Explore team or organizational use without violating core constraints.

This phase is optional and not required for project success.

### Stretch Guidance (Computation Without Normative Collapse)

#### Core Clarification
Avoiding scores and rankings does not imply avoiding quantitative structure.

Bonsai permits:
- explicit metrics
- feature vectors
- coefficients
- distances
- envelopes and constraints
- clustering and embeddings

Bonsai forbids:
- normative aggregation into a single scalar
- implicit or explicit ordering of repositories or people
- optimization toward a notion of “better”
- loss functions that encode preference or priority

The boundary is **normative collapse**, not quantification.

#### Design Principle

> Bonsai over-engineers features and under-engineers conclusions.

All computation must stop at the point where:
- tensions are surfaced
- constraints are evaluated
- unknowns are made explicit

No computation may continue into:
- judgment
- prioritization
- recommendation
- optimization

#### Feature Engineering Guidance

Implementation may:
- represent repositories as multi-dimensional feature vectors
- use coefficients and ratios to describe relationships
- compute distances, similarities, and divergences
- evaluate observations against declared intent envelopes
- surface violations of declared constraints deterministically

Implementation must not:
- reduce multiple dimensions into a single “health” value
- rank or order repositories by desirability
- encode “closer is better” semantics
- hide assumptions behind composite metrics

#### Fit Computation (Constraint Satisfaction)

Fit is computed as constraint satisfaction, not scoring.

Allowed outputs include:
- “Observed structure lies outside declared complexity tolerance”
- “Motion exceeds declared stability expectations”
- “Accessibility assumptions exceed declared audience”

Forbidden outputs include:
- “This project is unhealthy”
- “This repo should be prioritized”
- “This is worse than X”

Fit surfaces where reality violates expectations, not what to do about it.

#### Machine Learning (Stretch Only)

Machine learning may be used only for:
- feature extraction
- pattern recognition
- clustering
- classification of observed phenomena
- compression of high-dimensional observation space

Machine learning must not:
- define success criteria
- own a loss function tied to outcomes
- produce recommendations
- replace explicit intent with learned intent
- collapse uncertainty into confidence

ML outputs must remain:
- observational
- contextual
- discardable
- non-normative

#### Computational Boundary (Explicit)

> Bonsai is not a decision engine.
> It is an instrument for making constraints and tensions legible.

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
