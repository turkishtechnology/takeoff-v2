# Component Authoring Contract

This document defines how `@takeoff-ui/react-spar` components are designed and
reviewed.

The package is not a second design system. It is a React wrapper layer for
Takeoff components built on top of Spar primitives.

## Layer responsibilities

### Takeoff Core owns product vocabulary

Takeoff Core defines product-facing names and visual language:

- `variant`
- `type`
- `size`
- `mode`
- `activeIndex` (Core Accordion only; React Spar uses `value`)
- `visible`
- `multiple`
- `arrowPosition`
- `expandIcon`
- `collapseIcon`
- `hideArrows`
- `invalid`
- `loading`
- `clearable`

React Spar should preserve this vocabulary unless there is a strong
React-specific reason not to.

Accordion is an approved exception: React Spar uses the cleaner primitive
`value` / `defaultValue` / `onValueChange` API and `Accordion.Item value`
instead of the Takeoff Core active-index and item-key names.

### React owns framework ergonomics

Preserve Takeoff Core product vocabulary, not Web Component mechanics.

Map these directly when Spar supports them:

```txt
multiple
type
mode
size
arrowPosition
expandIcon
collapseIcon
hideArrows
```

Translate framework mechanics into React conventions:

```txt
tk-active-index-change -> onValueChange
initial open value     -> defaultValue
slots                  -> compound components
```

Do not expose Web Component-only shortcuts when React has a clearer shape:

```txt
Accordion.Item active
Accordion.Item header
slot="header"
slot="content"
custom active-index DOM events
```

If mapping is only prop naming or event naming, keep it inline or fix Spar so
the wrapper can pass the prop through. Do not create an adapter hook for this.

### Spar owns behavior

Spar owns:

- controlled/uncontrolled state
- keyboard behavior
- focus behavior
- ARIA wiring
- item registration
- open/closed logic
- disabled/readOnly behavior

If Spar behavior or API is wrong, fix Spar first. Do not hide the problem inside
a takeoff-spar adapter hook.

### takeoff-spar owns visual wrapping

takeoff-spar owns:

- `tk-*` class names
- `data-*` styling hooks
- Takeoff visual props
- decorative slots
- icon rendering
- public React component anatomy

takeoff-spar should be thin.

---

## No adapter hook rule

Do not create hooks like:

```txt
useAccordionAdapter
useButtonAdapter
useDialogAdapter
useInputAdapter
```

unless there is a real React reason:

- internal state
- effect
- ref
- context
- subscription
- layout measurement
- lifecycle coordination

Prop mapping is not a hook.

Value normalization is not a hook.

Class name generation is not a hook.

If a wrapper needs a large adapter hook, first ask whether Spar should be fixed.

Allowed alternatives:

```txt
pure helper function
inline mapping
upstream Spar API change
```

Preferred:

```txt
fix Spar -> keep takeoff-spar thin
```

---

## Upstream-first rule

When takeoff-spar needs to translate behavior-heavy props, use this decision
order:

1. Can Spar expose the correct primitive API directly?
2. Can Spar support the Takeoff-compatible name as the primary or alias API?
3. Can takeoff-spar pass the prop through directly?
4. Only then consider a tiny pure helper.
5. Do not create an adapter hook unless React lifecycle/state/ref/effect is
   required.

Example:

Bad:

```tsx
const sparProps = useAccordionAdapter(props);
return <SparAccordion {...sparProps} />;
```

Good:

```tsx
return (
  <SparAccordion
    multiple={multiple}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
  />
);
```

If Spar does not support this, fix Spar first.

---

## Compound component rule

Expose public compound components only for meaningful anatomy.

Public compound parts usually include:

```txt
Accordion.Item
Accordion.Header
Accordion.Trigger
Accordion.Content

Dialog.Trigger
Dialog.Panel
Dialog.Header
Dialog.Title
Dialog.Description
Dialog.Body
Dialog.Footer
Dialog.CloseButton

Input.Label
Input.Field
Input.Description
Input.ErrorMessage
```

Do not expose decorative pieces by default.

Usually internal:

```txt
Accordion.Arrow
Button.Spinner
Button.Label wrapper span
Input.Spinner
Input.ClearIcon
Dialog.SignIcon
```

A decorative part may become public only if at least one is true:

1. Consumers must place it manually.
2. It owns accessibility semantics.
3. It has independent behavior.
4. It is a public Takeoff Core slot.
5. Product/design explicitly requires manual anatomy control.

---

## Accordion-specific decision

Accordion arrow is internal.

Takeoff Core controls arrow through root props:

```tsx
<Accordion
  arrowPosition="right"
  expandIcon={<ChevronDown />}
  collapseIcon={<ChevronUp />}
  hideArrows={false}
/>
```

Do not require:

```tsx
<Accordion.Trigger>
  Title
  <Accordion.Arrow />
</Accordion.Trigger>
```

The trigger renders an internal arrow slot with stable styling hooks.

Accordion item identity is `value`.

React examples and public types should require `Accordion.Item value` so
controlled root props (`value`, `defaultValue`) have a stable target.

Accordion open state comes from Spar.

`Accordion.Item` and `Accordion.Content` expose Spar's `data-state="open"` /
`data-state="closed"` when they render. Do not mirror the same state with
wrapper-owned state attributes or local value matching.

---

## Wrapper boilerplate

Single-slot wrappers use `composeRootAttrs` from `core/`. It runs the merge
every wrapper needs: layer
`(author defaults → theme defaults → instance props)`, then compose the
canonical root-slot attrs (`data-slot`, `tk-*` class, theme/instance overrides).
Returns the attrs and the leftover props with the layering keys (`className`,
`classNames`, `slotProps`) already stripped.

```tsx
export const Header = (props: HeaderProps) => {
  const theme = useComponentTheme('Header');
  const { rootAttrs, rest } = composeRootAttrs(HeaderBase, props, theme);
  const { children, ...spar } = rest;

  return (
    <SparHeader {...spar} {...rootAttrs}>
      {children}
    </SparHeader>
  );
};
```

Do not inline the `resolveProps` + `buildSlotAttrs` chain. Any contract change
(slotProps precedence, theme-className shortcut, etc.) lives in one place.

`composeRootAttrs` takes `theme` as a parameter. Wrappers call
`useComponentTheme(...)` themselves so the theme dependency stays visible at the
top of the function and the helper stays pure (no context read or React state
inside).

---

## Default placement

Visual defaults live at the destructure site of the consuming wrapper, not in
`base.defaultProps`:

```tsx
const { type = 'grouped', size = 'base', ... } = rest;
```

Single source of truth, next to the prop it fills, narrowed by TypeScript.

---

## Component structure

Keep component files small and direct.

Recommended structure:

```txt
components/<component>/
  <Component>.tsx
  <Component>Base.ts
  types.ts
  index.ts
  <Component>.test.tsx
```

Only add extra files when they remove real complexity.

Do not add `use<Component>Adapter.ts` by default.

---

## Public type rule

Do not expose full Spar props through wrapper public types.

Avoid:

```ts
type AccordionProps = SparAccordionProps & AccordionOwnProps;
```

Prefer explicit props:

```ts
interface AccordionProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'classNames' | 'defaultValue' | 'onChange'
> {
  value?: AccordionCurrentValue;
  defaultValue?: AccordionCurrentValue;
  onValueChange?: (next: AccordionCurrentValue) => void;
  multiple?: boolean;
  type?: AccordionType;
  mode?: AccordionMode;
  size?: AccordionSize;
}
```

If Spar and takeoff-spar props are identical after upstream alignment, pass them
through directly.

---

## Docs demos

Each component page in `apps/docs` has exactly one editable demo. It is named
`Playground` and uses `<LiveCode>` with default `editable={true}`. Authors run
prettier on its source at runtime, so the source string can stay in
template-literal-friendly indentation, but keep it readable in source too.

All other demos on the page are display-only and pass `editable={false}`. They
still render the live preview, but skip the editable textarea, prettier
formatting, and reset/error tooling. Pre-format their source strings the way
they should appear; runtime prettier does not run on them.

If Prettier would rewrite visible demo source strings, wrap the demo constants
block with MDX `<!-- prettier-ignore-start -->` /
`<!-- prettier-ignore-end -->`.

The `Usage` anatomy snippet should show component tags only. Do not include
props, sample content, or state wiring there; put those in dedicated demo
sections.

This keeps each page weight bounded — one editable surface per component instead
of one per example — without losing the rendered preview for the supporting
demos.

---

## Review checklist

A component is not ready unless:

- Spar behavior is correct upstream.
- takeoff-spar does not hide Spar behavior problems.
- Public API preserves Takeoff vocabulary.
- React callbacks use React naming.
- Public types do not leak unwanted Spar props.
- Decorative pieces are internal unless explicitly justified.
- Tests cover controlled and uncontrolled usage.
- Tests cover callback payload shape.
- Tests cover styling hooks.
- Tests cover accessibility happy path.
