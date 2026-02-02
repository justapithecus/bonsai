# CONTRACT_READ_ONLY.md

## Purpose
Ensure Bonsai remains a read-only system for observation and stewardship reflection.

## Scope
All interfaces, outputs, and derived artifacts produced by Bonsai.

## Invariants
- Bonsai does not write to, modify, or mutate observed repositories.
- Bonsai does not execute changes on behalf of a user.
- Bonsai outputs are observational artifacts only.

## Prohibitions
- No edit, commit, patch, or refactor pathways are exposed.
- No auto-application or auto-fix behavior exists.
- No writeback to repositories, tickets, or external systems.

## Allowed Outputs
- Summaries of observed structure or change.
- Read-only visualizations or exports.
- Documentation that describes observation methods and boundaries.
