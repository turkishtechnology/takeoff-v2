# Stepper

`Stepper` guides users through a multi-step flow. Each step renders an indicator
(status dot, status glyph, or custom content), an optional connecting rail, and
a title with an optional description. The active step is index-based and can be
controlled or uncontrolled.

Steps are real `<button>` elements: keyboard users activate them with `Enter` or
`Space`, arrow keys (plus `Home`/`End`) move focus along the list, and the
active step is announced through `aria-current="step"`.

## Usage

```tsx
import { Stepper } from '@takeoff-ui/react-spar';
```

```tsx
<Stepper>
  <Stepper.Item>
    <Stepper.Title />
    <Stepper.Description />
  </Stepper.Item>
</Stepper>
```

## Playground

```tsx
function PlaygroundDemo() {
  const [active, setActive] = React.useState(1);

  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-6">
      <Stepper active={active} onActiveChange={setActive}>
        <Stepper.Item>
          <Stepper.Title>Flight</Stepper.Title>
          <Stepper.Description>Choose your route</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Passengers</Stepper.Title>
          <Stepper.Description>Traveler details</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Payment</Stepper.Title>
          <Stepper.Description>Card or miles</Stepper.Description>
        </Stepper.Item>
      </Stepper>
      <div className="flex justify-center gap-3">
        <Button
          size="small"
          variant="secondary"
          disabled={active === 0}
          onClick={() => setActive(active - 1)}
        >
          Back
        </Button>
        <Button
          size="small"
          disabled={active === 2}
          onClick={() => setActive(active + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

render(<PlaygroundDemo />);
```

## Step status

Steps before the active index show the completed treatment. Mark a step with
`error` or `disabled`; both apply as modifiers without replacing the derived
progress status. Disabled steps are natively disabled buttons — they are
unfocusable and unselectable.

```tsx
function StatusDemo() {
  return (
    <Stepper className="mx-auto max-w-160" defaultActive={3}>
      <Stepper.Item
        indicator={<span className="text-xs font-semibold">i</span>}
      >
        <Stepper.Title>Custom</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item error>
        <Stepper.Title>Error</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item disabled>
        <Stepper.Title>Disabled</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Active</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Inactive</Stepper.Title>
      </Stepper.Item>
    </Stepper>
  );
}

render(<StatusDemo />);
```

## Numbered indicators

Pass a number through `Stepper.Item`'s `indicator` prop when the indicator
should show step numbers instead of the default status glyphs. `indicator` also
accepts a render function receiving the step's `status` and `index` — returning
`undefined` falls back to the built-in glyphs, so completed steps regain the
check.

```tsx
function NumberedIndicatorsDemo() {
  const steps = ['Search', 'Passengers', 'Payment'];

  return (
    <Stepper className="mx-auto max-w-160" defaultActive={1}>
      {steps.map((step, index) => (
        <Stepper.Item
          key={step}
          indicator={({ status }) =>
            status === 'completed' ? undefined : (
              <span className="text-xs font-semibold">{index + 1}</span>
            )
          }
        >
          <Stepper.Title>{step}</Stepper.Title>
        </Stepper.Item>
      ))}
    </Stepper>
  );
}

render(<NumberedIndicatorsDemo />);
```

## Linear progression

With `linear`, users can revisit any previous step but only advance to the
immediate next step — and only while the current step is neither errored nor
disabled.

```tsx
function LinearDemo() {
  const [active, setActive] = React.useState(0);

  return (
    <Stepper
      className="mx-auto max-w-160"
      linear
      active={active}
      onActiveChange={setActive}
    >
      <Stepper.Item>
        <Stepper.Title>Account</Stepper.Title>
        <Stepper.Description>
          Only the next step is clickable
        </Stepper.Description>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Verification</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Done</Stepper.Title>
      </Stepper.Item>
    </Stepper>
  );
}

render(<LinearDemo />);
```

## Clickability

Use `isClickable={false}` when a step should stay in the visual flow but not
change the active step on press.

```tsx
function ClickabilityDemo() {
  const [active, setActive] = React.useState(0);

  return (
    <Stepper
      className="mx-auto max-w-160"
      active={active}
      onActiveChange={setActive}
    >
      <Stepper.Item>
        <Stepper.Title>Available</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item isClickable={false}>
        <Stepper.Title>Locked</Stepper.Title>
        <Stepper.Description>Visible but skipped</Stepper.Description>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Available</Stepper.Title>
      </Stepper.Item>
    </Stepper>
  );
}

render(<ClickabilityDemo />);
```

## Reverse

Use `reverse` to flip indicators and content along the cross axis without
changing the step order.

```tsx
function ReverseDemo() {
  return (
    <Stepper className="mx-auto max-w-160" reverse defaultActive={1}>
      <Stepper.Item>
        <Stepper.Title>Origin</Stepper.Title>
        <Stepper.Description>Start city</Stepper.Description>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Seats</Stepper.Title>
        <Stepper.Description>Selected cabin</Stepper.Description>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Boarding</Stepper.Title>
        <Stepper.Description>Final details</Stepper.Description>
      </Stepper.Item>
    </Stepper>
  );
}

render(<ReverseDemo />);
```

## Vertical

```tsx
function VerticalDemo() {
  return (
    <div className="flex w-full justify-center">
      <Stepper
        orientation="vertical"
        defaultActive={1}
        style={{ maxWidth: 280 }}
      >
        <Stepper.Item>
          <Stepper.Title>Order placed</Stepper.Title>
          <Stepper.Description>We received your order</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Processing</Stepper.Title>
          <Stepper.Description>Tickets are being issued</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Ready</Stepper.Title>
          <Stepper.Description>Check your inbox</Stepper.Description>
        </Stepper.Item>
      </Stepper>
    </div>
  );
}

render(<VerticalDemo />);
```

## Compact

`mode="compact"` drops the rails: each step carries a progress border that
recolors with its status.

```tsx
function CompactDemo() {
  const [active, setActive] = React.useState(1);

  return (
    <Stepper
      className="mx-auto max-w-120"
      mode="compact"
      size="small"
      active={active}
      onActiveChange={setActive}
    >
      <Stepper.Item>
        <Stepper.Title>Cabin</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Seats</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Extras</Stepper.Title>
      </Stepper.Item>
    </Stepper>
  );
}

render(<CompactDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-8">
      {['xsmall', 'small', 'base', 'large'].map(size => (
        <Stepper key={size} size={size} defaultActive={1}>
          <Stepper.Item>
            <Stepper.Title>{size}</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Active</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Next</Stepper.Title>
          </Stepper.Item>
        </Stepper>
      ))}
    </div>
  );
}

render(<SizesDemo />);
```

## Accessibility

- The root is an ordered list; each step is a list item wrapping a real
  `<button>` trigger, so steps are focusable and keyboard-activatable by
  default.
- The active step's trigger carries `aria-current="step"`.
- Steps that cannot change the active step (non-clickable or blocked by
  `linear`) expose `aria-disabled` and stay silent on press; `disabled` steps
  are natively disabled and removed from the tab order.
- Indicators and rails are decorative and hidden from assistive technology; a
  step's accessible name comes from its title text, extended with a visually
  hidden status suffix on completed/errored steps — localize it through the
  root's `completedLabel`/`errorLabel` props.
- `Stepper.Description` is linked to the trigger through `aria-describedby`
  instead of inflating the accessible name.
- Arrow keys along the stepper's orientation move focus between step triggers;
  `Home` and `End` jump to the first and last focusable step.

## API Reference

### Stepper {#stepper}

#### Props {#stepper-props}

| Name           | Type                                                         | Default      | Description                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children       | `React.ReactNode`                                            | -            | `Stepper.Item` elements. The root derives each step’s index from its position in `children`.                                                                                       |
| active         | `number`                                                     | -            | Currently active step index (controlled). Not clamped: an out-of-range index renders every step completed (or inactive) with no active step.                                       |
| defaultActive  | `number`                                                     | 0            | Initially active step index (uncontrolled).                                                                                                                                        |
| orientation    | `StepperOrientation`                                         | 'horizontal' | Layout axis of the step list.                                                                                                                                                      |
| mode           | `StepperMode`                                                | 'default'    | Display mode — indicators with connecting rails (`'default'`) or a progress border per step without rails (`'compact'`).                                                           |
| linear         | `boolean`                                                    | false        | Restricts navigation to a linear progression: any previous step, or the next step when the current one is neither errored nor disabled.                                            |
| size           | `StepperSize`                                                | 'base'       | Density scale for indicators and typography.                                                                                                                                       |
| reverse        | `boolean`                                                    | false        | Flips indicators and content along the cross axis.                                                                                                                                 |
| completedLabel | `string`                                                     | 'completed'  | Accessible status suffix appended to a completed step's name — the check glyph alone is invisible to assistive technology. Localize per stepper; an empty string drops the suffix. |
| errorLabel     | `string`                                                     | 'error'      | Accessible status suffix appended to an errored step's name — the error glyph alone is invisible to assistive technology. Localize per stepper; an empty string drops the suffix.  |
| classNames     | `Partial<Record<"root", string>>`                            | -            | Per-slot class name overrides.                                                                                                                                                     |
| slotProps      | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -            | Per-slot HTML attribute overrides.                                                                                                                                                 |
| className      | `string`                                                     | -            | Appends custom classes to the root slot of this part.                                                                                                                              |

#### Events {#stepper-events}

| Name           | Type                                       | Default | Description                                                                                                                                                                             |
| -------------- | ------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onActiveChange | `(index: number) => void`                  | -       | Fires with the new step index when the active step changes.                                                                                                                             |
| onStepClick    | `(detail: StepperStepClickDetail) => void` | -       | Fires on selectable step presses, and on the active step when pressed again, with the step's index and progress status. Disabled, non-clickable, and linear-blocked steps emit nothing. |

#### Data attributes {#stepper-data-attributes}

| Attribute        | Applied when            | Purpose                                                                                        |
| ---------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| data-slot="root" | Always                  | Stable selector for wrapper styling on the root slot.                                          |
| data-orientation | Always                  | Reflects the resolved `orientation` prop (`horizontal` \| `vertical`). Emitted by the wrapper. |
| data-mode        | Always                  | Reflects the resolved `mode` prop (`default` \| `compact`).                                    |
| data-size        | Always                  | Reflects the resolved `size` prop so theme recipes can scope size variants.                    |
| data-linear      | When `linear` is true.  | Marks linear progression; selection gating itself is wrapper-owned.                            |
| data-reverse     | When `reverse` is true. | Styling hook for the flipped indicator/content layout.                                         |

### Stepper.Item {#stepper-item}

#### Props {#stepper-item-props}

| Name        | Type                                                                     | Default | Description                                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode`                                                        | -       | Step content — typically `Stepper.Title` and `Stepper.Description`. Renders inside the step’s `<button>` trigger and provides its accessible name.                                                                                                                                       |
| error       | `boolean`                                                                | -       | Marks the step as errored without changing its progress status.                                                                                                                                                                                                                          |
| disabled    | `boolean`                                                                | -       | Disables the step. The trigger renders as a natively disabled button: unfocusable, unselectable, and silent.                                                                                                                                                                             |
| isClickable | `boolean`                                                                | true    | Whether the step can be activated by pressing it. Non-clickable steps stay visible in the flow but are removed from the tab order.                                                                                                                                                       |
| indicator   | `React.ReactNode \| ((state: StepperIndicatorState) => React.ReactNode)` | -       | Custom indicator content. Replaces the built-in status glyph (check, close, or dot) for every status except `disabled`. Pass a function to render by status — returning `undefined` or `null` falls back to the built-in glyphs, so numbered steps can surface the check once completed. |
| classNames  | `Partial<Record<StepperItemSlot, string>>`                               | -       | Per-slot class name overrides.                                                                                                                                                                                                                                                           |
| slotProps   | `Partial<Record<StepperItemSlot, React.HTMLAttributes<HTMLElement>>>`    | -       | Per-slot HTML attribute overrides.                                                                                                                                                                                                                                                       |
| className   | `string`                                                                 | -       | Appends custom classes to the root slot of this part.                                                                                                                                                                                                                                    |

#### Data attributes {#stepper-item-data-attributes}

| Attribute        | Applied when                                                                         | Purpose                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| data-slot="root" | Always                                                                               | Stable selector for wrapper styling on the root slot.                                |
| data-state       | Always                                                                               | Resolved progress status: `inactive` \| `active` \| `completed`.                     |
| data-error       | When `error` is true.                                                                | Error treatment modifier; can coexist with any progress status.                      |
| data-disabled    | When `disabled` is true.                                                             | Disabled treatment modifier; the trigger is natively disabled.                       |
| data-clickable   | When pressing the step may change the active step — never on the active step itself. | Cursor/hover affordance hook. Respects `disabled`, `isClickable`, and linear gating. |

### Stepper.Title {#stepper-title}

#### Data attributes {#stepper-title-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Stepper.Description {#stepper-description}

#### Data attributes {#stepper-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#stepper-type-definitions}

| Name                   | Definition                                                  |
| ---------------------- | ----------------------------------------------------------- |
| StepperOrientation     | `'horizontal' \| 'vertical'`                                |
| StepperMode            | `'default' \| 'compact'`                                    |
| StepperSize            | `'large' \| 'base' \| 'small' \| 'xsmall'`                  |
| StepperStepClickDetail | `{ index: number; status: StepperStepStatus }`              |
| StepperIndicatorState  | `{ status: StepperStepStatus; index: number }`              |
| StepperItemSlot        | `'root' \| 'trigger' \| 'rail' \| 'indicator' \| 'content'` |
