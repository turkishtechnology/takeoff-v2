# Chip

`Chip` is a compact inline label used for filters, entered values, and short
metadata. It can optionally expose a built-in remove action that dismisses the
chip from the DOM.

Static chips are not keyboard-focusable. A clickable chip makes its root
focusable and button-like. A removable chip exposes its remove button as the tab
stop. Disabled chips are removed from the tab order.

## Usage

```tsx
import { Chip } from '@takeoff-ui/react-spar';
```

```tsx
<Chip removable>Business class</Chip>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Chip>Economy</Chip>
      <Chip variant="success" removable>
        Confirmed
      </Chip>
      <Chip variant="danger" appearance="outlined">
        Delayed
      </Chip>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Chip variant="primary">Primary</Chip>
      <Chip variant="secondary">Secondary</Chip>
      <Chip variant="neutral">Neutral</Chip>
      <Chip variant="info">Info</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="danger">Danger</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="verified">Verified</Chip>
      <Chip variant="purple">Purple</Chip>
      <Chip variant="cyan">Cyan</Chip>
      <Chip variant="business">Business</Chip>
      <Chip variant="teal">Teal</Chip>
      <Chip variant="white">White</Chip>
      <Chip variant="dark">Dark</Chip>
    </div>
  );
}

render(<VariantsDemo />);
```

## Appearances

```tsx
function AppearancesDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Chip appearance="filled">Filled</Chip>
      <Chip appearance="filledLight">Filled Light</Chip>
      <Chip appearance="outlined">Outlined</Chip>
    </div>
  );
}

render(<AppearancesDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Chip size="small">Small</Chip>
      <Chip size="base">Base</Chip>
      <Chip size="large">Large</Chip>
    </div>
  );
}

render(<SizesDemo />);
```

## Remove

The remove button is a real, labeled `<button>` in the tab sequence, so keyboard
and assistive-tech users can reach it directly and activate it with `Enter` or
`Space`. A chip that is also `clickable` additionally accepts `Backspace` or
`Delete` while its root is focused to request removal.

Use `onRemove` to sync removal with application state. By default, a removable
chip dismisses itself after a remove action. Set `autoDismiss={false}` when the
parent owns the chip list — otherwise the chip's internal dismissed state and
the parent's list become two sources of truth.

```tsx
function RemoveDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Chip removable>Removable</Chip>
      <Chip variant="primary" removable>
        Cabin bag
      </Chip>
      <Chip disabled removable>
        Disabled
      </Chip>
    </div>
  );
}

render(<RemoveDemo />);
```

## Clickable

Use `clickable` when the chip performs an action, such as selecting a filter.
Clickable chips are keyboard-focusable and trigger their `onClick` handler with
`Enter` or `Space`.

```tsx
function ClickableDemo() {
  const [selected, setSelected] = React.useState('Economy');

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {['Economy', 'Business', 'Miles'].map(option => (
        <Chip
          appearance={selected === option ? 'filled' : 'outlined'}
          clickable
          key={option}
          onClick={() => setSelected(option)}
          variant={selected === option ? 'primary' : 'secondary'}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
}

render(<ClickableDemo />);
```

## Accessibility

- Static chip roots are not focusable.
- Clickable chips use a button-like root and support `Enter` and `Space`.
- The remove button is a labeled control in the tab sequence and is activated
  with `Enter` or `Space`.
- Clickable removable chips also support `Delete` and `Backspace` while the root
  is focused.
- Disabled chips do not receive focus and do not respond to remove actions.

## API Reference

### Chip {#chip}

#### Props {#chip-props}

| Name        | Type                                                           | Default   | Description                                                                                                                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode`                                              | -         | Chip content.                                                                                                                                                                                                                                                                                                                    |
| variant     | `ChipVariant`                                                  | 'primary' | Color variant.                                                                                                                                                                                                                                                                                                                   |
| appearance  | `ChipAppearance`                                               | 'filled'  | Visual appearance.                                                                                                                                                                                                                                                                                                               |
| size        | `ChipSize`                                                     | 'base'    | Size scale.                                                                                                                                                                                                                                                                                                                      |
| disabled    | `boolean`                                                      | false     | Disables interactive affordances and remove actions.                                                                                                                                                                                                                                                                             |
| removable   | `boolean`                                                      | false     | Renders a remove button that dismisses the chip from the DOM when pressed.                                                                                                                                                                                                                                                       |
| clickable   | `boolean`                                                      | false     | Makes the chip root keyboard-focusable and button-like for click actions.                                                                                                                                                                                                                                                        |
| autoDismiss | `boolean`                                                      | true      | Whether the chip removes itself from the DOM after a remove action. Removal is tracked in internal state, so set `autoDismiss={false}` when the parent owns the chip list (e.g. renders chips from an array) and let `onRemove` drive the parent's state — otherwise the chip and the parent's list become two sources of truth. |
| classNames  | `Partial<Record<ChipSlot, string>>`                            | -         | Per-slot extra classes.                                                                                                                                                                                                                                                                                                          |
| slotProps   | `Partial<Record<ChipSlot, React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                                                                                                                                                                                                                                                               |
| className   | `string`                                                       | -         | Appends custom classes to the root slot.                                                                                                                                                                                                                                                                                         |

#### Events {#chip-events}

| Name     | Type         | Default | Description                                                                                     |
| -------- | ------------ | ------- | ----------------------------------------------------------------------------------------------- |
| onRemove | `() => void` | -       | Called when the remove button is pressed or a focused clickable chip receives Backspace/Delete. |

#### Data attributes {#chip-data-attributes}

| Attribute        | Applied when             | Purpose                                                           |
| ---------------- | ------------------------ | ----------------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.             |
| data-variant     | Always                   | Reflects the resolved `variant` prop for theme recipe scoping.    |
| data-type        | Always                   | Reflects the resolved `appearance` prop for theme recipe scoping. |
| data-size        | Always                   | Reflects the resolved `size` prop for theme recipe scoping.       |
| data-clickable   | When `clickable` is true | Styling hook for chips with a click action.                       |
| data-disabled    | When `disabled` is true  | Styling hook for the disabled state.                              |
| data-removable   | When `removable` is true | Styling hook for chip with a remove action.                       |

### Type Definitions {#chip-type-definitions}

| Name           | Definition                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ChipVariant    | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'verified' \| 'purple' \| 'cyan' \| 'business' \| 'teal' \| 'white' \| 'dark'` |
| ChipAppearance | `'filled' \| 'filledLight' \| 'outlined'`                                                                                                                                |
| ChipSize       | `'small' \| 'base' \| 'large'`                                                                                                                                           |
| ChipSlot       | `'root' \| 'label' \| 'remove'`                                                                                                                                          |
