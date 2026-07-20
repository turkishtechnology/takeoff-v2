---
name: takeoff-spinner
description:
  'Indeterminate loading indicator with built-in status semantics — the Spinner
  from @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger when you need a
  loading spinner, busy indicator, async/pending state, button or page loader,
  throbber, or activity indicator. Use this skill WHENEVER building, adding,
  importing, styling, or fixing a Spinner (or related loading UI) in a React app
  that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Spinner — @takeoff-ui/react-spar

A compact indeterminate loading indicator with built-in `status` role and
accessible-name semantics.

**When to use:** Show ongoing, indeterminate activity (fetching, saving,
processing) where progress is unknown. Not this — use a progress bar component
for determinate percentage progress.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Spinner } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<Spinner aria-label="Loading results" />
```

`Spinner` renders a polite status by default; always give it a domain-specific
`aria-label` (or `aria-labelledby`) unless it is purely decorative.

## Examples

### Variants

```tsx
<div className="flex flex-wrap items-center gap-5">
  <Spinner variant="primary" aria-label="Primary loading" />
  <Spinner variant="secondary" aria-label="Secondary loading" />
  <Spinner variant="neutral" aria-label="Neutral loading" />
  <Spinner variant="info" aria-label="Info loading" />
  <Spinner variant="success" aria-label="Success loading" />
  <Spinner variant="danger" aria-label="Danger loading" />
  <Spinner variant="warning" aria-label="Warning loading" />
</div>
```

### Appearances

```tsx
<div className="flex flex-wrap items-center gap-5">
  <Spinner appearance="rounded" aria-label="Rounded loading" />
  <Spinner appearance="dots" aria-label="Dots loading" />
  <Spinner appearance="lines" aria-label="Lines loading" />
  <Spinner appearance="pulse" aria-label="Pulse loading" />
  <Spinner appearance="threeDots" aria-label="Three dots loading" />
  <Spinner appearance="loader" aria-label="Loader loading" />
  <Spinner appearance="logo" aria-label="Logo loading" />
</div>
```

### Sizes

```tsx
<div className="flex items-center gap-5">
  <Spinner size="small" aria-label="Small loading" />
  <Spinner size="base" aria-label="Base loading" />
  <Spinner size="large" aria-label="Large loading" />
  <Spinner size="xlarge" aria-label="Extra large loading" />
</div>
```

### Visible loading text

`Spinner` does not lay out a label. When visible text is needed, compose it with
`Label` and connect via `aria-labelledby`.

```tsx
import { Spinner, Label } from '@takeoff-ui/react-spar';

<div className="flex flex-col items-center gap-1">
  <Spinner aria-labelledby="spinner-flight-label" variant="primary" />
  <Label as="span" id="spinner-flight-label">
    Loading flights
  </Label>
</div>;
```

### Conditional / inline loading

```tsx
{
  isLoading ? <Spinner size="small" aria-label="Saving" /> : <span>Saved</span>;
}
```

### Decorative spinner

When another element already announces the loading state, hide the spinner from
assistive tech. With `aria-hidden`, the status role and default accessible name
are not applied.

```tsx
<Spinner aria-hidden />
```

## Key props

| Prop              | Type                                                                                                       | Default     | Notes                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `size`            | `SpinnerSize` — `'small' \| 'base' \| 'large' \| 'xlarge'`                                                 | `'base'`    | Size scale.                                                    |
| `appearance`      | `SpinnerAppearance` — `'rounded' \| 'dots' \| 'lines' \| 'pulse' \| 'threeDots' \| 'loader' \| 'logo'`     | `'rounded'` | Visual spinner style.                                          |
| `variant`         | `SpinnerVariant` — `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning'` | `'neutral'` | Color variant.                                                 |
| `aria-label`      | `string`                                                                                                   | `'Loading'` | Accessible name; override for domain-specific text.            |
| `aria-labelledby` | `string`                                                                                                   | -           | ID of visible loading text; disables the default `aria-label`. |
| `aria-hidden`     | `boolean`                                                                                                  | `false`     | Hides a decorative spinner; drops status role + default name.  |
| `className`       | `string`                                                                                                   | -           | Appends classes to the root slot.                              |
| `classNames`      | `Partial<Record<SpinnerSlot, string>>`                                                                     | -           | Per-slot extra classes (`'root' \| 'indicator'`).              |
| `slotProps`       | `Partial<Record<SpinnerSlot, React.HTMLAttributes<HTMLElement>>>`                                          | -           | Per-slot HTML-attribute overrides.                             |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Renders a polite `status` by default — screen readers announce it without
  interrupting.
- Provide `aria-label` or `aria-labelledby` for a domain-specific name; the
  default name is `Loading`.
- Use `aria-hidden` only when the spinner is purely decorative beside another
  loading message; this removes the status role and default accessible name.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/spinner
- Source: `packages/react-spar/src/components/spinner/`
