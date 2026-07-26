# Composition & Styling

Takeoff Spar uses compound components when a UI surface has meaningful parts.
The parent owns shared state and behavior; child parts preserve semantic DOM,
accessibility relationships, and stable styling hooks.

## Compose the documented anatomy

```tsx
import { Accordion } from '@takeoff-ui/react-spar';

<Accordion defaultValue="baggage">
  <Accordion.Item value="baggage">
    <Accordion.Header>
      <Accordion.Trigger>
        Baggage allowance
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>One cabin bag is included.</Accordion.Content>
  </Accordion.Item>
</Accordion>;
```

This is intentionally more explicit than a single component with many shortcut
props. You control composition and placement without rebuilding keyboard or
accessibility behavior.

## Customization layers

Every DOM-rendering public part can expose these layers:

- `className` appends a class to the part's root slot.
- `classNames` appends classes by named slot.
- `slotProps` supplies HTML attributes by named slot.
- Provider `components` entries set shared defaults and slot customization.

```tsx
<Accordion.Item value="fare" className="fare-item">
  <Accordion.Header>
    <Accordion.Trigger
      classNames={{ root: 'fare-trigger' }}
      slotProps={{ root: { 'aria-describedby': 'fare-help' } }}
    >
      Fare rules
      <Accordion.Indicator />
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>Changes may include a fee.</Accordion.Content>
</Accordion.Item>
```

Available slot names differ by component part. Use the API table on each
component page rather than guessing a slot name.

## Stable selectors

The wrappers preserve two selector families:

- Canonical `tk-*` classes connect components to Takeoff token recipes.
- `data-slot` identifies the rendered part, such as `root`, `indicator`, or
  `icon`.

Components also expose documented state attributes such as `data-size`,
`data-variant`, `data-disabled`, or `data-invalid` where applicable.

```css
.booking-form [data-slot='root'][data-invalid] {
  outline: 2px solid var(--states-danger-base);
}
```

Only rely on attributes listed in the component's **Data attributes** table.
Internal DOM structure is not a public styling contract.

## Precedence rules

Component props resolve from lowest to highest priority:

1. Library-authored defaults
2. Provider `components` defaults
3. Instance props

Classes are concatenated rather than replaced: canonical class, provider class,
then instance class. `slotProps` are shallow-merged, while canonical wrapper
attributes such as `data-slot` and component-owned state hooks remain
authoritative.

## Preserve accessibility behavior

Compound parts are not decorative wrappers. Triggers, labels, content panels,
and portal surfaces establish keyboard and ARIA relationships. Keep the
documented parts in place, provide visible labels, and use consumer-supplied
icons as decorative content unless they carry meaning not present in text.

Component pages describe their specific keyboard model and labeling requirements
under **Accessibility & Keyboard**.

See [Theming & tokens](./theming) for color mode, token bundles, and shared
provider defaults.
