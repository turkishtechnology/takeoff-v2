# Validation Matrix

Use this file before sign-off. The scripts catch common issues, but they do not
replace deliberate review.

The authoritative readiness gate lives at
[`docs/component-port-readiness.md`](../../../../docs/component-port-readiness.md).
This file lists the commands and per-area checks; the readiness doc lists the
full checklist, the artifact manifest, the parity-review template, and the
React-enhancement review template. When the two disagree, the readiness doc wins
and this file should be updated in the same PR.

## Required commands

From the repo root:

```bash
pnpm check-types
pnpm lint
pnpm build
python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py <ComponentName> --repo-root .
```

If tokens or recipes changed, also run in `../takeoff-design`:

```bash
pnpm --filter @takeoff-design/tokens build
```

## Contract checks

- `takeoff-ui` props, defaults, and events mapped intentionally
- Spar primitive choice stated explicitly
- component-level customization surface decision stated explicitly
- structural vs content/decorative slot inventory recorded
- every recipe selector backed by a rendered class name or `data-*` hook
- `slotProps` attach to canonical slot owner nodes
- render overrides preserve canonical slot owner nodes, classes, and `data-slot`
  hooks
- wrapper and public compound parts share the same slot/data styling contract
  when compound parts exist
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
- wrapper path still works after richer customization surfaces are added
- public compound composition smoke path exists when compound parts are exported

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
- `customization surface decision`:
- `slot inventory and ownership split`:
- `difference classification`:
- `touched files`:
- `validations run`:
- `residual risks`:
