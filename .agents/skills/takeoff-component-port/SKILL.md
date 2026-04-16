---
name: takeoff-component-port
description: >
  Use this skill when porting, reviewing, or correcting a Takeoff component
  across takeoff-ui, takeoff-design, spar, and takeoff-spar. Apply it for
  "bilesen port", parity investigations, Spar primitive fit checks, token recipe
  extraction, React wrapper design, docs or README contract fixes, or drift
  reviews between the Web Component source and the React package.
compatibility: >
  Assumes a local workspace with sibling repos ../takeoff-ui and
  ../takeoff-design. ../spar is strongly preferred but optional. Shell access is
  required to run the bundled scripts.
metadata:
  owner: takeoff-ui
  version: '2'
---

# Takeoff Component Port

Use this skill when a component has to move through this stack:

- `takeoff-ui` is the original source of truth for public contract, visual
  intent, and baseline behavior.
- `takeoff-design/packages/tokens` is the shared styling distribution layer.
- `spar` is the preferred behavior and accessibility primitive layer.
- `takeoff-spar` is the final React delivery layer.

## Repo discovery

- Assume sibling repos at `../takeoff-ui`, `../takeoff-design`, and optionally
  `../spar`.
- Do not ask the user for repo locations up front.
- Only ask the user for repo locations if the required repos cannot be found
  locally.
- Treat missing `takeoff-ui` or `takeoff-design` as blockers.
- Treat missing `spar` as a warning unless the task depends on confirming a
  matching Spar primitive.

## Quick start

1. Resolve the component name in `ComponentName`, `component-name`, and
   `componentName` forms.
2. From the skill directory, run:

   ```bash
   python3 scripts/check_port_context.py <ComponentName> --repo-root ../..
   ```

3. Read these references:
   - Always: [references/workflow.md](references/workflow.md)
   - Always: [references/adaptation-policy.md](references/adaptation-policy.md)
   - When the component structure is not obvious:
     [references/archetypes.md](references/archetypes.md)
   - When implementing slot/data/class contracts:
     [references/live-button.md](references/live-button.md)
   - Before sign-off:
     [references/validation-matrix.md](references/validation-matrix.md)
4. Implement the port or review.
5. Before finishing, run:

   ```bash
   python3 scripts/verify_port_artifacts.py <ComponentName> --repo-root ../..
   ```

## Non-negotiables

- Live repo state wins over stale prompt text.
- Start from `takeoff-ui`, not from the current `takeoff-spar` implementation.
- If a matching Spar primitive exists, use it unless the adaptation policy says
  otherwise and you state the reason explicitly.
- Stencil event names do not carry their `tk` prefix into React. Convert them to
  idiomatic React callback names such as `onClick`, `onActiveChange`, and
  `onActiveIndexChange`.
- Keep porting rationale internal. Do not push Stencil history, adaptation
  notes, or internal migration commentary into public docs or component comments
  unless they change the consumer-visible contract.
- `takeoff-design/packages/tokens` owns shared styling and emitted CSS.
- `@takeoff-ui/react-spar` ships JS and types, not component CSS.
- Every selector in a token recipe must map to a real React slot class or
  `data-*` hook.
- Classify differences explicitly:
  - `strict-parity`
  - `technical-adaptation`
  - `react-enhancement`
  - `forbidden-divergence`
- README, docs, smoke app, exports, and peer dependency guidance are part of the
  public contract.

## Available resources

- [references/workflow.md](references/workflow.md) End-to-end workflow and
  repo-aware sequence.
- [references/adaptation-policy.md](references/adaptation-policy.md) Rules for
  deciding what React may adapt and what must remain identical.
- [references/archetypes.md](references/archetypes.md) Porting heuristics by
  component shape.
- [references/validation-matrix.md](references/validation-matrix.md) Required
  checks and final report template.
- [references/live-button.md](references/live-button.md) Verified
  slot/data/class contract example from the current repo.
- [scripts/check_port_context.py](scripts/check_port_context.py) Verifies
  sibling repo layout and prints a read-first checklist.
- [scripts/verify_port_artifacts.py](scripts/verify_port_artifacts.py) Verifies
  emitted CSS, token imports, slot/recipe coverage, and stale contract issues.

## Final report

Before closing the task, report:

- chosen archetype
- Spar primitive decision
- difference classification
- touched files
- validations run
- remaining risks or open questions
