# React Spar Coding Standards

This document explains how we build components under
`packages/react-spar/src/components`.

`@takeoff-ui/react-spar` is a React adapter layer on top of
`@turkish-technology/spar`, not a second component framework. Every component is
authored as a **compound surface**: a root that owns state plus a fixed list of
named subcomponents that own structure. The standards below keep that model
consistent across the package.

Consistency goals:

- idiomatic React APIs for consumers
- preserved Spar behavior and accessibility
- stable styling hooks for Takeoff recipes and docs

## Folder Structure

Each component directory should contain:

```plaintext
component-name/
├── ComponentName.tsx          # Root + all compound subcomponents (Object.assign export)
├── ComponentNameBase.ts       # Slots, class names, defaults, context, helpers
├── useComponentNameAdapter.ts # State translation hook (when needed)
├── types.ts                   # Public types for the root and every subcomponent
├── ComponentName.test.tsx     # Tests covering the compound surface
└── index.ts                   # Local barrel
```

Large families (Accordion, Dialog, Input) often benefit from a single
`ComponentName.tsx` that declares every subcomponent and exports the compound
surface via `Object.assign`. Split into separate files only when the single file
becomes hard to read.

Rules:

- Folder names use `kebab-case`.
- Component files and exports use `PascalCase`.
- Not every component needs an adapter hook. Add one when the root must
  reconcile controlled and uncontrolled state, normalize values, or build shared
  context that drives the subcomponents.
- Every component **does** ship compound subcomponents. Even leaf controls
  (Button, Checkbox) expose at minimum a `Label` and adornment subcomponents so
  the content surface stays structural, not prop-driven.
- `ComponentNameBase.ts` is the source of truth for slot names, emitted class
  names, default props, and the context hook that subcomponents consume.
- Export the root from the local barrel and from `src/components/index.ts`.
  Subcomponents are reached exclusively via the root (`Button.Label`,
  `Dialog.Header`, …), not via direct named exports.
- Mirror slot classes into `src/styling/slot-registry.ts` (the generator script
  does this automatically when scaffolding a new component).
- Prefer the generator script when scaffolding a new component:

```bash
pnpm --filter @takeoff-ui/react-spar generate Tooltip
```

## Compound-Only Baseline

Every component ships a root plus compound subcomponents. That is the only
authoring model. Concretely:

- The root accepts **state props only**: variant/size/type/mode flags,
  controlled/uncontrolled value pairs, lifecycle callbacks, and native HTML
  attributes that target the root element.
- Content, icons, descriptions, error messages, spinners, footers, masks, close
  buttons, and every other structural or content-bearing piece live in
  **compound subcomponents** (`Root.Label`, `Root.LeadingIcon`, `Root.Icon`,
  `Root.Description`, `Root.ErrorMessage`, `Root.Spinner`, `Root.Header`,
  `Root.Body`, `Root.Footer`, `Root.CloseButton`, `Root.Mask`, `Root.Panel`, and
  so on).
- Subcomponents share state with the root through **context**, not props. For
  example, `Input.Asterisk` only renders when `required` is true on the root;
  `Input.ErrorMessage` only renders when `invalid` is true; `Button.Spinner`
  only renders when `loading` is true.
- **Do not** add flat content props (`label`, `header`, `subheader`, `icon`,
  `leadingIcon`, `description`, `error`, `footerActions`, `spinner`,
  `containerSlot`, `headerSlot`, `contentSlot`, `footerSlot`). Translate them
  into subcomponents.
- **Do not** add render-override props (`renderIcon`, `renderSpinner`,
  `renderLeadingIcon`, `renderTrailingIcon`, `renderClearIcon`,
  `renderCloseIcon`, `renderSignIcon`). Consumers override by passing children
  to the relevant subcomponent. The canonical owner node is always preserved by
  the subcomponent.

When a subcomponent needs to expose render-time state to consumers, use
function-as-children:
`<Checkbox.Icon>{({ checked, indeterminate }) => …}</Checkbox.Icon>`.

## Naming Conventions

### Component, file, and type names

- Public root components use `PascalCase`: `Button`, `Accordion`, `Input`.
- Subcomponents are attached to the root via `Object.assign` and exported as
  part of the root's compound surface: `Button.Label`, `Accordion.Item`,
  `Dialog.Header`, etc. Their `displayName` follows the dotted form
  (`displayName = 'Dialog.Header'`).
- Base objects use `ComponentNameBase`.
- Adapter hooks use `useComponentNameAdapter`.
- Public props and type aliases live in `types.ts`. Each subcomponent has its
  own props interface (`ButtonLabelProps`, `DialogHeaderProps`, ...).
- Internal helper names should describe the domain behavior they own, such as
  `encodeAccordionItemValue` or `normalizeAccordionItemKeys`.

### Slot names and emitted classes

- Slot keys in `*Base.ts` use `lowerCamelCase`.
- Rendered `data-slot` values use `kebab-case`.
- Emitted class names use stable `tk-*` selectors.
- Slot arrays and class name maps should be `as const` and satisfy
  `SlotClassNames<...>`.

Example:

```ts
export const buttonSlots = [
  'root',
  'label',
  'leadingIcon',
  'trailingIcon',
  'spinner',
] as const;

export const buttonClassNames = {
  root: 'tk-button',
  label: 'tk-button-label',
  leadingIcon: 'tk-button-leading-icon',
  trailingIcon: 'tk-button-trailing-icon',
  spinner: 'tk-button-spinner',
} as const satisfies SlotClassNames<ButtonSlot>;
```

### Props, callbacks, and refs

- Public props use `camelCase`.
- Callback props use React-style `onX` naming.
- Do not surface custom-event naming or prefixed callback names.
- In React 19, accept `ref` as a regular prop. Do not use `forwardRef`.
- When typing refs, use `Ref<TElement>`.

## Public API

- Start from native React props with `ComponentPropsWithoutRef` and remove
  conflicts deliberately with `Omit`.
- Expose idiomatic React props and callbacks, not raw primitive internals.
- Keep the root's public surface narrow — only state. Content flows through
  subcomponents.
- Prefer clear controlled and uncontrolled pairs for stateful components, such
  as `activeIndex` and `defaultActiveIndex`.
- When two state inputs overlap, define and document precedence explicitly.
- Reflect defaults in both `ComponentBase.defaultProps` and `@defaultValue`
  JSDoc.
- Avoid broad polymorphism. Support only the render modes the package is
  prepared to test and document.

### Customization surfaces

Every component exposes exactly these customization surfaces:

- **compound subcomponents** — the primary way to compose anatomy and swap
  content inside canonical owner nodes;
- **`classNames`** — per-slot extra class names, always concatenated with
  `tk-*`;
- **`slotProps`** — per-slot HTML attribute overrides, shallow-merged with
  instance winning;
- **provider-level defaults** — `SparReactProvider` `components` map (theme
  defaultProps + classNames + slotProps).

Do not add `renderX` props. Do not add flat content props. If consumers need a
new content hook, add a new compound subcomponent.

Examples of explicit precedence that should be documented and tested:

- `activeIndex` overrides `Accordion.Item.active`
- `indeterminate` overrides `value` / `defaultValue` on `Checkbox`
- instance `slotProps` / `classNames` override theme-level counterparts of the
  same slot

## Component Architecture

### Wrapper responsibility

- Each component is a thin React adapter.
- Spar owns behavior, keyboard handling, and ARIA whenever it already provides
  them.
- The root owns API translation, state, context, DOM required for styling, value
  normalization, and stable `data-*` hooks.
- Subcomponents own their canonical slot owner nodes (tag, class, `data-slot`,
  and any behavior such as dismiss). They read shared state from context and
  apply `classNames`/`slotProps` on render.

### Customization ownership

For every slot, classify it before exposing customization:

- **structural** — owns semantics, interaction, layout, or selector anchoring.
  Always a compound subcomponent.
- **content-bearing** — the subcomponent renders a canonical container whose
  inner content is consumer-supplied via children.
- **decorative** — optional ornaments (icons, spinners, arrows). The
  subcomponent can be omitted entirely, or accept custom children.

Typical structural subcomponents include `Root`, `Mask`, `Panel`, `Body`,
`Header`, `Footer`, `CloseButton`, `Item`, `Trigger`.

### Base file responsibility

- Define slots, class names, and default props in `ComponentNameBase.ts`.
- Declare the context that subcomponents consume (`createSafeContext` from
  `src/utils`).
- Keep the base file focused on static metadata, pure helpers, and light context
  wiring.
- Prefer `createComponentBase` for `cx`, `getSlotProps`, and `resolveProps`.

### Adapter hook responsibility

- Use `useComponentNameAdapter` when state translation is non-trivial.
- Adapter hooks own controlled and uncontrolled reconciliation, normalization,
  equality checks, and child processing.
- Keep heavy derivation out of the JSX return block.
- Keep adapter helpers pure where possible.

## Component Implementation

### Code organization template

```tsx
import { Primitive } from '@turkish-technology/spar';
import { type Ref } from 'react';

import {
  MyComponentBase,
  MyComponentProvider,
  useMyComponentContext,
} from './MyComponentBase';
import type { MyComponentProps, MyComponentPartProps } from './types';
import { useMyComponentAdapter } from './useMyComponentAdapter';

function MyComponent({
  ref,
  ...rawProps
}: MyComponentProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    children,
    className,
    classNames,
    slotProps,
    ...restProps
  } = MyComponentBase.resolveProps(rawProps);

  const { normalizedValue, handleValueChange } = useMyComponentAdapter({
    controlledValue,
    defaultValue,
    onValueChange,
    children,
  });

  const contextValue = {
    /* state flags + classNames + slotProps */
  };

  return (
    <MyComponentProvider value={contextValue}>
      <Primitive
        {...restProps}
        ref={ref}
        {...MyComponentBase.getSlotProps('root', {
          className,
          'data-state': normalizedValue ? 'open' : undefined,
        })}
        value={normalizedValue}
        onValueChange={handleValueChange}
      >
        {children}
      </Primitive>
    </MyComponentProvider>
  );
}

function MyComponentPart({
  children,
  className,
  ...rest
}: MyComponentPartProps) {
  const context = useMyComponentContext('MyComponent.Part');
  const attrs = buildSlotAttrs(
    MyComponentBase.getSlotProps('part', { className }),
    context.slotProps,
    'part',
    context.classNames?.part,
  );
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
MyComponentPart.displayName = 'MyComponent.Part';

const MyComponentCompound = Object.assign(MyComponent, {
  Part: MyComponentPart,
});
export { MyComponentCompound as MyComponent };
```

### Implementation rules

- Call `resolveProps` once near the top of the root component.
- Normalize values and derive booleans above the return block.
- Keep JSX shallow. Move repeated or branching rendering into subcomponents.
- Use `getSlotProps` for slot nodes. Use `cx` when you only need class
  composition without extra slot metadata.
- Use `buildSlotAttrs` (from `src/customization`) inside subcomponents to
  compose canonical slot attrs with context-resolved `classNames`/`slotProps`.
- Use `clsx` through `createComponentBase` or directly. Do not add local
  string-join helpers.
- Use small pure helpers for normalization, encoding, and equality checks.
- Fire callbacks exactly once per user-visible state change.
- Preserve native semantics for button, link, form, disabled, and loading
  states.
- If rendering as an anchor while simulating disabled behavior, also remove
  navigation, set `aria-disabled`, manage `tabIndex`, and block activation keys.
- Memoization is allowed only when identity or repeated derivation actually
  matters. Do not add `useMemo` or `useCallback` by default.
- Use `createSafeContext` (from `src/utils/createSafeContext`) so that a
  subcomponent used outside its root raises a descriptive error.
- Set `displayName` on the root (`'Button'`) and every subcomponent
  (`'Button.Label'`, `'Dialog.Header'`).

## Composition Archetypes

The compound-only baseline (above) decides _that_ every component has compound
parts. This section decides _what each part renders underneath_. Every compound
part falls into exactly one of three archetypes:

| Archetype             | When it applies                                                                             | Canonical example                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Inherited**         | The upstream Spar primitive already exports a part for this slot                            | `Input.Label` → `SparInputLabel`                                                  |
| **React-enhancement** | No upstream part exists for this slot; the wrapper owns the DOM tag and styling hooks alone | `Button.Spinner`, `Input.Container`, `Dialog.SignIcon`                            |
| **Bypass**            | An upstream part exists but the wrapper renders a plain tag for a specific, recorded reason | `Dialog.Mask` is the class to avoid; justified bypasses carry an inline rationale |

The rules:

1. **Every compound part declares its archetype in `ComponentNameBase.ts`.** A
   one-line JSDoc on the slot or part reference is enough
   (`// @archetype inherited — wraps SparDialog.Title`). Reviewers should be
   able to read the base file and know which parts delegate, which are pure
   React, and which intentionally bypass upstream.
2. **Inherited parts must render their upstream counterpart, not a plain tag.**
   A compound part that has an upstream equivalent but renders a plain `<div>` /
   `<span>` is a bug unless it is explicitly classified as Bypass with a reason.
   This is the upstream-first rule (see `docs/component-authoring-contract.md`)
   applied at the slot level.
3. **React-enhancement parts must have no upstream equivalent.** If the upstream
   primitive grows a matching part later, the react-enhancement classification
   must migrate to Inherited in the same release.
4. **Bypass parts must carry an inline `exemption:` comment at the render site
   and a `@bypass` line in the base file** giving the concrete reason (e.g.
   upstream behavior conflicts with the React wrapper's semantics, upstream
   hasn't shipped the part yet). "Felt easier" is not a reason.
5. **Wrappers must not re-implement behavior Spar already owns** (see
   `docs/component-authoring-contract.md` — "Spar owns behavior"). When a
   wrapper bypasses an upstream part, it inherits the burden of proving that no
   behavior (keyboarding, focus, ARIA lifecycle) is being silently
   re-implemented in React. If there is, the correct path is to delegate through
   the upstream part and restrict the wrapper to styling and API translation.

Canonical examples per archetype, as of the composition audit absorbed into this
section:

- **Inherited root, inherited parts** — `Accordion`. Delegates through every
  `SparAccordion.*` part it uses, with only styling enhancements layered in.
- **Inherited root, mix of inherited + react-enhancement parts** — `Input` and
  `Dialog`. Upstream compound parts exist for semantic anchors (`Label`,
  `Title`, `Description`, `Field`, …) and are inherited; visual chrome parts
  (`Container`, `LeadingIcon`, `SignIcon`, `Header`, …) are react-enhancement.
- **Compound-in-react over a leaf upstream** — `Button` and `Checkbox`.
  `SparButton` and `SparCheckbox` are leaves; every `.Label` / `.Icon` /
  `.Indicator` / `.Spinner` part is react-enhancement.
- **Bypass with documented rationale** — `Button` link-mode renders a bare `<a>`
  rather than `<SparButton as="a">` because the upstream keyboard handler
  preventDefaults Enter/Space on non-native elements, which would block a native
  anchor's navigation. The rationale lives in `ButtonBase.ts`.

Every new component port must classify its parts against this table as part of
the contract produced by the
[`takeoff-component-workflow`](../../../.agents/skills/takeoff-component-workflow/SKILL.md)
skill. A missing archetype classification is a contract blocker.

## Styling Contract

- This package does not ship component CSS.
- Consumers import the token CSS entrypoint once at the app shell or entrypoint.
- `*Base.ts` is the source of truth for slot names and emitted classes.
- Use `data-slot` for anatomy.
- Use canonical `data-*` attributes for state, variant, size, and other styling
  hooks. See `docs/DATA_ATTRIBUTE_VOCABULARY.md`.
- Every emitted class or `data-*` hook must have a real consumer in styling,
  semantics, or docs.
- Avoid anonymous wrapper nodes that only add DOM weight.

### DOM ownership

For interactive and compound components, decide these separately:

- visual owner: border, radius, spacing, hover, layout
- interactive owner: click, keyboard, focus, pressed state
- semantic owner: heading, label, region, form semantics

These do not have to be the same node. They do have to be intentional.

### Styling hook example

```tsx
const sharedProps = {
  ...restProps,
  'className': ButtonBase.cx('root', className),
  'data-slot': 'root',
  'data-disabled': disabled ? '' : undefined,
  'data-loading': loading ? '' : undefined,
  'data-variant': variant,
  'data-size': size,
};
```

## Accessibility

- Do not rewrite keyboard or ARIA behavior that Spar already provides.
- Wrapper nodes must not break focus order, label linkage, heading hierarchy, or
  region ownership.
- Decorative icons and arrows should be `aria-hidden`.
- Icon-only interactive controls must still have an accessible name (typically
  via `aria-label` on the root).
- When simulating disabled behavior on non-disabled elements, also handle
  `aria-disabled`, focusability, and blocked pointer and keyboard interaction.
- Prefer semantic HTML or Spar primitives over custom role recreation.
- Add at least one accessibility assertion path for interactive components,
  typically via `axe`.

## Testing Standards

### Test stack

- Use `Vitest` for test running and assertions.
- Use `@testing-library/react` for rendering and queries.
- Use `userEvent` for interaction-driven behavior.
- Use `vitest-axe` for baseline accessibility checks.
- Mock Spar only when it helps isolate the React wrapper contract. Keep the
  mocked surface small.

### Test file placement

- Keep tests next to the component as `ComponentName.test.tsx`.
- Group cases by behavior, not by private implementation detail.

### Test structure

```tsx
describe('Button (compound)', () => {
  describe('rendering', () => {
    it('renders a button element by default', () => {
      render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations', async () => {
      const { container } = render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
```

### Test best practices

- Always compose the anatomy explicitly — tests exist to pin the compound
  surface.
- Prefer queries by role, label, text, and visible behavior.
- Use `container.querySelector` only when asserting stable structural hooks such
  as `data-slot` or documented `data-*` attributes.
- Simulate user behavior with `userEvent` instead of calling internal helpers or
  mutating DOM nodes directly.
- For stateful roots, cover controlled, uncontrolled, and transition paths.
- Assert emitted `data-*` hooks only when they are part of the documented
  styling contract.
- Include one happy-path `axe` check for each interactive component, and add
  focused regression checks for risky variants.
- When a subcomponent renders conditionally (`Input.Spinner`,
  `Input.ClearButton`, `Input.ErrorMessage`, `Button.Spinner`,
  `Input.Asterisk`), assert both the rendered and the skipped paths.
- Assert that `classNames`/`slotProps` land on the correct subcomponent owner
  node.
- Assert that using a subcomponent outside its root raises the safe-context
  error.

### Component test checklist

Before submitting a component, make sure tests cover:

- default rendering and root slot contract
- canonical anatomy for every subcomponent (class + `data-slot`)
- class name merging (theme + instance)
- default props and emitted data attributes
- controlled and uncontrolled behavior when applicable
- callback behavior and call counts
- disabled, loading, invalid, required, clearable (and any other state-driven
  conditional subcomponent) edge semantics
- `slotProps` behavior
- context-boundary errors when subcomponents are used outside the root
- accessibility baseline

## Documentation

- Public docs describe compound usage only. No flat content props appear in
  examples because no flat content props exist.
- Internal porting history, migration notes, or primitive quirks do not belong
  in component comments or public docs unless they affect consumers.
- Keep type docs precise. Generated API tables are only as good as the JSDoc in
  `types.ts`.
- If a prop or callback has a default, keep `defaultProps` and `@defaultValue`
  aligned.
- If a slot, prop, event, or data attribute changes, regenerate the docs output
  in `apps/docs/src/docs-files`.
- Generated API output should expose callback props under the `Events` section
  when applicable.
- Do not manually edit generated MDX files.

## Merge Checklist

The authoritative gate for new component work is the contract produced by the
[`takeoff-component-workflow`](../../../.agents/skills/takeoff-component-workflow/SKILL.md)
skill, governed by
[`docs/component-authoring-contract.md`](../../../docs/component-authoring-contract.md).
The list below is the subset local to this package.

Before considering a component complete:

- `pnpm check-types`
- `pnpm lint`
- `pnpm build`
- `pnpm --filter @takeoff-ui/react-spar test`
- regenerate docs API output when public types changed
- confirm the root is exported from `src/components/index.ts` (subcomponents are
  reached exclusively through the root)
- confirm no CSS is emitted from `packages/react-spar/dist`
- confirm slot classes are mirrored in `src/styling/slot-registry.ts`
- confirm at least one smoke scenario in
  [`apps/react-app/src/App.tsx`](../../../apps/react-app/src/App.tsx) exercises
  the new compound anatomy end to end against the real tokens CSS import. If a
  customization surface is genuinely not part of the component's public
  contract, mark the omission inline as `// exemption: <reason>` so it is
  intentional and reviewable.
- confirm docs, generated API tables, tests, and component types describe the
  same compound contract
- include the parity-review summary (and any React-enhancement justification) in
  the PR description, following
  [`docs/component-authoring-contract.md`](../../../docs/component-authoring-contract.md)
