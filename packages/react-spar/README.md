# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`. Every component ships as a **compound surface** —
state lives on the root and structure lives in named subcomponents.

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

Every component is compound-only. Import the root and compose the anatomy from
the attached subcomponents. No flat alternatives exist.

```tsx
import { useState } from 'react';
import '@takeoff-design/tokens/css/default/theme.css';
import {
  Accordion,
  Button,
  Dialog,
  Input,
  SparReactProvider,
} from '@takeoff-ui/react-spar';

export function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <SparReactProvider>
      <Accordion>
        <Accordion.Item itemKey="baggage">
          <Accordion.Header>
            <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Review your cabin and checked baggage limits before your trip.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <Button type="outlined" variant="secondary">
        <Button.Label>Manage booking</Button.Label>
      </Button>

      <Button onClick={() => setVisible(true)}>
        <Button.Label>Open dialog</Button.Label>
      </Button>

      <Dialog visible={visible} onVisibleChange={setVisible}>
        <Dialog.Mask />
        <Dialog.Panel style={{ width: '460px' }}>
          <Dialog.Header>
            <Dialog.SignIcon />
            <Dialog.TitleGroup>
              <Dialog.Description>
                Review the fare difference before you continue.
              </Dialog.Description>
              <Dialog.Title>Upgrade cabin</Dialog.Title>
            </Dialog.TitleGroup>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>
            The React wrapper keeps Takeoff's dialog surface while Spar owns the
            focus trap and ARIA wiring.
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.FooterActions>
              <Button
                type="text"
                variant="neutral"
                onClick={() => setVisible(false)}
              >
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button>
                <Button.Label>Continue</Button.Label>
              </Button>
            </Dialog.FooterActions>
          </Dialog.Footer>
        </Dialog.Panel>
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
from `locale`.

## Compound Anatomy

Each component exposes a fixed list of compound parts. These are the only
rendering surfaces; there are no flat `label`, `header`, `icon`, `description`
props on any component.

### Button

```tsx
<Button variant="primary" loading={false} disabled={false}>
  <Button.LeadingIcon>home</Button.LeadingIcon> {/* optional */}
  <Button.Label>Submit</Button.Label> {/* optional when iconOnly */}
  <Button.TrailingIcon>arrow_forward</Button.TrailingIcon> {/* optional */}
  <Button.Spinner /> {/* renders only when loading={true} */}
</Button>
```

- Root state props: `type`, `variant`, `size`, `mode`, `fullWidth`, `rounded`,
  `underline`, `loading`, `disabled`, `iconOnly`, `as`, `href`, `target`, `rel`,
  `onClick`, plus native button/anchor attributes.
- Icon children accept a ReactNode or a `string` (string renders as a Material
  Symbols ligature).

### Checkbox

```tsx
<Checkbox value={...} onChange={...} size="base" type="default">
  <Checkbox.Indicator>
    <Checkbox.Icon />
  </Checkbox.Indicator>
  <Checkbox.Content>
    <Checkbox.Label>Accept terms</Checkbox.Label>
    <Checkbox.Description>Read the terms of service</Checkbox.Description>
  </Checkbox.Content>
</Checkbox>
```

- Root state props: `value`, `defaultValue`, `indeterminate`, `onChange`,
  `size`, `type`, `disabled`, `readOnly`, `required`, `invalid`, `name`,
  `formValue`, `form`, plus focus/keyboard handlers.
- `<Checkbox.Icon>` children can be a function
  `({ checked, indeterminate }) => ReactNode` for custom glyphs.

### Accordion

```tsx
<Accordion allowMultiple activeIndex={...} onActiveIndexChange={...} arrowPosition="right">
  <Accordion.Item itemKey="one">
    <Accordion.Header>
      <Accordion.Trigger>FAQ</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>Answer content</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

- Root state props: `activeIndex`, `defaultActiveIndex`, `allowMultiple`,
  `onActiveIndexChange`, `preventCollapse`.
- Root visual props: `type`, `mode`, `size`, `arrowPosition`, `hideArrows`,
  `expandIcon`, `collapseIcon`.
- Item state props: `itemKey`, `disabled`.
- The arrow is rendered automatically inside every `Accordion.Trigger`. Hide it
  with `hideArrows` on the root, swap glyphs with `expandIcon`/`collapseIcon`,
  or move it with `arrowPosition`.

### Input

```tsx
<Input value={...} onChange={...} required invalid={invalid} clearable loading>
  <Input.Label>
    Email <Input.Asterisk />                 {/* auto-hides when not required */}
  </Input.Label>
  <Input.Container>
    <Input.LeadingIcon>mail</Input.LeadingIcon>
    <Input.Prefix>@</Input.Prefix>
    <Input.Field placeholder="you@example.com" />
    <Input.Suffix>.com</Input.Suffix>
    <Input.TrailingIcon>check</Input.TrailingIcon>
    <Input.Spinner />                        {/* renders only when loading=true */}
    <Input.ClearButton />                    {/* renders only when clearable && has value */}
  </Input.Container>
  <Input.Description>Helper text</Input.Description>    {/* hides when invalid */}
  <Input.ErrorMessage>Required</Input.ErrorMessage>     {/* renders only when invalid */}
</Input>
```

- Root state props: `type`, `size`, `value`, `defaultValue`, `onChange`,
  `onClearClick`, `disabled`, `readOnly`, `required`, `invalid`, `clearable`,
  `loading`, `id`.
- `<Input.Field>` inherits `type`, `disabled`, `readOnly`, `required`, `value`,
  `defaultValue` from the root; set those on `<Input>` only.

### Dialog

```tsx
<Dialog
  visible={visible}
  onVisibleChange={setVisible}
  variant="info"
  headerType="basic"
>
  <Dialog.Mask />
  <Dialog.Panel>
    <Dialog.Header>
      <Dialog.SignIcon />
      <Dialog.TitleGroup>
        <Dialog.Description>Review the fare difference</Dialog.Description>
        <Dialog.Title>Confirm upgrade</Dialog.Title>
      </Dialog.TitleGroup>
      <Dialog.CloseButton />
    </Dialog.Header>
    <Dialog.Body>Review details below.</Dialog.Body>
    <Dialog.Footer>
      <Dialog.FooterActions>
        <Button type="text" variant="neutral">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button>
          <Button.Label>Confirm</Button.Label>
        </Button>
      </Dialog.FooterActions>
    </Dialog.Footer>
  </Dialog.Panel>
</Dialog>
```

- Root state props: `visible`, `defaultVisible`, `onVisibleChange`, `onOpen`,
  `onClose`, `variant`, `headerType`, `maskVariant`, `isMaskBlur`,
  `hideBackdrop`, `containerStyle`, `preventDismiss`, `portalContainer`.
- Omit a part to hide it (`<Dialog.CloseButton>`, `<Dialog.SignIcon>`,
  `<Dialog.Footer>`, etc. are all optional). `Dialog.Title` and
  `Dialog.Description` are still the ARIA-labelling nodes, so render them
  whenever the dialog ships a visible or hidden title/description.

## Component Customization

Every component supports a per-slot customization surface via `classNames` and
`slotProps`. Subcomponents read those overrides from context — no need to thread
per-part props through the tree.

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
<Button classNames={{ root: 'my-root', label: 'my-label' }}>
  <Button.Label>Click me</Button.Label>
</Button>
```

### slotProps

Forward arbitrary HTML attributes to specific slots. `className` values inside
slotProps are also concatenated with the canonical class:

```tsx
<Accordion.Item
  itemKey="faq"
  slotProps={{
    root: { 'aria-describedby': 'faq-note' },
  }}
>
  <Accordion.Header>
    <Accordion.Trigger>FAQ</Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>Answer text</Accordion.Content>
</Accordion.Item>
```

### Content overrides via compound children

Compound subcomponents accept whatever children the consumer needs. Instead of
`renderIcon`/`renderSpinner`/`renderCloseIcon` props, drop custom content
directly into the slot subcomponent:

```tsx
<Button loading>
  <Button.Spinner>
    <MySpinner />         {/* replaces the default indicator; the canonical owner span is preserved */}
  </Button.Spinner>
  <Button.Label>Processing</Button.Label>
</Button>

<Dialog visible>
  <Dialog.Panel>
    <Dialog.Header>
      <Dialog.SignIcon><MySignIcon /></Dialog.SignIcon>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.CloseButton><XIcon /></Dialog.CloseButton>
    </Dialog.Header>
  </Dialog.Panel>
</Dialog>
```

> **Structural slot rule:** Compound subcomponents own the canonical owner node
> (its class, `data-slot`, and behavior like dismiss). Children override only
> the _content_ inside that node.

## Roadmap

- **RTL / i18n**: currently out of scope. The wrapper sets `lang` from `locale`
  and `data-theme` from `colorMode`; it does not flip leading/trailing, mirror
  icons, or emit dir-aware tokens. RTL lands as a deliberate pass when product
  priorities surface it. Until then, set `html[dir]` yourself at the framework
  level (Docusaurus, Next.js) if you need RTL layout.
- **Shared hooks**: `useControllableValue`, `useMergedRef` are being extracted
  component-by-component and will move under `src/hooks/` once the form-field
  family (Input, Checkbox, Radio, Switch, Select) is shipped.
