# ToggleButtonGroup

`ToggleButtonGroup` is a row (or column) of toggle buttons. In single mode one
item is pressed at a time; with `multiple` any number can be. The group is a
single tab stop and the arrow keys move between its items. Behavior comes from
the headless Spar `ToggleGroup` primitive; this wrapper adds the Takeoff group
surface and the pressed-item appearances.

## Usage

```tsx
import { ToggleButtonGroup } from '@takeoff-ui/react-spar';
```

```tsx
<ToggleButtonGroup>
  <ToggleButtonGroup.Item />
</ToggleButtonGroup>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <ToggleButtonGroup aria-label="Fare view" type="light" defaultValue="list">
      <ToggleButtonGroup.Item value="list">List</ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item value="calendar">Calendar</ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item
        value="map"
        startContent={<MapIconOutlinedRounded />}
      >
        Map
      </ToggleButtonGroup.Item>
    </ToggleButtonGroup>
  );
}

render(<PlaygroundDemo />);
```

## Multiple selection

With `multiple`, every item toggles on its own and `value` / `onValueChange` use
a `string[]`.

```tsx
function MultipleDemo() {
  return (
    <ToggleButtonGroup
      aria-label="Cabin filters"
      multiple
      type="divided"
      defaultValue={['economy', 'business']}
    >
      <ToggleButtonGroup.Item value="economy">Economy</ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item value="business">Business</ToggleButtonGroup.Item>
      <ToggleButtonGroup.Item value="first">First</ToggleButtonGroup.Item>
    </ToggleButtonGroup>
  );
}

render(<MultipleDemo />);
```

## Controlled

`onValueChange` reports a `string` in single mode and a `string[]` with
`multiple`. In single mode, pressing the pressed item releases it and reports
`''`; set `deselectable={false}` when one option must stay selected.

```tsx
function ControlledDemo() {
  const [trip, setTrip] = React.useState('round');

  return (
    <div className="flex flex-col items-start gap-3">
      <ToggleButtonGroup
        aria-label="Trip type"
        type="light"
        value={trip}
        onValueChange={value => setTrip(value)}
        deselectable={false}
      >
        <ToggleButtonGroup.Item value="one-way">One way</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="round">
          Round trip
        </ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="multi">
          Multi-city
        </ToggleButtonGroup.Item>
      </ToggleButtonGroup>
      <p className="text-sm">Selected: {trip}</p>
    </div>
  );
}

render(<ControlledDemo />);
```

## Group types

`type` draws the group surface: `basic` (transparent), `divided` (bordered
track) or `light` (bordered, lightest background).

```tsx
function TypesDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      {['basic', 'divided', 'light'].map(type => (
        <ToggleButtonGroup
          key={type}
          aria-label={type + ' group'}
          type={type}
          defaultValue="day"
        >
          <ToggleButtonGroup.Item value="day">Day</ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="week">Week</ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="month">Month</ToggleButtonGroup.Item>
        </ToggleButtonGroup>
      ))}
    </div>
  );
}

render(<TypesDemo />);
```

## Appearances and variants

An item that is not pressed is transparent. `appearance` and `variant` decide
how the pressed item is drawn. Both cascade from the group and can be set per
item.

```tsx
function AppearancesDemo() {
  const appearances = ['filled', 'filledLight', 'outlined', 'text', 'raised'];

  return (
    <div className="flex flex-col items-start gap-4">
      {['neutral', 'primary'].map(variant => (
        <div key={variant} className="flex flex-wrap gap-4">
          {appearances.map(appearance => (
            <ToggleButtonGroup
              key={appearance}
              aria-label={variant + ' ' + appearance}
              type="divided"
              variant={variant}
              appearance={appearance}
              defaultValue="on"
            >
              <ToggleButtonGroup.Item value="on">
                {appearance}
              </ToggleButtonGroup.Item>
              <ToggleButtonGroup.Item value="off">Off</ToggleButtonGroup.Item>
            </ToggleButtonGroup>
          ))}
        </div>
      ))}
    </div>
  );
}

render(<AppearancesDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      {['small', 'base', 'large'].map(size => (
        <ToggleButtonGroup
          key={size}
          aria-label={size + ' group'}
          type="light"
          size={size}
          defaultValue="a"
        >
          <ToggleButtonGroup.Item value="a">{size}</ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="b">Option</ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="c">Option</ToggleButtonGroup.Item>
        </ToggleButtonGroup>
      ))}
    </div>
  );
}

render(<SizesDemo />);
```

## Icons, rounded and vertical

`startContent` / `endContent` place an icon around the label. An item without
children is icon-only and needs an `aria-label`. `rounded` makes the group and
its items pill-shaped; `orientation="vertical"` stacks them and switches the
arrow keys to ↑ / ↓. Disabled items are skipped.

```tsx
function LayoutDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <ToggleButtonGroup
        aria-label="Text alignment"
        type="light"
        rounded
        defaultValue="left"
      >
        <ToggleButtonGroup.Item
          value="left"
          aria-label="Align left"
          startContent={<AlignLeftIconOutlinedRounded />}
        />
        <ToggleButtonGroup.Item
          value="center"
          aria-label="Align center"
          startContent={<AlignCenterIconOutlinedRounded />}
        />
        <ToggleButtonGroup.Item
          value="right"
          aria-label="Align right"
          startContent={<AlignRightIconOutlinedRounded />}
        />
      </ToggleButtonGroup>
      <ToggleButtonGroup
        aria-label="Seat side"
        type="divided"
        orientation="vertical"
        defaultValue="window"
      >
        <ToggleButtonGroup.Item value="window">Window</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="middle" disabled>
          Middle
        </ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="aisle">Aisle</ToggleButtonGroup.Item>
      </ToggleButtonGroup>
    </div>
  );
}

render(<LayoutDemo />);
```

## A single toggle button

A lone toggle is a [`Button`](/docs/components/button) with `pressed` /
`onPressedChange` (controlled) or `defaultPressed` (uncontrolled); it renders
the same `aria-pressed` state.

```tsx
function StandaloneDemo() {
  return (
    <Button variant="secondary" appearance="outlined" defaultPressed>
      Notify me
    </Button>
  );
}

render(<StandaloneDemo />);
```

## Accessibility & Keyboard

- The root renders `role="group"`. Name it with `aria-label` or
  `aria-labelledby`.
- Each `ToggleButtonGroup.Item` is a native `<button>` with `aria-pressed`, in
  both single and multiple mode.
- Exactly one item is in the tab order: the last focused item, else the first
  pressed one, else the first enabled one.

| Key           | Behavior                                                        |
| ------------- | --------------------------------------------------------------- |
| Tab           | Move focus into the group, then out of it.                      |
| → / ←         | Next / previous item (horizontal); wraps, skips disabled items. |
| ↓ / ↑         | Next / previous item (vertical); wraps, skips disabled items.   |
| Home / End    | First / last enabled item.                                      |
| Space / Enter | Press or release the focused item. Moving focus never selects.  |

:::info Consumer event handlers are composed with Spar's

A consumer `onKeyDown` / `onBlur` on `ToggleButtonGroup` and `onFocus` on
`ToggleButtonGroup.Item` run _before_ the built-in handler. Call
`event.preventDefault()` inside the group's `onKeyDown` to veto the built-in
navigation for that key.

:::

## API Reference

### ToggleButtonGroup {#toggle-button-group}

See
[Spar ToggleGroup docs](https://v2.takeoffui.com/headless/docs/Components/ToggleGroup)
for primitive behavior.

#### Props {#toggle-button-group-props}

| Name       | Type                                                         | Default   | Description                                                                           |
| ---------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -         | `ToggleButtonGroup.Item` elements.                                                    |
| type       | `ToggleButtonGroupType`                                      | 'basic'   | Group surface.                                                                        |
| rounded    | `boolean`                                                    | false     | Pill-shaped group and items.                                                          |
| size       | `ToggleButtonGroupSize`                                      | 'base'    | Size scale. Cascades to every `ToggleButtonGroup.Item`; an item's own `size` wins.    |
| variant    | `ToggleButtonGroupVariant`                                   | 'neutral' | Colour of a pressed item. Cascades to every item; an item's own `variant` wins.       |
| appearance | `ToggleButtonGroupAppearance`                                | 'filled'  | How a pressed item is drawn. Cascades to every item; an item's own `appearance` wins. |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot class name overrides.                                                        |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML attribute overrides.                                                    |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.                                 |

#### Data attributes {#toggle-button-group-data-attributes}

| Attribute        | Applied when             | Purpose                                                                           |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.                             |
| data-type        | Always                   | Reflects the resolved group `type` (`basic` / `divided` / `light`).               |
| data-size        | Always                   | Reflects the resolved `size` so theme recipes can scope size variants.            |
| data-rounded     | When `rounded` is true.  | Pill-shaped group and items.                                                      |
| data-orientation | Always                   | Reflects the resolved `orientation` (`horizontal` / `vertical`). Emitted by Spar. |
| data-multiple    | When `multiple` is true. | Marks a multiple-selection group. Emitted by Spar.                                |
| data-disabled    | When `disabled` is true. | Theme hook for the disabled group. Emitted by Spar.                               |

### ToggleButtonGroup.Item {#toggle-button-group-item}

See
[Spar ToggleGroup docs](https://v2.takeoffui.com/headless/docs/Components/ToggleGroup)
for primitive behavior.

#### Props {#toggle-button-group-item-props}

| Name         | Type                                                                            | Default                  | Description                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                                               | -                        | The label, wrapped in the `label` slot.                                                                                                      |
| size         | `ToggleButtonGroupSize`                                                         | inherited from the group | Size scale for this item.                                                                                                                    |
| variant      | `ToggleButtonGroupVariant`                                                      | inherited from the group | Pressed colour for this item.                                                                                                                |
| appearance   | `ToggleButtonGroupAppearance`                                                   | inherited from the group | Pressed drawing for this item.                                                                                                               |
| startContent | `React.ReactNode`                                                               | -                        | Content before the label — typically an icon. Wrapped in the `content` slot. An item with no children is icon-only: give it an `aria-label`. |
| endContent   | `React.ReactNode`                                                               | -                        | Content after the label. Wrapped in the `content` slot.                                                                                      |
| classNames   | `Partial<Record<ToggleButtonGroupItemSlot, string>>`                            | -                        | Per-slot class name overrides.                                                                                                               |
| slotProps    | `Partial<Record<ToggleButtonGroupItemSlot, React.HTMLAttributes<HTMLElement>>>` | -                        | Per-slot HTML attribute overrides.                                                                                                           |
| className    | `string`                                                                        | -                        | Appends custom classes to the root slot of this part.                                                                                        |

#### Data attributes {#toggle-button-group-item-data-attributes}

| Attribute           | Applied when                                           | Purpose                                                                                                    |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| data-slot="root"    | Always                                                 | Stable selector for wrapper styling on the root slot.                                                      |
| data-slot="content" | When `startContent` / `endContent` is renderable.      | Internal wrapper around the start / end content. Customize via `classNames.content` / `slotProps.content`. |
| data-slot="label"   | When children are renderable.                          | Internal wrapper around the label. Customize via `classNames.label` / `slotProps.label`.                   |
| data-size           | Always                                                 | Reflects the resolved `size` so theme recipes can scope size variants.                                     |
| data-variant        | Always                                                 | Reflects the resolved pressed colour (`neutral` / `primary`).                                              |
| data-type           | Always                                                 | Reflects the resolved `appearance` of the pressed item.                                                    |
| data-icon-only      | When the item has start / end content and no children. | Square padding for icon-only items.                                                                        |
| aria-pressed        | Always                                                 | Pressed state (`true` / `false`); the recipe keys the pressed appearance on it. Emitted by Spar Button.    |
| data-pressed        | When the item is pressed.                              | Presence hook for the pressed state. Emitted by Spar Button.                                               |
| data-disabled       | When the item or the group is disabled.                | Theme hook for the disabled item. Emitted by Spar Button.                                                  |

### Type Definitions {#toggle-type-definitions}

| Name                        | Definition                                                      |
| --------------------------- | --------------------------------------------------------------- |
| ToggleButtonGroupType       | `'basic' \| 'divided' \| 'light'`                               |
| ToggleButtonGroupSize       | `'small' \| 'base' \| 'large'`                                  |
| ToggleButtonGroupVariant    | `'neutral' \| 'primary'`                                        |
| ToggleButtonGroupAppearance | `'filled' \| 'filledLight' \| 'outlined' \| 'text' \| 'raised'` |
| ToggleButtonGroupItemSlot   | `'root' \| 'content' \| 'label'`                                |

## When to use

switching between a few views or modes, alignment / formatting toolbars, small
filter sets. Not this — a single on/off button is a `Button` with `pressed` /
`onPressedChange` (or `defaultPressed`); a form choice with a visible radio dot
is `Radio`; switching panels of content is `Tabs`.
