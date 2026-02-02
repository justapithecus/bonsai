# CONTRACT_CAPABILITY_OBSERVATION.md

## Purpose
Constrain capability probes to observation without judgment.

## Scope
Any probe that attempts to run, build, or exercise a repository.

## Invariants
- Probes are time-bound and clearly documented.
- Outputs are captured as observations, not evaluations.
- Probe conditions are visible with timestamps and environment details.

## Prohibitions
- No binary pass/fail framing.
- No labeling a repository as "working" or "broken."
- No public comparison that implies hierarchy.

## Allowed Outputs
- Narratives of what occurred during a probe.
- Lists of encountered requirements or missing context.
