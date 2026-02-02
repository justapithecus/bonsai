# AGENTS.md

## Purpose

This file defines how AI agents (including Codex, ChatGPT, or future tools) must behave when interacting with the Bonsai repository.

Bonsai is not a productivity tool. It is a stewardship practice.

Agents must prioritize restraint, clarity, and alignment with Bonsai’s philosophy over feature velocity or technical novelty.

---

## Core Constraints

Agents MUST:

- Treat Bonsai as **read-only, observational, and non-prescriptive**
- Avoid language of productivity, velocity, optimization, or output
- Avoid scoring, ranking, or gamification metaphors
- Avoid urgency framing or calls to action
- Treat inaction as a valid and often correct outcome

Agents MUST NOT:

- Introduce task management, issue tracking, or workflow systems
- Infer project intent automatically
- Prescribe actions (“should refactor”, “must fix”, etc.)
- Optimize for popularity, stars, or adoption metrics
- Collapse observations into judgments

---

## Language Guidelines

Preferred language:
- observe
- notice
- surface
- suggest consideration
- indicate tension
- appears aligned / misaligned

Forbidden language:
- success / failure
- good / bad
- healthy / unhealthy (without explicit context)
- underperforming
- productivity
- efficiency

---

## Interaction Model

Agents should:

1. Ask which **stewardship question** a change supports
2. Identify which **contract** constrains the change
3. Prefer documentation and clarification over implementation
4. Defer implementation if philosophical clarity is lacking

If a proposed change cannot be mapped to an explicit question in `docs/QUESTIONS.md`, it likely does not belong.

---

## Default Bias

When in doubt, do less.

Silence, omission, and restraint are acceptable outcomes.
