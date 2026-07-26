# Dialog

`Dialog` wraps Spar's headless dialog primitive and adds Takeoff styling hooks
for overlay intensity, header types, and compound anatomy.

## Usage

```tsx
import { Dialog } from '@takeoff-ui/react-spar';
```

```tsx
<Dialog>
  <Dialog.Trigger />
  <Dialog.Overlay />
  <Dialog.Panel>
    <Dialog.Header>
      <Dialog.Title />
      <Dialog.Close />
    </Dialog.Header>
    <Dialog.Body>
      <Dialog.Description />
    </Dialog.Body>
    <Dialog.Footer />
  </Dialog.Panel>
</Dialog>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Dialog>
      <Dialog.Trigger as={Button}>Open Dialog</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Panel>
        <Dialog.Header>
          <Dialog.Title>Flight Details</Dialog.Title>
          <Dialog.Close>✕</Dialog.Close>
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>
            Review your selected flight information before continuing.
          </Dialog.Description>
        </Dialog.Body>
      </Dialog.Panel>
    </Dialog>
  );
}

render(<PlaygroundDemo />);
```

## Intensity

Use `intensity` to control how strong the backdrop appears behind the dialog.

```tsx
function OverlayIntensityDemo() {
  const intensities = ['lightest', 'light', 'base', 'dark', 'darkest'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {intensities.map(intensity => (
        <Dialog key={intensity}>
          <Dialog.Trigger as={Button}>{intensity}</Dialog.Trigger>
          <Dialog.Overlay intensity={intensity} />
          <Dialog.Panel>
            <Dialog.Header>
              <Dialog.Title>{intensity} overlay</Dialog.Title>
              <Dialog.Close>✕</Dialog.Close>
            </Dialog.Header>
            <Dialog.Body>
              Overlay intensity is set to <code>{intensity}</code>.
            </Dialog.Body>
          </Dialog.Panel>
        </Dialog>
      ))}
    </div>
  );
}

render(<OverlayIntensityDemo />);
```

## Overlay Behavior

Use `blur` for a softened backdrop and `invisible` when the overlay should stay
interactive but visually disappear.

```tsx
function OverlayBehaviorDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Dialog>
        <Dialog.Trigger as={Button}>Blur</Dialog.Trigger>
        <Dialog.Overlay blur />
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.Title>Blurred overlay</Dialog.Title>
            <Dialog.Close>✕</Dialog.Close>
          </Dialog.Header>
          <Dialog.Body>
            The backdrop stays visible and adds a soft blur effect behind the
            panel.
          </Dialog.Body>
        </Dialog.Panel>
      </Dialog>

      <Dialog>
        <Dialog.Trigger as={Button}>Invisible</Dialog.Trigger>
        <Dialog.Overlay invisible />
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.Title>Invisible overlay</Dialog.Title>
            <Dialog.Close>✕</Dialog.Close>
          </Dialog.Header>
          <Dialog.Body>
            The overlay remains mounted for interaction but is visually hidden.
          </Dialog.Body>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}

render(<OverlayBehaviorDemo />);
```

## Header Type

Use `headerType` to switch the visual treatment of the dialog header without
changing the rest of the panel structure.

```tsx
function HeaderTypeDemo() {
  const headerTypes = ['basic', 'divided', 'light', 'dark', 'primary'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {headerTypes.map(headerType => (
        <Dialog key={headerType}>
          <Dialog.Trigger as={Button}>{headerType}</Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Panel>
            <Dialog.Header headerType={headerType}>
              <Dialog.Title>{headerType} header</Dialog.Title>
              <Dialog.Close>✕</Dialog.Close>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>
                Header styling changes with <code>headerType</code>.
              </Dialog.Description>
              <div className="mt-3">
                This panel keeps the same body and footer while only the header
                appearance changes.
              </div>
            </Dialog.Body>
          </Dialog.Panel>
        </Dialog>
      ))}
    </div>
  );
}

render(<HeaderTypeDemo />);
```

## Dismissible

Set `dismissible={false}` when the dialog should stay open until the user
explicitly closes it.

```tsx
function DismissibleDemo() {
  return (
    <Dialog dismissible={false}>
      <Dialog.Trigger as={Button}>Open sticky dialog</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Panel>
        <Dialog.Header headerType="light">
          <Dialog.Title>Dismiss disabled</Dialog.Title>
          <Dialog.Close>✕</Dialog.Close>
        </Dialog.Header>
        <Dialog.Body>
          Escape and outside clicks will not close this dialog. Use the close
          button to dismiss it.
        </Dialog.Body>
      </Dialog.Panel>
    </Dialog>
  );
}

render(<DismissibleDemo />);
```

## Footer Type

Use `footerType` to switch the footer treatment without changing the action
layout.

```tsx
function FooterTypeDemo() {
  const footerTypes = ['basic', 'divided', 'light'];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {footerTypes.map(footerType => (
        <Dialog key={footerType}>
          <Dialog.Trigger as={Button}>{footerType}</Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Panel>
            <Dialog.Header headerType="divided">
              <Dialog.Title>{footerType} footer</Dialog.Title>
              <Dialog.Close>✕</Dialog.Close>
            </Dialog.Header>
            <Dialog.Body>
              Footer styling changes with <code>footerType</code>.
            </Dialog.Body>
            <Dialog.Footer footerType={footerType}>
              <Button variant="secondary">Cancel</Button>
              <Button>Confirm</Button>
            </Dialog.Footer>
          </Dialog.Panel>
        </Dialog>
      ))}
    </div>
  );
}

render(<FooterTypeDemo />);
```

## Controlled

Use `open` and `onOpenChange` when the dialog state needs to be managed from
outside the component.

```tsx
function ControlledDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setOpen(true)}>Open externally</Button>
      <span className="text-xs opacity-70">
        State: {open ? 'open' : 'closed'}
      </span>
      <Dialog open={open} onOpenChange={setOpen} dismissible={false}>
        <Dialog.Overlay />
        <Dialog.Panel>
          <Dialog.Header headerType="light">
            <Dialog.Title>Controlled dialog</Dialog.Title>
            <Dialog.Close>✕</Dialog.Close>
          </Dialog.Header>
          <Dialog.Body>
            This dialog is controlled outside the component. Escape and outside
            clicks are disabled with <code>dismissible=false</code>.
          </Dialog.Body>
          <Dialog.Footer className="flex justify-end">
            <Dialog.Close as={Button}>Done</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}

render(<ControlledDemo />);
```

## Accessibility & Keyboard

- The dialog renders with the proper `role`, `aria-labelledby`, and
  `aria-describedby` wiring through Spar.
- Focus is trapped inside the content while open and restored on close.
- `Dialog.Title` provides the accessible label and `Dialog.Description` provides
  the accessible description.
- `Dialog.Body` provides the default content spacing area between header and
  footer.
- When `dismissible={false}`, Escape and outside interaction do not close the
  dialog.

| Key             | Behavior                                        |
| --------------- | ----------------------------------------------- |
| Escape          | Closes the dialog unless `dismissible={false}`. |
| Tab / Shift+Tab | Cycles focus within the dialog content.         |

## API Reference

### Dialog {#dialog}

#### Props {#dialog-props}

| Name        | Type              | Default | Description                                                                                                                                                                      |
| ----------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `React.ReactNode` | -       | Dialog parts rendered inside the root.                                                                                                                                           |
| dismissible | `boolean`         | true    | Whether the dialog can be dismissed by clicking outside or pressing Escape.                                                                                                      |
| id          | `string`          | -       | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-title`, `${id}-description`, `${id}-content`. |
| disabled    | `boolean`         | false   | Disables all dialog triggers (prevents opening)                                                                                                                                  |
| forceMount  | `boolean`         | false   | Always render portal/overlay/content (for animation libraries)                                                                                                                   |
| open        | `boolean`         | -       | Controlled open state                                                                                                                                                            |
| defaultOpen | `boolean`         | false   | Initial open state (uncontrolled)                                                                                                                                                |
| modal       | `boolean`         | true    | Whether dialog is modal (blocks interaction outside)                                                                                                                             |

#### Events {#dialog-events}

| Name         | Type                      | Default | Description                      |
| ------------ | ------------------------- | ------- | -------------------------------- |
| onOpenChange | `(open: boolean) => void` | -       | Callback when open state changes |

### Dialog.Trigger {#dialog-trigger}

#### Data attributes {#dialog-trigger-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dialog.Overlay {#dialog-overlay}

#### Props {#dialog-overlay-props}

| Name       | Type                                                         | Default       | Description                                                                |
| ---------- | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| invisible  | `boolean`                                                    | false         | When true, the overlay is rendered but visually invisible.                 |
| intensity  | `DialogOverlayIntensity`                                     | 'base'        | Overlay backdrop intensity.                                                |
| blur       | `boolean`                                                    | false         | Applies backdrop blur on the overlay.                                      |
| classNames | `Partial<Record<"root", string>>`                            | -             |                                                                            |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             |                                                                            |
| container  | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |

#### Data attributes {#dialog-overlay-data-attributes}

| Attribute        | Applied when             | Purpose                                                     |
| ---------------- | ------------------------ | ----------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.       |
| data-state       | Always                   | `"open"` or `"closed"` — used for overlay fade transitions. |
| data-intensity   | Always                   | Reflects the resolved `intensity` prop.                     |
| data-invisible   | When `invisible` is true | Indicates the overlay is visually hidden but still mounted. |
| data-blur        | When `blur` is true      | Enables backdrop blur styling on the overlay.               |

### Dialog.Panel {#dialog-panel}

#### Props {#dialog-panel-props}

| Name         | Type                                                         | Default       | Description                                                                |
| ------------ | ------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| classNames   | `Partial<Record<"root", string>>`                            | -             |                                                                            |
| slotProps    | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -             |                                                                            |
| role         | `React.AriaRole`                                             | 'dialog'      | ARIA role for dialog type                                                  |
| container    | `HTMLElement \| null`                                        | document.body | Portal container element. Content is portaled to document.body by default. |
| trapFocus    | `boolean`                                                    | true          | Enable focus trapping                                                      |
| restoreFocus | `boolean`                                                    | true          | Restore focus on close                                                     |
| initialFocus | `HTMLElement \| (() => HTMLElement)`                         | -             | Element to focus on open                                                   |
| finalFocus   | `HTMLElement \| (() => HTMLElement)`                         | -             | Element to focus on close                                                  |

#### Events {#dialog-panel-events}

| Name                 | Type                             | Default | Description                                                |
| -------------------- | -------------------------------- | ------- | ---------------------------------------------------------- |
| onOpenAutoFocus      | `(event: Event) => void`         | -       | Callback before auto-focus                                 |
| onCloseAutoFocus     | `(event: Event) => void`         | -       | Callback before focus restore                              |
| onEscapeKeyDown      | `(event: KeyboardEvent) => void` | -       | Escape key handler                                         |
| onPointerDownOutside | `(event: PointerEvent) => void`  | -       | Outside click handler                                      |
| onInteractOutside    | `(event: PointerEvent) => void`  | -       | Outside interaction handler with preventDefault capability |

#### Data attributes {#dialog-panel-data-attributes}

| Attribute        | Applied when | Purpose                                                    |
| ---------------- | ------------ | ---------------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot.      |
| data-state       | Always       | `"open"` or `"closed"` — forwarded from Spar dialog state. |
| data-modal       | Always       | Reflects whether the dialog is modal.                      |
| data-role        | Always       | Reflects the resolved ARIA role.                           |

### Dialog.Header {#dialog-header}

#### Props {#dialog-header-props}

| Name       | Type                                                         | Default | Description         |
| ---------- | ------------------------------------------------------------ | ------- | ------------------- |
| headerType | `DialogHeaderType`                                           | 'basic' | Type of the header. |
| classNames | `Partial<Record<"root", string>>`                            | -       |                     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                     |

#### Data attributes {#dialog-header-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-header-type | Always       | Reflects the resolved `headerType` prop.              |

### Dialog.Title {#dialog-title}

#### Props {#dialog-title-props}

| Name       | Type                                                         | Default | Description         |
| ---------- | ------------------------------------------------------------ | ------- | ------------------- |
| classNames | `Partial<Record<"root", string>>`                            | -       |                     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                     |
| level      | `number`                                                     | 5       | Heading level (1-6) |

#### Data attributes {#dialog-title-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dialog.Description {#dialog-description}

#### Data attributes {#dialog-description-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dialog.Body {#dialog-body}

#### Data attributes {#dialog-body-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Dialog.Footer {#dialog-footer}

#### Props {#dialog-footer-props}

| Name       | Type                                                         | Default | Description         |
| ---------- | ------------------------------------------------------------ | ------- | ------------------- |
| footerType | `DialogFooterType`                                           | 'basic' | Type of the footer. |
| classNames | `Partial<Record<"root", string>>`                            | -       |                     |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       |                     |

#### Data attributes {#dialog-footer-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |
| data-footer-type | Always       | Reflects the resolved `footerType` prop.              |

### Dialog.Close {#dialog-close}

#### Data attributes {#dialog-close-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#dialog-type-definitions}

| Name                   | Definition                                               |
| ---------------------- | -------------------------------------------------------- |
| DialogOverlayIntensity | `'lightest' \| 'light' \| 'base' \| 'dark' \| 'darkest'` |
| DialogHeaderType       | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'` |
| DialogFooterType       | `'basic' \| 'divided' \| 'light'`                        |
