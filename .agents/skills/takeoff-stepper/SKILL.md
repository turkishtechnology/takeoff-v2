---
name: takeoff-stepper
description:
  Build multi-step workflow navigation with the compound Stepper component from
  @takeoff-ui/react-spar. Use whenever building, importing, styling, or fixing a
  stepper, wizard, checkout flow, onboarding flow, progress steps, numbered
  steps, vertical steps, linear flow, or step navigation in a Takeoff / Spar
  React app.
---

# Stepper — @takeoff-ui/react-spar

Use `Stepper` to show progress through an ordered workflow and optionally let
users navigate between eligible steps. It is a standalone Takeoff component.

**When to use:** Multi-step flows where the sequence itself is meaningful and
the user should see where they are and what remains — checkout, booking,
onboarding, multi-page forms. Not this — use `takeoff-tabs` when sections can be
visited in any order, and `takeoff-progress` when you only need to show
completion without naming the steps.

## Quick start

```tsx
import { Stepper } from '@takeoff-ui/react-spar';

<Stepper defaultActive={1}>
  <Stepper.Item>
    <Stepper.Title>Passenger details</Stepper.Title>
    <Stepper.Description>Names and contact details</Stepper.Description>
  </Stepper.Item>
  <Stepper.Item>
    <Stepper.Title>Seats</Stepper.Title>
  </Stepper.Item>
  <Stepper.Item>
    <Stepper.Title>Payment</Stepper.Title>
  </Stepper.Item>
</Stepper>;
```

## Key behavior

- Use `active` / `onActiveChange` for controlled state or `defaultActive` for
  uncontrolled state.
- Set `linear` to restrict navigation to completed/eligible steps. Use item
  `disabled`, `error`, and `isClickable` for per-step rules.
- Choose `orientation="horizontal" | "vertical"`, `mode="default" | "compact"`,
  and `size="large" | "base" | "small" | "xsmall"`.
- Use `reverse` to flip indicator/content placement. Use item `indicator` for
  custom or numbered status visuals.
- Render `Stepper.Item` children directly or from an array; do not group items
  in Fragments because indices derive from direct child positions.
- Arrow keys follow orientation; Home and End move focus. Localize the
  `completedLabel` and `errorLabel` accessible status suffixes when needed.

## Controlled and linear workflows

```tsx
import { useState } from 'react';

function CheckoutSteps() {
  const [active, setActive] = useState(0);

  return (
    <Stepper linear active={active} onActiveChange={setActive}>
      <Stepper.Item>
        <Stepper.Title>Passenger</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Seats</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Payment</Stepper.Title>
      </Stepper.Item>
    </Stepper>
  );
}
```

With `linear`, users may revisit previous steps and advance only to the
immediate next step when the current step is neither errored nor disabled.
Disabled, non-clickable, and linear-blocked steps do not emit callbacks.

## Status, errors, and custom indicators

Progress status is derived from index relative to `active`: earlier steps are
`completed`, the matching step is `active`, and later steps are `inactive`.
`error` is a separate modifier and can coexist with any progress status.

```tsx
const steps = [
  {
    id: 'passenger',
    title: 'Passenger',
    description: 'Contact details',
    hasError: false,
    disabled: false,
  },
  {
    id: 'seats',
    title: 'Seats',
    description: 'Choose seats',
    hasError: true,
    disabled: false,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete payment',
    hasError: false,
    disabled: true,
  },
];

<Stepper defaultActive={1}>
  {steps.map((step, index) => (
    <Stepper.Item
      key={step.id}
      error={step.hasError}
      disabled={step.disabled}
      indicator={({ status }) =>
        status === 'completed' ? undefined : index + 1
      }
    >
      <Stepper.Title>{step.title}</Stepper.Title>
      <Stepper.Description>{step.description}</Stepper.Description>
    </Stepper.Item>
  ))}
</Stepper>;
```

Returning `null` or `undefined` from an indicator render function falls back to
the built-in status glyph. `onStepClick` receives `{ index, status }` at press
time; use `onActiveChange` for the selected index itself.

## Layout variants

```tsx
<Stepper orientation="vertical" reverse size="small" defaultActive={1}>
  {/* items */}
</Stepper>

<Stepper mode="compact" defaultActive={1}>
  {/* items */}
</Stepper>
```

`mode="compact"` removes connecting rails in favor of per-step progress borders.
`reverse` flips indicator/content placement without reversing step order.

## Key props

| API                        | Type                                       | Default        | Notes                         |
| -------------------------- | ------------------------------------------ | -------------- | ----------------------------- |
| `active` / `defaultActive` | `number`                                   | — / `0`        | Controlled or initial index.  |
| `onActiveChange`           | `(index: number) => void`                  | —              | Selected-index callback.      |
| `onStepClick`              | `({ index, status }) => void`              | —              | Eligible press detail.        |
| `orientation`              | `'horizontal' \| 'vertical'`               | `'horizontal'` | Layout and arrow-key axis.    |
| `mode`                     | `'default' \| 'compact'`                   | `'default'`    | Rails or compact borders.     |
| `linear`                   | `boolean`                                  | `false`        | Restricts forward navigation. |
| `size`                     | `'large' \| 'base' \| 'small' \| 'xsmall'` | `'base'`       | Density scale.                |
| `reverse`                  | `boolean`                                  | `false`        | Cross-axis visual flip.       |
| `Stepper.Item error`       | `boolean`                                  | —              | Error modifier.               |
| `Stepper.Item disabled`    | `boolean`                                  | —              | Native disabled trigger.      |
| `Stepper.Item isClickable` | `boolean`                                  | `true`         | Whether pressing may select.  |
| `Stepper.Item indicator`   | `ReactNode \| render function`             | —              | Custom status visual.         |

## Accessibility and composition rules

- Root renders an ordered list; each item owns a real button trigger.
- The active trigger uses `aria-current="step"`; descriptions are connected via
  `aria-describedby`.
- Non-clickable/blocked steps use `aria-disabled`; explicitly disabled items use
  native `disabled` and leave the tab order.
- Indicators and rails are decorative. Localize `completedLabel` and
  `errorLabel` so status is available in the accessible name.
- Root and Item are polymorphic, but overriding the root element may require a
  matching Item element to preserve valid list markup.
- Render items directly or from arrays. Fragments count as one child position
  and therefore produce incorrect derived indices.

Read `references/full-docs.md` for click gating, statuses, numbered indicators,
all props, slots, data attributes, accessibility, and type definitions.

## Source

- Docs: `apps/docs/docs/components/stepper.mdx`
- Component: `packages/react-spar/src/components/stepper/`
