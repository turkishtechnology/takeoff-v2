# Alert

`Alert` displays contextual feedback inside the page layout. Leading status
icons are intentionally omitted in this version; only `Alert.Close` ships a
built-in icon. Status-icon anatomy can be added later without changing the root
contract.

## Usage

```tsx
import { Alert } from '@takeoff-ui/react-spar';
```

```tsx
<Alert variant="info" appearance="outlined">
  <Alert.Content>
    <Alert.Title>Gate changed</Alert.Title>
    <Alert.Description>Your flight now departs from gate A8.</Alert.Description>
  </Alert.Content>
</Alert>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Alert variant="info" appearance="outlined" className="max-w-160">
      <Alert.Content>
        <Alert.Title>Gate changed</Alert.Title>
        <Alert.Description>
          Your flight TK1983 now departs from gate A8.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button appearance="text">Details</Button>
      </Alert.Actions>
    </Alert>
  );
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  const variants = ['success', 'warning', 'info', 'danger', 'neutral'];

  return (
    <div className="flex w-full max-w-160 flex-col gap-3">
      {variants.map(variant => (
        <Alert key={variant} variant={variant}>
          <Alert.Content>
            <Alert.Title>{variant}</Alert.Title>
            <Alert.Description>Contextual feedback message.</Alert.Description>
          </Alert.Content>
        </Alert>
      ))}
    </div>
  );
}

render(<VariantsDemo />);
```

## Appearances

```tsx
function AppearancesDemo() {
  const appearances = ['filled', 'filledLight', 'outlined', 'gradient'];

  return (
    <div className="flex w-full max-w-160 flex-col gap-3">
      {appearances.map(appearance => (
        <Alert key={appearance} variant="success" appearance={appearance}>
          <Alert.Content>
            <Alert.Title>{appearance}</Alert.Title>
            <Alert.Description>Visual appearance preview.</Alert.Description>
          </Alert.Content>
        </Alert>
      ))}
    </div>
  );
}

render(<AppearancesDemo />);
```

## Actions

```tsx
function ActionsDemo() {
  return (
    <Alert variant="warning" appearance="outlined" className="max-w-160">
      <Alert.Content>
        <Alert.Title>Payment requires attention</Alert.Title>
        <Alert.Description>
          Update your billing method to avoid service interruption.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button size="small" variant="neutral" appearance="text">
          Later
        </Button>
        <Button size="small" variant="warning">
          Update
        </Button>
      </Alert.Actions>
    </Alert>
  );
}

render(<ActionsDemo />);
```

## Close

```tsx
function CloseDemo() {
  const [visible, setVisible] = React.useState(true);

  return (
    <div className="flex w-full max-w-160 flex-col gap-3">
      {visible ? (
        <Alert
          variant="info"
          appearance="outlined"
          onClose={() => setVisible(false)}
        >
          <Alert.Content>
            <Alert.Title>Dismissible alert</Alert.Title>
            <Alert.Description>
              Closing the alert calls onClose; the parent owns visibility.
            </Alert.Description>
          </Alert.Content>
          <Alert.Close aria-label="Close alert" />
        </Alert>
      ) : (
        <Button
          size="small"
          appearance="outlined"
          onClick={() => setVisible(true)}
        >
          Show alert
        </Button>
      )}
    </div>
  );
}

render(<CloseDemo />);
```

## API Reference

### Alert {#alert}

#### Props {#alert-props}

| Name       | Type                                                         | Default   | Description                                                                       |
| ---------- | ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -         | Alert content, usually Alert.Content plus optional Alert.Actions and Alert.Close. |
| variant    | `AlertVariant`                                               | 'neutral' | Defines the visual variant of the alert.                                          |
| appearance | `AlertAppearance`                                            | 'filled'  | Visual appearance of the alert.                                                   |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot extra classes.                                                           |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML-attribute overrides.                                                |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.                             |

#### Events {#alert-events}

| Name    | Type         | Default | Description                           |
| ------- | ------------ | ------- | ------------------------------------- |
| onClose | `() => void` | -       | Called when `Alert.Close` is clicked. |

#### Data attributes {#alert-data-attributes}

| Attribute        | Applied when | Purpose                                                           |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.             |
| data-variant     | Always       | Reflects the resolved `variant` prop for theme recipe scoping.    |
| data-type        | Always       | Reflects the resolved `appearance` prop for theme recipe scoping. |

### Alert.Content {#alert-content}

#### Data attributes {#alert-content-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Alert.Title {#alert-title}

#### Props {#alert-title-props}

| Name       | Type                                                         | Default | Description                                            |
| ---------- | ------------------------------------------------------------ | ------- | ------------------------------------------------------ |
| level      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                 | 5       | Semantic heading level used when `as` is not provided. |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot extra classes.                                |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides.                     |

#### Data attributes {#alert-title-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Alert.Description {#alert-description}

#### Data attributes {#alert-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Alert.Actions {#alert-actions}

#### Data attributes {#alert-actions-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Alert.Close {#alert-close}

#### Data attributes {#alert-close-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#alert-type-definitions}

| Name            | Definition                                                  |
| --------------- | ----------------------------------------------------------- |
| AlertVariant    | `'success' \| 'warning' \| 'info' \| 'danger' \| 'neutral'` |
| AlertAppearance | `'filled' \| 'filledLight' \| 'outlined' \| 'gradient'`     |
