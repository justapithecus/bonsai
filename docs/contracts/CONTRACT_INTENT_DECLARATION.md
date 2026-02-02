# CONTRACT_INTENT_DECLARATION.md

## Purpose
Require intent to be declared by humans and never inferred.

## Scope
Intent capture, storage, and display.

## Invariants
- Intent is declared by a person, not inferred by Bonsai.
- Intent remains separate from observation outputs.
- Absent intent is treated as unknown, not missing.

## Prohibitions
- No auto-generated intent labels.
- No interpolation of intent from code, commits, or metadata.
- No coercion to declare intent.

## Allowed Outputs
- Storage and display of human-authored intent statements.
- Timestamped history of declared intent changes.
