---
name: takeoff-alert
description:
  'Renders contextual feedback banners (success/warning/info/danger/neutral)
  with title, description, action buttons, and a dismiss control. This is the
  Alert from @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger when
  building an alert, callout, banner, notice, inline message, dismissible
  warning, or status message. Use this skill WHENEVER building, adding,
  importing, styling, or fixing an Alert or related feedback UI in a React app
  that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Alert — @takeoff-ui/react-spar

`Alert` displays contextual feedback inside the page layout, composed from a
content block plus optional actions and a dismiss button.

**When to use:** Inline, page-level feedback (gate changes, billing warnings,
status notices). Not for transient stacked notifications — for those use a
toast/notification component instead.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Alert } from '@takeoff-ui/react-spar';
```

`Alert.Actions` and the close-from-button demo use `Button`, also from
`@takeoff-ui/react-spar`.

## Compound parts

- `Alert.Content` — wraps the title + description block.
- `Alert.Title` — heading; accepts `level` (1–6, default 5).
- `Alert.Description` — supporting body text.
- `Alert.Actions` — trailing action slot (typically `Button`s).
- `Alert.Close` — ships a built-in dismiss icon; clicking it fires the root
  `onClose`.

## Basic usage

```tsx
<Alert variant="info" appearance="outlined">
  <Alert.Content>
    <Alert.Title>Gate changed</Alert.Title>
    <Alert.Description>Your flight now departs from gate A8.</Alert.Description>
  </Alert.Content>
</Alert>
```

## Examples

### Variants

```tsx
const variants = ['success', 'warning', 'info', 'danger', 'neutral'] as const;

<div className="flex w-full max-w-160 flex-col gap-3">
  {variants.map(variant => (
    <Alert key={variant} variant={variant}>
      <Alert.Content>
        <Alert.Title>{variant}</Alert.Title>
        <Alert.Description>Contextual feedback message.</Alert.Description>
      </Alert.Content>
    </Alert>
  ))}
</div>;
```

### Appearances

```tsx
const appearances = ['filled', 'filledLight', 'outlined', 'gradient'] as const;

<div className="flex w-full max-w-160 flex-col gap-3">
  {appearances.map(appearance => (
    <Alert key={appearance} variant="success" appearance={appearance}>
      <Alert.Content>
        <Alert.Title>{appearance}</Alert.Title>
        <Alert.Description>Visual appearance preview.</Alert.Description>
      </Alert.Content>
    </Alert>
  ))}
</div>;
```

### Actions

```tsx
import { Alert, Button } from '@takeoff-ui/react-spar';

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
</Alert>;
```

### Dismissible (controlled visibility)

`Alert.Close` only fires `onClose`; the parent owns whether the alert renders.

```tsx
import { useState } from 'react';
import { Alert, Button } from '@takeoff-ui/react-spar';

function DismissibleAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <Button
        size="small"
        appearance="outlined"
        onClick={() => setVisible(true)}
      >
        Show alert
      </Button>
    );
  }

  return (
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
  );
}
```

## Key props

| Prop                  | Type                                                         | Default     | Notes                                |
| --------------------- | ------------------------------------------------------------ | ----------- | ------------------------------------ |
| `variant`             | `'success' \| 'warning' \| 'info' \| 'danger' \| 'neutral'`  | `'neutral'` | Visual/semantic variant.             |
| `appearance`          | `'filled' \| 'filledLight' \| 'outlined' \| 'gradient'`      | `'filled'`  | Visual appearance.                   |
| `onClose`             | `() => void`                                                 | —           | Fired when `Alert.Close` is clicked. |
| `className`           | `string`                                                     | —           | Extra classes on the root slot.      |
| `classNames`          | `Partial<Record<'root', string>>`                            | —           | Per-slot extra classes.              |
| `slotProps`           | `Partial<Record<'root', React.HTMLAttributes<HTMLElement>>>` | —           | Per-slot HTML-attribute overrides.   |
| `Alert.Title` `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                 | `5`         | Semantic heading level.              |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/alert
- Source: `packages/react-spar/src/components/alert/`
