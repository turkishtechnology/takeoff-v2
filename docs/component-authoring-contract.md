# Component Authoring Contract

This document defines **how `@takeoff-ui/react-spar` components are designed and
reviewed**. It is the single source of truth for layer responsibilities, the
upstream-first rule, the no-adapter-hook rule, the public compound parts policy,
and the merge gate.

The package is not a second design system. It is a React wrapper layer for
Takeoff components built on top of Spar primitives.

## Document scope

This contract is **layer-policy, not implementation detail**. It governs what
each layer owns, what wrappers may and may not do, and which rules block a
merge.

Implementation specifics — file layout, naming conventions, slot vocabulary, the
`composeRootAttrs` / `buildSlotAttrs` API, testing stack, docs demos mechanics —
live in the package-local
[Coding Standards](../packages/react-spar/docs/coding-standards.md). If a rule
appears in both documents, **this one wins**.

## Layer responsibilities

Four layers, in dependency order: Takeoff Core → Spar → takeoff-spar → React.
Each layer owns a disjoint slice of the contract. A wrapper that reaches into
another layer's slice is a contract violation.

### Takeoff Core owns product vocabulary

Takeoff Core defines product-facing names and the visual language. React Spar
preserves this vocabulary unless there is a strong React-specific reason not to.

Canonical names that React Spar must preserve:

```txt
variant   type   size   mode
visible   multiple
arrowPosition   expandIcon   collapseIcon   hideArrows
invalid   loading   clearable
```

**Approved exception — Accordion:** React Spar uses the cleaner primitive
`value` / `defaultValue` / `onValueChange` API and `Accordion.Item value`
instead of Core's `activeIndex` and item-key names. New exceptions require an
explicit decision in the component contract.

### Spar owns behavior

Spar owns:

- controlled/uncontrolled state reconciliation
- keyboard behavior
- focus management
- ARIA wiring
- item registration
- open/closed logic
- disabled/readOnly semantics

If Spar behavior or API is wrong, **fix Spar first**. Do not hide the problem
inside a takeoff-spar adapter hook.

### takeoff-spar owns visual wrapping

takeoff-spar owns:

- `tk-*` class names
- `data-*` styling hooks
- Takeoff visual props
- decorative slots
- icon rendering
- public React component anatomy

takeoff-spar should be thin. Visual chrome only — never behavior
re-implementation.

### React owns framework ergonomics

Preserve Takeoff Core product vocabulary, **not** Web Component mechanics.

Map these props directly when Spar supports them: `multiple`, `type`, `mode`,
`size`, `arrowPosition`, `expandIcon`, `collapseIcon`, `hideArrows`.

Translate framework mechanics into React conventions:

| Web Component            | React                 |
| ------------------------ | --------------------- |
| `tk-active-index-change` | `onValueChange`       |
| initial open value attr  | `defaultValue`        |
| `slot="header"`          | compound subcomponent |
| custom DOM events        | `on*` callback prop   |

Do not expose Web Component-only shortcuts when React has a clearer shape (e.g.
`Accordion.Item active`, `slot="content"`, custom active-index DOM events).

If a mapping is only prop renaming or event renaming, **keep it inline or fix
Spar so the wrapper can pass the prop through**. Do not create an adapter hook
for renaming alone.

## Upstream-first rule

When takeoff-spar would need to translate behavior-heavy props, follow this
decision order:

1. Can **Spar** expose the correct primitive API directly?
2. Can **Spar** support the Takeoff-compatible name as the primary or alias API?
3. Can **takeoff-spar** pass the prop through directly?
4. Only then consider a **tiny pure helper**.
5. Adapter hooks are forbidden by default — see No adapter hook rule below.

### No adapter hook rule

Do not create adapter hooks like `useAccordionAdapter`, `useButtonAdapter`,
`useDialogAdapter`, `useInputAdapter`.

An adapter hook is permitted **only** when there is a real React reason:

- internal state
- effect
- ref
- context
- subscription
- layout measurement
- lifecycle coordination

The following are explicitly **not** reasons to introduce an adapter hook:

- prop renaming or mapping → use inline mapping or fix Spar
- value normalization → use a pure helper
- class name generation → use `composeRootAttrs`
- "the wrapper got long" → break out subcomponents, don't introduce a hook

If a wrapper appears to need a large adapter hook, first ask whether **Spar
should be fixed instead**. The preferred outcome is always: fix Spar → keep
takeoff-spar thin.

Example:

```tsx
// Bad — hides the mapping inside a hook with no React lifecycle reason
const sparProps = useAccordionAdapter(props);
return <SparAccordion {...sparProps} />;

// Good — direct pass-through, behavior owned by Spar
return (
  <SparAccordion
    multiple={multiple}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
  />
);
```

If Spar does not support this shape, the fix is upstream — not a wrapper hook.

## Compound component rule

Expose public compound components **only for meaningful anatomy**.

### Public by default

Compound parts that compose anatomy, own semantics, or anchor a documented slot
are public:

```txt
Accordion.Item   Accordion.Header   Accordion.Trigger   Accordion.Content

Dialog.Trigger   Dialog.Panel    Dialog.Header   Dialog.Title
Dialog.Description   Dialog.Body   Dialog.Footer   Dialog.CloseButton

Input.Label   Input.Field   Input.Description   Input.ErrorMessage
```

### Internal by default

Decorative ornaments are **internal** unless they meet a justification criterion
below:

```txt
Accordion.Arrow   Button.Spinner   Button.Label wrapper span
Input.Spinner   Input.ClearIcon   Dialog.SignIcon
```

### Justification for promoting a decorative part to public

A decorative part may become public **only** if at least one of these is true:

1. Consumers must place it manually for the anatomy to render correctly.
2. It owns accessibility semantics (focus target, labelling).
3. It has independent behavior (its own controlled state, event surface).
4. It is a public Takeoff Core slot that consumers expect to compose.
5. Product or design explicitly requires manual anatomy control.

"Some consumer might want to customize it" is **not** a justification — that is
what `slotProps`, `classNames`, and theme overrides are for. Promoting a
decorative part is a contract change and must be approved in the component
contract before implementation.

## Public type boundary

Public component types must **not** extend full Spar prop types directly.

Use `Pick<SparFooProps, ...>` to selectively inherit Spar props that this layer
intentionally exposes. This keeps the API surface explicit while staying in sync
with Spar's type definitions.

```ts
// Bad — leaks every Spar prop into the public API
type AccordionProps = SparAccordionProps & AccordionOwnProps;

// Bad — manually duplicates Spar's type definitions
interface TooltipProps {
  open?: boolean; // duplicated from Spar
  onOpenChange?: (open: boolean) => void; // duplicated from Spar
}

// Good — explicit, intentional surface, DRY with Spar
interface TooltipProps extends Pick<
  SparTooltipProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'delay' | 'hideDelay' | 'disabled'
> {
  children?: ReactNode;
}
```

The wrapper is a public contract. `Pick` ensures only chosen props are exposed
while keeping type definitions in sync with Spar — if a Spar prop type changes,
the wrapper inherits it automatically.

### Intent comment above every `Pick<>`

Every `Pick<SparFooProps, ...>` clause must be preceded by a short comment
explaining **why these props and not others**. This is the rationale that used
to live in the now-removed `sparBehaviorProps` config; without it, future
readers cannot tell whether an unlisted Spar prop was forgotten or excluded on
purpose. Keep the comment to 1–3 lines.

```ts
// Good — intent is captured in code
interface DrawerProps
  // Dialog root identity, controlled state, and trigger disable. Other Spar
  // Dialog root props (e.g. `modal`) are intentionally not exposed — the
  // Drawer's modality is part of its visual contract, not a consumer knob.
  extends Pick<
    SparDialogProps,
    'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled'
  > {}
```

Naming the **excluded** props (or families of them) is more valuable than
listing the included ones — the type itself already names the included ones.

### Renaming follows Spar

When Spar renames a behavior prop (e.g. `pressed` → `isPressed`, or `loading` →
`isLoading`), the wrapper follows verbatim. Do not preserve the old name as a
wrapper-local alias, and do not coin a wrapper-local synonym ("`loading` here,
`isLoading` there"). Pre-release, this is a silent change; post-release, it
requires a migration note.

### Polymorphism: `as` prop, no `asChild`

Every wrapper Props type that renders DOM must be **polymorphic** via Spar's
`PolymorphicProps<TDefault, T, OwnProps>`. The wrapper preserves Spar's `as`
prop and the polymorphic generic; consumers can render
`<Accordion as="section">`, `<Button as="a" href="...">`, etc.

```ts
import type { PolymorphicProps } from '@turkish-technology/spar';

interface AccordionOwnProps {
  type?: AccordionType;
  classNames?: ClassNamesMap<AccordionSlot>;
  slotProps?: SlotPropsMap<AccordionSlot>;
}

export type AccordionProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  AccordionOwnProps &
    // Spar Accordion root state & a11y surface. Visual concerns are in
    // AccordionOwnProps above, not picked.
    Pick<
      SparAccordionProps,
      | 'multiple'
      | 'value'
      | 'defaultValue'
      | 'onValueChange'
      | 'collapsible'
      | 'disabled'
      | 'orientation'
    >
>;
```

The wrapper component itself is generic:

```ts
export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  // Cast to default-element shape for internal destructuring; the `as` prop
  // flows through `...sparProps` and the consumer's `T` is preserved at the
  // call site via the prop type.
  const { ... } = props as AccordionProps<'div'>;
  // ...
};
```

`asChild` is **not** supported because Spar does not implement it. If a consumer
needs `asChild` semantics, fix Spar first (upstream-first rule), then expose it
through the wrapper.

State-only roots that render no DOM (e.g. `Tooltip`, `Drawer` root) are exempt
from polymorphism — they accept no `as`, no native HTML props, and **no styling
layers** (`className`, `classNames`, `slotProps`). There is no rendered element
to receive any of these, so adding them is a silent contract bug: the values are
swallowed by the underlying state-only Spar primitive and never reach the DOM.
State-driven styling hooks (`data-placement`, `data-disabled`, …) belong on the
child DOM-rendering parts (`Drawer.Panel`, `Tooltip.Content`, …) where they
actually have a DOM target.

State-only roots also skip `composeRootAttrs`. Read theme `defaultProps`
directly and register the root with `StateOnlyComponentThemeConfig` (which
exposes only `defaultProps`):

```ts
declare module '@takeoff-ui/react-spar' {
  interface ComponentThemeRegistry {
    Drawer: StateOnlyComponentThemeConfig<DrawerProps>;
  }
}

export const Drawer = (props: DrawerProps) => {
  const theme = useComponentTheme('Drawer');
  const merged = { ...theme?.defaultProps, ...props };
  const { placement = 'right', children, ...sparProps } = merged;
  return (
    <DrawerProvider value={{ placement }}>
      <SparDialog {...sparProps}>{children}</SparDialog>
    </DrawerProvider>
  );
};
```

### Render-prop children where Spar provides them

When a Spar trigger/close component accepts function-as-children for state
access (e.g. `DialogTrigger`, `DialogClose`, `CollapsibleTrigger`), the wrapper
picks `children` from the Spar type so the function form flows through:

```ts
export type DrawerTriggerProps<T extends ElementType = 'button'> =
  PolymorphicProps<
    'button',
    T,
    DrawerTriggerOwnProps &
      // Trigger surface from Spar. `children` is picked so it accepts both
      // ReactNode and the render-prop function form for accessing open/close
      // state without a separate hook.
      Pick<SparDialogTriggerProps, 'children'>
  >;
```

Render-prop children are **not** exposed on wrapper subcomponents whose visual
chrome (icon, arrow, title-wrap) is invariant — exposing a function child there
would conflict with the wrapper-owned anatomy. Example: `AccordionTrigger` does
**not** expose render-prop children because the wrapper always renders arrow +
icon + title around the consumer's content.

### Standard HTML omit set

`@takeoff-ui/react-spar` exports a `TakeoffSlotOverrides` constant
(`'classNames' | 'slotProps'`) and a `TakeoffHTMLProps<T>` alias that applies
it. Use `TakeoffHTMLProps<T>` for **non-polymorphic** wrappers (rare). For
polymorphic wrappers (the default), `PolymorphicProps` already omits these keys
automatically via `keyof Props`, provided `classNames` and `slotProps` are
declared in the OwnProps interface — which is the required pattern.

For naming, slot vocabulary, callback conventions, and the `composeRootAttrs` /
`buildSlotAttrs` API, see
[Coding Standards](../packages/react-spar/docs/coding-standards.md).

## Review checklist

A component is not ready to merge unless:

- [ ] Spar behavior is correct upstream — no behavior re-implemented in the
      wrapper
- [ ] takeoff-spar does not hide a Spar behavior problem inside an adapter or
      helper
- [ ] No adapter hook was introduced, or the React lifecycle/state/ref/effect
      reason is documented and approved
- [ ] Public API preserves Takeoff Core vocabulary
- [ ] React callbacks use React `on*` naming, not Web Component event names
- [ ] Public types do not extend full Spar prop types
- [ ] DOM-rendering wrappers are polymorphic via
      `PolymorphicProps<TDefault, T, OwnProps>`; `classNames`/`slotProps` are
      declared in OwnProps
- [ ] Render-prop children are picked from Spar where Spar provides them,
      **except** on wrappers with invariant visual chrome
- [ ] Decorative compound parts are internal unless a justification criterion is
      met and recorded
- [ ] Composition archetype (Inherited / React-enhancement / Bypass) is
      classified for every compound part — see
      [Coding Standards → Composition archetypes](../packages/react-spar/docs/coding-standards.md#composition-archetypes)
- [ ] Tests cover controlled and uncontrolled usage
- [ ] Tests cover callback payload shape
- [ ] Tests cover documented styling hooks (`data-*`, `tk-*`)
- [ ] Tests cover the accessibility happy path (`axe`)
