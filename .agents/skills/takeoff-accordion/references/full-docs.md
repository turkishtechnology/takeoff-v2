# Accordion

`Accordion` organizes related content into collapsible sections so users can
scan dense pages and open the details they need. Keep behavior props on the root
so Spar owns the open/closed state model.

## Usage

```tsx
import { Accordion } from '@takeoff-ui/react-spar';
```

```tsx
<Accordion>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content />
  </Accordion.Item>
</Accordion>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Accordion className="w-full max-w-90" defaultValue="fare">
      <Accordion.Item value="fare">
        <Accordion.Header>
          <Accordion.Trigger>
            Fare conditions
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Review refund windows, change fees, and cabin rules before confirming
          the itinerary.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="baggage">
        <Accordion.Header>
          <Accordion.Trigger>
            Baggage allowance
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Carry-on, checked baggage, and sports equipment allowances stay
          grouped in one collapsible panel.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="check-in">
        <Accordion.Header>
          <Accordion.Trigger>
            Online check-in
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Use the trigger text as the accessible heading, then place rich
          content in the content part.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<PlaygroundDemo />);
```

## Multiple Panels

```tsx
function MultipleDemo() {
  return (
    <Accordion
      multiple
      className="w-full max-w-90"
      defaultValue={['boarding', 'baggage']}
      mode="compact"
      type="divided"
    >
      <Accordion.Item value="boarding">
        <Accordion.Header>
          <Accordion.Trigger>
            Boarding pass
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Show mobile pass availability, airport counter fallbacks, and
          printable document rules together.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="baggage">
        <Accordion.Header>
          <Accordion.Trigger>
            Bag drop
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Multiple panels can remain open when the workflow asks users to
          compare related instructions.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="security">
        <Accordion.Header>
          <Accordion.Trigger>
            Security notes
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Compact mode keeps dense operational guidance scannable without
          changing the compound anatomy.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<MultipleDemo />);
```

## Controlled

```tsx
function ControlledAccordionDemo() {
  const [value, setValue] = useState('documents');

  return (
    <div className="w-full max-w-90">
      <Badge variant="neutral" appearance="outlined">
        Open panel: {value}
      </Badge>
      <Accordion value={value} onValueChange={setValue} collapsible>
        <Accordion.Item value="documents">
          <Accordion.Header>
            <Accordion.Trigger>
              Travel documents
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Controlled state lets app logic decide which passenger task remains
            expanded.
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="seat">
          <Accordion.Header>
            <Accordion.Trigger>
              Seat selection
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Pair value with onValueChange when the open panel should sync with
            route state, analytics, or form progress.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

render(<ControlledAccordionDemo />);
```

## Custom Indicator

```tsx
function CustomIndicatorDemo() {
  return (
    <Accordion className="w-full max-w-90" defaultValue="service" size="large">
      <Accordion.Item value="service">
        <Accordion.Header level={2}>
          <Accordion.Trigger>
            <Accordion.Indicator>
              {({ isOpen }) =>
                isOpen ? (
                  <RemoveIconOutlinedRounded />
                ) : (
                  <AddIconOutlinedRounded />
                )
              }
            </Accordion.Indicator>
            Service options
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Accordion.Indicator is opt-in. Place it before or after the title to
          control where the disclosure affordance appears; swap its content via
          children or the ({'{'} isOpen {'}'}) render prop.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="support">
        <Accordion.Header level={2}>
          <Accordion.Trigger>
            <Accordion.Indicator>
              {({ isOpen }) =>
                isOpen ? (
                  <RemoveIconOutlinedRounded />
                ) : (
                  <AddIconOutlinedRounded />
                )
              }
            </Accordion.Indicator>
            Support channels
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Indicators receive the live isOpen state, so each item can flip its
          own icon without reading the accordion context manually.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<CustomIndicatorDemo />);
```

## Disabled Item

```tsx
function DisabledDemo() {
  return (
    <Accordion className="w-full max-w-90" defaultValue="open">
      <Accordion.Item value="open">
        <Accordion.Header>
          <Accordion.Trigger>
            Refundable fares
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Active items respond to click and keyboard activation as usual.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="locked" disabled>
        <Accordion.Header>
          <Accordion.Trigger>
            Loyalty upgrades (coming soon)
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Disabled items render a disabled trigger and ignore both pointer and
          keyboard activation.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<DisabledDemo />);
```

## Without Indicator

```tsx
function WithoutIndicatorDemo() {
  return (
    <Accordion className="w-full max-w-90" defaultValue="hours">
      <Accordion.Item value="hours">
        <Accordion.Header>
          <Accordion.Trigger>Customer support hours</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Skip Accordion.Indicator entirely and the trigger ships without a
          visual affordance — useful when the surrounding layout already
          telegraphs disclosure.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="contact">
        <Accordion.Header>
          <Accordion.Trigger>Contact channels</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Trigger text remains the accessible label and clickable target; the
          panel still opens via click or Enter/Space.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<WithoutIndicatorDemo />);
```

## Force-Mounted Content

```tsx
function ForceMountDemo() {
  return (
    <Accordion className="w-full max-w-90">
      <Accordion.Item value="search">
        <Accordion.Header>
          <Accordion.Trigger>
            Search-friendly content
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content forceMount>
          Use forceMount when in-page search must reach the panel body even when
          the section is collapsed.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="default">
        <Accordion.Header>
          <Accordion.Trigger>
            Default mounting
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Without forceMount the panel mounts only while open, keeping the DOM
          lean.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

render(<ForceMountDemo />);
```

## Accessibility & Keyboard

- Each `Accordion.Trigger` renders a native `<button>` and exposes
  `aria-expanded` plus `aria-controls` pointing at its panel.
- Each `Accordion.Content` is a `role="region"` labelled by the matching trigger
  via `aria-labelledby`.
- `Accordion.Header` renders an `h1`–`h6` heading; pick the level that fits the
  surrounding document outline.
- Stable trigger / panel ids derive from the `id` set on `Accordion.Item`;
  override there if you need deterministic markup.

| Key           | Behavior                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Enter / Space | Toggle the focused trigger.                                             |
| ↓ / ↑         | Move focus to the next / previous trigger (vertical orientation).       |
| → / ←         | Move focus to the next / previous trigger (`orientation="horizontal"`). |
| Home / End    | Move focus to the first / last trigger.                                 |

Disabled items skip both pointer and keyboard activation and surface
`data-disabled` on the item root for theme recipes.

## API Reference

### Accordion {#accordion}

See
[Spar Accordion docs](https://spar.app.turkishtechlab.com/docs/Components/Accordion)
for primitive behavior.

#### Props {#accordion-props}

| Name         | Type                                                         | Default    | Description                                                                                                                                                |
| ------------ | ------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                            | -          | `Accordion.Item` elements rendered inside the disclosure container.                                                                                        |
| type         | `AccordionType`                                              | 'grouped'  | Visual grouping.                                                                                                                                           |
| mode         | `AccordionMode`                                              | 'default'  | Density mode. Pairs with any `AccordionType`.                                                                                                              |
| size         | `AccordionSize`                                              | 'base'     | Size scale.                                                                                                                                                |
| classNames   | `Partial<Record<"root", string>>`                            | -          | Per-slot class name overrides.                                                                                                                             |
| slotProps    | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -          | Per-slot HTML attribute overrides.                                                                                                                         |
| defaultValue | `AccordionCurrentValue`                                      | -          | Uncontrolled initial item identifier(s). Used only on mount.                                                                                               |
| multiple     | `boolean`                                                    | false      | When `true`, multiple items can be expanded at once.                                                                                                       |
| value        | `AccordionCurrentValue`                                      | -          | Controlled item identifier(s). Match the `value` of the items that should be expanded.                                                                     |
| collapsible  | `boolean`                                                    | true       | In single mode, when `true`, an active item can be collapsed by clicking it again. When `false`, one item is always expanded. Has no effect in multi mode. |
| disabled     | `boolean`                                                    | false      | Disables every item in the accordion.                                                                                                                      |
| orientation  | `Orientation`                                                | 'vertical' | Orientation for keyboard navigation.                                                                                                                       |
| className    | `string`                                                     | -          | Appends custom classes to the root slot of this part.                                                                                                      |

#### Events {#accordion-events}

| Name          | Type                                    | Default | Description                                                                                                                  |
| ------------- | --------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| onValueChange | `(next: AccordionCurrentValue) => void` | -       | Fired when the open value changes. The payload preserves the canonical shape: scalar in single mode, array in multiple mode. |

#### Data attributes {#accordion-data-attributes}

| Attribute        | Applied when | Purpose                                                                                                |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                  |
| data-mode        | Always       | Reflects the resolved `mode` prop. Theme recipes can scope per-mode rules without reading React props. |
| data-size        | Always       | Reflects the resolved `size` prop so theme recipes can scope size variants.                            |

### Accordion.Item {#accordion-item}

See
[Spar Accordion docs](https://spar.app.turkishtechlab.com/docs/Components/Accordion)
for primitive behavior.

#### Props {#accordion-item-props}

| Name       | Type                                                         | Default | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------- | -------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -       | `Accordion.Header` and `Accordion.Content` elements that compose the item. |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                                             |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                         |
| value      | `AccordionValue`                                             | -       | Stable identity for this item.                                             |
| disabled   | `boolean`                                                    | false   | Disables this item.                                                        |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.                      |

#### Data attributes {#accordion-item-data-attributes}

| Attribute           | Applied when    | Purpose                                                                                                |
| ------------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| data-slot="root"    | Always          | Stable selector for wrapper styling on the root slot.                                                  |
| data-type           | Always          | Reflects the resolved `type` prop. Theme recipes can target items per type.                            |
| data-mode           | Always          | Reflects the resolved `mode` prop. Theme recipes can scope per-mode rules without reading React props. |
| data-size           | Always          | Reflects the resolved `size` prop so theme recipes can scope size variants.                            |
| data-state="open"   | When expanded.  | Spar open-state hook.                                                                                  |
| data-state="closed" | When collapsed. | Spar closed-state hook.                                                                                |

### Accordion.Header {#accordion-header}

See
[Spar Accordion docs](https://spar.app.turkishtechlab.com/docs/Components/Accordion)
for primitive behavior.

#### Props {#accordion-header-props}

| Name       | Type                                                         | Default | Description                                                  |
| ---------- | ------------------------------------------------------------ | ------- | ------------------------------------------------------------ |
| children   | `React.ReactNode`                                            | -       | `Accordion.Trigger` element rendered inside the heading tag. |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                               |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                           |
| level      | `number`                                                     | 3       | Heading level (1-6) for document hierarchy                   |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.        |

#### Data attributes {#accordion-header-data-attributes}

| Attribute           | Applied when    | Purpose                                               |
| ------------------- | --------------- | ----------------------------------------------------- |
| data-slot="root"    | Always          | Stable selector for wrapper styling on the root slot. |
| data-state="open"   | When expanded.  | Spar open-state hook.                                 |
| data-state="closed" | When collapsed. | Spar closed-state hook.                               |

### Accordion.Trigger {#accordion-trigger}

See
[Spar Accordion docs](https://spar.app.turkishtechlab.com/docs/Components/Accordion)
for primitive behavior.

#### Props {#accordion-trigger-props}

| Name         | Type                                                                       | Default | Description                                                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                                          | -       | Accessible label for the trigger button.                                                                                                                                               |
| startContent | `React.ReactNode`                                                          | -       | Leading content rendered before the title — typically an icon, but accepts any node. The wrapper element (class + `data-slot`) is invariant; only the inner node is consumer-supplied. |
| classNames   | `Partial<Record<AccordionTriggerSlot, string>>`                            | -       | Per-slot class name overrides.                                                                                                                                                         |
| slotProps    | `Partial<Record<AccordionTriggerSlot, React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                                                                     |
| className    | `string`                                                                   | -       | Appends custom classes to the root slot of this part.                                                                                                                                  |

#### Data attributes {#accordion-trigger-data-attributes}

| Attribute           | Applied when    | Purpose                                               |
| ------------------- | --------------- | ----------------------------------------------------- |
| data-slot="root"    | Always          | Stable selector for wrapper styling on the root slot. |
| data-state="open"   | When expanded.  | Spar open-state hook.                                 |
| data-state="closed" | When collapsed. | Spar closed-state hook.                               |

### Accordion.Content {#accordion-content}

See
[Spar Accordion docs](https://spar.app.turkishtechlab.com/docs/Components/Accordion)
for primitive behavior.

#### Props {#accordion-content-props}

| Name       | Type                                                         | Default | Description                                           |
| ---------- | ------------------------------------------------------------ | ------- | ----------------------------------------------------- |
| children   | `React.ReactNode`                                            | -       | Panel body. Animated open/closed by Spar.             |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                        |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                    |
| forceMount | `boolean`                                                    | false   | Force content to remain mounted when closed           |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part. |

#### Events {#accordion-content-events}

| Name          | Type                     | Default | Description                                             |
| ------------- | ------------------------ | ------- | ------------------------------------------------------- |
| onBeforeMatch | `(event: Event) => void` | -       | Callback fired when content is found via browser search |

#### Data attributes {#accordion-content-data-attributes}

| Attribute           | Applied when    | Purpose                                               |
| ------------------- | --------------- | ----------------------------------------------------- |
| data-slot="root"    | Always          | Stable selector for wrapper styling on the root slot. |
| data-state="open"   | When expanded.  | Spar open-state hook.                                 |
| data-state="closed" | When collapsed. | Spar closed-state hook.                               |

### Type Definitions {#accordion-type-definitions}

| Name                  | Definition                            |
| --------------------- | ------------------------------------- |
| AccordionType         | `'grouped' \| 'divided'`              |
| AccordionMode         | `'default' \| 'compact'`              |
| AccordionSize         | `'base' \| 'large'`                   |
| AccordionCurrentValue | `AccordionValue \| AccordionValue[]`  |
| Orientation           | `'vertical' \| 'horizontal'`          |
| AccordionValue        | `string \| number`                    |
| AccordionTriggerSlot  | `'root' \| 'startContent' \| 'title'` |
