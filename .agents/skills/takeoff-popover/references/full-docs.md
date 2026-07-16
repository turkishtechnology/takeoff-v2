# Popover

`Popover` displays a floating panel on click or hover to surface additional
content, forms, or actions. It wraps the Spar headless Popover primitive and
adds Takeoff visual vocabulary — `variant`, close button, and arrow slots.

## Usage

```tsx
import { Popover } from '@takeoff-ui/react-spar';
```

```tsx
<Popover>
  <Popover.Trigger />
  <Popover.Content>
    <Popover.Header />
    <Popover.Description />
    <Popover.Arrow />
    <Popover.Close />
  </Popover.Content>
</Popover>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Popover>
      <Popover.Trigger as={Button}>Click me</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>Title</Popover.Header>
        <Popover.Description>Popover content goes here.</Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

render(<PlaygroundDemo />);
```

## Header & Description

Use `Popover.Header` and `Popover.Description` to structure the content with a
title and supporting text. Both are styling slots — no behavior is attached.

```tsx
function HeaderDescriptionDemo() {
  return (
    <Popover>
      <Popover.Trigger as={Button}>Open</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>Account settings</Popover.Header>
        <Popover.Description>
          Manage your personal information, password, and notifications.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

render(<HeaderDescriptionDemo />);
```

## Variants

The `variant` prop controls the visual appearance of the popover content.

```tsx
function TypesDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Popover>
        <Popover.Trigger as={Button}>White</Popover.Trigger>
        <Popover.Content variant="white">
          <Popover.Description>White variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Dark</Popover.Trigger>
        <Popover.Content variant="dark">
          <Popover.Description>Dark variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Info</Popover.Trigger>
        <Popover.Content variant="info">
          <Popover.Description>Info variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Success</Popover.Trigger>
        <Popover.Content variant="success">
          <Popover.Description>Success variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Warning</Popover.Trigger>
        <Popover.Content variant="warning">
          <Popover.Description>Warning variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Danger</Popover.Trigger>
        <Popover.Content variant="danger">
          <Popover.Description>Danger variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Neutral</Popover.Trigger>
        <Popover.Content variant="neutral">
          <Popover.Description>Neutral variant popover</Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}

render(<TypesDemo />);
```

## Placement

```tsx
function PlacementDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Popover>
        <Popover.Trigger as={Button}>Top</Popover.Trigger>
        <Popover.Content side="top">
          <Popover.Description>Positioned top</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Bottom</Popover.Trigger>
        <Popover.Content side="bottom">
          <Popover.Description>Positioned bottom</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Left</Popover.Trigger>
        <Popover.Content side="left">
          <Popover.Description>Positioned left</Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger as={Button}>Right</Popover.Trigger>
        <Popover.Content side="right">
          <Popover.Description>Positioned right</Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}

render(<PlacementDemo />);
```

## Arrow

Add `Popover.Arrow` as the last child of `Popover.Content` to point at the
trigger. The arrow is bordered by default — its two outer edges continue the
content's outline in the variant's border color, and the neck stays open where
it joins the bubble. This is matched automatically for every variant and
placement.

```tsx
function ArrowDemo() {
  return (
    <Popover>
      <Popover.Trigger as={Button}>With arrow</Popover.Trigger>
      <Popover.Content>
        <Popover.Description>Popover with arrow</Popover.Description>
        <Popover.Arrow />
      </Popover.Content>
    </Popover>
  );
}

render(<ArrowDemo />);
```

Pass your own `children` to `Popover.Arrow` to replace the default shape (and
its border). The default draws its border with the `.tk-arrow-border` layer and
its fill with `.tk-arrow-fill` — target those classes to restyle it.

## Scrollable content

For long content, put `max-height` and `overflow` on an **inner wrapper** and
keep `Popover.Arrow` a direct child of `Popover.Content`. Applying `overflow` to
`Popover.Content` itself would clip the arrow, because the arrow is positioned
just outside the content box.

```tsx
function ScrollableDemo() {
  return (
    <Popover>
      <Popover.Trigger as={Button}>Release notes</Popover.Trigger>
      <Popover.Content className="w-72">
        {/* Arrow is a direct child of Content (overflow: visible) so it is never clipped */}
        <Popover.Arrow />
        <Popover.Header>Release notes</Popover.Header>
        {/* Bound the scroll on an INNER wrapper — never on Content — or the arrow gets cut off */}
        <div className="max-h-40 space-y-2 overflow-y-auto pr-2">
          <Popover.Description>
            v2.4.0 — Scrollable content with the arrow kept outside the scroll
            region.
          </Popover.Description>
          <Popover.Description>
            v2.3.0 — Dark, info, success, warning, and danger variants.
          </Popover.Description>
          <Popover.Description>
            v2.2.0 — New Popover.Header and Popover.Description slots.
          </Popover.Description>
          <Popover.Description>
            v2.1.0 — Placement controls: top, bottom, left, and right.
          </Popover.Description>
          <Popover.Description>
            v2.0.0 — Rebuilt on Spar's headless Popover primitive.
          </Popover.Description>
          <Popover.Description>
            v1.9.0 — Controlled open state via open / onOpenChange.
          </Popover.Description>
          <Popover.Description>
            v1.8.0 — Focus trap and escape-to-dismiss.
          </Popover.Description>
        </div>
      </Popover.Content>
    </Popover>
  );
}

render(<ScrollableDemo />);
```

## Close Button

```tsx
function CloseDemo() {
  return (
    <Popover>
      <Popover.Trigger as={Button}>Open</Popover.Trigger>
      <Popover.Content>
        <Popover.Header className="flex items-center justify-between">
          <span>Title</span>
          <Popover.Close>x</Popover.Close>
        </Popover.Header>
        <Popover.Description>Click x to dismiss</Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

render(<CloseDemo />);
```

## Controlled

```tsx
function ControlledDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger as={Button}>Controlled</Popover.Trigger>
        <Popover.Content>
          <Popover.Description>Controlled popover</Popover.Description>
        </Popover.Content>
      </Popover>
      <Button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</Button>
    </div>
  );
}

render(<ControlledDemo />);
```

## Accessibility & Keyboard

- Trigger uses `aria-expanded` and `aria-controls` pointing to the content.
- Content has `role="dialog"` (or `role="popover"`).
- Focus is trapped inside the content when `modal` is `true`.
- Escape key dismisses the popover and returns focus to the trigger.
- Click outside the popover dismisses it (non-modal mode).

| Key    | Behavior                         |
| ------ | -------------------------------- |
| Escape | Dismiss the popover.             |
| Tab    | Navigate focusable content.      |
| Enter  | Activate trigger / close button. |

## API Reference

### Popover {#popover}

See
[Spar Popover docs](https://spar.app.turkishtechlab.com/docs/Components/Popover)
for primitive behavior.

#### Props {#popover-props}

| Name        | Type              | Default | Description                                                                                                                                                      |
| ----------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode` | -       | PopoverTrigger and PopoverContent components                                                                                                                     |
| id          | `string`          | -       | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-trigger` and `${id}-content`. |
| disabled    | `boolean`         | false   | Disables all popover triggers (prevents opening)                                                                                                                 |
| open        | `boolean`         | -       | Controlled state for popover visibility                                                                                                                          |
| defaultOpen | `boolean`         | false   | Initial open state for uncontrolled mode                                                                                                                         |
| modal       | `boolean`         | false   | Whether popover should behave modally (focus trap + backdrop)                                                                                                    |

#### Events {#popover-events}

| Name         | Type                      | Default | Description                              |
| ------------ | ------------------------- | ------- | ---------------------------------------- |
| onOpenChange | `(open: boolean) => void` | -       | Callback when popover open state changes |

### Popover.Content {#popover-content}

#### Props {#popover-content-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -             |                                                                            |
| variant    | `PopoverVariant`                                             | 'white'       | Color variant.                                                             |
| classNames | `Partial<Record<"root", string>>`                            | -             | Per-slot extra classes.                                                    |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             | Per-slot HTML-attribute overrides.                                         |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| trapFocus  | `boolean`                                                    | false         | Whether to trap focus within content                                       |
| side       | `Side`                                                       | 'bottom'      | Side of trigger to position against                                        |
| align      | `Align`                                                      | 'center'      | Alignment relative to trigger                                              |
| className  | `string`                                                     | -             |                                                                            |

#### Events {#popover-content-events}

| Name                 | Type                                          | Default | Description                                             |
| -------------------- | --------------------------------------------- | ------- | ------------------------------------------------------- |
| onOpenAutoFocus      | `(event: Event) => void`                      | -       | Called when popover opens and focus moves inside        |
| onCloseAutoFocus     | `(event: Event) => void`                      | -       | Called when popover closes and focus returns to trigger |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void`              | -       | Called when escape is pressed                           |
| onPointerDownOutside | `(event: PointerEvent) => void`               | -       | Called when pointer down occurs outside the content     |
| onInteractOutside    | `(event: PointerEvent \| FocusEvent) => void` | -       | Called when interaction occurs outside the content      |
| onFocusOutside       | `(event: FocusEvent) => void`                 | -       | Called when focus moves outside the content             |

#### Data attributes {#popover-content-data-attributes}

| Attribute        | Applied when | Purpose                                                   |
| ---------------- | ------------ | --------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.     |
| data-variant     | Always       | Reflects the resolved `variant` for theme recipe scoping. |

### Popover.Trigger {#popover-trigger}

#### Data attributes {#popover-trigger-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Popover.Arrow {#popover-arrow}

#### Data attributes {#popover-arrow-data-attributes}

| Attribute        | Applied when | Purpose                        |
| ---------------- | ------------ | ------------------------------ |
| data-slot="root" | Always       | Stable selector for the arrow. |

### Popover.Close {#popover-close}

#### Data attributes {#popover-close-data-attributes}

| Attribute        | Applied when | Purpose                               |
| ---------------- | ------------ | ------------------------------------- |
| data-slot="root" | Always       | Stable selector for the close button. |

### Type Definitions {#popover-type-definitions}

| Name                      | Definition                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| PopoverVariant            | `'white' \| 'dark' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'`                  |
| Side                      | `'top' \| 'right' \| 'bottom' \| 'left'`                                                          |
| Align                     | `'start' \| 'center' \| 'end'`                                                                    |
| PopoverTriggerRenderProps | `{ isOpen: boolean; disabled: boolean; open: () => void; close: () => void; toggle: () => void }` |
| PopoverCloseRenderProps   | `{ isOpen: boolean; close: () => void }`                                                          |
