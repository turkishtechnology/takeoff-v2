# React Spar Coding Standards

Applies to all component work under `packages/react-spar/src/components`.

## 1. Component role

- A component in this package is a thin React adapter, not a second component
  framework.
- Behavior and accessibility should stay in the underlying primitive when one
  exists.
- The wrapper owns API translation, DOM structure required for styling, and
  stable slot hooks.

## 2. Public API

- Expose idiomatic React props and callbacks.
- Event props must use `onX` naming. Do not surface prefixed or custom-event
  style names.
- Prefer a clear controlled/uncontrolled pair for stateful components when
  needed.
- Keep the public surface small. Do not leak primitive-only implementation
  details.
- If two props overlap, define precedence explicitly in the type docs and
  implementation.

## 3. File layout

Use this component folder shape by default:

- `<ComponentName>.tsx`: main wrapper
- `<ComponentName>Base.ts`: slot classes, default props, and shared adapter
  helpers
- `types.ts`: public types only
- `index.ts`: local barrel

Rules:

- Prefer a single `ComponentBase` file over separate `style.ts` and
  `internal.ts`.
- Keep the base file focused on slot metadata, defaults, pure encoding helpers,
  and light context wiring.
- Adapter logic (state normalization, controlled/uncontrolled reconciliation,
  value transforms) belongs in a `useComponentAdapter` hook, not in the base
  file.
- Split extra helper files only when the base file becomes hard to read.
- Export the component through the local barrel and `src/components/index.ts`.
- New components use `getSlotProps` for slot prop composition. Touched existing
  components adopt it when the change is low risk.
- Stable components are not rewritten only for stylistic purity.

## 4. Styling contract

- This package does not ship component CSS.
- Shared styling comes from the token CSS entrypoint imported by the consumer.
- `ComponentBase.ts` is the source of truth for slot names.
- Slot keys in `*Base.ts` use `lowerCamelCase` (JS identifiers). Rendered
  `data-slot` values use `kebab-case` (CSS/DOM hooks). This is deliberate:
  `leadingIcon` → `data-slot="leading-icon"`.
- Emitted class names use stable `tk-*` selectors.
- Use `data-slot` for anatomy and `data-*` attributes for stable state or
  variant hooks.
- See `docs/DATA_ATTRIBUTE_VOCABULARY.md` for the canonical attribute list and
  decision rules.
- Every emitted class or `data-*` hook must have a real consumer in styling,
  semantics, or docs.
- Do not add wrapper nodes unless they serve clear visual, semantic, or
  interaction ownership.

## 5. DOM ownership

For any interactive or compound component, identify these separately:

- visual owner: border, radius, spacing, hover, layout
- interactive owner: click, keyboard, focus
- semantic owner: heading, label, region, form semantics

These do not need to be the same node. Make the split intentional.

## 6. React 19 conventions

This package targets React 19+ exclusively. Follow these rules:

- **Do not use `forwardRef`.** Accept `ref` as a regular prop in the component
  signature. Destructure it before passing the remaining props to
  `resolveProps`.
- **Do not use legacy context APIs** (`contextType`, legacy `createContext`
  consumer patterns). Use `useContext` only.
- **Do not use `defaultProps` on function components.** Use JavaScript default
  parameters or `resolveProps` defaults in `ComponentBase`.
- **Do not use string refs.** Only `Ref<T>` from React is acceptable.
- When typing `ref`, use `Ref<HTMLElement>` (not `ForwardedRef`, `RefObject`, or
  `MutableRefObject` which are deprecated or unnecessary in React 19).

Example component signature:

```tsx
function MyComponent({
  ref,
  ...rawProps
}: MyComponentProps & { ref?: Ref<HTMLDivElement> }) {
  const { children, className, ...restProps } =
    MyComponentBase.resolveProps(rawProps);
  // ...
}
```

## 7. Types and defaults

- Start from native React element props with `ComponentPropsWithoutRef` and
  `Omit` conflicts deliberately.
- Use explicit unions for visual variants, sizes, and modes.
- Reflect defaults in both implementation and `@defaultValue` docs.
- Avoid overly broad polymorphism. Support only the concrete render modes the
  package intends to own.
- Prefer `ReactNode` for content slots and document precedence with `children`
  when aliases exist.

## 8. Implementation rules

- Keep JSX shallow; move normalization and derivation above the return block.
- Memoization is allowed only when identity or repeated derivation actually
  matters.
- Use small pure helpers for value normalization, encoding, and equality checks.
- Use `clsx` for class composition instead of local string-join helpers.
- Fire callbacks exactly once per user-visible state change.
- Preserve native semantics for button, link, form, disabled, and loading
  states.
- Icon-only interactive components must still have an accessible name.

## 9. Accessibility

- Do not rewrite keyboard or ARIA behavior that the primitive already provides.
- Wrapper nodes must not break focus, label linkage, heading structure, or
  region ownership.
- When simulating disabled behavior on non-disabled elements, also handle
  `aria-disabled`, focusability, and blocked interaction.

## 10. Documentation

- Public docs describe usage and user-visible behavior only.
- Internal porting history or migration rationale does not belong in component
  comments or public docs unless it changes consumer-facing behavior.
- API docs must separate callback props into an `Events` section instead of
  mixing them into `Props`.
- If a slot, prop, or event changes, regenerate the docs output in
  `apps/docs/src/docs-files`.

## 11. Merge checklist

Before considering a component complete:

- `pnpm check-types`
- `pnpm lint`
- `pnpm build`
- regenerate docs API output when types changed
- confirm no CSS is emitted from `packages/react-spar/dist`
- confirm slot classes are registered in `src/theme/recipes.ts`
- confirm docs, examples, and component types describe the same contract
