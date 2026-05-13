# React Spar Coding Standards

This document explains how we build components under
`packages/react-spar/src/components`.

`@takeoff-ui/react-spar` is a React wrapper layer on top of
`@turkish-technology/spar`, not a second component framework. Every component is
authored as a **compound surface**: a root that owns state plus a fixed list of
named subcomponents that own structure. The standards below keep that model
consistent across the package.

> **Canonical authoring rules live in
> [`docs/component-authoring-contract.md`](../../../docs/component-authoring-contract.md).**
> That document is the single source of truth for layer responsibilities, the
> no-adapter-hook rule, the upstream-first rule, public compound parts policy,
> and the review checklist. This file complements it with **package-local
> detail**: folder structure, naming, slot vocabulary, testing stack, styling
> contract, and the per-package merge checklist. If a rule appears in both
> places, the contract wins and this file should link rather than restate.

Consistency goals:

- idiomatic React APIs for consumers
- preserved Spar behavior and accessibility
- stable styling hooks for Takeoff recipes and docs

## Folder Structure

Each component directory should contain (Accordion is the reference — see
`src/components/accordion/`):

```plaintext
component-name/
├── ComponentName.tsx          # Root component
├── ComponentNamePart.tsx      # One file per public sub-component
├── base.ts                    # createComponentBase calls for every part
├── context.ts                 # Cross-part variant context (when needed)
├── defaults.ts                # DEFAULT_* literals (when needed)
├── types.ts                   # Public types for the root and every part
├── types.test-d.ts            # Compile-time type tests (when needed)
└── index.ts                   # Local barrel — Object.assign compound export
```

Rules:

- Folder names use `kebab-case`.
- Component files and exports use `PascalCase`. Infrastructure files (`base.ts`,
  `context.ts`, `defaults.ts`) stay lowercase.
- Every component **does** ship compound subcomponents. Even leaf controls
  (Button, Checkbox) expose at minimum a `Label` and adornment subcomponents so
  the content surface stays structural, not prop-driven.
- `base.ts` is the source of truth for slot names and emitted class names. One
  `createComponentBase` call per public sub-component, all colocated.
- Export the root from the local barrel and from `src/components/index.ts`.
  Subcomponents are reached exclusively via the root (`Button.Label`,
  `Dialog.Header`, …), not via direct named exports.
- Mirror slot classes into `src/slot-registry.ts` (the generator script does
  this automatically when scaffolding a new component).
- Prefer the generator script after the component contract has named the public
  compound parts:

```bash
pnpm --filter @takeoff-ui/react-spar generate Button --root=button Label=span LeadingIcon=span Spinner=span
```

The generator does not scaffold `ComponentName.test.tsx`. Tests are added
manually following the [Testing Standards](#testing-standards) below.

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
- **Do not** add flat **string** content props (`label`, `header`, `subheader`,
  `title`, `description`, `error`, `footerActions`, `spinner`, `containerSlot`,
  `headerSlot`, `contentSlot`, `footerSlot`). Translate them into subcomponents.
  **`ReactNode` slot props** for decorative pieces (`icon`, `leadingIcon`) are
  allowed when the slot has no independent theming surface or behavior —
  consumers already control the node they pass in.
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
- Base objects (inside `base.ts`) use `ComponentNameBase` — e.g.
  `AccordionBase`, `AccordionItemBase`. Each is one `createComponentBase` call.
- Public props and type aliases live in `types.ts`. Each subcomponent has its
  own props interface (`ButtonLabelProps`, `DialogHeaderProps`, ...).
- Internal helper names should describe the domain behavior they own, such as
  `encodeAccordionItemValue` or `normalizeAccordionValues`.

### Slot names and emitted classes

- Slot keys in `*Base.ts` use `lowerCamelCase`.
- Slot keys must have **single uppercase boundaries** between lowercase runs
  (`leadingIcon`, `errorMessage`). Avoid consecutive uppercase (`leadingICON`,
  `aPIKey`): both the type-level `KebabCase<S>` transform and the runtime
  `toDataSlotName` helper insert a hyphen before every uppercase letter, so
  `'leadingICON'` produces `data-slot="leading-i-c-o-n"`. The convention keeps
  `data-slot` legible without complicating the transform.
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
  as `value` and `defaultValue`.
- When two state inputs overlap, define and document precedence explicitly.
- Apply visual defaults at the destructure site of `rest`, after
  `composeRootAttrs` has merged
  `(author defaults → theme defaults → instance props)`. Do not pass
  `defaultProps` to `createComponentBase` for visual props — theme defaults must
  layer correctly, which only happens when defaults are applied post-merge.
  Mirror each default in `@defaultValue` JSDoc on the prop type so generated API
  tables stay accurate.
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

- `value` controls Accordion open state when provided.
- `indeterminate` overrides `value` / `defaultValue` on `Checkbox`
- instance `slotProps` / `classNames` override theme-level counterparts of the
  same slot

### `slotProps` scope — what it is and isn't for

`slotProps` is **DOM-level customization**. It is shallow-merged underneath
canonical attrs (`data-slot`, `tk-*` class) at every slot's render site, so
consumers can attach anything that lives on the DOM element to that slot.

**Use `slotProps` for:**

- `aria-*`, `data-*` attributes
- `id`, `style`, additional className contributions
- DOM event handlers that do not drive component state: `onMouseEnter`,
  `onFocus`, `onKeyDown`, decorative `onClick` (analytics, tooltips)

**Do not use `slotProps` for:**

- Controlled state props (`value`, `defaultValue`, `checked`, `open`,
  `disabled`) — these are root props
- State-change callbacks owned by the component contract (`onValueChange`,
  `onOpenChange`, `onCheckedChange`) — these are root props
- Anything documented as a behavior prop on the root component

> [!WARNING] **This boundary is not enforced at runtime.** A consumer who routes
> a behavior prop (e.g. `onValueChange`, `checked`, `disabled`) through
> `slotProps.root` will silently override the component's controlled wiring and
> the component will appear broken with no error thrown. Debugging this
> typically takes longer than the wiring took to write. The contract belongs in
> documentation; the library does not police it.

Rule of thumb: _Customizing a DOM attribute? → `slotProps`. Driving component
behavior? → root prop._

## Component Architecture

### Wrapper responsibility

Layer responsibilities (Takeoff Core / React Spar / Spar) are defined in
[`docs/component-authoring-contract.md` → Layer responsibilities](../../../docs/component-authoring-contract.md#layer-responsibilities).
The wrapper-level summary is: components are thin; Spar owns behavior; the root
owns Takeoff visual props plus stable `data-*` hooks; subcomponents own their
canonical slot owner nodes and read shared state from context.

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

- Define slots, class names, and default props in `base.ts` (one
  `createComponentBase` call per public sub-component, all colocated).
- Declare the context that subcomponents consume in `context.ts`
  (`createSafeContext` from `src/hooks`).
- Keep the base file focused on static metadata, pure helpers, and light context
  wiring.
- Prefer `createComponentBase` for `cx`, `getSlotProps`, and `resolveProps`.

### Composition archetypes

The compound-only baseline decides _that_ every component has compound parts.
This section decides _what each part renders underneath_. Every compound part
falls into exactly one of three archetypes:

| Archetype             | When it applies                                                                             | Canonical example                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Inherited**         | The upstream Spar primitive already exports a part for this slot                            | `Input.Label` → `SparInputLabel`                                                  |
| **React-enhancement** | No upstream part exists for this slot; the wrapper owns the DOM tag and styling hooks alone | `Button.Spinner`, `Input.Container`, `Dialog.SignIcon`                            |
| **Bypass**            | An upstream part exists but the wrapper renders a plain tag for a specific, recorded reason | `Dialog.Mask` is the class to avoid; justified bypasses carry an inline rationale |

Classification happens at contract time, before implementation begins. A missing
archetype classification is a contract blocker — see the
[`takeoff-component-workflow`](../../../.agents/skills/takeoff-component-workflow/SKILL.md)
skill.

Rules:

1. **Every compound part declares its archetype in `base.ts`.** A one-line JSDoc
   on the slot or part reference is enough
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

Canonical examples:

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

### Upstream-first wrapper responsibility

See
[`docs/component-authoring-contract.md` → Upstream-first rule](../../../docs/component-authoring-contract.md#upstream-first-rule)
and
[No adapter hook rule](../../../docs/component-authoring-contract.md#no-adapter-hook-rule)
for the canonical rules. In short: Spar owns controlled/uncontrolled
reconciliation, keyboard behavior, focus, ARIA, and item registration; if
behavior-heavy translation is needed, fix Spar first so the wrapper can pass the
prop through. Adapter hooks (`useComponentNameAdapter`) are forbidden unless a
real React lifecycle/state/ref/effect reason has been approved.

## Component Implementation

### Code organization template

Single-slot wrappers (root, or a sub-component that only renders one owner node)
go through `composeRootAttrs`. Multi-slot sub-components compose the root with
`composeRootAttrs` and each additional slot with `buildSlotAttrs` at its own
render site. Do not inline the `resolveProps` + slot-attr chain.

```tsx
import { Primitive as SparPrimitive } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { MyComponentBase } from './base';
import { MyComponentProvider, useMyComponentOwnContext } from './context';
import type { MyComponentProps, MyComponentPartProps } from './types';

// Root: single slot, may layer canonical state-driven data-* via stateAttrs.
export const MyComponent = (props: MyComponentProps) => {
  const theme = useComponentTheme('MyComponent');
  const { rootAttrs, rest } = composeRootAttrs(MyComponentBase, props, theme, {
    stateAttrs: {
      'data-variant': props.variant,
      'data-disabled': props.disabled ? '' : undefined,
    },
  });
  const { children, ref, ...spar } = rest;

  return (
    <MyComponentProvider value={{ variant: props.variant }}>
      <SparPrimitive {...spar} {...rootAttrs} ref={ref}>
        {children}
      </SparPrimitive>
    </MyComponentProvider>
  );
};

MyComponent.displayName = 'MyComponent';

// Single-slot sub-component: same composeRootAttrs call shape as the root.
export const MyComponentPart = (props: MyComponentPartProps) => {
  const theme = useComponentTheme('MyComponentPart');
  const { rootAttrs, rest } = composeRootAttrs(
    MyComponentPartBase,
    props,
    theme,
  );
  const { children, ref, ...spar } = rest;

  return (
    <SparPrimitivePart {...spar} {...rootAttrs} ref={ref}>
      {children}
    </SparPrimitivePart>
  );
};

MyComponentPart.displayName = 'MyComponent.Part';

// Multi-slot sub-component: composeRootAttrs for the root slot, buildSlotAttrs
// at each additional slot's render site.
export const MyComponentTrigger = (props: MyComponentTriggerProps) => {
  const theme = useComponentTheme('MyComponentTrigger');
  const { rootAttrs, rest } = composeRootAttrs(
    MyComponentTriggerBase,
    props,
    theme,
  );
  const { children, icon, ref, ...spar } = rest;

  const iconNode = icon != null && (
    <span
      {...buildSlotAttrs(MyComponentTriggerBase.getSlotProps('icon'), 'icon', {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        instanceSlotProps: props.slotProps,
        instanceClassNames: props.classNames,
      })}
    >
      {icon}
    </span>
  );

  return (
    <SparPrimitiveTrigger {...spar} {...rootAttrs} ref={ref}>
      {iconNode}
      {children}
    </SparPrimitiveTrigger>
  );
};

MyComponentTrigger.displayName = 'MyComponent.Trigger';
```

Local barrel (`index.ts`) attaches sub-components with `Object.assign`:

```ts
const MyComponentCompound = Object.assign(MyComponent, {
  Part: MyComponentPart,
  Trigger: MyComponentTrigger,
});

export { MyComponentCompound as MyComponent };
```

### Implementation rules

- Compose the root with `composeRootAttrs(Base, props, theme)` — never inline
  the `resolveProps` + slot-attr chain. The helper resolves
  `(author defaults → theme defaults → instance props)` and returns
  `{ rootAttrs, rest }` with `className`/`classNames`/`slotProps` already
  stripped.
- Layer canonical state-driven `data-*` (variant, size, disabled, …) via
  `composeRootAttrs(..., { stateAttrs: { ... } })`. These attrs spread on top of
  `slotProps.root` so the design-system invariants cannot be overridden by
  consumer slot props. Pass `''` for "present" and `undefined` for "absent" —
  `undefined` entries are dropped.
- For additional slot owner nodes inside a sub-component, call
  `buildSlotAttrs(Base.getSlotProps('slotName'), 'slotName', { themeSlotProps, themeClassNames, instanceSlotProps, instanceClassNames })`
  at the render site. Do not invent ad-hoc slot composition.
- Keep visual-only derivation above the return block.
- Do not re-implement Spar behavior in the wrapper. If behavior props cannot be
  passed through directly, fix Spar first.
- Keep JSX shallow. Move repeated or branching rendering into subcomponents.
- Use `clsx` through `createComponentBase` (`cx`) or directly. Do not add local
  string-join helpers.
- Use small pure helpers for normalization, encoding, and equality checks.
- Fire callbacks exactly once per user-visible state change.
- Preserve native semantics for button, link, form, disabled, and loading
  states.
- If rendering as an anchor while simulating disabled behavior, also remove
  navigation, set `aria-disabled`, manage `tabIndex`, and block activation keys.
- Memoization is allowed only when identity or repeated derivation actually
  matters. Do not add `useMemo` or `useCallback` by default.
- Use `createSafeContext` (from `src/hooks`) so that a subcomponent used outside
  its root raises a descriptive error.
- When a sub-component conditionally renders based on whether the consumer
  already supplied a specific child (e.g. `Accordion.Trigger.Title`), detect it
  with `hasChildOfType` (from `src/hooks`) rather than ad-hoc `React.Children`
  iteration.
- Set `displayName` on the root (`'Button'`) and every subcomponent
  (`'Button.Label'`, `'Dialog.Header'`).

### Wrapper helpers — quick reference

| Need                                       | Helper                                                   | Where it lives |
| ------------------------------------------ | -------------------------------------------------------- | -------------- |
| Compose canonical root attrs (single slot) | `composeRootAttrs(Base, props, theme)`                   | `src/core`     |
| Layer canonical `data-*` on root           | `composeRootAttrs(..., { stateAttrs })`                  | `src/core`     |
| Compose canonical attrs for an extra slot  | `buildSlotAttrs(Base.getSlotProps(slot), slot, { ... })` | `src/core`     |
| Read theme defaults                        | `useComponentTheme('Name')`                              | `src/provider` |
| Share root state with sub-components       | `createSafeContext('NameProvider')`                      | `src/hooks`    |
| Detect a specific child sub-component      | `hasChildOfType`                                         | `src/hooks`    |

## Styling Contract

- This package does not ship component CSS.
- Consumers import the token CSS entrypoint once at the app shell or entrypoint.
- `*Base.ts` is the source of truth for slot names and emitted classes.
- Use `data-slot` for anatomy.
- Use canonical `data-*` attributes for state, variant, size, and other styling
  hooks. See `docs/data-attribute-vocabulary.md`.
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
- Usage anatomy snippets show component tags only. Props, sample content, and
  state wiring belong in dedicated examples.
- Each component page has exactly one editable demo, named `Playground`, using
  `<LiveCode>` with the default `editable={true}`. Authors run prettier on its
  source at runtime, so the source string can stay in template-literal-friendly
  indentation as long as it is readable in source.
- All other demos on the page are display-only and pass `editable={false}`. They
  still render the live preview, but skip the editable textarea, prettier
  formatting, and reset/error tooling. Pre-format their source strings the way
  they should appear; runtime prettier does not run on them.
- If Prettier would rewrite visible demo source strings, wrap the demo constants
  block with MDX `<!-- prettier-ignore-start -->` /
  `<!-- prettier-ignore-end -->`.
- Internal porting history, migration notes, or primitive quirks do not belong
  in component comments or public docs unless they affect consumers.
- Keep type docs precise. Generated API tables are only as good as the JSDoc in
  `types.ts`.
- If a prop or callback has a default, keep the destructure-site default and the
  `@defaultValue` JSDoc aligned.
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
- confirm slot classes are mirrored in `src/slot-registry.ts`
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
