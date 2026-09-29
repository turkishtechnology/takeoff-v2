---
name: takeoff-popover
description:
  'Floating click/hover panel for surfacing extra content, forms, or actions
  anchored to a trigger. This is the Popover from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Use WHENEVER building, adding, importing, styling,
  or fixing a popover, popup panel, anchored overlay, info bubble, dropdown
  panel, floating card, or trigger-attached menu in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar. Triggers: popover, takeoff popover,
  Popover.Content, floating panel, anchored popup.'
---

# Popover — @takeoff-ui/react-spar

`Popover` displays a floating panel on click or hover to surface additional
content, forms, or actions, anchored to a trigger element. It wraps the Spar
headless Popover primitive and adds Takeoff visual vocabulary — `variant`, close
button, and arrow slots.

**When to use:** Anchored, dismissible panels tied to a trigger (settings, quick
forms, contextual info). Not this — use `takeoff-tooltip` for short hover-only
hint text, and `takeoff-dropdown`/`takeoff-menu` for selectable action lists.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Popover } from '@takeoff-ui/react-spar';
```

`Popover` is a compound component — all sub-parts are accessed as `Popover.*`.

## Compound parts

- `Popover.Trigger` — the element that opens the panel; pass `as={Button}` to
  render any component as the trigger.
- `Popover.Content` — the floating panel; portaled to `document.body`. Holds
  `variant`, `side`, `align`.
- `Popover.Header` — styling slot for a title row (no behavior).
- `Popover.Description` — styling slot for supporting body text (no behavior).
- `Popover.Arrow` — optional pointer arrow connecting content to the trigger.
- `Popover.Close` — button that dismisses the popover.

## Basic usage

```tsx
import { Popover, Button } from '@takeoff-ui/react-spar';

<Popover>
  <Popover.Trigger as={Button}>Click me</Popover.Trigger>
  <Popover.Content>
    <Popover.Header>Title</Popover.Header>
    <Popover.Description>Popover content goes here.</Popover.Description>
  </Popover.Content>
</Popover>;
```

## Examples

### Variants

`variant` controls the color appearance of the content:
`'white' | 'dark' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'`.

```tsx
<Popover>
  <Popover.Trigger as={Button}>Success</Popover.Trigger>
  <Popover.Content variant="success">
    <Popover.Description>Success variant popover</Popover.Description>
  </Popover.Content>
</Popover>
```

The default arrow includes a border rim matching the content variant. Custom
`children` replace the default arrow shape. For scrollable content, keep the
arrow as a direct child of `Popover.Content` and put `max-height`/`overflow` on
an inner wrapper so the arrow is not clipped.

### Placement

`side` (`'top' | 'right' | 'bottom' | 'left'`) and `align`
(`'start' | 'center' | 'end'`) position content against the trigger.

```tsx
<Popover>
  <Popover.Trigger as={Button}>Right</Popover.Trigger>
  <Popover.Content side="right" align="start">
    <Popover.Description>Positioned to the right</Popover.Description>
  </Popover.Content>
</Popover>
```

### Arrow

```tsx
<Popover>
  <Popover.Trigger as={Button}>With arrow</Popover.Trigger>
  <Popover.Content>
    <Popover.Description>Popover with arrow</Popover.Description>
    <Popover.Arrow />
  </Popover.Content>
</Popover>
```

### Close button

```tsx
<Popover>
  <Popover.Trigger as={Button}>Open</Popover.Trigger>
  <Popover.Content>
    <Popover.Header className="flex items-center justify-between">
      <span>Title</span>
      <Popover.Close />
    </Popover.Header>
    <Popover.Description>Click x to dismiss</Popover.Description>
  </Popover.Content>
</Popover>
```

### Controlled

```tsx
import { useState } from 'react';
import { Popover, Button } from '@takeoff-ui/react-spar';

function ControlledPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger as={Button}>Controlled</Popover.Trigger>
        <Popover.Content>
          <Popover.Description>Controlled popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</Button>
    </div>
  );
}
```

## Key props

| Prop           | Type                      | Default         | Notes                                                                                                                                |
| -------------- | ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `open`         | `boolean`                 | -               | Controlled open state (pair with `onOpenChange`). On `Popover`.                                                                      |
| `defaultOpen`  | `boolean`                 | `false`         | Initial open state for uncontrolled mode. On `Popover`.                                                                              |
| `onOpenChange` | `(open: boolean) => void` | -               | Fired when open state changes. On `Popover`.                                                                                         |
| `disabled`     | `boolean`                 | `false`         | Disables all triggers (native `disabled`); `open`/`defaultOpen` and the render-prop `open()`/`toggle()` still open it. On `Popover`. |
| `modal`        | `boolean`                 | `false`         | `role="dialog"` + `aria-modal` + focus trap; no backdrop; outside pointer down still dismisses. On `Popover`.                        |
| `id`           | `string`                  | auto            | Base ID for ARIA; only the content id is derived (`${id}-content`), the trigger gets no id. On `Popover`.                            |
| `variant`      | `PopoverVariant`          | `'white'`       | Color variant. On `Popover.Content`.                                                                                                 |
| `side`         | `Side`                    | `'bottom'`      | Side of trigger to position against. On `Popover.Content`.                                                                           |
| `align`        | `Align`                   | `'center'`      | Alignment relative to trigger. On `Popover.Content`.                                                                                 |
| `trapFocus`    | `boolean`                 | `false`         | Trap focus within content. On `Popover.Content`.                                                                                     |
| `container`    | `HTMLElement \| null`     | `document.body` | Portal target for content. On `Popover.Content`.                                                                                     |
| `as`           | component                 | -               | Render the trigger as another component (e.g. `Button`). On `Popover.Trigger`.                                                       |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Trigger exposes `aria-expanded`, `aria-controls` pointing at the content and
  `aria-haspopup="dialog"`.
- Non-modal content has no `role`; give it an `aria-label` / `aria-labelledby`
  when it needs a name. With `modal` it becomes `role="dialog"` +
  `aria-modal="true"`.
- Focus is trapped inside the content when `modal` is `true` (or `trapFocus` is
  set on `Popover.Content`). No backdrop is rendered.
- `Escape` dismisses the popover and returns focus to the trigger.
- Pointer down outside dismisses it in both modes; focus moving outside
  dismisses it only when focus is not trapped.
- Keyboard: `Escape` dismisses; `Tab` navigates focusable content; `Enter`
  activates trigger / close button.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/popover
- Source: `packages/react-spar/src/components/popover/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Popover
