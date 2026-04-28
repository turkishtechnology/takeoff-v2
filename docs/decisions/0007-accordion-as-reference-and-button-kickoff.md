# ADR-0007: Accordion as the reference component, Button kickoff checklist

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`@takeoff-ui/react-spar` has shipped exactly one compound component to date —
`Accordion`. The other components named in the public surface (`Button`,
`Checkbox`, `Dialog`, `Input`) appear in audit and aspirational sample-app code
but have not been ported.

This ADR's purpose is twofold:

1. **Pin Accordion as the reference implementation.** Until its public API,
   adapter shape, export policy, and customization contract were stable, the
   architecture docs were describing the intent and the actual code partially
   contradicted them (Spar state props leaked through `AccordionProps`, the
   barrel re-exported subcomponents and `*Base` helpers, instance `classNames` /
   `slotProps` were undocumented on the surface).
2. **Block Button from copying the partial state.** Component ports are
   templated. If Button starts before Accordion is clean, the unfinished
   architecture multiplies across the package.

## Decision

### Accordion is the reference. Lock-in conditions

A new component port may use Accordion as its template only when **all** of the
following are true. (Each one was verified on the
`feat/api-contract-and-accordion-mode` branch before this ADR landed; tests in
`packages/react-spar/src/components/accordion/Accordion.test.tsx` pin the
behavior.)

- [x] Public root API speaks Takeoff vocabulary only: `activeIndex`,
      `defaultActiveIndex`, `onActiveIndexChange`, `allowMultiple`, `type`,
      `mode`, `size`. Spar's `value`, `defaultValue`, `onValueChange`,
      `type='single'|'multiple'`, and `isCollapsible` are `omitted` from the
      public type via `Omit<...>`.
- [x] Public item API uses `itemKey: string | number`. Spar's `value` is omitted
      from `AccordionItemProps`. The root injects positional numeric keys for
      items declared without `itemKey`. The wrapper warns once when
      `Accordion.Item` mounts outside `Accordion`'s child-walk.
- [x] State-shape conversion lives in `useAccordionAdapter`, not in
      `Accordion.tsx`. The hook owns single↔multi normalization, the
      `allowMultiple → type` mapping, and round-tripping the original
      `AccordionItemKey` shape on the callback.
- [x] Local barrel exports the compound root only (`Accordion`). Subcomponents
      and `*Base` helpers are package-internal — `slot-registry.ts` reaches them
      through `accordion/base` directly. ADR-0002 enforces this.
- [x] `displayName` is dotted on every subcomponent (`Accordion`,
      `Accordion.Item`, `Accordion.Header`, `Accordion.Trigger`,
      `Accordion.Content`, `Accordion.Arrow`).
- [x] Instance-level `classNames` and `slotProps` are first-class props on every
      public surface. Precedence is canonical → theme → instance for class
      composition; `data-*` and the canonical `tk-*` class are protected from
      override. `buildSlotAttrs` carries this contract.
- [x] Tests cover the Takeoff state API (controlled, uncontrolled, callback
      shape and call count, single vs multi, numeric vs string itemKey), the
      compound anatomy, the customization layers, and the legacy
      `type='compact'` deprecation.

If Accordion regresses on any of the above, fix Accordion first. Do not start a
new component on a regressed reference.

### Button kickoff checklist

Use this checklist as the planning artifact for the Button port, before any code
lands in `packages/react-spar/src/components/button/`. Each item maps to a
section of the architecture or contract docs.

#### Pre-flight artifacts

- [ ] `tools/button-api-alignment.html` is filled in with one row per Core prop
      / event / slot, one row per Spar prop / callback / part, and one row per
      react-spar-only surface. Decisions logged for every row; rationale
      required for `adapt`, `rename`, `deprecated`, `omitted`. (Framework:
      `docs/api-decision-framework.md`.)
- [ ] Link to ADRs created for any wrapper-only public surface or behavior
      change beyond Core. ADR-0003 (Spar delegation) and ADR-0004 (no render
      overrides) almost always apply; cite explicitly.
- [ ] `apps/docs/docs/components/button.mdx` outline drafted (Usage, API,
      Anatomy, Migration, Accessibility headings).

#### File layout (`packages/react-spar/src/components/button/`)

Mirrors the Accordion layout exactly. Must contain:

- [ ] `Button.tsx` — root + every compound subcomponent (`Object.assign`
      assembly), `useButtonAdapter` call, `ButtonVariantProvider` for context.
- [ ] `base.ts` — slot keys, `tk-*` classes, `defaultProps`, archetype JSDoc per
      slot. One `createComponentBase` instance per registered customization key
      (root + each multi-slot subcomponent).
- [ ] `useButtonAdapter.ts` — Core ↔ Spar translation, JSX-free. Responsible
      for: `loading`-derived flags, controlled/uncontrolled state reconciliation
      if Button gains stateful behavior, link-mode flag derivation. ADR-0003
      forbids re-implementing Spar's keyboard/focus.
- [ ] `context.ts` — `createSafeContext<ButtonVariantContextValue>` for passing
      variant/size/loading/disabled to `Button.Label`, `Button.Spinner`,
      `Button.LeadingIcon`, `Button.TrailingIcon`.
- [ ] `defaults.ts` — `DEFAULT_VARIANT`, `DEFAULT_SIZE`, etc. matched to Core
      defaults.
- [ ] `types.ts` — `ButtonProps`, `ButtonOwnProps`, every subcomponent's props,
      every slot key union, `ButtonClassNames`, `ButtonSlotProps`. No Spar state
      names leak through. Polymorphic `<T extends ElementType>` base, with
      state-only Spar props omitted.
- [ ] `Button.test.tsx` — see Test coverage below.
- [ ] `index.ts` — exports `Button` (compound) and the public types only. No
      subcomponent named exports, no `*Base` exports.

#### Public API rules

- [ ] Variant union matches Core verbatim
      (`primary | secondary | neutral |     info | success | danger | warning | white | black`).
- [ ] `loading: boolean` is preserved; the `Spinner` subcomponent only renders
      when `loading` is true. No `spinner` slot prop.
- [ ] `iconPosition` is `omitted`. Replaced by `Button.LeadingIcon` /
      `Button.TrailingIcon`. Documented as such in the decision sheet.
- [ ] Render-override props (`renderIcon`, `renderSpinner`, `renderLeadingIcon`,
      `renderTrailingIcon`) are forbidden per ADR-0004.
- [ ] Flat content props (`label`) are `compound` from day one — no deprecation
      shim because Button has not shipped before in this package.
- [ ] Stencil `tk-click` → React `onClick`; payload preserved.
- [ ] Link-mode bypass (rendering `<a>` directly because SparButton's keyboard
      handler `preventDefault`s Enter on non-native elements) is classified
      `bypass`. Carries `// exemption: <reason>` at the render site **and**
      `@bypass <reason>` in `base.ts`. (See archetype example in
      `docs/component-architecture.md`.)

#### Customization plumbing

- [ ] Every public surface accepts instance-level `classNames` and `slotProps`,
      typed against the slot union.
- [ ] `buildSlotAttrs` is fed both `themeSlotProps`/`themeClassNames` from
      `useComponentTheme` and `instanceSlotProps`/`instanceClassNames` from
      props, in one call per slot.
- [ ] `ComponentCustomizationRegistry` in `src/customization/contracts.ts`
      registers `Button`, `Button.Label`, `Button.Spinner`,
      `Button.LeadingIcon`, `Button.TrailingIcon` so provider-level theming is
      type-checked.

#### Test coverage

(Mirror Accordion's split. Each bullet is one or more `it(...)` blocks.)

- [ ] Variant/size/loading/disabled emit the canonical `data-*` hooks on the
      root.
- [ ] Compound anatomy: root + every subcomponent renders the correct `tk-*`
      class and `data-slot`.
- [ ] `loading` true → `Button.Spinner` renders; false → it does not. Same
      pattern for `LeadingIcon` / `TrailingIcon` when their children are
      omitted.
- [ ] Click triggers `onClick` once. Disabled / loading suppress the callback.
- [ ] Link-mode bypass: passing `as='a'` (or whatever the resolved polymorphic
      API is) renders an `<a>` and forwards `href` / `target` / `rel`.
      `tk-click` Enter handler does not block native navigation.
- [ ] Compound `displayName`: `Button`, `Button.Label`, `Button.Spinner`,
      `Button.LeadingIcon`, `Button.TrailingIcon`.
- [ ] Customization layering: instance `classNames` appended after theme
      `classNames`; instance `slotProps` overrides theme on non-canonical keys;
      canonical `tk-*` class and `data-slot` never drop.
- [ ] `vitest-axe` baseline pass for the default and disabled states.

#### Validation gate

`docs/component-port-readiness.md` is the merge gate. The Button port PR
attaches its decision sheet, parity review, and react-enhancement review
templates from that gate. Skipping any of those rows means the work is not
ready, regardless of how complete the implementation looks.

## Consequences

- ✅ The Accordion implementation is locked in as the reference. Drift is
  treated as a regression, not a refactor.
- ✅ Button starts from a fully resolved template, eliminating the "first port
  disagrees with the second" debt.
- ❌ Locking the reference creates a small ongoing maintenance cost: any
  improvement to the architecture must be propagated to both Accordion and the
  Button kickoff checklist before it counts as adopted.
- ❌ A future component (`Dialog`, `Input`, `Checkbox`) that conflicts with the
  Accordion-derived contract triggers an ADR rather than a quiet divergence.

## References

- `docs/contract-model.md` § "State model policy", § "Customization surfaces".
- `docs/api-decision-framework.md` § "Spar props", § "Spar callbacks".
- `docs/component-architecture.md` § "File responsibilities".
- `docs/component-port-readiness.md` (the merge gate).
- `decisions/0002-compound-export-policy.md` (compound-only barrel).
- `decisions/0003-spar-delegation-rule.md` (don't re-implement Spar behavior;
  bypass requires `@bypass` rationale).
- `decisions/0004-no-render-overrides.md` (no render-override props on new
  ports).
- `tools/button-api-alignment.html` (decision sheet — kept blank in the
  react-spar column for the Button port).
- `packages/react-spar/src/components/accordion/` — the reference implementation
  this checklist mirrors.
