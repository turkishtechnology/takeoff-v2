---
name: takeoff-component-workflow
description:
  Source-backed workflow for designing, implementing, reviewing, and verifying
  components in @takeoff-ui/react-spar. Enforces upstream-first thinking — Spar
  fixes precede thin takeoff-spar wrappers — and rejects adapter hooks by
  default.
---

# Takeoff Component Workflow Skill

Use this skill for component work in `@takeoff-ui/react-spar`.

Supported commands:

```txt
contract <ComponentName>
implement <ComponentName>
review current branch
fix review blockers only
final verify
```

## Required reading

Before producing any output in any mode, you MUST read the following files in
full using the Read tool. Do not rely on memory, summaries, or prior context —
re-read them on every invocation.

Always required:

```txt
docs/component-authoring-contract.md
packages/react-spar/docs/coding-standards.md
```

Conditionally required:

```txt
packages/react-spar/docs/data-attribute-vocabulary.md
  → required whenever the work emits, consumes, or styles any `data-*`
    attribute, slot anchor, or compound part.
```

If you cannot read any required file (missing, moved, permission error), stop
and report it as a blocker instead of proceeding.

Begin every mode's output with a `## Required reading` section that lists each
file you read and its current line count, proving the read happened. Output
produced without this section is invalid and must be rejected.

---

## Core rule

Do not solve upstream Spar behavior/API problems in takeoff-spar with adapter
hooks.

If behavior belongs to Spar, stop and create an upstream Spar task first.

---

## Mode: contract <ComponentName>

Purpose: decide the API before implementation.

### Required source inspection

Inspect actual source code, not only docs:

```txt
takeoff-ui Core component
spar primitive component
existing takeoff-spar component
existing tests
styling/token recipe if relevant
```

### Output format

```md
# <ComponentName> Contract

## Required reading

| File | Lines read |
| ---- | ---------- |

## Sources inspected

| Layer | File | Symbols |
| ----- | ---- | ------- |

## Behavior ownership

| Behavior | Owner | Reason |
| -------- | ----- | ------ |

## Upstream Spar changes required

| Required? | Change | Reason |
| --------- | ------ | ------ |

## Public takeoff-spar API

| API | Kind | Decision | Reason |
| --- | ---- | -------- | ------ |

## Public compound parts

| Part | Public? | Reason |
| ---- | ------: | ------ |

## Internal decorative slots

| Slot | Reason |
| ---- | ------ |

## Implementation order

1. Spar change, if required.
2. Spar tests.
3. takeoff-spar thin wrapper.
4. takeoff-spar tests.

## Blockers before implementation

- ...
```

### Rules

- If Spar needs API/behavior alignment, say so clearly.
- Do not propose `use<Component>Adapter`.
- Do not expose decorative parts as public compound components unless justified.
- Every decision must point to actual source behavior.

---

## Mode: implement <ComponentName>

Purpose: implement an approved contract.

### Preconditions

Before coding:

1. There must be an accepted component contract.
2. Any required Spar alignment must already be implemented or explicitly in
   scope.
3. No adapter hook may be introduced unless the contract explicitly approves it.

### Implementation order

If Spar needs changes:

1. Update Spar primitive API.
2. Update Spar primitive behavior.
3. Add Spar tests.
4. Then update takeoff-spar wrapper.

For takeoff-spar:

1. Update public types.
2. Implement wrapper directly.
3. Keep decorative slots internal.
4. Add tests.
5. Export only intended public surface.

### Forbidden by default

```txt
use<Component>Adapter.ts
render override props
public decorative subcomponents
full SparProps extension
large ADR/doc generation
```

### Output format

```md
# Implementation Summary

## Required reading

| File | Lines read |
| ---- | ---------- |

## Spar changes

| File | Change |
| ---- | ------ |

## takeoff-spar changes

| File | Change |
| ---- | ------ |

## Public API

| API | Status |
| --- | ------ |

## Internal slots

| Slot | Status |
| ---- | ------ |

## Tests

| Test | Purpose |
| ---- | ------- |

## Not done

| Item | Reason |
| ---- | ------ |
```

---

## Mode: review current branch

Purpose: strict review.

### Required checks

1. Did the code fix Spar first when behavior belongs to Spar?
2. Did takeoff-spar stay thin?
3. Was any adapter hook introduced?
4. Are decorative parts public without reason?
5. Are public types explicit?
6. Are callback names React-compatible?
7. Are tests behavior-focused?
8. Is CI green if available?

### Output format

```md
# Review Result

Decision: APPROVE | REQUEST_CHANGES | COMMENT

## Required reading

| File | Lines read |
| ---- | ---------- |

## Blockers

| #   | Issue | File | Why it matters | Fix |
| --- | ----- | ---- | -------------- | --- |

## Non-blocking

| #   | Issue | Fix |
| --- | ----- | --- |

## Good

| Area | Evidence |
| ---- | -------- |
```

### Review severity

Use `REQUEST_CHANGES` if:

- adapter hook was introduced without explicit approval
- Spar behavior issue is hidden in takeoff-spar
- unwanted Spar props leak into public wrapper types
- decorative subcomponents are public without justification
- tests do not cover core behavior

---

## Mode: fix review blockers only

Fix only blockers from the previous review.

Do not expand scope.

Do not create extra docs.

Do not refactor unrelated components.

Output:

```md
# Fix Summary

## Required reading

| File | Lines read |
| ---- | ---------- |

## Fixed blockers

| Blocker | Fix |
| ------- | --- |

## Files changed

| File | Change |
| ---- | ------ |

## Still unresolved

| Issue | Reason |
| ----- | ------ |
```

---

## Mode: final verify

Final pass before developer review.

Check:

1. Contract followed.
2. Spar aligned first if needed.
3. takeoff-spar thin.
4. No adapter hooks.
5. Public API clean.
6. Decorative parts internal.
7. Tests meaningful.
8. CI status.

Output:

```md
# Final Verification

Decision: READY_FOR_DEVELOPER_REVIEW | NOT_READY

## Required reading

| File | Lines read |
| ---- | ---------- |

## Contract compliance

| Requirement | Status | Evidence |
| ----------- | ------ | -------- |

## Developer review focus

- ...
```
