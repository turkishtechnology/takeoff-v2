# Card

`Card` groups related content and actions in a flexible surface. It is a
Takeoff-owned wrapper with compound parts for consistent spacing, typography,
and theming.

## Usage

```tsx
import { Card } from '@takeoff-ui/react-spar';
```

```tsx
<Card>
  <Card.Header>
    <Card.Title />
  </Card.Header>
  <Card.Body>
    <Card.Description />
  </Card.Body>
  <Card.Footer />
</Card>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Card className="w-full max-w-120">
      <Card.Header>
        <Card.Title>Flight Summary</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Description>IST to LHR · 18 Jun 2026</Card.Description>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-neutral-500">Departure</div>
            <div className="text-lg font-medium">09:40</div>
          </div>
          <Badge variant="success" appearance="filledLight">
            On time
          </Badge>
        </div>
      </Card.Body>
      <Card.Footer>
        <Button appearance="text">Details</Button>
        <Button>Check in</Button>
      </Card.Footer>
    </Card>
  );
}

render(<PlaygroundDemo />);
```

## Header Type

```tsx
function HeaderTypeDemo() {
  const headerTypes = ['basic', 'divided', 'light', 'dark', 'primary'];

  return (
    <div className="flex justify-center gap-3">
      {headerTypes.map(type => (
        <Card key={type}>
          <Card.Header headerType={type}>
            <Card.Title>{type}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>Header type preview</Card.Description>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

render(<HeaderTypeDemo />);
```

## Footer Type

```tsx
function FooterTypeDemo() {
  const footerTypes = ['basic', 'divided', 'light'];

  return (
    <div className="flex justify-center gap-3">
      {footerTypes.map(type => (
        <Card key={type}>
          <Card.Header>
            <Card.Title>{type}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>Footer type preview</Card.Description>
          </Card.Body>
          <Card.Footer footerType={type}>
            <Button variant="neutral" appearance="text">
              Cancel
            </Button>
            <Button>Confirm</Button>
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}

render(<FooterTypeDemo />);
```

## API Reference

### Card {#card}

#### Data attributes {#card-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Card.Header {#card-header}

#### Props {#card-header-props}

| Name       | Type                                                         | Default | Description                        |
| ---------- | ------------------------------------------------------------ | ------- | ---------------------------------- |
| headerType | `CardHeaderType`                                             | 'basic' | Type of the header.                |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot extra classes.            |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides. |

#### Data attributes {#card-header-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-header-type | Always       | Reflects the resolved `headerType` prop.              |

### Card.Title {#card-title}

#### Props {#card-title-props}

| Name       | Type                                                         | Default | Description                                            |
| ---------- | ------------------------------------------------------------ | ------- | ------------------------------------------------------ |
| level      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                 | 5       | Semantic heading level used when `as` is not provided. |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot extra classes.                                |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides.                     |

#### Data attributes {#card-title-data-attributes}

| Attribute        | Applied when         | Purpose                                                             |
| ---------------- | -------------------- | ------------------------------------------------------------------- |
| data-slot="root" | Always               | Stable selector for wrapper styling on the root slot.               |
| data-level       | When `as` is not set | Reflects the `level` prop that drives the rendered heading element. |

### Card.Description {#card-description}

#### Data attributes {#card-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Card.Body {#card-body}

#### Data attributes {#card-body-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Card.Footer {#card-footer}

#### Props {#card-footer-props}

| Name       | Type                                                         | Default | Description                        |
| ---------- | ------------------------------------------------------------ | ------- | ---------------------------------- |
| footerType | `CardFooterType`                                             | 'basic' | Type of the footer.                |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot extra classes.            |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML-attribute overrides. |

#### Data attributes {#card-footer-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-footer-type | Always       | Reflects the resolved `footerType` prop.              |

### Type Definitions {#card-type-definitions}

| Name           | Definition                                               |
| -------------- | -------------------------------------------------------- |
| CardHeaderType | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'` |
| CardFooterType | `'basic' \| 'divided' \| 'light'`                        |
