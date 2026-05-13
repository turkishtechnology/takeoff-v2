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

Public component types must **not** extend full Spar prop types.

```ts
// Bad — leaks every Spar prop into the public API
type AccordionProps = SparAccordionProps & AccordionOwnProps;

// Good — explicit, intentional surface
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

The wrapper is a public contract. Spar's prop surface can grow, shrink, or
rename freely; the wrapper must not propagate those changes silently to
consumers. If Spar and takeoff-spar props are identical after upstream
alignment, pass them through by name — never by spread of an `&`-extended type.

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
- [ ] Decorative compound parts are internal unless a justification criterion is
      met and recorded
- [ ] Composition archetype (Inherited / React-enhancement / Bypass) is
      classified for every compound part — see
      [Coding Standards → Composition archetypes](../packages/react-spar/docs/coding-standards.md#composition-archetypes)
- [ ] Tests cover controlled and uncontrolled usage
- [ ] Tests cover callback payload shape
- [ ] Tests cover documented styling hooks (`data-*`, `tk-*`)
- [ ] Tests cover the accessibility happy path (`axe`)
