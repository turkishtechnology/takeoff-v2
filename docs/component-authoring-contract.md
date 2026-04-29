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
- `activeIndex`
- `visible`
- `allowMultiple`
- `arrowPosition`
- `expandIcon`
- `collapseIcon`
- `hideArrows`
- `invalid`
- `loading`
- `clearable`

React Spar should preserve this vocabulary unless there is a strong
React-specific reason not to.

### React owns framework ergonomics

Preserve Takeoff Core product vocabulary, not Web Component mechanics.

Map these directly when Spar supports them:

```txt
activeIndex
allowMultiple
itemKey
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
tk-active-index-change -> onActiveIndexChange
initial active state   -> defaultActiveIndex
slots                  -> compound components
```

Do not expose Web Component-only shortcuts when React has a clearer shape:

```txt
Accordion.Item active
Accordion.Item header
slot="header"
slot="content"
onTkActiveIndexChange
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
    allowMultiple={allowMultiple}
    activeIndex={activeIndex}
    defaultActiveIndex={defaultActiveIndex}
    onActiveIndexChange={onActiveIndexChange}
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

Accordion item identity is `itemKey`.

React examples and public types should require `Accordion.Item itemKey` so
controlled root props (`activeIndex`, `defaultActiveIndex`) have a stable
target. Spar may keep a runtime fallback for JavaScript or low-level usage, but
takeoff-spar should guide TypeScript consumers toward explicit identity.

Accordion uses `data-open` as the public open-state hook.

`Accordion.Item` and `Accordion.Content` both emit `data-open` when open.
takeoff-design recipes key open-state CSS off this attribute instead of Spar's
`data-state` so rules stay attached when `forceMount` keeps closed panels in
the DOM.

`AccordionItem` mirrors Spar's active-index match in a `useMemo` because the
attribute is set on `<SparAccordionItem>` itself, before Spar's item context is
visible. Both `data-open` writes (item + content) are intentional. Do not
collapse the duplication.

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
  activeIndex?: AccordionActiveIndex;
  defaultActiveIndex?: AccordionActiveIndex;
  onActiveIndexChange?: (next: AccordionActiveIndex) => void;
  allowMultiple?: boolean;
  type?: AccordionType;
  mode?: AccordionMode;
  size?: AccordionSize;
}
```

If Spar and takeoff-spar props are identical after upstream alignment, pass them
through directly.

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
