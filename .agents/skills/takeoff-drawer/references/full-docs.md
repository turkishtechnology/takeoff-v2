# Drawer

`Drawer` is a slide-in side panel that wraps Spar's Dialog primitive in modal
mode. It provides a compound component API for building navigation menus, detail
views, filters, or contextual forms that overlay the current page.

## Usage

```tsx
import { Drawer } from '@takeoff-ui/react-spar';
```

```tsx
<Drawer>
  <Drawer.Trigger />
  <Drawer.Overlay />
  <Drawer.Panel>
    <Drawer.Header>
      <Drawer.Title />
      <Drawer.Close>✕</Drawer.Close>
    </Drawer.Header>
    <Drawer.Body>
      <Drawer.Description />
    </Drawer.Body>
    <Drawer.Footer />
  </Drawer.Panel>
</Drawer>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Drawer placement="right">
      <Drawer.Trigger as={Button}>Open Drawer</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Panel>
        <Drawer.Header>
          <Drawer.Title>Flight Details</Drawer.Title>
          <Drawer.Close>✕</Drawer.Close>
        </Drawer.Header>
        <Drawer.Body>
          <Drawer.Description>
            Review your selected flight information and passenger details before
            confirming the booking.
          </Drawer.Description>
        </Drawer.Body>
      </Drawer.Panel>
    </Drawer>
  );
}

render(<PlaygroundDemo />);
```

## Placement

The `placement` prop controls from which side the drawer slides in.

```tsx
function PlacementDemo() {
  const [placement, setPlacement] = useState('right');

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {['left', 'right', 'top', 'bottom'].map(p => (
        <Drawer key={p} placement={p}>
          <Drawer.Trigger as={Button}>{p}</Drawer.Trigger>
          <Drawer.Overlay />
          <Drawer.Panel>
            <Drawer.Header>
              <Drawer.Title>Drawer from {p}</Drawer.Title>
              <Drawer.Close>✕</Drawer.Close>
            </Drawer.Header>
            <Drawer.Body>
              This drawer slides in from the <strong>{p}</strong> side.
            </Drawer.Body>
          </Drawer.Panel>
        </Drawer>
      ))}
    </div>
  );
}

render(<PlacementDemo />);
```

## Full Screen

Stretch `Drawer.Panel` to the viewport with a style override to fill the whole
screen. `placement` still decides which edge the panel slides in from.

```tsx
function FullScreenDemo() {
  const fullScreen = {
    inset: 0,
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 0,
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {['right', 'bottom'].map(p => (
        <Drawer key={p} placement={p}>
          <Drawer.Trigger as={Button}>Full screen from {p}</Drawer.Trigger>
          <Drawer.Overlay />
          <Drawer.Panel style={fullScreen}>
            <Drawer.Header headerType="divided">
              <Drawer.Title>Full-screen drawer</Drawer.Title>
              <Drawer.Close>✕</Drawer.Close>
            </Drawer.Header>
            <Drawer.Body>
              The panel is stretched to the viewport by the style override and
              still slides in from the <strong>{p}</strong> edge.
            </Drawer.Body>
            <Drawer.Footer footerType="divided">
              <Drawer.Close as={Button} variant="secondary">
                Close
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Panel>
        </Drawer>
      ))}
    </div>
  );
}

render(<FullScreenDemo />);
```

## Footer Types

`Drawer.Footer` supports a few visual variants through the `footerType` prop.
Use `divided` to add a separation line or `light` to soften the footer
background.

```tsx
function FooterTypeDrawerDemo() {
  const footerTypes = ['basic', 'divided', 'light'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {footerTypes.map(type => (
        <Drawer key={type} placement="right">
          <Drawer.Trigger as={Button}>{type}</Drawer.Trigger>
          <Drawer.Overlay />
          <Drawer.Panel>
            <Drawer.Header>
              <Drawer.Title>{type} footer</Drawer.Title>
              <Drawer.Close>✕</Drawer.Close>
            </Drawer.Header>
            <Drawer.Body>
              This footer uses <code>{type}</code> styling.
            </Drawer.Body>
            <Drawer.Footer footerType={type}>
              <Button variant="secondary">Cancel</Button>
              <Button>Confirm</Button>
            </Drawer.Footer>
          </Drawer.Panel>
        </Drawer>
      ))}
    </div>
  );
}

render(<FooterTypeDrawerDemo />);
```

## Header Types

`Drawer.Header` supports multiple visual variants via the `headerType` prop. Use
this option to add a divider, light or dark background, or a primary-style
header when the drawer content requires extra emphasis.

```tsx
function HeaderTypeDrawerDemo() {
  const headerTypes = ['basic', 'divided', 'light', 'dark', 'primary'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {headerTypes.map(type => (
        <Drawer key={type} placement="right">
          <Drawer.Trigger as={Button}>{type}</Drawer.Trigger>
          <Drawer.Overlay />
          <Drawer.Panel>
            <Drawer.Header headerType={type}>
              <Drawer.Title>{type} header</Drawer.Title>
              <Drawer.Close>✕</Drawer.Close>
            </Drawer.Header>
            <Drawer.Body>Header type: {type}</Drawer.Body>
          </Drawer.Panel>
        </Drawer>
      ))}
    </div>
  );
}

render(<HeaderTypeDrawerDemo />);
```

## Dismissible

Set `dismissible={false}` to prevent the drawer from closing when the user
clicks outside or presses Escape.

```tsx
function DismissibleDrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      dismissible={false}
      placement="right"
    >
      <Drawer.Trigger as={Button}>Open non-dismissible</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Panel>
        <Drawer.Header>
          <Drawer.Title>Sticky Drawer</Drawer.Title>
          <Drawer.Close>✕</Drawer.Close>
        </Drawer.Header>
        <Drawer.Body>
          This drawer can only be closed using the close control.
        </Drawer.Body>
      </Drawer.Panel>
    </Drawer>
  );
}

render(<DismissibleDrawerDemo />);
```

## Overlay Behavior

Use `blur` for a softened backdrop and `invisible` when the overlay should stay
interactive but visually disappear.

```tsx
function OverlayBehaviorDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Drawer placement="right">
        <Drawer.Trigger as={Button}>Blur</Drawer.Trigger>
        <Drawer.Overlay blur />
        <Drawer.Panel>
          <Drawer.Header>
            <Drawer.Title>Blurred overlay</Drawer.Title>
            <Drawer.Close>✕</Drawer.Close>
          </Drawer.Header>
          <Drawer.Body>
            The backdrop stays visible and adds a soft blur effect behind the
            panel.
          </Drawer.Body>
        </Drawer.Panel>
      </Drawer>

      <Drawer placement="right">
        <Drawer.Trigger as={Button}>Invisible</Drawer.Trigger>
        <Drawer.Overlay invisible />
        <Drawer.Panel>
          <Drawer.Header>
            <Drawer.Title>Invisible overlay</Drawer.Title>
            <Drawer.Close>✕</Drawer.Close>
          </Drawer.Header>
          <Drawer.Body>
            The overlay remains mounted for interaction but is visually hidden.
          </Drawer.Body>
        </Drawer.Panel>
      </Drawer>
    </div>
  );
}

render(<OverlayBehaviorDemo />);
```

## Intensity

The `intensity` prop controls how dark the overlay appears.

```tsx
function OverlayIntensityDemo() {
  const intensities = ['lightest', 'light', 'base', 'dark', 'darkest'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {intensities.map(intensity => (
        <Drawer key={intensity} placement="right">
          <Drawer.Trigger as={Button}>{intensity}</Drawer.Trigger>
          <Drawer.Overlay intensity={intensity} />
          <Drawer.Panel>
            <Drawer.Header>
              <Drawer.Title>{intensity}</Drawer.Title>
              <Drawer.Close>✕</Drawer.Close>
            </Drawer.Header>
            <Drawer.Body>Overlay intensity: {intensity}</Drawer.Body>
          </Drawer.Panel>
        </Drawer>
      ))}
    </div>
  );
}

render(<OverlayIntensityDemo />);
```

## Accessibility & Keyboard

- The drawer renders as a modal `role="dialog"` with proper `aria-labelledby`
  and `aria-describedby` relationships.
- Focus is trapped inside the panel while open and restored on close.
- `Drawer.Title` provides the accessible label; `Drawer.Description` provides
  the accessible description.
- When `dismissible={false}`, pressing Escape and clicking outside will not
  close the drawer.

| Key             | Behavior                                          |
| --------------- | ------------------------------------------------- |
| Escape          | Closes the drawer (unless `dismissible={false}`). |
| Tab / Shift+Tab | Cycles focus within the panel.                    |

## Animation

The drawer animates automatically via CSS transitions. The panel slides in from
the configured `placement` direction and the overlay fades in. No JavaScript
animation library is required.

- **Panel:** `transform` 0.3s with `cubic-bezier(0.4, 0, 0.2, 1)`
- **Overlay:** `opacity` 0.3s with `ease-in-out`

## API Reference

### Drawer {#drawer}

#### Props {#drawer-props}

| Name        | Type              | Default | Description                                                                                                                                                                      |
| ----------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode` | -       | Drawer parts rendered inside the root.                                                                                                                                           |
| placement   | `DrawerPlacement` | -       | Side the drawer slides in from.                                                                                                                                                  |
| dismissible | `boolean`         | true    | Whether the drawer can be dismissed by clicking outside or pressing Escape.                                                                                                      |
| id          | `string`          | -       | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-title`, `${id}-description`, `${id}-content`. |
| disabled    | `boolean`         | false   | Disables all dialog triggers (prevents opening)                                                                                                                                  |
| open        | `boolean`         | -       | Controlled open state                                                                                                                                                            |
| defaultOpen | `boolean`         | false   | Initial open state (uncontrolled)                                                                                                                                                |

#### Events {#drawer-events}

| Name         | Type                      | Default | Description                      |
| ------------ | ------------------------- | ------- | -------------------------------- |
| onOpenChange | `(open: boolean) => void` | -       | Callback when open state changes |

### Drawer.Trigger {#drawer-trigger}

#### Data attributes {#drawer-trigger-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Drawer.Overlay {#drawer-overlay}

#### Props {#drawer-overlay-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| invisible  | `boolean`                                                    | false         | When true, the overlay is rendered but visually invisible.                 |
| intensity  | `DrawerOverlayIntensity`                                     | 'base'        | Overlay backdrop intensity.                                                |
| blur       | `boolean`                                                    | false         | Applies backdrop blur on the overlay.                                      |
| classNames | `Partial<Record<"root", string>>`                            | -             |                                                                            |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             |                                                                            |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |

#### Data attributes {#drawer-overlay-data-attributes}

| Attribute        | Applied when             | Purpose                                                     |
| ---------------- | ------------------------ | ----------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.       |
| data-state       | Always                   | `"open"` or `"closed"` — used for entry/exit animations.    |
| data-intensity   | Always                   | Reflects the resolved `intensity` prop.                     |
| data-invisible   | When `invisible` is true | Indicates overlay is visually hidden but still interactive. |
| data-blur        | When `blur` is true      | Enables backdrop blur styling on the overlay.               |

### Drawer.Panel {#drawer-panel}

#### Props {#drawer-panel-props}

| Name         | Type                                                         | Default       | Description                                                                |
| ------------ | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| classNames   | `Partial<Record<"root", string>>`                            | -             |                                                                            |
| slotProps    | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             |                                                                            |
| container    | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| trapFocus    | `boolean`                                                    | true          | Enable focus trapping                                                      |
| restoreFocus | `boolean`                                                    | true          | Restore focus on close                                                     |
| initialFocus | `HTMLElement \| (() => HTMLElement)`                         | -             | Element to focus on open                                                   |
| finalFocus   | `HTMLElement \| (() => HTMLElement)`                         | -             | Element to focus on close                                                  |

#### Events {#drawer-panel-events}

| Name                 | Type                             | Default | Description                                                |
| -------------------- | -------------------------------- | ------- | ---------------------------------------------------------- |
| onOpenAutoFocus      | `(event: Event) => void`         | -       | Callback before auto-focus                                 |
| onCloseAutoFocus     | `(event: Event) => void`         | -       | Callback before focus restore                              |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void` | -       | Escape key handler                                         |
| onPointerDownOutside | `(event: PointerEvent) => void`  | -       | Outside click handler                                      |
| onInteractOutside    | `(event: PointerEvent) => void`  | -       | Outside interaction handler with preventDefault capability |

#### Data attributes {#drawer-panel-data-attributes}

| Attribute        | Applied when | Purpose                                                 |
| ---------------- | ------------ | ------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.   |
| data-state       | Always       | `"open"` or `"closed"` — drives slide/scale animations. |
| data-placement   | Always       | Reflects placement for directional CSS transitions.     |

### Drawer.Header {#drawer-header}

#### Props {#drawer-header-props}

| Name       | Type                                                         | Default | Description         |
| ---------- | ------------------------------------------------------------ | ------- | ------------------- |
| headerType | `DrawerHeaderType`                                           | 'basic' | Type of the header. |
| classNames | `Partial<Record<"root", string>>`                            | -       |                     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                     |

#### Data attributes {#drawer-header-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-header-type | Always       | Reflects the resolved `headerType` prop.              |

### Drawer.Title {#drawer-title}

#### Props {#drawer-title-props}

| Name       | Type                                                         | Default | Description                                                                                                                                              |
| ---------- | ------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| classNames | `Partial<Record<"root", string>>`                            | -       |                                                                                                                                                          |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                                                                                                                                                          |
| level      | `number`                                                     | 5       | Semantic heading level (1-6). Sets the rendered tag (`h1`-`h6`) and `data-level` for the document outline; the visual size is fixed regardless of level. |

#### Data attributes {#drawer-title-data-attributes}

| Attribute        | Applied when | Purpose                                                                                   |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.                                     |
| data-level       | Always       | Reflects the resolved `level` prop for the document outline (does not change typography). |

### Drawer.Description {#drawer-description}

#### Data attributes {#drawer-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Drawer.Body {#drawer-body}

#### Data attributes {#drawer-body-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Drawer.Footer {#drawer-footer}

#### Props {#drawer-footer-props}

| Name       | Type                                                         | Default | Description         |
| ---------- | ------------------------------------------------------------ | ------- | ------------------- |
| footerType | `DrawerFooterType`                                           | 'basic' | Type of the footer. |
| classNames | `Partial<Record<"root", string>>`                            | -       |                     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                     |

#### Data attributes {#drawer-footer-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-footer-type | Always       | Reflects the resolved `footerType` prop.              |

### Drawer.Close {#drawer-close}

#### Data attributes {#drawer-close-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#drawer-type-definitions}

| Name                   | Definition                                               |
| ---------------------- | -------------------------------------------------------- |
| DrawerPlacement        | `'left' \| 'right' \| 'top' \| 'bottom'`                 |
| DrawerOverlayIntensity | `'lightest' \| 'light' \| 'base' \| 'dark' \| 'darkest'` |
| DrawerHeaderType       | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'` |
| DrawerFooterType       | `'basic' \| 'divided' \| 'light'`                        |
