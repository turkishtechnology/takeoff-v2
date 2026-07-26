# Spinner

A compact indeterminate loading indicator with built-in status semantics.

## Usage

```tsx
import { Spinner } from '@takeoff-ui/react-spar';
```

```tsx
<Spinner aria-label="Loading results" />
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
      <Spinner variant="primary" />
      <Spinner variant="success" size="large" aria-label="Saving" />
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <Spinner variant="primary" aria-label="Primary loading" />
      <Spinner variant="secondary" aria-label="Secondary loading" />
      <Spinner variant="neutral" aria-label="Neutral loading" />
      <Spinner variant="info" aria-label="Info loading" />
      <Spinner variant="success" aria-label="Success loading" />
      <Spinner variant="danger" aria-label="Danger loading" />
      <Spinner variant="warning" aria-label="Warning loading" />
    </div>
  );
}

render(<VariantsDemo />);
```

## Appearances

```tsx
function AppearancesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <Spinner appearance="rounded" aria-label="Rounded loading" />
      <Spinner appearance="dots" aria-label="Dots loading" />
      <Spinner appearance="lines" aria-label="Lines loading" />
      <Spinner appearance="pulse" aria-label="Pulse loading" />
      <Spinner appearance="threeDots" aria-label="Three dots loading" />
      <Spinner appearance="loader" aria-label="Loader loading" />
      <Spinner appearance="logo" aria-label="Logo loading" />
    </div>
  );
}

render(<AppearancesDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="flex items-center justify-center gap-5">
      <Spinner size="small" aria-label="Small loading" />
      <Spinner size="base" aria-label="Base loading" />
      <Spinner size="large" aria-label="Large loading" />
      <Spinner size="xlarge" aria-label="Extra large loading" />
    </div>
  );
}

render(<SizesDemo />);
```

## Label

`Spinner` does not provide label layout. When visible loading text is needed,
compose it with `Label` and connect the text with `aria-labelledby`.

```tsx
function LabelDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-1">
        <Spinner aria-labelledby="spinner-flight-label" variant="primary" />
        <Label as="span" id="spinner-flight-label">
          Loading flights
        </Label>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Spinner
          appearance="threeDots"
          aria-labelledby="spinner-saving-label"
          variant="success"
        />
        <Label as="span" id="spinner-saving-label">
          Saving
        </Label>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Spinner
          appearance="logo"
          aria-labelledby="spinner-preparing-label"
          variant="neutral"
        />
        <Label as="span" id="spinner-preparing-label">
          Preparing
        </Label>
      </div>
    </div>
  );
}

render(<LabelDemo />);
```

## Accessibility

`Spinner` renders a polite status by default. Use `aria-label` or
`aria-labelledby` for a domain-specific name; use native `aria-hidden` only when
the spinner is purely decorative next to another loading message. When
`aria-hidden` is true, `Spinner` does not apply the status role or default
accessible name.

```tsx
function AccessibilityDemo() {
  return (
    <div className="flex items-center justify-center gap-5">
      <Spinner aria-label="Loading flight results" />
      <Spinner aria-hidden />
    </div>
  );
}

render(<AccessibilityDemo />);
```

## API Reference

### Spinner {#spinner}

#### Props {#spinner-props}

| Name            | Type                                                              | Default   | Description                                                                                                               |
| --------------- | ----------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| size            | `SpinnerSize`                                                     | 'base'    | Size scale.                                                                                                               |
| appearance      | `SpinnerAppearance`                                               | 'rounded' | Visual spinner style.                                                                                                     |
| variant         | `SpinnerVariant`                                                  | 'neutral' | Color variant.                                                                                                            |
| classNames      | `Partial<Record<SpinnerSlot, string>>`                            | -         | Per-slot extra classes.                                                                                                   |
| slotProps       | `Partial<Record<SpinnerSlot, React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                                                        |
| className       | `string`                                                          | -         | Appends custom classes to the root slot.                                                                                  |
| aria-label      | `string`                                                          | 'Loading' | Accessible name for the loading status. Override it for domain-specific loading text.                                     |
| aria-labelledby | `string`                                                          | -         | ID reference for visible loading text. When provided, the default `aria-label` is not applied.                            |
| aria-hidden     | `boolean`                                                         | false     | Hides a decorative spinner from assistive technology. When true, status role and default accessible name are not applied. |

#### Data attributes {#spinner-data-attributes}

| Attribute        | Applied when | Purpose                                                           |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.             |
| data-variant     | Always       | Reflects the resolved `variant` prop for theme recipe scoping.    |
| data-size        | Always       | Reflects the resolved `size` prop for theme recipe scoping.       |
| data-type        | Always       | Reflects the resolved `appearance` prop for theme recipe scoping. |

### Type Definitions {#spinner-type-definitions}

| Name              | Definition                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| SpinnerSize       | `'small' \| 'base' \| 'large' \| 'xlarge'`                                              |
| SpinnerAppearance | `'rounded' \| 'dots' \| 'lines' \| 'pulse' \| 'threeDots' \| 'loader' \| 'logo'`        |
| SpinnerVariant    | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning'` |
| SpinnerSlot       | `'root' \| 'indicator'`                                                                 |
