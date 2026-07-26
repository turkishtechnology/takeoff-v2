# Button

`Button` triggers an action when clicked. It wraps the Spar headless button
primitive and adds Takeoff visual vocabulary — variant, size, loading state, and
icon slots.

## Usage

```tsx
import { Button } from '@takeoff-ui/react-spar';
```

```tsx
<Button variant="primary" size="base">
  Click me
</Button>
```

## Playground

```tsx
function PlaygroundDemo() {
  return <Button>Primary</Button>;
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
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
  );
}

render(<VariantsDemo />);
```

## Appearance

```tsx
function AppearanceDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3 items-center">
      <Button appearance="filled">Filled</Button>
      <Button appearance="filledLight">FilledLight</Button>
      <Button appearance="outlined">Outlined</Button>
      <Button appearance="text">Text</Button>
    </div>
  );
}

render(<AppearanceDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3">
      <Button size="small">Small</Button>
      <Button size="base">Base</Button>
      <Button size="large">Large</Button>
    </div>
  );
}

render(<SizesDemo />);
```

## Loading

```tsx
function LoadingDemo() {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button loading>Saving…</Button>
      <Button variant="secondary" loading>
        Loading
      </Button>
      <Button
        variant="primary"
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        Click to load
      </Button>
    </div>
  );
}

render(<LoadingDemo />);
```

## Disabled

```tsx
function DisabledDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button disabled>Disabled</Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
    </div>
  );
}

render(<DisabledDemo />);
```

## Toggle

```tsx
function ToggleButtonDemo() {
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

render(<ToggleButtonDemo />);
```

## Icons

```tsx
function IconsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button startContent={<StarIconOutlinedRounded />}>Favorite</Button>
      <Button endContent={<ArrowRightIconOutlinedRounded />}>Continue</Button>
      <Button
        startContent={<StarIconOutlinedRounded />}
        endContent={<ArrowRightIconOutlinedRounded />}
      >
        Both
      </Button>
      <Button startContent={<StarIconOutlinedRounded />} rounded />
    </div>
  );
}

render(<IconsDemo />);
```

## Accessibility & Keyboard

- Renders a native `<button>` element by default with correct `type="button"`.
- `loading` surfaces `aria-busy="true"` and `aria-live="polite"` for screen
  readers.
- Toggle mode exposes `aria-pressed` reflecting the current state.
- Disabled buttons set `tabIndex={-1}` and the native `disabled` attribute.

| Key           | Behavior                   |
| ------------- | -------------------------- |
| Enter / Space | Activate the button.       |
| Tab           | Move focus to/from button. |

## API Reference

### Button {#button}

See
[Spar Button docs](https://spar.app.turkishtechlab.com/docs/Components/Button)
for primitive behavior.

#### Props {#button-props}

| Name         | Type                                                             | Default   | Description                                                                                                                         |
| ------------ | ---------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                                | -         | Button label content.                                                                                                               |
| variant      | `ButtonVariant`                                                  | 'primary' | Color variant.                                                                                                                      |
| appearance   | `ButtonAppearance`                                               | 'filled'  | Visual appearance.                                                                                                                  |
| size         | `ButtonSize`                                                     | 'base'    | Size scale.                                                                                                                         |
| rounded      | `boolean`                                                        | false     | Renders a pill-shaped (circular) button. Ideal for icon-only actions.                                                               |
| startContent | `React.ReactNode`                                                | -         | Content rendered before children — typically an icon, but accepts any node (spinner, badge, kbd, etc.). Wrapped in the `icon` slot. |
| endContent   | `React.ReactNode`                                                | -         | Content rendered after children. Same shape as `startContent`.                                                                      |
| loading      | `boolean`                                                        | -         | Whether the button shows a loading spinner.                                                                                         |
| pressed      | `boolean`                                                        | -         | Whether the button is pressed. When defined, creates a toggle button.                                                               |
| classNames   | `Partial<Record<ButtonSlot, string>>`                            | -         | Per-slot extra classes.                                                                                                             |
| slotProps    | `Partial<Record<ButtonSlot, React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                                                                  |
| className    | `string`                                                         | -         | Appends custom classes to the root slot of this part.                                                                               |

#### Events {#button-events}

| Name            | Type                         | Default | Description                              |
| --------------- | ---------------------------- | ------- | ---------------------------------------- |
| onPressedChange | `(pressed: boolean) => void` | -       | Callback fired when toggle state changes |

#### Data attributes {#button-data-attributes}

| Attribute        | Applied when            | Purpose                                                           |
| ---------------- | ----------------------- | ----------------------------------------------------------------- |
| data-slot="root" | Always                  | Stable selector for wrapper styling on the root slot.             |
| data-variant     | Always                  | Reflects the resolved `variant` prop for theme recipe scoping.    |
| data-type        | Always                  | Reflects the resolved `appearance` prop for theme recipe scoping. |
| data-size        | Always                  | Reflects the resolved `size` prop for theme recipe scoping.       |
| data-rounded     | When `rounded` is true  | Styling hook for the pill-shaped state.                           |
| data-icon-only   | When icon-only          | Auto-detected when icons exist but no children.                   |
| data-loading     | When `loading` is true  | Styling hook for the loading state.                               |
| data-disabled    | When `disabled` is true | Styling hook for the disabled state.                              |

### Type Definitions {#button-type-definitions}

| Name             | Definition                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| ButtonVariant    | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'white' \| 'black'` |
| ButtonAppearance | `'filled' \| 'filledLight' \| 'outlined' \| 'text'`                                                           |
| ButtonSize       | `'small' \| 'base' \| 'large'`                                                                                |
| ButtonSlot       | `'root' \| 'content' \| 'label' \| 'spinner'`                                                                 |
