# Tabs

Tabs are built on top of Spar primitives. Use `Tabs.List` for the tablist,
`Tabs.Trigger` for each selectable tab, and `Tabs.Content` for each matching
panel.

## Usage

```tsx
import { Tabs } from '@takeoff-ui/react-spar';
```

```tsx
<Tabs>
  <Tabs.List>
    <Tabs.Trigger />
  </Tabs.List>
  <Tabs.Content />
</Tabs>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Tabs defaultValue="overview" className="w-120">
      <Tabs.List aria-label="Booking details">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
        <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">
        <div className="grid gap-1 p-4">
          <strong className="text-text-darkest">Istanbul to London</strong>
          <span className="text-text-base">
            TK1985 · 08:30 departure · Airbus A321
          </span>
        </div>
      </Tabs.Content>
      <Tabs.Content value="passengers">
        <div className="grid gap-1 p-4">
          <strong className="text-text-darkest">2 passengers</strong>
          <span className="text-text-base">
            Seats 12A and 12B, meal preferences saved.
          </span>
        </div>
      </Tabs.Content>
      <Tabs.Content value="payments">
        <div className="grid gap-1 p-4">
          <strong className="text-text-darkest">Paid</strong>
          <span className="text-text-base">
            Card ending 2046 · receipt sent to billing contact.
          </span>
        </div>
      </Tabs.Content>
    </Tabs>
  );
}

render(<PlaygroundDemo />);
```

## Sizes

Use `size` on the root to scale all triggers in the set.

```tsx
function SizesDemo() {
  return (
    <div className="grid gap-6">
      <Tabs size="small" defaultValue="one" className="w-120">
        <Tabs.List aria-label="Small tabs">
          <Tabs.Trigger value="one">One-way</Tabs.Trigger>
          <Tabs.Trigger value="round">Round trip</Tabs.Trigger>
          <Tabs.Trigger value="multi">Multi-city</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs defaultValue="one" className="w-120">
        <Tabs.List aria-label="Base tabs">
          <Tabs.Trigger value="one">One-way</Tabs.Trigger>
          <Tabs.Trigger value="round">Round trip</Tabs.Trigger>
          <Tabs.Trigger value="multi">Multi-city</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs size="large" defaultValue="one" className="w-120">
        <Tabs.List aria-label="Large tabs">
          <Tabs.Trigger value="one">One-way</Tabs.Trigger>
          <Tabs.Trigger value="round">Round trip</Tabs.Trigger>
          <Tabs.Trigger value="multi">Multi-city</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </div>
  );
}

render(<SizesDemo />);
```

## Orientation

Use `orientation="vertical"` for side navigation or settings panels where the
labels need more room.

```tsx
function VerticalDemo() {
  return (
    <Tabs orientation="vertical" defaultValue="fare" className="w-120">
      <Tabs.List aria-label="Fare details" className="w-40 shrink-0">
        <Tabs.Trigger value="fare">Fare</Tabs.Trigger>
        <Tabs.Trigger value="baggage">Baggage</Tabs.Trigger>
        <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="fare">
        <div className="p-4">
          Flexible economy fare with same-day change support.
        </div>
      </Tabs.Content>
      <Tabs.Content value="baggage">
        <div className="p-4">
          Includes one cabin bag and one checked bag up to 23 kg.
        </div>
      </Tabs.Content>
      <Tabs.Content value="rules">
        <div className="p-4">
          Refundable before departure; fare difference may apply.
        </div>
      </Tabs.Content>
    </Tabs>
  );
}

render(<VerticalDemo />);
```

## Controlled State

Use `value` and `onValueChange` when another part of the interface needs to
react to the current tab.

```tsx
function ControlledTabsDemo() {
  const [value, setValue] = useState('scheduled');

  return (
    <div className="grid gap-3">
      <Badge
        className="w-fit"
        variant={value === 'delayed' ? 'warning' : 'success'}
        appearance="outlined"
      >
        Status: {value}
      </Badge>
      <Tabs value={value} onValueChange={setValue} className="w-120">
        <Tabs.List aria-label="Flight status">
          <Tabs.Trigger value="scheduled">Scheduled</Tabs.Trigger>
          <Tabs.Trigger value="boarding">Boarding</Tabs.Trigger>
          <Tabs.Trigger value="delayed">Delayed</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </div>
  );
}

render(<ControlledTabsDemo />);
```

## Appearance

Use `appearance` to switch between `basic`, `compact`, `divided`, and
`expanded`.

```tsx
function AppearanceDemo() {
  return (
    <div className="grid justify-items-center gap-6">
      <Tabs appearance="basic" defaultValue="flights">
        <Tabs.List aria-label="Basic tabs">
          <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
          <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
          <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs appearance="compact" defaultValue="flights">
        <Tabs.List aria-label="Compact tabs">
          <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
          <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
          <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs appearance="divided" defaultValue="flights">
        <Tabs.List aria-label="Divided tabs">
          <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
          <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
          <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs appearance="expanded" defaultValue="flights">
        <Tabs.List aria-label="Expanded tabs">
          <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
          <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
          <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </div>
  );
}

render(<AppearanceDemo />);
```

## Variant

Use `variant` to change the active tab color treatment between `primary`,
`info`, and `neutral`.

```tsx
function VariantDemo() {
  return (
    <div className="grid gap-6">
      <Tabs variant="primary" defaultValue="overview">
        <Tabs.List aria-label="Primary tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="pricing">Pricing</Tabs.Trigger>
          <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs variant="info" defaultValue="overview">
        <Tabs.List aria-label="Info tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="pricing">Pricing</Tabs.Trigger>
          <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Tabs variant="neutral" defaultValue="overview">
        <Tabs.List aria-label="Neutral tabs">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="pricing">Pricing</Tabs.Trigger>
          <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </div>
  );
}

render(<VariantDemo />);
```

## Render Props

`Tabs.Trigger` children can be a function receiving `isSelected`, `disabled`,
`isFocused`, `orientation`, and `select`.

```tsx
function RenderPropDemo() {
  return (
    <Tabs defaultValue="mobile">
      <Tabs.List aria-label="Check-in channel">
        <Tabs.Trigger value="mobile">
          {({ isSelected }) => (isSelected ? 'Mobile selected' : 'Mobile')}
        </Tabs.Trigger>
        <Tabs.Trigger value="counter">
          {({ isSelected }) => (isSelected ? 'Counter selected' : 'Counter')}
        </Tabs.Trigger>
        <Tabs.Trigger value="kiosk" disabled>
          Kiosk closed
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="mobile">
        Mobile check-in opens 24 hours before departure.
      </Tabs.Content>
      <Tabs.Content value="counter">
        Airport counters open 3 hours before departure.
      </Tabs.Content>
    </Tabs>
  );
}

render(<RenderPropDemo />);
```

## Closable Triggers

Render the close affordance inside `Tabs.Trigger` children and stop the click
from bubbling when you remove the tab from your own state.

```tsx
function ClosableDemo() {
  const [tabs, setTabs] = useState(['outbound', 'return', 'extras']);
  const [active, setActive] = useState('outbound');
  const labels = {
    outbound: 'Outbound',
    return: 'Return',
    extras: 'Extras',
  };

  const closeTab = value => {
    const nextTabs = tabs.filter(item => item !== value);
    setTabs(nextTabs);
    if (active !== value) {
      return;
    }

    if (nextTabs.length === 0) {
      setActive(undefined);
      return;
    }

    setActive(nextTabs[Math.max(0, tabs.indexOf(value) - 1)]);
  };

  const getCloseClasses = isSelected =>
    'inline-flex h-4 w-4 items-center justify-center';

  const handleCloseKeyDown = (event, value) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    closeTab(value);
  };

  return (
    <Tabs value={active} onValueChange={setActive} variant="info">
      <Tabs.List aria-label="Closable itinerary tabs">
        {tabs.map(tab => (
          <Tabs.Trigger key={tab} value={tab}>
            {({ isSelected }) => (
              <span className="inline-flex items-center gap-2">
                <span>{labels[tab]}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={'Close ' + tab}
                  className={getCloseClasses(isSelected)}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeTab(tab);
                  }}
                  onKeyDown={event => handleCloseKeyDown(event, tab)}
                >
                  <CloseIconOutlinedRounded />
                </span>
              </span>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.includes('outbound') && (
        <Tabs.Content value="outbound">Outbound segment review.</Tabs.Content>
      )}
      {tabs.includes('return') && (
        <Tabs.Content value="return">Return segment review.</Tabs.Content>
      )}
      {tabs.includes('extras') && (
        <Tabs.Content value="extras">
          Ancillary services and seat add-ons.
        </Tabs.Content>
      )}
    </Tabs>
  );
}

render(<ClosableDemo />);
```

## Accessibility & Keyboard

- `Tabs.List` renders `role="tablist"` and wires `aria-orientation`.
- `Tabs.Trigger` renders a `role="tab"` button with `aria-selected` and
  `aria-controls` connected to its matching panel.
- `Tabs.Content` renders `role="tabpanel"` and lazy-mounts by default. Use
  `forceMount` when inactive panels must stay in the DOM.

| Key         | Behavior                                                    |
| ----------- | ----------------------------------------------------------- |
| Tab         | Move focus into the active tab, then into the active panel. |
| ↓ / →       | Move to the next tab for matching orientation.              |
| ↑ / ←       | Move to the previous tab for matching orientation.          |
| Home        | Move to the first enabled tab.                              |
| End         | Move to the last enabled tab.                               |
| Enter/Space | Activate the focused tab when `activationMode="manual"`.    |

## API Reference

### Tabs {#tabs}

See [Spar Tabs docs](https://spar.app.turkishtechlab.com/docs/Components/Tabs)
for primitive behavior.

#### Props {#tabs-props}

| Name       | Type                                                         | Default   | Description                                                                             |
| ---------- | ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -         | `Tabs.List`, `Tabs.Trigger`, and `Tabs.Content` elements rendered inside the tabs root. |
| size       | `TabsSize`                                                   | 'base'    | Size scale. Cascades to descendant `Tabs.Trigger`s via context.                         |
| variant    | `TabsVariant`                                                | 'primary' | Color variant used by the active tab treatment.                                         |
| appearance | `TabsAppearance`                                             | 'basic'   | Visual tab style.                                                                       |
| classNames | `Partial<Record<"root", string>>`                            | -         | Per-slot class name overrides.                                                          |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML attribute overrides.                                                      |
| className  | `string`                                                     | -         | Appends custom classes to the root slot of this part.                                   |

#### Data attributes {#tabs-data-attributes}

| Attribute        | Applied when | Purpose                                                                           |
| ---------------- | ------------ | --------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for the root slot.                                                |
| data-size        | Always       | Reflects the resolved `size` prop so theme recipes can scope size variants.       |
| data-variant     | Always       | Reflects the resolved `variant` prop for active-state coloring.                   |
| data-type        | Always       | Reflects the resolved `appearance` prop for style variants.                       |
| data-orientation | Always       | Reflects the resolved `orientation` (`horizontal` / `vertical`). Emitted by Spar. |

### Tabs.List {#tabs-list}

See [Spar Tabs docs](https://spar.app.turkishtechlab.com/docs/Components/Tabs)
for primitive behavior.

#### Data attributes {#tabs-list-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for the root slot.                    |
| data-size        | Always       | Reflects the resolved root `size` prop.               |
| data-variant     | Always       | Reflects the resolved root `variant` prop.            |
| data-type        | Always       | Reflects the resolved root `appearance` prop.         |
| data-orientation | Always       | Reflects the resolved `orientation`. Emitted by Spar. |

### Tabs.Trigger {#tabs-trigger}

See [Spar Tabs docs](https://spar.app.turkishtechlab.com/docs/Components/Tabs)
for primitive behavior.

#### Data attributes {#tabs-trigger-data-attributes}

| Attribute             | Applied when                                        | Purpose                                               |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root"      | Always                                              | Stable selector for the root slot.                    |
| data-size             | Always                                              | Reflects the resolved root `size` prop.               |
| data-variant          | Always                                              | Reflects the resolved root `variant` prop.            |
| data-type             | Always                                              | Reflects the resolved root `appearance` prop.         |
| data-state="active"   | When the trigger matches the selected value.        | Spar selected-state hook.                             |
| data-state="inactive" | When the trigger does not match the selected value. | Spar unselected-state hook.                           |
| data-disabled         | `disabled` is true.                                 | Theme hook for disabled triggers. Emitted by Spar.    |
| data-orientation      | Always                                              | Reflects the resolved `orientation`. Emitted by Spar. |

### Tabs.Content {#tabs-content}

See [Spar Tabs docs](https://spar.app.turkishtechlab.com/docs/Components/Tabs)
for primitive behavior.

#### Data attributes {#tabs-content-data-attributes}

| Attribute             | Applied when                                          | Purpose                                               |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root"      | Always                                                | Stable selector for the root slot.                    |
| data-state="active"   | When the content matches the selected value.          | Spar selected-state hook.                             |
| data-state="inactive" | `forceMount` is true and the content is not selected. | Spar unselected-state hook.                           |
| data-orientation      | Always                                                | Reflects the resolved `orientation`. Emitted by Spar. |

### Type Definitions {#tabs-type-definitions}

| Name                   | Definition                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| TabsSize               | `'small' \| 'base' \| 'large'`                                                                             |
| TabsVariant            | `'primary' \| 'info' \| 'neutral'`                                                                         |
| TabsAppearance         | `'basic' \| 'compact' \| 'divided' \| 'expanded'`                                                          |
| TabsTriggerRenderProps | `Pick<SparTabsTriggerRenderProps, 'isSelected' \| 'select' \| 'disabled' \| 'isFocused' \| 'orientation'>` |
