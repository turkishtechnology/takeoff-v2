# AGENTS.md

## Repository purpose

This repository builds `@takeoff-ui/react-spar`, a thin React wrapper layer for
Takeoff components built on top of Spar primitives.

This package should not hide upstream Spar behavior problems.

If a behavior belongs in Spar, fix Spar first.

## Required workflow

For component work, use:

```txt
.agents/skills/takeoff-component-workflow/SKILL.md
```

Before component work, read:

```txt
docs/component-authoring-contract.md
```

## Supported AI commands

```txt
contract <ComponentName>
implement <ComponentName>
review current branch
fix review blockers only
final verify
```

## Non-negotiable rules

- No component implementation before a contract.
- No adapter hooks by default.
- No `use<Component>Adapter.ts` unless explicitly approved.
- Fix Spar first when behavior/API belongs to Spar.
- takeoff-spar should stay thin.
- Do not expose full Spar props through public wrapper types.
- Do not expose decorative parts as public compound components by default.
- Do not create extra markdown architecture files unless explicitly requested.
- Keep outputs source-backed and concise.

## Validation

Use the repo's package scripts for validation.

At minimum, component work should run:

```txt
pnpm --filter @takeoff-ui/react-spar check-types
pnpm --filter @takeoff-ui/react-spar test
```

If Spar was changed, also run Spar package tests/typecheck.
