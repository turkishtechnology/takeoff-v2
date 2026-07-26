---
name: takeoff-button
description:
  'Use for the Button component from @takeoff-ui/react-spar (Takeoff UI / Spar
  React) — a clickable element that triggers an action, with variant,
  appearance, size, loading spinner, icon slots, and toggle support. Triggers on
  tasks like add a button, CTA, submit button, primary/secondary/danger button,
  icon button, loading/disabled button, toggle button. Use this skill WHENEVER
  building, adding, importing, styling, or fixing a Button (or related clickable
  action UI) in a React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Button — @takeoff-ui/react-spar

`Button` triggers an action when clicked. It wraps the Spar headless button
primitive and adds Takeoff visual vocabulary — variant, appearance, size,
loading state, and icon slots.

**When to use:** Any clickable action — submit, CTA, toolbar action, icon-only
action, or a two-state toggle (via `pressed`/`onPressedChange`).

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Button } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<Button variant="primary" size="base">
  Click me
</Button>
```

## Examples

### Variants

```tsx
<div className="flex flex-wrap gap-3">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="neutral">Neutral</Button>
  <Button variant="info">Info</Button>
  <Button variant="success">Success</Button>
  <Button variant="danger">Danger</Button>
  <Button variant="warning">Warning</Button>
  <Button variant="white">White</Button>
  <Button variant="black">Black</Button>
</div>
```

### Appearance & sizes

```tsx
<div className="flex flex-wrap items-center gap-3">
  <Button appearance="filled">Filled</Button>
  <Button appearance="filledLight">FilledLight</Button>
  <Button appearance="outlined">Outlined</Button>
  <Button appearance="text">Text</Button>
  <Button size="small">Small</Button>
  <Button size="base">Base</Button>
  <Button size="large">Large</Button>
</div>
```

### Loading & disabled

```tsx
import { useState } from 'react';

function SaveButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="primary"
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      Save
    </Button>
  );
}

// Static states:
<Button loading>Saving…</Button>
<Button disabled>Disabled</Button>
```

### Icons & icon-only

```tsx
import { StarIconOutlinedRounded } from '@takeoff-icons/react/star';
import { ArrowRightIconOutlinedRounded } from '@takeoff-icons/react/arrow-right';

<div className="flex flex-wrap gap-3">
  <Button startContent={<StarIconOutlinedRounded />}>Favorite</Button>
  <Button endContent={<ArrowRightIconOutlinedRounded />}>Continue</Button>
  {/* Icon-only: omit children, add rounded for a pill */}
  <Button startContent={<StarIconOutlinedRounded />} rounded />
</div>;
```

### Toggle

```tsx
import { useState } from 'react';

function ToggleButton() {
  const [pressed, setPressed] = useState(false);

  return (
    <Button
      variant={pressed ? 'primary' : 'secondary'}
      pressed={pressed}
      onPressedChange={setPressed}
    >
      {pressed ? 'On' : 'Off'}
    </Button>
  );
}
```

## Key props

| Prop                   | Type                             | Default     | Notes                                                                                        |
| ---------------------- | -------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| children               | `React.ReactNode`                | -           | Button label content.                                                                        |
| variant                | `ButtonVariant`                  | `'primary'` | `primary \| secondary \| neutral \| info \| success \| danger \| warning \| white \| black`. |
| appearance             | `ButtonAppearance`               | `'filled'`  | `filled \| filledLight \| outlined \| text`.                                                 |
| size                   | `ButtonSize`                     | `'base'`    | `small \| base \| large`.                                                                    |
| rounded                | `boolean`                        | `false`     | Pill-shaped button. Ideal for icon-only actions.                                             |
| startContent           | `React.ReactNode`                | -           | Node rendered before children (typically an icon).                                           |
| endContent             | `React.ReactNode`                | -           | Node rendered after children.                                                                |
| loading                | `boolean`                        | -           | Shows a spinner; sets `aria-busy`.                                                           |
| disabled               | `boolean`                        | -           | Native disabled state.                                                                       |
| pressed                | `boolean`                        | -           | When defined, makes a toggle button.                                                         |
| onPressedChange        | `(pressed: boolean) => void`     | -           | Fires when toggle state changes.                                                             |
| classNames / slotProps | `Partial<Record<ButtonSlot, …>>` | -           | Per-slot (`root \| content \| label \| spinner`) class/attribute overrides.                  |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Renders a native `<button>` with `type="button"` by default.
- `loading` surfaces `aria-busy="true"` and `aria-live="polite"`.
- Toggle mode exposes `aria-pressed` reflecting the current state.
- Disabled buttons set `tabIndex={-1}` and the native `disabled` attribute.
- Keyboard: Enter / Space activate; Tab moves focus to/from the button.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/button
- Source: `packages/react-spar/src/components/button/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Button
