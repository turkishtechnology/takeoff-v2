# @takeoff-ui/react-spar

Current-phase React package for Takeoff components backed by
`@turkish-technology/spar`. Components ship as compound surfaces: state lives on
the root and structure lives in named subcomponents.

The public API uses React primitive vocabulary (`value`, `defaultValue`,
`checked`, `open`, `on*Change`) while preserving visual Takeoff vocabulary
(`variant`, `appearance`, `type`, `mode`, `size`) and translating framework
mechanics into React conventions (`default*` props, `on*` callbacks, and
compound children instead of Web Component slots).

## Current Surface

The package currently exports these component roots:

- `Accordion`
- `Alert`
- `Badge`
- `Breadcrumb`
- `Button`
- `Card`
- `Checkbox`
- `Chip`
- `Dialog`
- `Drawer`
- `Dropdown`
- `Field`
- `Input`
- `Label`
- `Popover`
- `Radio`
- `Select`
- `Spinner`
- `Switch`
- `Table`
- `Tabs`
- `Toast`
- `Tooltip`

The package root also exports `TakeoffSparProvider`, `useTheme`,
`useComponentTheme`, and customization/theme types. Compound components expose
their public parts through the root object, for example `Accordion.Item`,
`Dialog.Panel`, `Input.Field`, `Select.Trigger`, and `Tabs.List`.

State-only roots such as `Dialog`, `Drawer`, `Popover`, and `Tooltip` render no
DOM element themselves; styling and slot customization live on their rendered
parts (`Dialog.Panel`, `Drawer.Overlay`, `Tooltip.Content`, etc.).

## Reference

- Spar documentation: https://spar.app.turkishtechlab.com/
- Spar Accordion reference:
  https://spar.app.turkishtechlab.com/docs/Components/Accordion

## Install

`@takeoff-ui/react-spar` currently targets React 19.x only.

`@takeoff-design/tokens` is a **peer dependency** — install it alongside
`@takeoff-ui/react-spar`. Keeping tokens out of `dependencies` ensures a single
tokens copy in your tree and lets you upgrade tokens independently of this
wrapper.

```bash
pnpm add @takeoff-ui/react-spar @takeoff-design/tokens
```

`@turkish-technology/spar` is still a regular dependency of
`@takeoff-ui/react-spar` and is installed automatically. Add it to your own
`package.json` only if your app imports from it directly (for example, when
using Spar primitives that `react-spar` does not re-export).

`@takeoff-ui/react-spar` does not bundle component CSS. Import the token
stylesheet once at the app shell or entrypoint:

```ts
import '@takeoff-design/tokens/css/default/theme.css';
```

## AI & editor setup

Coding assistants don't know this library and will invent props or hand-roll
markup unless you tell them about it. This package ships an instructions file
you can drop into your repository:

```bash
cp node_modules/@takeoff-ui/react-spar/agents/AGENTS.template.md ./AGENTS.md
```

> The `agents/` directory ships from 0.4.0 onward.

`AGENTS.md` at the repository root is read automatically by GitHub Copilot,
Cursor, and Claude. It lists every component with what it's for, plus the rules
that matter (React 19 only, provider + token CSS, the slot/customization model).

For full API context, point the assistant at the Markdown docs — every page is
available by appending `.md` to its URL, and the whole library is at
[`/llms-full.txt`](https://takeoff-v2.app.turkishtechlab.com/llms-full.txt).

Full guide, including tool-specific paths:
https://takeoff-v2.app.turkishtechlab.com/docs/ai-assistants

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
customization map. The provider renders no DOM of its own. It writes
`data-theme` from `colorMode` and `lang` from `locale` to
`document.documentElement` in a client effect so portal-mounted descendants
(`Dialog`, `Popover`, `Tooltip`, etc.) inherit the same theme and language
context. In SSR apps, set matching `<html data-theme="..." lang="...">`
attributes on the server to avoid first-paint mismatch.

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

Every rendered component root and rendered component part exposes the same
customization layers:

- `className`: appended to the canonical root slot class.
- `classNames`: per-slot extra classes, concatenated with canonical `tk-*`
  classes.
- `slotProps`: per-slot HTML attributes, shallow-merged below canonical wrapper
  attributes.
- provider `components`: global defaults, classes, and slot props keyed by
  component name.

Canonical `tk-*` classes and `data-slot` attributes are always preserved.
State-only roots (`Dialog`, `Drawer`, `Popover`, `Tooltip`) have no DOM target
for root-level styling, so their provider entries expose `defaultProps` only;
style their rendered parts instead.

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

Custom indicator content is rendered inside the canonical
`.tk-accordion-item-indicator` owner node so recipes keep their stable selector.

`Accordion.Indicator` is opt-in — omit it to render a trigger without a
disclosure affordance. Its owner node carries the canonical
`.tk-accordion-item-indicator` class so recipes keep a stable selector.
