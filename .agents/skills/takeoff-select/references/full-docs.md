# Select

`Select` is a fully-keyboard, accessible custom select. State (value, open
state, disabled, required) lives on the root; the trigger renders the collapsed
button, and the content portals a positioned dropdown. Wrap `Select` in a
`Field` to attach a label, helper text, or error message — the field-level state
cascades into the trigger automatically.

## Usage

```tsx
import { Field, Select } from '@takeoff-ui/react-spar';
```

```tsx
<Field>
  <Field.Label />
  <Select>
    <Select.Trigger placeholder="Choose..." />
    <Select.Content>
      <Select.Group>
        <Select.Label />
        <Select.Item value="..." label="...">
          ...
        </Select.Item>
      </Select.Group>
      <Select.Separator />
    </Select.Content>
  </Select>
  <Field.Description />
  <Field.ErrorMessage />
</Field>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Field className="max-w-90" required>
      <Field.Label>Cabin</Field.Label>
      <Select defaultValue="economy">
        <Select.Trigger placeholder="Pick a cabin" />
        <Select.Content>
          <Select.Item value="economy" label="Economy">
            Economy
          </Select.Item>
          <Select.Item value="business" label="Business">
            Business
          </Select.Item>
          <Select.Item value="first" label="First class">
            First class
          </Select.Item>
        </Select.Content>
      </Select>
      <Field.Description>
        Select the cabin for this itinerary.
      </Field.Description>
    </Field>
  );
}

render(<PlaygroundDemo />);
```

## Using with `Field`

`Field` is the generic ARIA wrapper. Setting `invalid`, `disabled`, `required`,
`optional`, or `readOnly` on `Field` cascades into the nested `Select`, and
`Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
trigger through shared IDs.

```tsx
function FieldSelectDemo() {
  return (
    <Field className="max-w-90" required>
      <Field.Label>Cabin</Field.Label>
      <Select invalid>
        <Select.Trigger placeholder="Choose cabin" aria-invalid="true" />
        <Select.Content>
          <Select.Item value="economy" label="Economy">
            Economy
          </Select.Item>
          <Select.Item value="business" label="Business">
            Business
          </Select.Item>
          <Select.Item value="first" label="First class">
            First class
          </Select.Item>
        </Select.Content>
      </Select>
      <Field.Description>
        Select the cabin for this itinerary.
      </Field.Description>
      <Field.ErrorMessage>
        Please choose a cabin to continue.
      </Field.ErrorMessage>
    </Field>
  );
}

render(<FieldSelectDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="grid w-full max-w-90 gap-3">
      <Select size="small">
        <Select.Trigger placeholder="Small" />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>
      <Select size="base">
        <Select.Trigger placeholder="Base" />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>
      <Select size="large">
        <Select.Trigger placeholder="Large" />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
}

render(<SizesDemo />);
```

## Groups, Separator, Disabled Item

```tsx
function GroupsDemo() {
  return (
    <Select className="max-w-90" defaultValue="ist">
      <Select.Trigger placeholder="Choose origin" />
      <Select.Content>
        <Select.Group>
          <Select.Label>Türkiye</Select.Label>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
          <Select.Item value="izm" label="Izmir">
            Izmir
          </Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>Europe</Select.Label>
          <Select.Item value="lhr" label="London Heathrow">
            London Heathrow
          </Select.Item>
          <Select.Item value="cdg" label="Paris CDG">
            Paris CDG
          </Select.Item>
          <Select.Item value="fra" disabled label="Frankfurt (unavailable)">
            Frankfurt (unavailable)
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select>
  );
}

render(<GroupsDemo />);
```

## Indicator

`Select.Trigger` renders a disclosure chevron at its trailing edge by default —
it flips direction (and switches to the primary color) with the open state, the
same visual language as [`Accordion.Indicator`](/docs/components/accordion).
Pass the `indicator` prop to customize it: a node for a custom static icon, a
render function `({ isOpen }) => …` to swap icons by open state, or `false` to
hide it.

```tsx
function IndicatorDemo() {
  const PlusMinus = ({ isOpen }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {!isOpen && (
        <path
          d="M8 3v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );

  return (
    <div className="grid w-full max-w-90 gap-3">
      {/* Default — a chevron that flips direction with the open state. */}
      <Select defaultValue="ist">
        <Select.Trigger placeholder="Default chevron" />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>

      {/* Custom indicator via the Trigger prop — render function gets { isOpen }. */}
      <Select defaultValue="ist">
        <Select.Trigger
          placeholder="Custom icon"
          indicator={state => <PlusMinus isOpen={state.isOpen} />}
        />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>

      {/* Opt out entirely. */}
      <Select defaultValue="ist">
        <Select.Trigger placeholder="No indicator" indicator={false} />
        <Select.Content>
          <Select.Item value="ist" label="Istanbul">
            Istanbul
          </Select.Item>
          <Select.Item value="ank" label="Ankara">
            Ankara
          </Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
}

render(<IndicatorDemo />);
```

For full layout control, drive the trigger's render-prop `children`. A
render-function `children` opts the trigger out of its built-in indicator and
value wrapper entirely — you own every node, so place a standalone
`<Select.Indicator />` wherever you need it. Its `children` accept the same
node-or-render-function form, so you can swap the glyph by `isOpen` without
reaching for a hook.

```tsx
function IndicatorCompoundDemo() {
  // Full layout control: a render-prop children opts the trigger out of the
  // built-in indicator, so you own every node — drop a standalone
  // <Select.Indicator /> wherever you want it.
  return (
    <Select className="max-w-90" defaultValue="ist">
      <Select.Trigger>
        {({ label }) => (
          <>
            <span className="tk-select-value">{label || 'Choose a city'}</span>
            <Select.Indicator>
              {({ isOpen }) => (isOpen ? '▲' : '▼')}
            </Select.Indicator>
          </>
        )}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="ist" label="Istanbul">
          Istanbul
        </Select.Item>
        <Select.Item value="ank" label="Ankara">
          Ankara
        </Select.Item>
        <Select.Item value="izm" label="Izmir">
          Izmir
        </Select.Item>
      </Select.Content>
    </Select>
  );
}

render(<IndicatorCompoundDemo />);
```

## Controlled

```tsx
function ControlledSelectDemo() {
  const [value, setValue] = useState('eco');

  return (
    <div className="grid w-full max-w-90 gap-3">
      <Badge className="w-fit" variant="neutral" appearance="outlined">
        Selected: {value}
      </Badge>
      <Select value={value} onChange={setValue}>
        <Select.Trigger placeholder="Pick a fare" />
        <Select.Content>
          <Select.Item value="eco" label="Eco">
            Eco
          </Select.Item>
          <Select.Item value="flex" label="Eco Flex">
            Eco Flex
          </Select.Item>
          <Select.Item value="biz" label="Business">
            Business
          </Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
}

render(<ControlledSelectDemo />);
```

## Invalid State

```tsx
function InvalidDemo() {
  return (
    <Select className="max-w-90" invalid>
      <Select.Trigger placeholder="Required field" />
      <Select.Content>
        <Select.Item value="a" label="Option A">
          Option A
        </Select.Item>
        <Select.Item value="b" label="Option B">
          Option B
        </Select.Item>
      </Select.Content>
    </Select>
  );
}

render(<InvalidDemo />);
```

## Accessibility & Keyboard

- `Select.Trigger` renders a button with `role="combobox"`,
  `aria-haspopup="listbox"`, and `aria-expanded`.
- `Select.Content` is a `role="listbox"` portalled to `document.body` by default
  and positioned with Floating UI.
- The trigger displays the selected item's `label` (or the configured
  `placeholder`) and exposes that as its accessible name; when nested in a
  `Field` it also gets `aria-labelledby` pointing at the Field label.

| Key               | Behavior                                                     |
| ----------------- | ------------------------------------------------------------ |
| Enter / Space     | Open the dropdown or select the highlighted item.            |
| ↓ / ↑             | Open the dropdown / move highlight to next or previous item. |
| Home / End        | Move highlight to the first / last item.                     |
| Esc               | Close the dropdown without changing selection.               |
| typing characters | Typeahead — jumps to the first matching item.                |

## API Reference

### Select {#select}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Props {#select-props}

| Name         | Type                                                         | Default   | Description                                                                                                                                                      |
| ------------ | ------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`                                            | -         | Compound parts (`Select.Trigger`, `Select.Content`).                                                                                                             |
| size         | `SelectSize`                                                 | 'base'    | Size scale.                                                                                                                                                      |
| invalid      | `boolean`                                                    | false     | Invalid state for form validation styling.                                                                                                                       |
| contentWidth | `SelectContentWidth`                                         | 'trigger' | How the portalled SelectContent panel computes its width. See `SelectContentWidth`.                                                                              |
| classNames   | `Partial<Record<"root", string>>`                            | -         | Per-slot class name overrides.                                                                                                                                   |
| slotProps    | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -         | Per-slot HTML attribute overrides.                                                                                                                               |
| defaultValue | `string`                                                     | -         | Uncontrolled initial value                                                                                                                                       |
| autoFocus    | `boolean`                                                    | false     | Whether to focus the trigger on mount                                                                                                                            |
| id           | `string`                                                     | -         | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-trigger` and `${id}-content`. |
| value        | `string`                                                     | -         | Controlled selected value                                                                                                                                        |
| disabled     | `boolean`                                                    | -         | Disables the entire select. When inside a Field, inherited from Field.                                                                                           |
| name         | `string`                                                     | -         | Form field name                                                                                                                                                  |
| required     | `boolean`                                                    | -         | Makes the select required for forms. When inside a Field, inherited from Field.                                                                                  |
| readOnly     | `boolean`                                                    | -         | Select read-only state. When inside a Field, inherited from Field. A read-only select can be opened and inspected but its value cannot change.                   |
| open         | `boolean`                                                    | -         | Controlled open state                                                                                                                                            |
| defaultOpen  | `boolean`                                                    | false     | Uncontrolled initial open state                                                                                                                                  |
| className    | `string`                                                     | -         | Appends custom classes to the root slot of this part.                                                                                                            |

#### Events {#select-events}

| Name         | Type                      | Default | Description                      |
| ------------ | ------------------------- | ------- | -------------------------------- |
| onChange     | `(value: string) => void` | -       | Callback when selection changes  |
| onOpenChange | `(open: boolean) => void` | -       | Callback when open state changes |

#### Data attributes {#select-data-attributes}

| Attribute        | Applied when             | Purpose                                                                     |
| ---------------- | ------------------------ | --------------------------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.                       |
| data-size        | Always                   | Reflects the resolved `size` prop so theme recipes can scope size variants. |
| data-invalid     | When `invalid` is true.  | Borders/background switch to the danger state. Mirrored from the root.      |
| data-disabled    | When `disabled` is true. | Theme hook for the disabled state. Emitted by Spar Select.                  |

### Select.Trigger {#select-trigger}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Props {#select-trigger-props}

| Name        | Type                                                                                     | Default | Description                                                                                                                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode`                                                                        | -       | Trigger content. Defaults to the selected item label or `placeholder`; supply children to override the rendering, or pass a render function for full layout control.                                                        |
| indicator   | `boolean \| React.ReactNode \| ((state: SelectIndicatorRenderState) => React.ReactNode)` | true    | Disclosure indicator after the value. Defaults to a chevron that flips with the open state. Pass `false` to hide it, a node for a custom static icon, or a render function `({ isOpen }) => …` to swap icons by open state. |
| classNames  | `Partial<Record<SelectTriggerSlot, string>>`                                             | -       | Per-slot class name overrides.                                                                                                                                                                                              |
| slotProps   | `Partial<Record<SelectTriggerSlot, React.HTMLAttributes<HTMLElement>>>`                  | -       | Per-slot HTML attribute overrides.                                                                                                                                                                                          |
| placeholder | `React.ReactNode`                                                                        | -       | Text shown when no value is selected                                                                                                                                                                                        |
| className   | `string`                                                                                 | -       | Appends custom classes to the root slot of this part.                                                                                                                                                                       |

#### Data attributes {#select-trigger-data-attributes}

| Attribute           | Applied when                  | Purpose                                                                     |
| ------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| data-slot="root"    | Always                        | Stable selector for wrapper styling on the root slot.                       |
| data-size           | Always                        | Reflects the resolved `size` prop so theme recipes can scope size variants. |
| data-invalid        | When `invalid` is true.       | Borders/background switch to the danger state. Mirrored from the root.      |
| data-state="open"   | While the dropdown is open.   | Spar open-state hook on the trigger and content.                            |
| data-state="closed" | While the dropdown is closed. | Spar closed-state hook on the trigger.                                      |
| data-placeholder    | When no value is selected.    | Theme hook to style the placeholder color.                                  |

### Select.Indicator {#select-indicator}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Data attributes {#select-indicator-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Select.Content {#select-content}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Props {#select-content-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -             | `Select.Item`, `Select.Group`, `Select.Separator`.                         |
| classNames | `Partial<Record<"root", string>>`                            | -             | Per-slot class name overrides.                                             |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             | Per-slot HTML attribute overrides.                                         |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| side       | `Side`                                                       | 'bottom'      | Preferred side for positioning relative to trigger                         |
| align      | `Align`                                                      | 'start'       | Alignment relative to trigger                                              |
| className  | `string`                                                     | -             | Appends custom classes to the root slot of this part.                      |

#### Events {#select-content-events}

| Name                 | Type                             | Default | Description            |
| -------------------- | -------------------------------- | ------- | ---------------------- |
| onCloseAutoFocus     | `(event: FocusEvent) => void`    | -       | Focus handler on close |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void` | -       | Escape key handler     |
| onPointerDownOutside | `(event: PointerEvent) => void`  | -       | Outside click handler  |

#### Data attributes {#select-content-data-attributes}

| Attribute        | Applied when | Purpose                                                                     |
| ---------------- | ------------ | --------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                       |
| data-size        | Always       | Reflects the resolved `size` prop so theme recipes can scope size variants. |

### Select.Item {#select-item}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Props {#select-item-props}

| Name       | Type                                                         | Default | Description                                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -       | Visible item content. Set `label` alongside it to register the text used for typeahead and trigger display.                                                                                                                                                                         |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                                                                                                                                                                                                                                                      |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                                                                                                                                                                  |
| label      | `string`                                                     | -       | Text label for this item. Shown in the trigger when this item is selected, and used as the search key for keyboard typeahead. Should be set whenever `children` is not plain text (e.g. contains icons or other elements) so the trigger can display a clean string representation. |
| value      | `string`                                                     | -       | Option value                                                                                                                                                                                                                                                                        |
| disabled   | `boolean`                                                    | false   | Disables the option                                                                                                                                                                                                                                                                 |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.                                                                                                                                                                                                                               |

#### Data attributes {#select-item-data-attributes}

| Attribute            | Applied when                                      | Purpose                                               |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root"     | Always                                            | Stable selector for wrapper styling on the root slot. |
| data-highlighted     | When the item is focused via keyboard or pointer. | Theme hook for the highlighted state.                 |
| data-state="checked" | When the item matches the current value.          | Theme hook for the checked state.                     |
| data-disabled        | When the item `disabled` is true.                 | Theme hook for the disabled item state.               |

### Select.Group {#select-group}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Data attributes {#select-group-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Select.Label {#select-label}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Data attributes {#select-label-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Select.Separator {#select-separator}

See
[Spar Select docs](https://spar.app.turkishtechlab.com/docs/Components/Select)
for primitive behavior.

#### Data attributes {#select-separator-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#select-type-definitions}

| Name                       | Definition                                   |
| -------------------------- | -------------------------------------------- |
| SelectSize                 | `'small' \| 'base' \| 'large'`               |
| SelectContentWidth         | `'trigger' \| 'content' \| number \| string` |
| SelectIndicatorRenderState | `{ isOpen: boolean }`                        |
| SelectTriggerSlot          | `'root' \| 'value' \| 'indicator'`           |
| Side                       | `'top' \| 'right' \| 'bottom' \| 'left'`     |
| Align                      | `'start' \| 'center' \| 'end'`               |
