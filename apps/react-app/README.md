# react-app

Vite + React + TypeScript consumer **smoke app and contract verifier** for
`@takeoff-ui/react-spar`.

Local development resolves `@takeoff-ui/react-spar` to
`../../packages/react-spar/src` so the app validates package source directly
instead of relying on prebuilt dist artifacts.

## Role

This app is **not just a demo**. Per Milestone 6 of
[`docs/proposals/monorepo-professionalization-execution-plan.md`](../../docs/proposals/monorepo-professionalization-execution-plan.md),
it is the runtime contract verifier that future component ports must keep green.
A sticky verifier panel renders pass/fail status on mount, and any failure also
calls `console.error` so a future headless-browser CI step can assert the panel.

## Verification scope

Each `pnpm dev:react` (or `pnpm --filter react-app build` followed by a manual
open) exercises the following contract surfaces:

1. **Provider contract** — `SparReactProvider` writes `data-theme` on its
   `display: contents` wrapper.
2. **Token CSS import path** — a known foundational variable (`--text-base`)
   resolves to a non-empty value, proving
   `@takeoff-design/tokens/css/default/theme.css` actually loaded.
3. **Public exports** — every named import at the top of `src/App.tsx` must stay
   resolvable. `pnpm check-types` and `pnpm --filter react-app build` cover this
   for free.
4. **Slot anatomy** — each visible-by-default shipped component (`Button`,
   `Accordion`, `AccordionItem`, `Input`) renders its canonical root with the
   documented `tk-*` slot class and `data-slot="root"` anchor (per ADR 0005).
   `Dialog` is interactive-only and is covered by its own test suite.
5. **Customization paths** — one scenario per documented surface:
   - provider-level `defaultProps`,
   - provider-level `classNames`,
   - provider-level `slotProps`,
   - instance `classNames` (concatenates with canonical class),
   - instance `slotProps` (merges onto canonical root),
   - render override (`renderSpinner`) — content replaces, owner stays.

## Maintenance rule

Every newly shipped component must add at least one smoke scenario here before
it can ship to npm. If a component genuinely cannot exercise a given
customization surface (because that surface is not part of its public contract),
add the scenario as `// exemption: <reason>` so the omission is intentional and
reviewable. The same rule lives in
[`packages/react-spar/docs/coding-standards.md`](../../packages/react-spar/docs/coding-standards.md)
and the release gate in the execution plan.

## Local commands

```bash
pnpm dev:react                       # vite dev server with the verifier panel
pnpm --filter react-app build        # tsc -b && vite build
pnpm --filter react-app preview      # serve the built bundle locally
```
