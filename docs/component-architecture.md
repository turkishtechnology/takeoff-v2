# Component Architecture

The folder and file structure every component in `@takeoff-ui/react-spar`
implements. This is the implementation-side counterpart to
[`api-decision-framework.md`](./api-decision-framework.md): once the API has
been pinned, the structure below is how it is built.

> Repo-local elaboration of these rules and the testing standards lives in
> [`packages/react-spar/docs/CODING_STANDARDS.md`](../packages/react-spar/docs/CODING_STANDARDS.md).
> When the two disagree, this file wins for **structure**, CODING_STANDARDS wins
> for **runtime conventions** (cx, slotProps, displayName).

## Folder layout

```
packages/react-spar/src/components/<component-name>/
├── <ComponentName>.tsx              Root + every compound subcomponent (Object.assign export).
├── <ComponentName>Base.ts           Slots, classNames, defaults, context, helpers, archetype JSDoc.
├── use<ComponentName>Adapter.ts     Core API → Spar API mapping. Optional; only when needed.
├── types.ts                         Public types: root props, every subcomponent's props.
├── <ComponentName>.test.tsx         Compound-surface tests.
└── index.ts                         Local barrel. Exports the root only.
```

Folder name: `kebab-case`. Component file and exports: `PascalCase`. The
single-file approach for the compound surface is the default; split into
`<ComponentName>Header.tsx` etc. only when the single file becomes hard to read
(Accordion is a current borderline case).

## File responsibilities

### `<ComponentName>.tsx` — the root and its compound parts

The root owns:

- `resolveProps()` for theme defaults and instance props.
- The adapter call that converts Core API to Spar API.
- The shared context value passed to subcomponents.
- The Spar primitive call (`<SparPrimitive>`).
- Stable `data-*` hooks emitted on the root owner node.
- The compound assembly (`Object.assign(Root, { Label, ... })`).

Subcomponents own:

- Their canonical owner node tag and class.
- Reading state from context via `useComponentNameContext('Root.Part')`.
- Applying `slotProps`, `classNames` for their slot through `buildSlotAttrs`.
- Their `displayName = 'Root.Part'`.

The root never mounts more DOM than necessary. If a subcomponent is the
canonical owner of a slot, the root does not also wrap it in a redundant
`<div>`.

### `<ComponentName>Base.ts` — static metadata and context

Contains, in this order:

1. Slot key array (`as const`).
2. Slot class names (`tk-*`, `as const satisfies SlotClassNames<Slot>`).
3. Default props.
4. Context creation via `createSafeContext`.
5. `createComponentBase()` instance exposing `cx`, `getSlotProps`,
   `resolveProps`.
6. Pure helpers and normalizers.
7. Archetype JSDoc on each slot or part reference.

Examples of archetype annotation, from
[CODING_STANDARDS](../packages/react-spar/docs/CODING_STANDARDS.md#composition-archetypes):

```ts
// @archetype inherited — wraps SparAccordion.Header
header: 'tk-accordion-header',
// @archetype react-enhancement — no upstream Spar arrow part
arrow: 'tk-accordion-arrow',
// @archetype bypass — see ButtonBase.ts §link-mode
//   exemption: SparButton's keyboard handler preventDefaults Enter on non-native elements,
//   which would block native anchor navigation. Render <a> directly in link mode.
linkRoot: 'tk-button',
```

### `use<ComponentName>Adapter.ts` — Core ↔ Spar translation

Add this file when **any** of the following is true:

- The component reconciles controlled and uncontrolled state.
- The Takeoff prop value shape differs from the Spar prop value shape.
- The component normalizes children before rendering.
- The component derives multiple booleans from related props (e.g. Input's
  `clearable && !!value && !disabled && !readOnly`).

Skip the adapter when the component is purely structural (no state, no
translation, no normalization). Decide once: if any field needs translation,
move all translation into the adapter.

The adapter:

- Takes raw inputs (controlled/uncontrolled values, callbacks, children).
- Returns Spar-shaped outputs (`value`, `onValueChange`, etc.) plus any derived
  booleans the root needs.
- Calls the Takeoff-named callback with the Takeoff-shaped value, never with the
  Spar-shaped one.
- Fires the callback exactly once per user-visible state change.
- Has no JSX. Pure hook.

### `types.ts` — public types

Every public type lives here:

- `<ComponentName>Props` for the root.
- `<ComponentName><Part>Props` for every subcomponent.
- `<ComponentName>Slot` slot key union.
- `<ComponentName>ClassNames`, `<ComponentName>SlotProps` if exposed via the
  customization surfaces.
- Any value enum exposed through props (`AccordionType`, `ButtonVariant`).

Types start from `ComponentPropsWithoutRef<'div'>` (or the right element) and
remove conflicts deliberately with `Omit`. They expose Takeoff vocabulary, not
Spar vocabulary. Defaults are mirrored in `@defaultValue` JSDoc.

### `<ComponentName>.test.tsx` — compound-surface tests

Co-located with the component. Tests must cover at minimum:

- Default rendering and root slot contract.
- Canonical anatomy for every subcomponent (class + `data-slot`).
- `classNames` and `slotProps` reaching the right owner node.
- Default props and emitted `data-*` hooks.
- Controlled and uncontrolled paths.
- Callback signatures and call counts.
- Conditional subcomponent paths (rendered + skipped).
- Context-boundary errors when subcomponents are used outside the root.
- One `axe` baseline per interactive component.

`vitest-axe` is on every interactive component. Spar is not mocked unless
mocking is essential to isolate a wrapper-level concern.

### `index.ts` — local barrel

Exports the compound root only:

```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps /* subcomponent props */ } from './types';
```

Subcomponents are reached through the root (`ComponentName.Part`), never as
named exports from this barrel or from `src/components/index.ts`. See
[`decisions/0002-compound-export-policy.md`](./decisions/0002-compound-export-policy.md).

## Pseudo-implementation reference

```tsx
// ComponentName.tsx
import { Primitive } from '@turkish-technology/spar';
import { type Ref } from 'react';

import {
  ComponentNameBase,
  ComponentNameProvider,
  useComponentNameContext,
} from './ComponentNameBase';
import type { ComponentNameProps, ComponentNamePartProps } from './types';
import { useComponentNameAdapter } from './useComponentNameAdapter';

function ComponentName({
  ref,
  ...rawProps
}: ComponentNameProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    children,
    className,
    classNames,
    slotProps,
    ...restProps
  } = ComponentNameBase.resolveProps(rawProps);

  const { sparValue, handleSparChange, derivedFlags } = useComponentNameAdapter(
    {
      controlledValue,
      defaultValue,
      onChange,
      children,
    },
  );

  const contextValue = {
    classNames,
    slotProps,
    ...derivedFlags,
  };

  return (
    <ComponentNameProvider value={contextValue}>
      <Primitive
        {...restProps}
        ref={ref}
        {...ComponentNameBase.getSlotProps('root', {
          'className': className,
          'data-state': sparValue ? 'open' : undefined,
        })}
        value={sparValue}
        onValueChange={handleSparChange}
      >
        {children}
      </Primitive>
    </ComponentNameProvider>
  );
}

function ComponentNamePart({
  children,
  className,
  ...rest
}: ComponentNamePartProps) {
  const context = useComponentNameContext('ComponentName.Part');
  const attrs = buildSlotAttrs(
    ComponentNameBase.getSlotProps('part', { className }),
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
ComponentNamePart.displayName = 'ComponentName.Part';

const ComponentNameCompound = Object.assign(ComponentName, {
  Part: ComponentNamePart,
});

export { ComponentNameCompound as ComponentName };
```

## Customization plumbing — where each surface lives

| Surface               | Lives on      | Resolved in                   | Lands on                   |
| --------------------- | ------------- | ----------------------------- | -------------------------- |
| `defaultProps`        | Provider      | `Base.resolveProps(rawProps)` | Root prop values.          |
| Compound parts        | Subcomponents | Each subcomponent's render    | Canonical part owner node. |
| Instance `classNames` | Root prop     | Context → `buildSlotAttrs`    | Per-slot owner node.       |
| Theme `classNames`    | Provider      | Context → `buildSlotAttrs`    | Per-slot owner node.       |
| Instance `slotProps`  | Root prop     | Context → `buildSlotAttrs`    | Per-slot owner node.       |
| Theme `slotProps`     | Provider      | Context → `buildSlotAttrs`    | Per-slot owner node.       |

Precedence (lowest to highest):

1. Wrapper's canonical attrs (`tk-*` class, `data-slot`, ARIA).
2. Theme `slotProps[slot]`.
3. Theme `classNames[slot]`.
4. Instance `slotProps[slot]`.
5. Instance `classNames[slot]`.
6. Per-attribute overrides explicitly set in JSX.

The canonical class is never dropped. It is concatenated with downstream
classes; consumer classes append to it.

## Slot registry

Every slot's `tk-*` class is mirrored in
`packages/react-spar/src/styling/slot-registry.ts`. The generator script updates
this automatically when scaffolding a new component. When adding a slot to an
existing component, update the registry by hand. CI does not currently fail on
registry drift, but consumer styling does.

## Required exports

`packages/react-spar/src/index.ts` re-exports, in this order:

```ts
export * from './provider';
export * from './components';
export type {
  ComponentCustomizationRegistry,
  ComponentName,
  ComponentThemeConfig,
  ComponentsThemeMap,
} from './customization';
export type { SlotClassNames } from './types';
```

`packages/react-spar/src/components/index.ts` re-exports each component's local
barrel. The local barrel exports the root and the public types. No subcomponent
is exported from the package root.

## When to deviate

Three legitimate reasons to step outside this layout, all requiring an ADR:

1. The component is genuinely stateless and structural; the adapter file is
   skipped. Documented in the component's port note.
2. The component spans multiple Spar primitives that don't share a root (rare).
   Each Spar root is wrapped, the Takeoff component composes them.
3. The component has more than ~6 subcomponents and the single `.tsx` file
   becomes unreadable. Split into one file per subcomponent under the component
   folder, keep the compound assembly in `<ComponentName>.tsx`.

Anything else outside this layout is a bug.
