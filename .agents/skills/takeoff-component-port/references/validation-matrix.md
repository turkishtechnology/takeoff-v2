# Validation Matrix

Use this file before sign-off. The scripts catch common issues, but they do not
replace deliberate review.

## Required commands

From the repo root:

```bash
pnpm check-types
pnpm lint
pnpm build
python3 .agents/takeoff-component-port/scripts/verify_port_artifacts.py <ComponentName> --repo-root .
```

If tokens or recipes changed, also run in `../takeoff-design`:

```bash
pnpm --filter @takeoff-design/tokens build
```

## Contract checks

- `takeoff-ui` props, defaults, and events mapped intentionally
- Spar primitive choice stated explicitly
- every recipe selector backed by a rendered class name or `data-*` hook
- `react-spar` emits no component CSS
- public token CSS import path is correct
- no stale `@takeoff-ui/react-spar/styles` references remain
- README, docs, and smoke app reflect the real package behavior
- public docs do not carry internal migration rationale unless it affects
  consumer-visible contract

## Behavior checks

- disabled behavior
- loading behavior when applicable
- focus-visible behavior
- keyboard navigation
- form behavior when applicable
- grouped or compound state propagation when applicable

## Visual checks

- size, spacing, radius, and gap parity
- grouped, divided, compact, or other variant parity
- icon and text alignment
- open, active, selected, and hover states

## Accessibility checks

- correct semantic owner
- correct interactive owner
- correct label or region linkage
- no regression in ARIA attributes introduced by wrappers

## Final report template

- `archetype`:
- `primitive decision`:
- `difference classification`:
- `touched files`:
- `validations run`:
- `residual risks`:
