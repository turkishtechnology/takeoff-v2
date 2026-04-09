---
slug: /
title: Getting Started
---

# Takeoff Spar Docs

This site documents public usage of `@takeoff-ui/react-spar`.

Current React policy: `@takeoff-ui/react-spar` targets React 19.x only in the
current phase because the locked `@turkish-technology/spar` dependency requires
React 19 peers.

## Install

`@takeoff-ui/react-spar` ships JS and types only. Install the shared Takeoff
token package for component CSS.

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar react react-dom
```

## Start Here

- [Theming](./theming) — one-time app-shell setup for styles, color mode, and
  density
- [Components Overview](/docs/components/overview) — component inventory styled
  with the Takeoff UI docs theme
- [Button](/docs/components/button) — live preview surface for the current
  `Button` wrapper in docs

Internal architecture, backlog, and parity notes live in
`/internal-docs/react-spar` in the repository and are intentionally excluded
from the public docs site.
