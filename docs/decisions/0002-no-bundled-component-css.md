---
number: 0002
title: No bundled component CSS
status: accepted
date: 2026-04-17
tags: [architecture, styling, tokens]
---

## Context

Takeoff already ships a single styling source of truth via
`@takeoff-design/tokens`. That package owns:

- the CSS reset
- token layers for theme, color mode, and density
- per-component recipes that target the slot classes declared by
  `packages/react-spar`

If `@takeoff-ui/react-spar` bundled its own CSS, consumers would receive:

- duplicated cascade definitions
- competing recipe ownership
- build-size penalties that scale with component count
- a second upgrade axis whenever design tokens move

## Decision

`@takeoff-ui/react-spar` ships JavaScript and TypeScript declarations only. The
build must not emit CSS. Consumers import
`@takeoff-design/tokens/css/default/theme.css` once at the application shell or
entrypoint.

Component-specific slot classes (`tk-*`) are declared inside each `*Base.ts` and
centralized in `packages/react-spar/src/styling/slot-registry.ts` as an internal
inventory. Token recipes consume those classes by string convention
(`@use 'recipes/<component>'` plus `.tk-<component> { @include … }` in
`@takeoff-design/tokens/styles/_index.scss`); the registry itself is not
imported across packages. The compiled `dist/` output stays CSS-free.

## Consequences

- Tokens remain the single styling source of truth across every Takeoff
  framework binding.
- New wrappers must register slot classes in `src/styling/slot-registry.ts`
  during port (the generator script handles this automatically).
- The merge checklist must include "confirm no CSS is emitted from
  `packages/react-spar/dist`".
- Smoke app scenarios exercise the real tokens import path, not inlined
  stylesheets.
- Consumers cannot rely on implicit "install the package and styles appear".
  Install docs must show the token import as a required step.

## References

- [`README.md`](../../README.md) — Scope Guardrails
- [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md)
  — Styling Contract
- [`packages/react-spar/src/styling/slot-registry.ts`](../../packages/react-spar/src/styling/slot-registry.ts)
