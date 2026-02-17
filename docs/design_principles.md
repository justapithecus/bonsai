# Design Principles

UI design guardrails for Grove. These bridge the UX Discipline section of `CLAUDE.md` and the implementation handoff in `docs/designs/ui-v0.md`.

---

## 1. Observatory, not dashboard

The interface serves reflection, not reaction. Information density supports consideration, not throughput. Every screen must remain useful if visited only a few times per year. If a view requires frequent attention to remain legible, it does not belong.

---

## 2. Calm density

White space, clarity, calm typography. No KPI layouts. No traffic-light indicators. No progress bars implying completion. Visual hierarchy guides attention without demanding it.

---

## 3. Seasonal atmosphere

Seasons influence visual tone — color temperature, typography weight, spatial density. Atmospheric shifts are subtle and non-informational. They shape mood, not decisions. Season is derived from declared phase at presentation time. Atmosphere must never encode urgency, judgment, or ranking.

---

## 4. Declared, not inferred

All classifications displayed come from human declarations. The source of every value is legible in the interface. Derived values — such as season from phase — show their derivation. No value appears without a traceable origin.

---

## 5. Tension, not judgment

Misalignment between declared intent and observed structure is presented as tension, not verdict. Valid framing: "appears in tension," "diverges from declared intent." Invalid framing: "is broken," "needs attention," "requires action."

---

## 6. Invitation, not obligation

Ritual surfaces have no completion state, no tracking, no badges. They are ignorable without consequence. Language is reflective: "This project may be ready for a consolidation review." Never directive: "You should review this project."

---

## 7. Restraint as feature

Every element must map to a stewardship question defined in `docs/QUESTIONS.md`. If an element cannot be traced to a question, it does not belong. Prefer absence over noise. An empty view is a valid view.

---

## 8. Ecological vocabulary

Use sparingly and atmospherically: season, consolidation, prune, steward, dormancy, canopy, root. The vocabulary names conditions; it does not construct ideology. Avoid prophetic, ideological, or civilizational tone. Nature is present the way gravity is present — felt, not sermonized.

---

## Contract References

- `CLAUDE.md` — UX Discipline, Language Constraints, Core Invariants
- `docs/contracts/CONTRACT_NON_PRESCRIPTIVE.md` — Ritual and presentation constraints
- `docs/contracts/CONTRACT_OBSERVATIONAL.md` — Observation-only display requirements
