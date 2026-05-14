# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`. Components ship as compound surfaces: state lives on
the root and structure lives in named subcomponents.

The public API uses React primitive vocabulary for Accordion state (`value`,
`defaultValue`, `onValueChange`, item `value`) while preserving visual Takeoff
vocabulary (`type`, `mode`, `size`) and translating framework mechanics into
React conventions (`default*` props, `on*` callbacks, and compound children
instead of Web Component slots).

## Current Surface

The package currently exports:

- `Accordion`
- `Button`
- `Drawer`
- `Tooltip`
- `TakeoffSparProvider`
- customization and theme types from the package root

See the [Roadmap](#roadmap) below for components queued next. Additional
wrappers are added only after their component contract is source-backed and any
upstream Spar behavior gaps are resolved.

## Reference

- Spar documentation: https://spar.app.turkishtechlab.com/
- Spar Accordion reference:
  https://spar.app.turkishtechlab.com/docs/Components/Accordion

## Install

`@takeoff-ui/react-spar` currently targets React 19.x only.

```bash
pnpm add @takeoff-ui/react-spar
```

`@takeoff-design/tokens` and `@turkish-technology/spar` are direct dependencies
of `@takeoff-ui/react-spar` — you don't need to install them separately. Add
either one to your own `package.json` only if your app imports from it directly
(for example, when overriding token CSS variables from an entry stylesheet, or
when using Spar primitives that `react-spar` does not re-export).

`@takeoff-ui/react-spar` does not bundle component CSS. Import the token
stylesheet once at the app shell or entrypoint:

```ts
import '@takeoff-design/tokens/css/default/theme.css';
```

## Usage

```tsx
import '@takeoff-design/tokens/css/default/theme.css';
import { Accordion, TakeoffSparProvider } from '@takeoff-ui/react-spar';

export function Example() {
  return (
    <TakeoffSparProvider>
      <Accordion defaultValue="baggage">
        <Accordion.Item value="baggage">
          <Accordion.Header>
            <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Review your cabin and checked baggage limits before your trip.
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="changes">
          <Accordion.Header>
            <Accordion.Trigger>Flight changes</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Change rules depend on the fare family selected during booking.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </TakeoffSparProvider>
  );
}
```

`TakeoffSparProvider` accepts `colorMode` (`'light' | 'dark'`, default
`'light'`), an optional `locale` string, and an optional `components`
customization map. The provider renders a `display: contents` wrapper that
writes `data-theme` from `colorMode` and `lang` from `locale`.

## Accordion

```tsx
<Accordion multiple defaultValue={['one']}>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Accordion.Trigger>
        FAQ
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>Answer content</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

- Root behavior props: `value`, `defaultValue`, `multiple`, `onValueChange`,
  `collapsible`, `disabled`, `orientation`.
- Root visual props: `type`, `mode`, `size`.
- Trigger leading content: `startContent` prop on `Accordion.Trigger`.
- Item props: required `value`, optional `disabled`.
- Public parts: `Accordion.Item`, `Accordion.Header`, `Accordion.Trigger`,
  `Accordion.Indicator`, `Accordion.Content`.
- The disclosure indicator is opt-in: drop `<Accordion.Indicator />` into the
  trigger to render the default chevron, override its children to swap glyphs,
  or omit it to ship a trigger without a visual affordance. Placement (left vs
  right of the title) follows where you put it inside the trigger.
- Web Component shortcuts such as item-level `active`, `header`, and custom DOM
  active-index events are intentionally not part of the React surface; use root
  state props and compound children instead.

## Customization

Every public component part exposes the same customization layers:

- `className`: appended to the canonical root slot class.
- `classNames`: per-slot extra classes, concatenated with canonical `tk-*`
  classes.
- `slotProps`: per-slot HTML attributes, shallow-merged below canonical wrapper
  attributes.
- provider `components`: global defaults, classes, and slot props keyed by
  component name.

Canonical `tk-*` classes and `data-slot` attributes are always preserved.

### Theme-level Defaults

```tsx
<TakeoffSparProvider
  components={{
    Accordion: {
      defaultProps: { size: 'large' },
      className: 'travel-faq',
    },
    AccordionTrigger: {
      slotProps: { root: { 'aria-describedby': 'faq-trigger-hint' } },
    },
  }}
>
  {children}
</TakeoffSparProvider>
```

Instance props override provider defaults. Instance `classNames` and `slotProps`
override provider entries for the same slot, while canonical wrapper attributes
remain in place.

### Per-instance Classes

```tsx
<Accordion.Item value="faq" classNames={{ root: 'faq-item' }}>
  <Accordion.Header>
    <Accordion.Trigger classNames={{ root: 'faq-trigger' }}>
      FAQ
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>Answer text</Accordion.Content>
</Accordion.Item>
```

### Per-instance Slot Props

```tsx
<Accordion.Item
  value="faq"
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

### Custom Indicator

```tsx
<Accordion>
  <Accordion.Item value="faq">
    <Accordion.Header>
      <Accordion.Trigger>
        FAQ
        <Accordion.Indicator>
          {({ isOpen }) => (isOpen ? <span>-</span> : <span>+</span>)}
        </Accordion.Indicator>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>Answer text</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

`Accordion.Indicator` is opt-in — omit it to render a trigger without a
disclosure affordance. Its owner node carries the canonical
`.tk-accordion-item-indicator` class so recipes keep a stable selector.

## Roadmap

- **Additional wrappers**: Checkbox, Dialog, Input, Select, and the broader
  parity set with the legacy Stencil `takeoff-ui` library are planned but not
  yet exported. See the docs-site roadmap page for the live list.
- **RTL / i18n**: currently out of scope. The wrapper sets `lang` from `locale`
  and `data-theme` from `colorMode`; it does not flip leading/trailing, mirror
  icons, or emit dir-aware tokens. Set `html[dir]` at the framework level until
  a deliberate RTL pass lands.
- **Shared hooks**: `useControllableValue` and `useMergedRef` should be
  extracted only when repeated shipped components need them.
