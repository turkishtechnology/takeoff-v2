---
name: takeoff-toggle-button-group
description:
  'Build a ToggleButtonGroup (a row or column of toggle buttons with single or
  multiple selection) — the ToggleButtonGroup from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Trigger when adding a view switcher (list / grid /
  map), segmented control, text-alignment or formatting toolbar, trip-type or
  filter toggles, or migrating tk-toggle-button-group / TkToggleButtonGroup. Use
  this skill WHENEVER building, adding, importing, styling, or fixing a
  ToggleButtonGroup in a React app that uses @takeoff-ui/react-spar / Takeoff /
  Spar. Not for a single on/off toggle — use Button with pressed there.'
---

# ToggleButtonGroup — @takeoff-ui/react-spar

`ToggleButtonGroup` renders a group of toggle buttons. In single mode one item
is pressed at a time; with `multiple` any number can be. The group is one tab
stop and the arrow keys move between items. Behavior is Spar's `ToggleGroup`;
the wrapper adds the group surface (`type`, `rounded`) and the pressed-item look
(`variant`, `appearance`, `size`).

**When to use:** switching between a few views or modes, alignment / formatting
toolbars, small filter sets. Not this — a single on/off button is a `Button`
with `pressed` / `onPressedChange` (or `defaultPressed`); a form choice with a
visible radio dot is `Radio`; switching panels of content is `Tabs`.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { ToggleButtonGroup } from '@takeoff-ui/react-spar';
```

## Compound parts

- `ToggleButtonGroup` — root; renders `role="group"` and owns the value. Name it
  with `aria-label` / `aria-labelledby`.
- `ToggleButtonGroup.Item` — one toggle `<button aria-pressed>`; requires a
  `value`. Children are the label; `startContent` / `endContent` hold icons.

## Basic usage

```tsx
<ToggleButtonGroup aria-label="View" type="light" defaultValue="list">
  <ToggleButtonGroup.Item value="list">List</ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="calendar">Calendar</ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="map" disabled>
    Map
  </ToggleButtonGroup.Item>
</ToggleButtonGroup>
```

## Examples

### Multiple selection

`value` / `defaultValue` / `onValueChange` use a `string[]` with `multiple`.

```tsx
<ToggleButtonGroup
  aria-label="Cabin filters"
  multiple
  defaultValue={['economy']}
>
  <ToggleButtonGroup.Item value="economy">Economy</ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="business">Business</ToggleButtonGroup.Item>
</ToggleButtonGroup>
```

### Controlled, one option always selected

In single mode a second press releases the item and reports `''`;
`deselectable={false}` keeps one item pressed. The callback type is
`string | string[]` — narrow it in single mode.

Note: `import { useState } from 'react';`

```tsx
const [trip, setTrip] = useState('round');

<ToggleButtonGroup
  aria-label="Trip type"
  value={trip}
  onValueChange={value => setTrip(value as string)}
  deselectable={false}
>
  <ToggleButtonGroup.Item value="one-way">One way</ToggleButtonGroup.Item>
  <ToggleButtonGroup.Item value="round">Round trip</ToggleButtonGroup.Item>
</ToggleButtonGroup>;
```

### Look: type, appearance, variant, size, rounded, vertical

```tsx
<ToggleButtonGroup
  aria-label="Text alignment"
  type="divided"
  variant="primary"
  appearance="filledLight"
  size="small"
  rounded
  orientation="vertical"
  defaultValue="left"
>
  <ToggleButtonGroup.Item
    value="left"
    aria-label="Align left"
    startContent={<AlignLeftIconOutlinedRounded />}
  />
  <ToggleButtonGroup.Item
    value="right"
    aria-label="Align right"
    startContent={<AlignRightIconOutlinedRounded />}
  />
</ToggleButtonGroup>
```

`size` / `variant` / `appearance` cascade from the group; set them on an item to
override that item only.

## Key props

### `ToggleButtonGroup` (root)

| Prop            | Type                                                            | Default        | Notes                                                     |
| --------------- | --------------------------------------------------------------- | -------------- | --------------------------------------------------------- |
| `multiple`      | `boolean`                                                       | `false`        | Any number of items can be pressed.                       |
| `value`         | `string \| string[]`                                            | -              | Controlled pressed value(s).                              |
| `defaultValue`  | `string \| string[]`                                            | -              | Uncontrolled initial value(s).                            |
| `onValueChange` | `(value: string \| string[]) => void`                           | -              | `string` in single mode (`''` when released), else array. |
| `deselectable`  | `boolean`                                                       | `true`         | Single mode: `false` keeps one item pressed.              |
| `disabled`      | `boolean`                                                       | `false`        | Disables every item.                                      |
| `orientation`   | `'horizontal' \| 'vertical'`                                    | `'horizontal'` | Layout and arrow-key axis.                                |
| `type`          | `'basic' \| 'divided' \| 'light'`                               | `'basic'`      | Group surface.                                            |
| `rounded`       | `boolean`                                                       | `false`        | Pill-shaped group and items.                              |
| `size`          | `'small' \| 'base' \| 'large'`                                  | `'base'`       | Cascades to items.                                        |
| `variant`       | `'neutral' \| 'primary'`                                        | `'neutral'`    | Pressed colour; cascades to items.                        |
| `appearance`    | `'filled' \| 'filledLight' \| 'outlined' \| 'text' \| 'raised'` | `'filled'`     | Pressed drawing; cascades to items.                       |

### `ToggleButtonGroup.Item`

| Prop                              | Type        | Default   | Notes                                             |
| --------------------------------- | ----------- | --------- | ------------------------------------------------- |
| `value`                           | `string`    | -         | Required. Identifies the item in the group value. |
| `disabled`                        | `boolean`   | `false`   | Skips pointer and keyboard activation.            |
| `startContent` / `endContent`     | `ReactNode` | -         | Icons around the label; no children = icon-only.  |
| `size` / `variant` / `appearance` | as root     | inherited | Per-item override.                                |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Root renders `role="group"`; always name it with `aria-label` or
  `aria-labelledby`. Items are native `<button aria-pressed>` in both modes.
- Icon-only items (no children) need an `aria-label`.
- Keyboard: `Tab` enters the group on one item (last focused, else the first
  pressed, else the first enabled); `→`/`←` (horizontal) or `↓`/`↑` (vertical)
  move focus and wrap; `Home` / `End` jump to the ends; `Space` / `Enter` press
  or release. Moving focus never changes the value; disabled items are skipped.
- A consumer `onKeyDown` on the root runs first; `event.preventDefault()` vetoes
  the built-in navigation for that key.

## Migrating from v1

`tk-toggle-button-group` → `ToggleButtonGroup`, `tk-toggle-button` →
`ToggleButtonGroup.Item`: `direction` → `orientation`, button `type` →
`appearance` (`filled-light` → `filledLight`), `icon` / `iconPosition` →
`startContent` / `endContent`, `label` → children, `tk-change` →
`onValueChange`. Values are strings. v1 never released the pressed item; pass
`deselectable={false}` for that behavior.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/toggle-button-group
- Source: `packages/react-spar/src/components/toggle-button-group/`
- Spar primitive: https://v2.takeoffui.com/headless/docs/Components/ToggleGroup
