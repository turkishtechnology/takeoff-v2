---
name: takeoff-ui
description:
  'Setup, conventions, and component map for @takeoff-ui/react-spar (Takeoff UI
  / Takeoff Spar) — the React 19 component library of headless Spar primitives
  styled with Takeoff design tokens. Use this skill WHENEVER starting or wiring
  a project with @takeoff-ui/react-spar: installing packages, mounting
  TakeoffSparProvider, importing the token CSS, theming/color mode, the compound
  + slot (className/classNames/slotProps/data-slot) customization model, or when
  unsure which Takeoff component to reach for. Pair it with the per-component
  takeoff-<name> skills (takeoff-button, takeoff-input, takeoff-dialog, …) for
  component-specific APIs and examples.'
---

# Takeoff UI (`@takeoff-ui/react-spar`)

React-first wrapper layer over the headless **Spar** primitives, styled with
**Takeoff** design tokens. React 19 only. This skill is the shared foundation:
install, provider, theming, the styling model, and a map to the per-component
skills.

**When to use:** project setup, provider/token wiring, theming, the
slot/customization contract, or picking the right component. For a specific
component's props and examples, jump to its `takeoff-<name>` skill.

## Install (3 steps, no build config)

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens
# @takeoff-design/tokens is a peer dependency; @turkish-technology/spar comes in automatically.
```

1. **Token CSS** — import once at the app entry (`main.tsx`, `app/layout.tsx`,
   global CSS):

```ts
import '@takeoff-design/tokens/css/default/theme.css';
```

2. **Provider** — wrap the tree. Renders no DOM; writes `data-theme` (+ optional
   `lang`) to `<html>` and distributes component defaults via context:

```tsx
import { TakeoffSparProvider } from '@takeoff-ui/react-spar';

export function App({ children }) {
  return (
    <TakeoffSparProvider colorMode="light">{children}</TakeoffSparProvider>
  );
}
```

3. **Use any component** — plain imports, no Tailwind preset / Sass / loader
   required:

```tsx
import { Button } from '@takeoff-ui/react-spar';

<Button variant="primary">Start building</Button>;
```

React 18 throws at runtime — pin React 19. Icons ship separately in
`@takeoff-icons/react`
(`import { StarIconOutlinedRounded } from '@takeoff-icons/react/star'`).

## Customization model (applies to every component)

Compound components: the parent owns state/behavior, child parts keep semantic
DOM + a11y wiring. Every DOM-rendering part exposes these layers (lowest →
highest precedence):

- `className` — appends a class to the part's **root** slot.
- `classNames={{ slot: '…' }}` — append classes by named slot.
- `slotProps={{ slot: { … } }}` — HTML attributes by named slot
  (shallow-merged).
- Provider `components` entries — shared defaults + slot customization.

Stable selectors for CSS: canonical `tk-*` recipe classes, `data-slot` (e.g.
`root`, `icon`, `indicator`), and documented state attributes (`data-variant`,
`data-size`, `data-disabled`, `data-invalid`, …). Only rely on attributes listed
in a component's **Data attributes** table — internal DOM is not a styling
contract. Slot names differ per part; check the component's API table rather
than guessing. See `references/composition-styling.md`.

## Theming

`colorMode="light" | "dark"`, branded token bundles, and shared component
defaults flow through the provider. See `references/theming.md`.

## Component map → per-component skills

Each component has its own `takeoff-<name>` skill with import, examples, key
props, a11y, and a verbatim Copy-page doc in its `references/`.

**Actions & form controls:** `takeoff-button` · `takeoff-checkbox` ·
`takeoff-input` · `takeoff-label` · `takeoff-radio` · `takeoff-select` ·
`takeoff-switch` · `takeoff-field` (form-field wrapper: label + description +
error context for nested controls)

**Navigation & disclosure:** `takeoff-accordion` · `takeoff-breadcrumb` ·
`takeoff-tabs`

**Feedback & status:** `takeoff-alert` · `takeoff-badge` · `takeoff-chip` ·
`takeoff-spinner` · `takeoff-tooltip` · `takeoff-toast`

**Content & overlays:** `takeoff-card` · `takeoff-dialog` · `takeoff-drawer` ·
`takeoff-popover` · `takeoff-table`

## Forms

`Field` + the controls integrate with React Hook Form and TanStack Form.
Patterns in `references/forms-react-hook-form.md` and
`references/forms-tanstack-form.md`.

## Reference

- Installation: `references/installation.md`
- Components index: `references/components-index.md`
- Composition & styling: `references/composition-styling.md`
- Theming: `references/theming.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/
- LLM corpus: https://takeoff-v2.app.turkishtechlab.com/llms.txt (and
  `/llms-full.txt`)
- Source: `packages/react-spar/`
