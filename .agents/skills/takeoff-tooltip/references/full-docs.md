# Tooltip

`Tooltip` displays a floating label on hover or focus to provide brief
contextual information. It wraps the Spar headless Tooltip primitive and adds
Takeoff visual vocabulary — variant, header, description, and arrow slots.

## Usage

```tsx
import { Tooltip } from '@takeoff-ui/react-spar';
```

```tsx
<Tooltip>
  <Tooltip.Trigger />
  <Tooltip.Content>
    <Tooltip.Header />
    <Tooltip.Description />
    <Tooltip.Arrow />
  </Tooltip.Content>
</Tooltip>
```

To share delay configuration across a group of tooltips, wrap them in
`Tooltip.Provider`:

```tsx
<Tooltip.Provider delayDuration={300} skipDelayDuration={150}>
  {/* multiple <Tooltip /> instances */}
</Tooltip.Provider>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Tooltip>
      <Tooltip.Trigger as={Button}>Hover me</Tooltip.Trigger>
      <Tooltip.Content>
        <Tooltip.Description>Simple tooltip</Tooltip.Description>
      </Tooltip.Content>
    </Tooltip>
  );
}

render(<PlaygroundDemo />);
```

## Variants

```tsx
function VariantsDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Tooltip>
        <Tooltip.Trigger as={Button}>White</Tooltip.Trigger>
        <Tooltip.Content variant="white">
          <Tooltip.Description>White variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Dark</Tooltip.Trigger>
        <Tooltip.Content variant="dark">
          <Tooltip.Description>Dark variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Info</Tooltip.Trigger>
        <Tooltip.Content variant="info">
          <Tooltip.Description>Info variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Success</Tooltip.Trigger>
        <Tooltip.Content variant="success">
          <Tooltip.Description>Success variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Warning</Tooltip.Trigger>
        <Tooltip.Content variant="warning">
          <Tooltip.Description>Warning variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Danger</Tooltip.Trigger>
        <Tooltip.Content variant="danger">
          <Tooltip.Description>Danger variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Neutral</Tooltip.Trigger>
        <Tooltip.Content variant="neutral">
          <Tooltip.Description>Neutral variant</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

render(<VariantsDemo />);
```

## Placement

```tsx
function PlacementDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Tooltip>
        <Tooltip.Trigger as={Button}>Top</Tooltip.Trigger>
        <Tooltip.Content side="top">
          <Tooltip.Description>Positioned top</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Bottom</Tooltip.Trigger>
        <Tooltip.Content side="bottom">
          <Tooltip.Description>Positioned bottom</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Left</Tooltip.Trigger>
        <Tooltip.Content side="left">
          <Tooltip.Description>Positioned left</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger as={Button}>Right</Tooltip.Trigger>
        <Tooltip.Content side="right">
          <Tooltip.Description>Positioned right</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

render(<PlacementDemo />);
```

## Header & Description

```tsx
function HeaderDemo() {
  return (
    <Tooltip>
      <Tooltip.Trigger as={Button}>With header</Tooltip.Trigger>
      <Tooltip.Content variant="info">
        <Tooltip.Header>Important</Tooltip.Header>
        <Tooltip.Description>
          This tooltip has a header and description.
        </Tooltip.Description>
      </Tooltip.Content>
    </Tooltip>
  );
}

render(<HeaderDemo />);
```

## Arrow

```tsx
function ArrowDemo() {
  return (
    <Tooltip>
      <Tooltip.Trigger as={Button}>With arrow</Tooltip.Trigger>
      <Tooltip.Content>
        <Tooltip.Description>Tooltip with arrow</Tooltip.Description>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  );
}

render(<ArrowDemo />);
```

## Provider

Wrap a group of tooltips in `Tooltip.Provider` to share `delayDuration` and a
`skipDelayDuration` window — once one tooltip in the group has opened, moving to
a sibling within the skip window opens it instantly. Recommended for
toolbar-style clusters (WCAG 1.4.13).

```tsx
function ProviderDemo() {
  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={150}>
      <div className="flex flex-wrap justify-center gap-3">
        <Tooltip>
          <Tooltip.Trigger as={Button}>First</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>
              Hover, then move to the next one
            </Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger as={Button}>Second</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>
              Opens instantly within skip window
            </Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger as={Button}>Third</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Same skip-delay behavior</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  );
}

render(<ProviderDemo />);
```

## Controlled

```tsx
function ControlledDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger as={Button}>Controlled</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Description>Controlled tooltip</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</Button>
    </div>
  );
}

render(<ControlledDemo />);
```

## Accessibility & Keyboard

- Trigger uses `aria-describedby` pointing to the content element.
- Content has `role="tooltip"`.
- Tooltip respects `WCAG 1.4.13` — hoverable content remains visible while the
  pointer is over it.
- Escape key dismisses the tooltip and returns focus to the trigger.

| Key    | Behavior                                    |
| ------ | ------------------------------------------- |
| Escape | Dismiss the tooltip.                        |
| Tab    | Focus trigger shows tooltip; blur hides it. |

## API Reference

### Tooltip {#tooltip}

See
[Spar Tooltip docs](https://spar.app.turkishtechlab.com/docs/Components/Tooltip)
for primitive behavior.

#### Props {#tooltip-props}

| Name        | Type                    | Default | Description                                                                                                                                                      |
| ----------- | ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.React.ReactNode` | -       | Tooltip trigger and content components                                                                                                                           |
| id          | `string`                | -       | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-trigger` and `${id}-content`. |
| disabled    | `boolean`               | false   | Whether tooltip is disabled                                                                                                                                      |
| open        | `boolean`               | -       | Controlled state for tooltip visibility                                                                                                                          |
| defaultOpen | `boolean`               | false   | Default open state for uncontrolled tooltip                                                                                                                      |
| delay       | `number`                | -       | Override provider delay for this tooltip                                                                                                                         |
| hideDelay   | `number`                | 0       | Override provider hide delay for this tooltip                                                                                                                    |

#### Events {#tooltip-events}

| Name         | Type                      | Default | Description                              |
| ------------ | ------------------------- | ------- | ---------------------------------------- |
| onOpenChange | `(open: boolean) => void` | -       | Callback when tooltip open state changes |

### Tooltip.Content {#tooltip-content}

#### Props {#tooltip-content-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| children   | `React.React.ReactNode`                                      | -             |                                                                            |
| variant    | `TooltipVariant`                                             | 'white'       | Color variant.                                                             |
| classNames | `Partial<Record<"root", string>>`                            | -             | Per-slot extra classes.                                                    |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             | Per-slot HTML-attribute overrides.                                         |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| side       | `Side`                                                       | 'top'         | Preferred placement relative to trigger                                    |
| align      | `Align`                                                      | 'center'      | Alignment relative to trigger                                              |
| className  | `string`                                                     | -             |                                                                            |

#### Events {#tooltip-content-events}

| Name                 | Type                             | Default | Description                        |
| -------------------- | -------------------------------- | ------- | ---------------------------------- |
| onOpenAutoFocus      | `(event: Event) => void`         | -       | Called when auto-focusing on open  |
| onCloseAutoFocus     | `(event: Event) => void`         | -       | Called when auto-focusing on close |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void` | -       | Escape key handler                 |
| onPointerDownOutside | `(event: PointerEvent) => void`  | -       | Outside pointer down handler       |

#### Data attributes {#tooltip-content-data-attributes}

| Attribute        | Applied when | Purpose                                                   |
| ---------------- | ------------ | --------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.     |
| data-variant     | Always       | Reflects the resolved `variant` for theme recipe scoping. |

### Tooltip.Header {#tooltip-header}

#### Data attributes {#tooltip-header-data-attributes}

| Attribute        | Applied when | Purpose                         |
| ---------------- | ------------ | ------------------------------- |
| data-slot="root" | Always       | Stable selector for the header. |

### Tooltip.Description {#tooltip-description}

#### Data attributes {#tooltip-description-data-attributes}

| Attribute        | Applied when | Purpose                              |
| ---------------- | ------------ | ------------------------------------ |
| data-slot="root" | Always       | Stable selector for the description. |

### Tooltip.Trigger {#tooltip-trigger}

### Tooltip.Arrow {#tooltip-arrow}

### Type Definitions {#tooltip-type-definitions}

| Name                      | Definition                                                                       |
| ------------------------- | -------------------------------------------------------------------------------- |
| TooltipVariant            | `'white' \| 'dark' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` |
| Side                      | `'top' \| 'right' \| 'bottom' \| 'left'`                                         |
| Align                     | `'start' \| 'center' \| 'end'`                                                   |
| TooltipTriggerRenderProps | `{ isOpen: boolean; disabled: boolean; show: () => void; hide: () => void }`     |
