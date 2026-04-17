# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`.

## Reference

- Spar documentation: https://spar.app.turkishtechlab.com/
- Spar Accordion reference:
  https://spar.app.turkishtechlab.com/docs/Components/Accordion
- Spar Button reference:
  https://spar.app.turkishtechlab.com/docs/Components/Button
- Spar Checkbox reference:
  https://spar.app.turkishtechlab.com/docs/Components/Checkbox
- Spar Dialog reference:
  https://spar.app.turkishtechlab.com/docs/Components/Dialog
- Spar Input reference:
  https://spar.app.turkishtechlab.com/docs/Components/Input

## Install

`@takeoff-ui/react-spar` currently targets React 19.x only.

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar react react-dom
```

## Usage

```tsx
import { useState } from 'react';
import '@takeoff-design/tokens/css/default/theme.css';
import {
  Accordion,
  AccordionItem,
  Button,
  Dialog,
  SparReactProvider,
} from '@takeoff-ui/react-spar';

export function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <SparReactProvider>
      <Accordion>
        <AccordionItem header="Baggage allowance">
          Review your cabin and checked baggage limits before your trip.
        </AccordionItem>
      </Accordion>

      <Button type="outlined" variant="secondary">
        Manage booking
      </Button>

      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Upgrade cabin"
        subheader="Review the fare difference before you continue."
        containerStyle={{ width: '460px' }}
      >
        The React wrapper keeps Takeoff's dialog surface while Spar owns the
        focus trap and ARIA wiring.
      </Dialog>
    </SparReactProvider>
  );
}
```

`@takeoff-ui/react-spar` does not bundle component CSS. Install and import
`@takeoff-design/tokens` once at the app shell or entrypoint.

`SparReactProvider` is the root provider for the package. It accepts `colorMode`
(`'light' | 'dark'`, default `'light'`), an optional `locale` string, and an
optional `components` customization map. The provider renders a
`display: contents` wrapper that writes `data-theme` from `colorMode` and `lang`
from `locale`. RTL, density, and direction-aware token attributes are not part
of the current contract — see the Roadmap section for scope.

## Component Customization

Every component supports a per-slot customization surface via `classNames`,
`slotProps`, and (where applicable) render overrides and compound parts.

### Theme-level defaults

Use `SparReactProvider`'s `components` prop to apply global defaults,
classNames, and slotProps for any component:

```tsx
<SparReactProvider
  components={{
    Button: {
      defaultProps: { variant: 'secondary', size: 'large' },
      classNames: { root: 'my-button' },
      slotProps: { root: { 'aria-describedby': 'global-hint' } },
    },
    Dialog: {
      defaultProps: { maskVariant: 'dark' },
      classNames: { header: 'custom-dialog-header' },
    },
  }}
>
  {children}
</SparReactProvider>
```

Instance props always win over theme defaults.

### classNames

Target specific slots with extra CSS classes. These are **concatenated** with
the canonical `tk-*` classes, never replacing them:

```tsx
<Button classNames={{ root: 'my-root', label: 'my-label' }}>Click me</Button>
```

### slotProps

Forward arbitrary HTML attributes to specific slots. `className` values inside
slotProps are also concatenated with the canonical class:

```tsx
<AccordionItem
  header="FAQ"
  slotProps={{
    root: { 'aria-describedby': 'faq-note' },
    content: { className: 'faq-content', id: 'faq-body' },
  }}
>
  Answer text
</AccordionItem>
```

### Render overrides

Content-bearing and decorative slots can be overridden via render props. The
structural owner node is always preserved by the wrapper:

```tsx
<Button
  loading
  renderSpinner={(defaultSpinner) => <MySpinner fallback={defaultSpinner} />}
  renderIcon={(defaultIcon) => <MyIcon fallback={defaultIcon} />}
>
  Processing
</Button>

<Dialog
  visible
  header="Title"
  renderCloseIcon={(defaultIcon) => <span>X</span>}
  renderSignIcon={(defaultIcon) => <MySignIcon />}
>
  Content
</Dialog>
```

> **Structural slot rule:** Render overrides only replace the _content_ inside
> the canonical owner node. The owner element (its class, `data-slot`, and
> behavior like dismiss) is always owned by the wrapper.

### Dialog compound parts

For full layout control, use compound parts with `containerSlot`. Always include
`Dialog.Title` to ensure accessible naming:

```tsx
<Dialog
  visible
  containerSlot={
    <>
      <Dialog.Header className="my-header">
        <Dialog.Title>Confirm upgrade</Dialog.Title>
        <Dialog.Description>This cannot be undone</Dialog.Description>
      </Dialog.Header>
      <Dialog.Content>Review details below.</Dialog.Content>
      <Dialog.Footer>
        <Dialog.FooterActions>
          <Button variant="neutral">Cancel</Button>
          <Button>Confirm</Button>
        </Dialog.FooterActions>
      </Dialog.Footer>
    </>
  }
>
  Ignored when containerSlot is set
</Dialog>
```

The flat parity API (`header`, `subheader`, `footerActions` props) continues to
work and provides ARIA wiring automatically. Use compound parts only when you
need richer layout control.

## Roadmap

- **RTL / i18n**: currently out of scope. The wrapper sets `lang` from `locale`
  and `data-theme` from `colorMode`; it does not flip leading/trailing, mirror
  icons, or emit dir-aware tokens. RTL lands as a deliberate pass when product
  priorities surface it. Until then, set `html[dir]` yourself at the framework
  level (Docusaurus, Next.js) if you need RTL layout.
- **Shared hooks**: `useControllableValue`, `useMergedRef` are being extracted
  component-by-component and will move under `src/hooks/` once the form-field
  family (Input, Checkbox, Radio, Switch, Select) is shipped.
