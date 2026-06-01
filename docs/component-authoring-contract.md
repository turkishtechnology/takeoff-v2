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
invalid   loading   clearable
```

**Approved exceptions:**

- **Accordion behavior**: React Spar uses the cleaner primitive `value` /
  `defaultValue` / `onValueChange` API and `Accordion.Item value` instead of
  Core's `activeIndex` and item-key names.
- **Accordion indicator**: Core's `arrowPosition` / `expandIcon` /
  `collapseIcon` / `hideArrows` are dropped in favor of the opt-in
  `<Accordion.Indicator>` compound, which carries its own children (incl. a
  `({ isOpen }) => ReactNode` render-prop) and is positioned by placement.
- **Icon slots**: Core's `startIcon` / `endIcon` (Button) collapse into the
  generic `startContent` / `endContent` slot vocabulary (also used by
  `Accordion.Trigger.startContent`). Input keeps explicit `Input.LeadingIcon` /
  `Input.TrailingIcon` compound parts because its anatomy also includes text
  affixes and action buttons.
- **Input modes as composition**: Core's Input `mode` (`text` / `password` /
  `counter` / `number` / `chips`) and the `clearable` / `loading` / `visible`
  flags are **not** props on the React Spar compound. The compound is
  **mode-less**: each capability is expressed by composing parts —
  `Input.ClearButton` (clearable), `Input.Spinner` (loading),
  `Input.RevealButton` (password visible), `Input.Stepper` / `Input.Decrement` /
  `Input.Increment` (number), the same buttons placed flanking the field
  (counter), and `Input.Chips` / `Input.Chip` (chips). Rationale: Spar's Input
  is a scalar headless primitive with no `mode`; composition keeps the wrapper
  thin and the anatomy explicit. The number stepper and chips have their own
  contracts below.

New exceptions require an explicit decision in the component contract.

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
`size`. See the icon-slot exception above for `startContent` / `endContent`,
`Input.LeadingIcon` / `Input.TrailingIcon`, and `<Accordion.Indicator>`.

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

Field.Label   Field.Description   Field.ErrorMessage

Input.Field   Input.Prefix   Input.Suffix
Input.LeadingIcon   Input.TrailingIcon
Input.ClearButton   Input.RevealButton   Input.Spinner   Input.Strength
Input.Stepper   Input.Decrement   Input.Increment
```

### Internal by default

Decorative ornaments are **internal** unless they meet a justification criterion
below:

```txt
Accordion.Arrow   Button.Spinner   Button.Label wrapper span
Input.ClearIcon glyph   Input.Spinner glyph   Dialog.SignIcon
```

`Input.ClearButton` and `Input.RevealButton` are public because they are
focusable controls with their own accessibility semantics. `Input.Spinner` and
`Input.Strength` are public because the design requires consumers to place these
optional input anatomy parts explicitly.

`Input.Stepper`, `Input.Decrement`, and `Input.Increment` are public for number
inputs because the stepper is meaningful anatomy and the increment/decrement
buttons are focusable controls with their own accessibility labels. The
**counter** look (Core `mode='counter'`) is not a separate part set: it is the
same `Input.Decrement` / `Input.Increment` placed as **direct children flanking
`Input.Field`** (outside `Input.Stepper`). The recipe keys on that placement to
center the value and keep the buttons' brand colour, so no `mode`/`data-counter`
flag is introduced.

`Input.Chips` and `Input.Chip` are public for chips inputs: `Input.Chips` owns
the tag array (a focusable region with its own state) and `Input.Chip` is a
removable token whose remove control is a focusable, labelled button.

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

### Input number stepper contract

This contract covers the Phase 2 Input number stepper parts.

| Decision area             | Contract                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behavior owner            | Native `HTMLInputElement` number behavior owns min/max/step parsing, clamping, decimal math, formatting, keyboard, wheel, and `spinbutton` semantics. Spar owns `disabled` / `readOnly` field state through `useInputContext()`. takeoff-spar only provides visual anatomy and invokes native stepping. |
| Public API                | Consumers compose `<Input.Stepper><Input.Decrement /><Input.Increment /></Input.Stepper>` next to `<Input.Field type="number" min={1} max={9} step={1} />`.                                                                                                                                             |
| Public parts              | `Input.Stepper` is the structural owner for the two controls. `Input.Decrement` calls `fieldRef.current.stepDown()`. `Input.Increment` calls `fieldRef.current.stepUp()`. Both dispatch `new Event('input', { bubbles: true })` after stepping and then focus the field.                                |
| Internal decorative slots | Default decrement/increment glyphs are internal. Consumers customize button contents through children or DOM hooks through `classNames` / `slotProps`; no glyph subcomponents are exposed.                                                                                                              |
| Upstream Spar changes     | None required. Spar `InputField` already passes native props such as `type`, `min`, `max`, `step`, and `inputMode` to the rendered input; native `stepUp()` / `stepDown()` covers the behavior.                                                                                                         |
| Explicit non-goals        | No clamp/parse/decimal math/formatter, no hold-to-repeat, no wheel handling, no keyboard override, no custom `role="spinbutton"` / ARIA model, no adapter hook, and no speculative state `data-*` attributes.                                                                                           |
| Implementation order      | 1. Add the contract. 2. Add public types/base entries/compound exports/slot registry. 3. Implement thin stepper parts. 4. Add styles. 5. Add behavior and slot tests. 6. Update docs/API tables and changeset.                                                                                          |
| Blockers                  | If native stepping cannot dispatch the same React-visible input/change path used by controlled fields, stop and fix the event bridge instead of adding wrapper-owned number math.                                                                                                                       |

### Input chips contract

This contract covers the Input chips parts (Core `mode='chips'`).

| Decision area             | Contract                                                                                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behavior owner            | `Input.Chips` is a **react-enhancement** that owns the tag array as internal state (Spar has no array/chips primitive, so this is a permitted React reason — see No adapter hook rule). Spar owns `disabled` / `readOnly` via `useInputContext()`. The committed value is `string[]`. |
| Public API                | `<Input.Chips value={tags} onValueChange={setTags} separator="," max={5}>` placed next to `<Input.Field />`. Enter commits the trimmed field text as a tag and clears the field; Backspace on an empty field removes the last tag; an optional `separator` char also commits.         |
| Public parts              | `Input.Chips` (state owner + chip-list region; attaches its key handling to the shared `fieldRef` so `Input.Field` stays generic). `Input.Chip` (removable token; the remove control is a real `<button>` with an `aria-label`).                                                      |
| Internal decorative slots | The default chip remove glyph is internal; consumers customize via `Input.Chip` children / `classNames` / `slotProps`. No glyph subcomponents are exposed.                                                                                                                            |
| Upstream Spar changes     | None required for v1. `useControlledState` is mirrored locally as `useControllableState` because Spar does not re-export it; a follow-up may add the export upstream.                                                                                                                 |
| Explicit non-goals (v1)   | No object-array values, no `chipLabelKey` / `chipOptions` / `chipDisabled` (tk-select-coupled), no paste-splitting, no `aria-live` announcements, no masking, no adapter hook, and no speculative state `data-*`.                                                                     |
| Implementation order      | 1. Add the contract. 2. Add `useControllableState`. 3. Add public types/base/context/compound exports/slot registry. 4. Implement `Input.Chips` + `Input.Chip`. 5. Add styles (chip token + wrap layout). 6. Update docs/API tables and changeset.                                    |
| Blockers                  | If committing/removing a tag cannot dispatch the same React-visible input path used elsewhere, stop and fix the event bridge instead of forking the value model.                                                                                                                      |

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
