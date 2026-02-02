# MEASURES.md

## Purpose

Define the measurement vocabulary Bonsai uses as contextual signals.

Measures are descriptive, time-bound, and never collapsed into scores.

---

## Principles

- Measures exist only to support questions in `docs/QUESTIONS.md`.
- Measures are reported with explicit context (time window, environment, and source).
- Measures are not ranked, normalized, benchmarked, or aggregated into composite values.
- Measures are not used to prescribe action or imply correctness.
- Absence of a measure is a valid state and must be surfaced as unknown.

More measurement is not inherently better.

---

## Shape Measures

Shape measures describe static structure at a point in time.

- File count and directory count
- Lines of code by language (with method noted)
- Dependency count and dependency surface area
- Module or package boundaries as observed in the tree

Shape measures do not imply necessity, quality, or excess.

---

## Motion Measures

Motion measures describe how a project changes over time.

- Commit cadence over a specified window
- Churn as additions vs deletions over time
- Bursty vs steady change patterns
- Inactivity spans and return points
- Concentration of changes by contributor and path

Motion measures do not imply progress, productivity, or neglect.

---

## Accessibility Signals

Accessibility signals describe cognitive and procedural friction prior to meaningful use.

- Presence and clarity of setup instructions
- Ordering and locality of required steps
- External context required to proceed
- Error paths encountered during setup
- References that are missing, ambiguous, or outdated

Accessibility signals are contextual and must be interpreted relative to declared intent and audience.

High cognitive friction may be appropriate.

---

## Capability Observations

Capability observations describe what behaviors can be demonstrated at a given time.

- Whether a build or run path can be exercised in a stated environment
- Whether documented behaviors manifest during observation
- Inputs required to reproduce observed behaviors
- Error surfaces encountered during observation

Capability observations are:
- time-bound
- environment-dependent
- non-binary

They do not imply long-term viability or correctness.

---

## Fit Indicators

Fit indicators describe relationships between intent and observed dimensions.

- Declared intent vs observed shape tensions
- Declared intent vs observed motion tensions
- Declared intent vs accessibility signals
- Declared intent vs capability observations

Fit indicators surface alignment or tension but do not produce verdicts.

---

## Intent Records

Intent records are human-authored and authoritative.

- Declared intent statements
- Timestamped changes to intent
- Explicit unknowns or omissions in intent

Intent records are not inferred from observation.

