# Dropdown

`Dropdown` is an action menu for commands, secondary navigation, and compact
grouped choices that should not write a selected value back into the trigger. It
wraps Spar's headless `DropdownMenu` primitive and adds Takeoff slot classes,
size styling, and compound anatomy.

## Usage

```tsx
import { Dropdown } from '@takeoff-ui/react-spar';
```

```tsx
<Dropdown>
  <Dropdown.Trigger />
  <Dropdown.Content>
    <Dropdown.Viewport>
      <Dropdown.Item />
      <Dropdown.Separator />
      <Dropdown.Group>
        <Dropdown.Label />
        <Dropdown.Item />
      </Dropdown.Group>
    </Dropdown.Viewport>
    <Dropdown.Arrow />
  </Dropdown.Content>
</Dropdown>
```

`Dropdown.Viewport` is the panel's scroll container — it bounds the height and
provides the scrollable region. Wrap the items in it whenever the list can grow
long enough to need scrolling. Keeping the highlighted item in view during
keyboard navigation is handled by `Dropdown.Content` (it scrolls the item into
the nearest scrollable region), so it works with or without a viewport. The
content panel itself does not scroll, so a long menu without a viewport will
overflow; omit the viewport only for short menus that always fit.

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Dropdown>
      <Dropdown.Trigger as={Button}>Actions</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item onSelect={() => console.log('Edit')}>Edit</Dropdown.Item>
        <Dropdown.Item onSelect={() => console.log('Duplicate')}>
          Duplicate
        </Dropdown.Item>
        <Dropdown.Separator />
        <Dropdown.Item onSelect={() => console.log('Archive')}>
          Archive
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<PlaygroundDemo />);
```

## Groups

```tsx
function GroupedDemo() {
  return (
    <Dropdown>
      <Dropdown.Trigger as={Button}>Manage booking</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Group>
          <Dropdown.Label>Flight</Dropdown.Label>
          <Dropdown.Item textValue="Change flight">Change flight</Dropdown.Item>
          <Dropdown.Item textValue="Add baggage">Add baggage</Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Separator />
        <Dropdown.Group>
          <Dropdown.Label>Documents</Dropdown.Label>
          <Dropdown.Item>Download invoice</Dropdown.Item>
          <Dropdown.Item disabled>Refund receipt</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<GroupedDemo />);
```

## Placement

```tsx
function PlacementDemo() {
  const sides = ['top', 'bottom', 'right', 'left'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-8">
      {sides.map(side => (
        <Dropdown key={side}>
          <Dropdown.Trigger as={Button}>{side}</Dropdown.Trigger>
          <Dropdown.Content side={side}>
            <Dropdown.Item>Earlier flights</Dropdown.Item>
            <Dropdown.Item>Later flights</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      ))}
    </div>
  );
}

render(<PlacementDemo />);
```

## Sizes

```tsx
function SizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {['small', 'base', 'large'].map(size => (
        <Dropdown key={size} size={size}>
          <Dropdown.Trigger as={Button} size={size}>
            {size}
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Check in</Dropdown.Item>
            <Dropdown.Item>Seat selection</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      ))}
    </div>
  );
}

render(<SizeDemo />);
```

## Content Width

```tsx
function ContentWidthDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown contentWidth="content">
        <Dropdown.Trigger as={Button}>Content width</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Short action</Dropdown.Item>
          <Dropdown.Item>Longer content defines the panel width</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
      <Dropdown contentWidth="trigger">
        <Dropdown.Trigger as={Button} style={{ width: 220 }}>
          Trigger width
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Passenger details</Dropdown.Item>
          <Dropdown.Item>Travel documents</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
      <Dropdown contentWidth={280}>
        <Dropdown.Trigger as={Button}>Number width</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Download full itinerary PDF</Dropdown.Item>
          <Dropdown.Item>Send all booking documents</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
      <Dropdown contentWidth="min(20rem, 90vw)">
        <Dropdown.Trigger as={Button}>CSS width</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Width can be any CSS width value.</Dropdown.Item>
          <Dropdown.Item>Useful for responsive menus.</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}

render(<ContentWidthDemo />);
```

## Controlled

```tsx
function ControlledDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-3">
      <Dropdown open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger as={Button}>
          {({ isOpen }) =>
            isOpen ? 'Close controlled menu' : 'Open controlled menu'
          }
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Share</Dropdown.Item>
          <Dropdown.Item>Copy link</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
      <span className="text-sm text-sub-base">Open: {String(open)}</span>
    </div>
  );
}

render(<ControlledDemo />);
```

## Custom Content

```tsx
function CustomContentDemo() {
  const [selected, setSelected] = React.useState(['upgrade']);

  const toggle = value => {
    setSelected(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
  };

  const items = [
    {
      value: 'upgrade',
      title: 'Upgrade cabin',
      description: 'Review paid upgrade options for this flight.',
      accessory: (
        <span className="rounded border border-light px-1.5 py-0.5 text-xs">
          New
        </span>
      ),
    },
    {
      value: 'command',
      title: 'Open command center',
      description: 'Jump to operational shortcuts.',
      accessory: (
        <kbd className="rounded bg-light px-1.5 py-0.5 text-xs">Ctrl K</kbd>
      ),
    },
  ];

  return (
    <Dropdown closeOnSelect={false} contentWidth="min(22rem, 90vw)">
      <Dropdown.Trigger as={Button}>
        Rich items ({selected.length})
      </Dropdown.Trigger>
      <Dropdown.Content>
        {items.map(item => (
          <Dropdown.Item
            key={item.value}
            textValue={item.title}
            onSelect={() => toggle(item.value)}
          >
            <Checkbox
              checked={selected.includes(item.value)}
              readOnly
              aria-hidden="true"
              tabIndex={-1}
            >
              <Checkbox.Indicator />
            </Checkbox>
            <span className="flex min-w-0 flex-col">
              <strong className="font-medium text-darkest">{item.title}</strong>
              <span className="text-xs text-sub-base">{item.description}</span>
            </span>
            <span className="ml-auto">{item.accessory}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<CustomContentDemo />);
```

The same slot layout also carries a single-select menu. Keep it open with
`closeOnSelect={false}`, then mark the active row with an info border, a tinted
surface, and a trailing check so the current choice reads at a glance.

```tsx
function SelectableDemo() {
  const [sort, setSort] = React.useState('recommended');

  const options = [
    {
      value: 'recommended',
      label: 'Recommended',
      description: 'Best mix of price, duration, and stops.',
      Icon: StarIconOutlinedRounded,
    },
    {
      value: 'cheapest',
      label: 'Cheapest first',
      description: 'Lowest fares at the top of the list.',
      Icon: WalletIconOutlinedRounded,
    },
    {
      value: 'fastest',
      label: 'Fastest first',
      description: 'Shortest total travel time.',
      Icon: TakeoffRocketIconOutlinedRounded,
    },
  ];

  const current = options.find(option => option.value === sort);

  return (
    <Dropdown closeOnSelect={false} contentWidth="min(22rem, 90vw)">
      <Dropdown.Trigger as={Button}>Sort by: {current.label}</Dropdown.Trigger>
      <Dropdown.Content>
        {options.map(({ value, label, description, Icon }) => {
          const isSelected = value === sort;
          return (
            <Dropdown.Item
              key={value}
              textValue={label}
              onSelect={() => setSort(value)}
              className={
                'rounded-lg border ' +
                (isSelected
                  ? 'border-states-info-light bg-background-lightest'
                  : 'border-transparent')
              }
            >
              <Icon
                width={20}
                height={20}
                className={
                  isSelected ? 'text-states-info-base' : 'text-text-sub-base'
                }
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-col">
                <strong className="font-medium text-text-darkest">
                  {label}
                </strong>
                <span className="text-xs text-text-sub-base">
                  {description}
                </span>
              </span>
              {isSelected && (
                <CheckIconOutlinedRounded
                  width={20}
                  height={20}
                  className="ml-auto text-states-info-base"
                  aria-label="Selected"
                />
              )}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<SelectableDemo />);
```

## Disabled

```tsx
function DisabledDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dropdown disabled>
        <Dropdown.Trigger as={Button}>Disabled menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Unavailable action</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
      <Dropdown>
        <Dropdown.Trigger as={Button}>Enabled menu</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Open booking</Dropdown.Item>
          <Dropdown.Item disabled>Refund receipt</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}

render(<DisabledDemo />);
```

## Arrow

Add `Dropdown.Arrow` as the last child of `Dropdown.Content` to render a pointer
toward the trigger. It is automatically positioned by the underlying primitive
and inherits the panel's surface color, so no extra styling is required.

```tsx
function ArrowDemo() {
  return (
    <Dropdown>
      <Dropdown.Trigger as={Button}>Options</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item>Edit</Dropdown.Item>
        <Dropdown.Item>Duplicate</Dropdown.Item>
        <Dropdown.Separator />
        <Dropdown.Item>Delete</Dropdown.Item>
        <Dropdown.Arrow />
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<ArrowDemo />);
```

## Scrolling

Wrap the items in `Dropdown.Viewport` to keep a long list within a bounded,
scrollable area. The viewport owns the scroll bounds, and keyboard navigation
and typeahead keep the highlighted item in view. It renders a slim branded
scrollbar; you can also scroll with the wheel, trackpad, or keyboard.

```tsx
function ScrollingDemo() {
  const timezones = [
    'UTC-08:00 Los Angeles',
    'UTC-05:00 New York',
    'UTC+00:00 London',
    'UTC+01:00 Paris',
    'UTC+02:00 Athens',
    'UTC+03:00 Istanbul',
    'UTC+04:00 Dubai',
    'UTC+05:30 Mumbai',
    'UTC+07:00 Bangkok',
    'UTC+08:00 Singapore',
    'UTC+09:00 Tokyo',
    'UTC+10:00 Sydney',
  ];

  return (
    <Dropdown>
      <Dropdown.Trigger as={Button}>Select timezone</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Viewport>
          {timezones.map(zone => (
            <Dropdown.Item key={zone}>{zone}</Dropdown.Item>
          ))}
        </Dropdown.Viewport>
      </Dropdown.Content>
    </Dropdown>
  );
}

render(<ScrollingDemo />);
```

## Accessibility & Keyboard

- Trigger uses `aria-expanded`, `aria-haspopup="menu"`, and `aria-controls`.
- Content renders as a menu and items render as menu items.
- Disabled items remain visible but cannot be highlighted or selected.
- Escape closes the menu and returns focus to the trigger.

| Key           | Behavior                                        |
| ------------- | ----------------------------------------------- |
| Enter / Space | Open the menu or activate the highlighted item. |
| ↓ / ↑         | Move highlight to the next or previous item.    |
| Home / End    | Move highlight to the first or last item.       |
| Esc           | Close the menu without selecting an item.       |

## API Reference

### Dropdown {#dropdown}

See
[Spar DropdownMenu docs](https://spar.app.turkishtechlab.com/docs/Components/DropdownMenu)
for primitive behavior.

#### Props {#dropdown-props}

| Name          | Type                   | Default   | Description                                                                                                                                                      |
| ------------- | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children      | `React.ReactNode`      | -         | Component content                                                                                                                                                |
| size          | `DropdownSize`         | 'base'    | Size scale for the menu content and items.                                                                                                                       |
| contentWidth  | `DropdownContentWidth` | 'content' | How the portalled Dropdown.Content panel computes its width. See `DropdownContentWidth`.                                                                         |
| id            | `string`               | -         | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-trigger` and `${id}-content`. |
| disabled      | `boolean`              | false     | Disables all dropdown menu triggers (prevents opening)                                                                                                           |
| open          | `boolean`              | -         | Controlled open state                                                                                                                                            |
| defaultOpen   | `boolean`              | false     | Uncontrolled default open state                                                                                                                                  |
| modal         | `boolean`              | true      | Whether menu is modal (focus trapped)                                                                                                                            |
| closeOnSelect | `boolean`              | true      | Whether to close the menu after an item is selected                                                                                                              |

#### Events {#dropdown-events}

| Name         | Type                      | Default | Description                      |
| ------------ | ------------------------- | ------- | -------------------------------- |
| onOpenChange | `(open: boolean) => void` | -       | Callback when open state changes |

### Dropdown.Trigger {#dropdown-trigger}

#### Data attributes {#dropdown-trigger-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dropdown.Content {#dropdown-content}

#### Props {#dropdown-content-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -             |                                                                            |
| classNames | `Partial<Record<"root", string>>`                            | -             | Per-slot class name overrides.                                             |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             | Per-slot HTML attribute overrides.                                         |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| side       | `Side`                                                       | 'bottom'      | Preferred placement side                                                   |
| align      | `Align`                                                      | 'center'      | Alignment on placement side                                                |
| className  | `string`                                                     | -             |                                                                            |

#### Events {#dropdown-content-events}

| Name                 | Type                             | Default | Description           |
| -------------------- | -------------------------------- | ------- | --------------------- |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void` | -       | Escape key handler    |
| onPointerDownOutside | `(event: PointerEvent) => void`  | -       | Outside click handler |
| onFocusOutside       | `(event: FocusEvent) => void`    | -       | Outside focus handler |

#### Data attributes {#dropdown-content-data-attributes}

| Attribute        | Applied when | Purpose                                                     |
| ---------------- | ------------ | ----------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.       |
| data-size        | Always       | Reflects the resolved `Dropdown.size` for menu item sizing. |

### Dropdown.Viewport {#dropdown-viewport}

#### Data attributes {#dropdown-viewport-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dropdown.Item {#dropdown-item}

#### Props {#dropdown-item-props}

| Name       | Type                                                         | Default | Description                        |
| ---------- | ------------------------------------------------------------ | ------- | ---------------------------------- |
| children   | `React.ReactNode`                                            | -       |                                    |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides. |
| disabled   | `boolean`                                                    | false   | Whether item is disabled           |
| textValue  | `string`                                                     | -       | Value for typeahead search         |
| className  | `string`                                                     | -       |                                    |

#### Events {#dropdown-item-events}

| Name     | Type                                                 | Default | Description       |
| -------- | ---------------------------------------------------- | ------- | ----------------- |
| onSelect | `(event: React.SyntheticEvent<HTMLElement>) => void` | -       | Selection handler |

#### Data attributes {#dropdown-item-data-attributes}

| Attribute        | Applied when | Purpose                                                                                                                 |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                                                   |
| data-highlighted | Highlighted  | Present while the item is the active option (keyboard, pointer, or typeahead). Style hover/active affordances off this. |
| data-disabled    | Disabled     | Present when the item is disabled; the item stays visible but is not highlightable or selectable.                       |

### Dropdown.Group {#dropdown-group}

#### Data attributes {#dropdown-group-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dropdown.Label {#dropdown-label}

#### Data attributes {#dropdown-label-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dropdown.Separator {#dropdown-separator}

#### Data attributes {#dropdown-separator-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dropdown.Arrow {#dropdown-arrow}

#### Data attributes {#dropdown-arrow-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#dropdown-type-definitions}

| Name                           | Definition                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| DropdownSize                   | `'small' \| 'base' \| 'large'`                                                                    |
| DropdownContentWidth           | `'content' \| 'trigger' \| number \| string`                                                      |
| DropdownMenuTriggerRenderProps | `{ isOpen: boolean; disabled: boolean; open: () => void; close: () => void; toggle: () => void }` |
| Side                           | `'top' \| 'right' \| 'bottom' \| 'left'`                                                          |
| Align                          | `'start' \| 'center' \| 'end'`                                                                    |
