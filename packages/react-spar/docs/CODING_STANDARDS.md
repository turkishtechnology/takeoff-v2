# React Spar Coding Standards

This document explains how we build components under
`packages/react-spar/src/components`.

`@takeoff-ui/react-spar` is a React adapter layer on top of
`@turkish-technology/spar`, not a second component framework. The standards
below exist to keep three things consistent across the package:

- idiomatic React APIs for consumers
- preserved Spar behavior and accessibility
- stable styling hooks for Takeoff recipes and docs

## Folder Structure

Each new component directory should usually contain:

```plaintext
component-name/
├── ComponentName.tsx          # Public wrapper
├── ComponentNameBase.ts       # Slots, class names, defaults, light helpers
├── useComponentNameAdapter.ts # State translation hook (when needed)
├── types.ts                   # Public types only
├── ComponentName.test.tsx     # Tests
└── index.ts                   # Local barrel
```

Rules:

- Folder names use `kebab-case`.
- Component files and exports use `PascalCase`.
- Not every component needs an adapter hook. Add one when the wrapper must
  reconcile controlled and uncontrolled state, normalize values, or build shared
  context.
- `ComponentNameBase.ts` is the source of truth for slot names, emitted class
  names, and default props.
- Split extra helper files only when the base or adapter file becomes hard to
  read.
- Export the component from its local barrel and from `src/components/index.ts`.
- Register slot classes in `src/theme/recipes.ts`.
- Prefer the generator script when scaffolding a new component:

```bash
pnpm --filter @takeoff-ui/react-spar generate Tooltip
```

- Move existing components toward these patterns when the change is low risk. Do
  not rewrite stable code only for stylistic purity.

## Naming Conventions

### Component, file, and type names

- Public components use `PascalCase`: `Button`, `Accordion`, `AccordionItem`.
- Base objects use `ComponentNameBase`.
- Adapter hooks use `useComponentNameAdapter`.
- Public props and type aliases live in `types.ts`.
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
- Keep the public surface small. Do not leak Spar-only implementation details
  unless the wrapper intentionally owns that contract.
- Prefer clear controlled and uncontrolled pairs for stateful components, such
  as `activeIndex` and `defaultActiveIndex`.
- When two props overlap, define and document precedence explicitly.
- Reflect defaults in both `ComponentBase.defaultProps` and `@defaultValue`
  JSDoc.
- Avoid broad polymorphism. Support only the render modes the package is
  prepared to test and document.
- Use `ReactNode` for content slots. When aliases exist, document precedence
  with `children`.

Examples of explicit precedence that should be documented and tested:

- `children` overrides `label`
- `activeIndex` overrides `AccordionItem.active`
- explicit slot props override legacy parity aliases

## Component Architecture

### Wrapper responsibility

- A component in this package is a thin React adapter.
- Spar should continue to own behavior, keyboard handling, and ARIA whenever it
  already provides them.
- The wrapper owns API translation, DOM required for styling, value
  normalization, and stable `data-*` hooks.
- Do not add wrapper nodes unless they solve a clear styling, semantic, or
  interaction problem.

### Base file responsibility

- Define slots, class names, and default props in `ComponentNameBase.ts`.
- Keep the base file focused on static metadata, pure helpers, and light context
  wiring.
- `createContext` is allowed in the base file when multiple subcomponents share
  wrapper state.
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

import { MyComponentBase } from './MyComponentBase';
import type { MyComponentProps } from './types';
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
    ...restProps
  } = MyComponentBase.resolveProps(rawProps);

  const { normalizedValue, handleValueChange } = useMyComponentAdapter({
    controlledValue,
    defaultValue,
    onValueChange,
    children,
  });

  return (
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
  );
}
```

### Implementation rules

- Call `resolveProps` once near the top of the component.
- Normalize values and derive booleans above the return block.
- Keep JSX shallow. Move repeated or branching rendering into small helpers.
- Use `getSlotProps` for slot nodes. Use `cx` when you only need class
  composition without extra slot metadata.
- New components should prefer `getSlotProps` for consistent `data-slot` output.
  Existing stable components can adopt it opportunistically.
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
- Use `createContext` plus `useContext` for new context-based composition. Do
  not introduce `contextType` or `Context.Consumer` patterns in new code.
- Set `displayName` on exported components.

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
- Icon-only interactive controls must still have an accessible name.
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
describe('Button', () => {
  describe('rendering', () => {
    it('should render a button element by default', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
```

### Test best practices

- Prefer queries by role, label, text, and visible behavior.
- Use `container.querySelector` only when asserting stable structural hooks such
  as `data-slot` or documented `data-*` attributes.
- Simulate user behavior with `userEvent` instead of calling internal helpers or
  mutating DOM nodes directly.
- Test contract precedence cases explicitly, such as `children` over `label` or
  controlled props over item-level fallbacks.
- For stateful wrappers, cover controlled, uncontrolled, and transition paths.
- Assert emitted `data-*` hooks only when they are part of the documented
  styling contract.
- Include one happy-path `axe` check for each interactive component, and add
  focused regression checks for risky variants.

### Component test checklist

Before submitting a component, make sure tests cover:

- default rendering and root slot contract
- class name merging
- default props and emitted data attributes
- controlled and uncontrolled behavior when applicable
- callback behavior and call counts
- disabled, loading, and edge semantics
- slot rendering and precedence rules
- accessibility baseline
- errors or invariants for invalid composition when applicable

## Documentation

- Public docs should describe usage and user-visible behavior.
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

Before considering a component complete:

- `pnpm check-types`
- `pnpm lint`
- `pnpm build`
- `pnpm --filter @takeoff-ui/react-spar test`
- regenerate docs API output when public types changed
- confirm the component is exported from `src/components/index.ts`
- confirm no CSS is emitted from `packages/react-spar/dist`
- confirm slot classes are registered in `src/theme/recipes.ts`
- confirm docs, generated API tables, tests, and component types describe the
  same contract
