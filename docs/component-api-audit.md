# Component API Audit

Comparative API surface for the first port batch — **Button, Accordion,
Checkbox, Input, Dialog**. Three layers per component: takeoff-ui Core
(Stencil), Spar (headless React primitive), `@takeoff-ui/react-spar` (current
state).

The disposition column applies the
[divergence taxonomy](./contract-model.md#divergence-taxonomy):
`preserve / adapt / rename / compound / deprecated / omitted`.

> Decision sheets are the canonical, mutable per-component artifact. Refresh via
> `$generate-api-alignment`. This audit doc is the human-readable snapshot for
> review and is regenerated when the decision sheets export markdown.

---

## Cross-cutting findings

These come up in multiple components and are settled here so each component's
table can be read without repeating them.

| Finding                                                                                                                      | Disposition policy                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Stencil `tk-change`, `tk-blur`, `tk-focus`, `tk-clear-click`                                                                 | `rename` to React `onChange` / `onBlur` / `onFocus` / `onClearClick`.                                     |
| Stencil `tk-visible-change`, `tk-active-index-change`, `tk-open`, `tk-close`                                                 | `rename` to React `onVisibleChange` / `onActiveIndexChange` / `onOpen` / `onClose`.                       |
| Spar `value` / `defaultValue` / `onValueChange` / `open` / `defaultOpen` / `onOpenChange`                                    | `omitted` from the public surface. Adapter hook maps Takeoff names onto these internally.                 |
| `renderIcon`, `renderLeadingIcon`, `renderTrailingIcon`, `renderSpinner`, `renderClearIcon` on shipped components            | `deprecated`. Replaced by compound subcomponents per [ADR-0004](./decisions/0004-no-render-overrides.md). |
| Flat content props (`label`, `description`, `error`, `header`, `subheader`, `footer`, `footerActions`) on shipped components | `deprecated`. Replaced by compound subcomponents in the same release.                                     |
| Stencil `mode='counter' \| 'chips' \| 'password'` on Input                                                                   | `omitted`. Split into separate wrappers (`NumberInput`, `ChipsInput`, `PasswordInput`).                   |
| Stencil imperative methods (`open()`, `close()`, `focus()`, `clear()`)                                                       | `omitted` from public API; replaced by controlled state, refs, or callbacks.                              |

---

## Button

**Current state:** not started. Decision sheet draft at
`tools/button-api-alignment.html`. No
`packages/react-spar/src/components/button/`.

**Sources surveyed**

- `takeoff-ui/packages/core/src/components/tk-button/tk-button.tsx`
- `spar/packages/spar/src/components/Button/`

**Decision table**

| #   | Layer | Source name       | Source type                                                                                                   | Wrapper name          | Wrapper kind | Disposition | Rationale                                                                               |
| --- | ----- | ----------------- | ------------------------------------------------------------------------------------------------------------- | --------------------- | ------------ | ----------- | --------------------------------------------------------------------------------------- |
| 1   | core  | `variant`         | `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning' \| 'white' \| 'black'` | `variant`             | prop         | preserve    | Same name, same union, default `'primary'`.                                             |
| 2   | core  | `type`            | `'filled' \| 'filledLight' \| 'outlined' \| 'text'`                                                           | `type`                | prop         | preserve    | Visual type. Distinct from `variant`.                                                   |
| 3   | core  | `size`            | `'large' \| 'base' \| 'small'`                                                                                | `size`                | prop         | preserve    | Default `'base'`.                                                                       |
| 4   | core  | `mode`            | `'button' \| 'submit' \| 'reset' \| 'link'`                                                                   | `mode`                | prop         | preserve    | `link` triggers `<a>` rendering with documented bypass; see ADR-0003 example row.       |
| 5   | core  | `disabled`        | `boolean`                                                                                                     | `disabled`            | prop         | preserve    | Mapped to Spar `disabled`.                                                              |
| 6   | core  | `loading`         | `boolean`                                                                                                     | `loading`             | prop         | preserve    | Mapped to Spar `isLoading` inside adapter. Triggers `Button.Spinner` render.            |
| 7   | core  | `fullWidth`       | `boolean`                                                                                                     | `fullWidth`           | prop         | preserve    | Emits `data-full-width=""`.                                                             |
| 8   | core  | `rounded`         | `boolean`                                                                                                     | `rounded`             | prop         | preserve    | Emits `data-rounded=""`.                                                                |
| 9   | core  | `underline`       | `boolean`                                                                                                     | `underline`           | prop         | preserve    | Emits `data-underline=""` on label.                                                     |
| 10  | core  | `href`            | `string`                                                                                                      | `href`                | prop         | preserve    | Active when `mode='link'`.                                                              |
| 11  | core  | `target`          | `string`                                                                                                      | `target`              | prop         | preserve    | Active when `mode='link'`.                                                              |
| 12  | core  | `label`           | `string`                                                                                                      | (children)            | compound     | compound    | New port — flat label not exposed. Use `<Button>Children</Button>` or `<Button.Label>`. |
| 13  | core  | `icon`            | `string \| IIconOptions \| IMultiIconOptions`                                                                 | (compound)            | compound     | compound    | Replaced by `Button.LeadingIcon` / `Button.TrailingIcon`.                               |
| 14  | core  | `iconPosition`    | `'left' \| 'right'`                                                                                           | —                     | —            | omitted     | Replaced by which subcomponent the consumer mounts.                                     |
| 15  | core  | `tk-click`        | `MouseEvent`                                                                                                  | `onClick`             | callback     | rename      | React idiom. Spar `onClick` semantics preserved.                                        |
| 16  | spar  | `as`              | `ElementType`                                                                                                 | —                     | —            | omitted     | Element selection driven by `mode`. Polymorphism is not public.                         |
| 17  | spar  | `isLoading`       | `boolean`                                                                                                     | (via `loading`)       | prop         | omitted     | Mapped from Core `loading` in adapter.                                                  |
| 18  | spar  | `isPressed`       | `boolean`                                                                                                     | —                     | —            | omitted     | Toggle behavior is `Toggle`/`ToggleGroup` territory, not Button.                        |
| 19  | spar  | `onPressedChange` | `(pressed: boolean) => void`                                                                                  | —                     | —            | omitted     | Same as #18.                                                                            |
| 20  | wrap  | (new)             | —                                                                                                             | `Button.Label`        | subcomponent | (new)       | Canonical content owner. Always rendered when children are present.                     |
| 21  | wrap  | (new)             | —                                                                                                             | `Button.LeadingIcon`  | subcomponent | (new)       | Renders only when present.                                                              |
| 22  | wrap  | (new)             | —                                                                                                             | `Button.TrailingIcon` | subcomponent | (new)       | Renders only when present.                                                              |
| 23  | wrap  | (new)             | —                                                                                                             | `Button.Spinner`      | subcomponent | (new)       | Renders only when `loading=true`. Replaces the absent `renderSpinner`.                  |

**Open decisions**

- Does `mode='reset'` carry the same `<button type="reset">` semantics as Core,
  or do we collapse `submit`/`reset` to native `type` on the element? Default
  for the port: preserve Core's vocabulary, set `type` on the rendered
  `<button>` accordingly.
- Icon-only Button accessibility: required `aria-label` on the root when no
  `Button.Label` is present. Enforced by lint rule (TODO) or runtime warning.

---

## Accordion

**Current state:** shipped. Files in
`packages/react-spar/src/components/accordion/` (Accordion, AccordionItem,
AccordionHeader, AccordionTrigger, AccordionContent, AccordionArrow). The `type`
/ `mode` split has shipped: `type='compact'` is now an `@deprecated` back-compat
alias that emits a one-time dev warning and is normalized to
`(type='grouped', mode='compact')` at the root.

**Sources surveyed**

- `takeoff-ui/packages/core/src/components/tk-accordion/tk-accordion.tsx`
- `spar/packages/spar/src/components/Accordion/`
- `packages/react-spar/src/components/accordion/`

**Decision table**

| #   | Layer | Source name                                     | Source type                                | Wrapper name                                     | Wrapper kind | Disposition | Rationale                                                                                                                                                                                              |
| --- | ----- | ----------------------------------------------- | ------------------------------------------ | ------------------------------------------------ | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | core  | `activeIndex`                                   | `string \| number \| (string \| number)[]` | `activeIndex`                                    | prop         | preserve    | Public controlled API. Adapter normalizes shape against `allowMultiple`.                                                                                                                               |
| 2   | core  | (initial activeIndex)                           | (Core uses initial children)               | `defaultActiveIndex`                             | prop         | adapt       | React-idiomatic uncontrolled name.                                                                                                                                                                     |
| 3   | core  | `tk-active-index-change`                        | `string \| number \| (string \| number)[]` | `onActiveIndexChange`                            | callback     | rename      | React idiom. Payload preserved.                                                                                                                                                                        |
| 4   | core  | `allowMultiple`                                 | `boolean`                                  | `allowMultiple`                                  | prop         | preserve    | Default `false`.                                                                                                                                                                                       |
| 5   | core  | `arrowPosition`                                 | `'left' \| 'right'`                        | `arrowPosition`                                  | prop         | preserve    | Default `'right'`. Read by `Accordion.Arrow`.                                                                                                                                                          |
| 6   | core  | `expandIcon`                                    | `string \| IIconOptions`                   | (children of `.Arrow`)                           | compound     | compound    | Pass icon as children to `Accordion.Arrow` via function-as-children `({ isOpen }) => ...`.                                                                                                             |
| 7   | core  | `collapseIcon`                                  | `string \| IIconOptions`                   | (children of `.Arrow`)                           | compound     | compound    | Same as `expandIcon`. Function-as-children switches on `isOpen`.                                                                                                                                       |
| 8   | core  | `hideArrows`                                    | `boolean`                                  | `hideArrows`                                     | prop         | preserve    | Default `false`. When `true`, `Accordion.Arrow` renders `null`.                                                                                                                                        |
| 9   | core  | `type`                                          | `'grouped' \| 'divided'`                   | `type`                                           | prop         | preserve    | **Shipped.** `'compact'` remains in the union for one major as a deprecated alias; narrowing happens in the next major.                                                                                |
| 10  | core  | `mode`                                          | `'default' \| 'compact'`                   | `mode`                                           | prop         | preserve    | **Shipped.** Default `'default'`. Emits `data-mode` on root. Legacy `type='compact'` upgrades to `mode='compact'` when no explicit `mode` is passed.                                                   |
| 11  | core  | `tk-accordion-item-selected`                    | `{ index, active }` (deprecated in Core)   | —                                                | —            | omitted     | Already deprecated upstream. Not surfaced.                                                                                                                                                             |
| 12  | core  | `<slot>` (children)                             | `tk-accordion-item` children               | `Accordion.Item`                                 | subcomponent | compound    | Already shipped.                                                                                                                                                                                       |
| 13  | spar  | `type='single' \| 'multiple'`                   | discriminator                              | (via `allowMultiple`)                            | prop         | omitted     | Mapped from `allowMultiple`. Not public.                                                                                                                                                               |
| 14  | spar  | `value`, `defaultValue`, `onValueChange`        | string-keyed                               | (adapter)                                        | —            | omitted     | Mapped to/from Core `activeIndex`/`defaultActiveIndex`.                                                                                                                                                |
| 15  | spar  | `isCollapsible`                                 | `boolean`                                  | —                                                | —            | omitted     | Always collapsible in this wrapper. Re-introduce only with an ADR.                                                                                                                                     |
| 16  | spar  | `orientation`                                   | `'vertical' \| 'horizontal'`               | —                                                | —            | omitted     | Vertical only. Horizontal accordion is not part of Core's vocabulary.                                                                                                                                  |
| 17  | spar  | `AccordionItem`, `Header`, `Trigger`, `Content` | parts                                      | `Accordion.Item / .Header / .Trigger / .Content` | subcomponent | compound    | Inherited archetype. Already wired.                                                                                                                                                                    |
| 18  | wrap  | (existing)                                      | `'grouped' \| 'divided' \| 'compact'`      | `type`                                           | prop         | deprecated  | **Shipped:** `'compact'` value is `@deprecated`; using it logs one dev warning per instance and normalizes to `(type='grouped', mode='compact')` so existing call sites keep working until next major. |
| 19  | wrap  | (existing)                                      | `'base' \| 'large'`                        | `size`                                           | prop         | (review)    | Wrapper-only. Not in Core. Confirm it's a recipe-driven hook; otherwise needs ADR.                                                                                                                     |
| 20  | wrap  | `Accordion.Arrow`                               | `({ isOpen }) => ReactNode` children       | `Accordion.Arrow`                                | subcomponent | compound    | React-enhancement archetype. No upstream Spar arrow part.                                                                                                                                              |

**Open decisions**

- Wrapper-only `size: 'base' | 'large'` (row 19) — does it reflect a Core prop
  we missed, or is it a wrapper-introduced surface? If wrapper-only, needs an
  ADR.
- Spar owns `data-type` on the SparAccordion root for its `single` / `multiple`
  state discriminator (row 13). The wrapper therefore emits `data-type` on
  `Accordion.Item` only and emits `data-mode` / `data-size` on the root. Capture
  as a port note + add to the readiness gate's styling-contract notes when the
  next component port surfaces a similar conflict.

---

## Checkbox

**Current state:** shipped. Implementation in
`packages/react-spar/src/components/checkbox/` per the changeset. Several
shipped surfaces are now `deprecated` per the contract model and ADR-0004.

**Sources surveyed**

- `takeoff-ui/packages/core/src/components/tk-checkbox/tk-checkbox.tsx`
- `spar/packages/spar/src/components/Checkbox/`
- `.changeset/checkbox-component.md`

**Decision table**

| #   | Layer | Source name             | Source type                                      | Wrapper name           | Wrapper kind | Disposition | Rationale                                                                                             |
| --- | ----- | ----------------------- | ------------------------------------------------ | ---------------------- | ------------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| 1   | core  | `value`                 | `boolean` (mutable)                              | `value` (tri-state)    | prop         | adapt       | Promoted to `boolean \| null` to carry indeterminate. Spar `'indeterminate'` ↔ wrapper `null`.        |
| 2   | core  | (initial value)         | (Core mutates `value`)                           | `defaultValue`         | prop         | adapt       | React-idiomatic uncontrolled name.                                                                    |
| 3   | core  | `indeterminate`         | `boolean` (mutable)                              | `indeterminate`        | prop         | preserve    | Sugar; overrides `value`/`defaultValue` when `true`.                                                  |
| 4   | core  | `disabled`              | `boolean`                                        | `disabled`             | prop         | preserve    | Default `false`.                                                                                      |
| 5   | core  | `invalid`               | `boolean`                                        | `invalid`              | prop         | preserve    | Default `false`. Emits `data-invalid=""`.                                                             |
| 6   | core  | `name`                  | `string`                                         | `name`                 | prop         | preserve    | Spar's hidden input renders only when `name` is set.                                                  |
| 7   | core  | `type`                  | `'default' \| 'card'`                            | `type`                 | prop         | preserve    | Default `'default'`.                                                                                  |
| 8   | core  | `size`                  | `'small' \| 'base'`                              | `size`                 | prop         | preserve    | Default `'base'`.                                                                                     |
| 9   | core  | `label`                 | `string`                                         | `label`                | prop         | deprecated  | **Already shipped.** Replaced by `Checkbox.Label`. Removed next major.                                |
| 10  | core  | `description`           | `string`                                         | `description`          | prop         | deprecated  | **Already shipped.** Replaced by `Checkbox.Description`. Removed next major.                          |
| 11  | core  | `<slot name="content">` | (children override)                              | `Checkbox.Content`     | subcomponent | compound    | Compound replacement for the content slot.                                                            |
| 12  | core  | `tk-change`             | `(value: boolean \| null) => void`               | `onChange`             | callback     | rename      | React idiom. Tri-state payload preserved.                                                             |
| 13  | core  | `(none)`                | —                                                | `formValue`            | prop         | (wrap-only) | Wrap-only convenience: gates Spar's hidden input. Default `'on'`.                                     |
| 14  | core  | `(none)`                | —                                                | `readOnly`             | prop         | (wrap-only) | Wrap-only; passes through to Spar.                                                                    |
| 15  | core  | `(none)`                | —                                                | `required`             | prop         | (wrap-only) | Wrap-only; passes through to Spar.                                                                    |
| 16  | spar  | `checked`               | `true \| false \| 'indeterminate'`               | (via `value`)          | —            | omitted     | Mapped from `value`/`indeterminate` in adapter.                                                       |
| 17  | spar  | `defaultChecked`        | same                                             | (via `defaultValue`)   | —            | omitted     | Mapped in adapter.                                                                                    |
| 18  | spar  | `onChange`              | `(checked: CheckedState) => void`                | (via `onChange`)       | —            | omitted     | Mapped in adapter.                                                                                    |
| 19  | spar  | (render-prop children)  | `({ checked, indeterminate, ... }) => ReactNode` | (via `Checkbox.Icon`)  | —            | omitted     | Wrapper exposes `Checkbox.Icon` with function-as-children.                                            |
| 20  | wrap  | (existing)              | `({ checked, indeterminate }) => ReactNode`      | `renderIcon`           | prop         | deprecated  | **Already shipped.** Replaced by `Checkbox.Icon` function-as-children. Removed next major (ADR-0004). |
| 21  | wrap  | (new)                   | —                                                | `Checkbox.Label`       | subcomponent | (new)       | Compound replacement for `label` prop.                                                                |
| 22  | wrap  | (new)                   | —                                                | `Checkbox.Description` | subcomponent | (new)       | Compound replacement for `description` prop.                                                          |
| 23  | wrap  | (new)                   | —                                                | `Checkbox.Icon`        | subcomponent | (new)       | Compound replacement for `renderIcon` prop. Function-as-children supported.                           |

**Open decisions**

- The `avatar` card variant is deferred to a sibling `AvatarCheckbox` per the
  changeset. Confirm it lands alongside the Radio family when the recipe is
  ready.
- The `indeterminate` prop's precedence over `value` / `defaultValue` is
  documented; assert in tests.

---

## Input

**Current state:** shipped, base-mode only. Counter, chips, password, and mask
modes deferred to siblings (`NumberInput`, `ChipsInput`, `PasswordInput`).
Render-overrides shipped → deprecated.

**Sources surveyed**

- `takeoff-ui/packages/core/src/components/tk-input/tk-input.tsx`
- `spar/packages/spar/src/components/Input/`
- `.changeset/input-component.md`

**Decision table**

| #   | Layer | Source name                                                                  | Source type                                   | Wrapper name                                                            | Wrapper kind | Disposition | Rationale                                                                              |
| --- | ----- | ---------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- | ------------ | ----------- | -------------------------------------------------------------------------------------- |
| 1   | core  | `value`                                                                      | `string \| number`                            | `value`                                                                 | prop         | preserve    | Adapter normalizes to string for Spar.                                                 |
| 2   | core  | (initial value)                                                              | —                                             | `defaultValue`                                                          | prop         | adapt       | React-idiomatic uncontrolled name.                                                     |
| 3   | core  | `tk-change`                                                                  | `(value: string \| number) => void`           | `onChange`                                                              | callback     | rename      | React idiom.                                                                           |
| 4   | core  | `tk-blur`                                                                    | `void`                                        | `onBlur`                                                                | callback     | rename      | React idiom.                                                                           |
| 5   | core  | `tk-focus`                                                                   | `void`                                        | `onFocus`                                                               | callback     | rename      | React idiom.                                                                           |
| 6   | core  | `tk-clear-click`                                                             | `void`                                        | `onClearClick`                                                          | callback     | rename      | Stays distinct from `onChange` because consumers may need it for analytics.            |
| 7   | core  | `disabled`                                                                   | `boolean`                                     | `disabled`                                                              | prop         | preserve    |                                                                                        |
| 8   | core  | `readonly`                                                                   | `boolean`                                     | `readOnly`                                                              | prop         | rename      | React's standard prop name.                                                            |
| 9   | core  | `required`                                                                   | (none directly; via `showAsterisk`)           | `required`                                                              | prop         | adapt       | Reflects native required state; drives `Input.Asterisk`.                               |
| 10  | core  | `invalid`                                                                    | `boolean`                                     | `invalid`                                                               | prop         | preserve    | Drives `Input.ErrorMessage`.                                                           |
| 11  | core  | `clearable`                                                                  | `boolean`                                     | `clearable`                                                             | prop         | preserve    | Drives `Input.ClearButton`.                                                            |
| 12  | core  | `loading`                                                                    | `boolean`                                     | `loading`                                                               | prop         | preserve    | Drives `Input.Spinner`.                                                                |
| 13  | core  | `size`                                                                       | `'large' \| 'base' \| 'small'`                | `size`                                                                  | prop         | preserve    |                                                                                        |
| 14  | core  | `placeholder`                                                                | `string`                                      | `placeholder`                                                           | prop         | preserve    |                                                                                        |
| 15  | core  | `name`                                                                       | `string`                                      | `name`                                                                  | prop         | preserve    |                                                                                        |
| 16  | core  | `min`                                                                        | `string \| number`                            | `min`                                                                   | prop         | preserve    |                                                                                        |
| 17  | core  | `max`                                                                        | `string \| number`                            | `max`                                                                   | prop         | preserve    |                                                                                        |
| 18  | core  | `step`                                                                       | `string`                                      | `step`                                                                  | prop         | preserve    |                                                                                        |
| 19  | core  | `pre`                                                                        | `string`                                      | `prefix`                                                                | prop         | rename      | React idiom; "pre" is ambiguous.                                                       |
| 20  | core  | `icon`                                                                       | `string \| IIconOptions \| IMultiIconOptions` | (compound)                                                              | —            | deprecated  | **Already shipped as `icon`.** Replaced by `Input.LeadingIcon` / `Input.TrailingIcon`. |
| 21  | core  | `iconPosition`                                                               | `'left' \| 'right'`                           | (compound)                                                              | —            | deprecated  | **Already shipped.** Replaced by which subcomponent the consumer mounts.               |
| 22  | core  | `label`                                                                      | `string`                                      | `label`                                                                 | prop         | deprecated  | **Already shipped.** Replaced by `Input.Label`. Removed next major.                    |
| 23  | core  | `hint`                                                                       | `string`                                      | `description`                                                           | prop         | deprecated  | **Already shipped as `description`.** Replaced by `Input.Description`.                 |
| 24  | core  | `error`                                                                      | `string`                                      | `error`                                                                 | prop         | deprecated  | **Already shipped.** Replaced by `Input.ErrorMessage`.                                 |
| 25  | core  | `showAsterisk`                                                               | `boolean`                                     | (via `required`)                                                        | —            | omitted     | Asterisk presence derived from `required`.                                             |
| 26  | core  | `mode='text'`                                                                | `'text'`                                      | `type='text'`                                                           | prop         | rename      | Mapped to `type`.                                                                      |
| 27  | core  | `mode='number'`                                                              | `'number'`                                    | `type='number'`                                                         | prop         | rename      | Mapped to `type`.                                                                      |
| 28  | core  | `mode='password'`                                                            | `'password'`                                  | —                                                                       | —            | omitted     | Split into `PasswordInput`. Already deferred per changeset.                            |
| 29  | core  | `mode='counter'`                                                             | `'counter'`                                   | —                                                                       | —            | omitted     | Split into `NumberInput`. Already deferred per changeset.                              |
| 30  | core  | `mode='chips'`                                                               | `'chips'`                                     | —                                                                       | —            | omitted     | Split into `ChipsInput`. Already deferred per changeset.                               |
| 31  | core  | `maskOptions`                                                                | `IInputMaskOptions` (Cleave.js)               | —                                                                       | —            | omitted     | Split into `MaskedInput`. Already deferred per changeset.                              |
| 32  | core  | `chipLabelKey`, `chipOptions`, `chipDisabled`                                | various                                       | —                                                                       | —            | omitted     | Belong to `ChipsInput`.                                                                |
| 33  | core  | `showSafetyStatus`, `hidePasswordIcon`                                       | password-only                                 | —                                                                       | —            | omitted     | Belong to `PasswordInput`.                                                             |
| 34  | spar  | `Input`, `InputField`, `InputLabel`, `InputDescription`, `InputErrorMessage` | parts                                         | `Input.Field`, `Input.Label`, `Input.Description`, `Input.ErrorMessage` | subcomponent | compound    | Inherited archetype.                                                                   |
| 35  | wrap  | (existing)                                                                   | `({ ... }) => ReactNode`                      | `renderLeadingIcon`                                                     | prop         | deprecated  | **Already shipped.** Replaced by `Input.LeadingIcon`. Removed next major (ADR-0004).   |
| 36  | wrap  | (existing)                                                                   | `({ ... }) => ReactNode`                      | `renderTrailingIcon`                                                    | prop         | deprecated  | Same.                                                                                  |
| 37  | wrap  | (existing)                                                                   | `({ ... }) => ReactNode`                      | `renderSpinner`                                                         | prop         | deprecated  | Same.                                                                                  |
| 38  | wrap  | (existing)                                                                   | `({ ... }) => ReactNode`                      | `renderClearIcon`                                                       | prop         | deprecated  | Same.                                                                                  |
| 39  | wrap  | (new)                                                                        | —                                             | `Input.Container`                                                       | subcomponent | (new)       | React-enhancement; visual chrome around the field.                                     |
| 40  | wrap  | (new)                                                                        | —                                             | `Input.LeadingIcon`                                                     | subcomponent | (new)       | Compound replacement.                                                                  |
| 41  | wrap  | (new)                                                                        | —                                             | `Input.TrailingIcon`                                                    | subcomponent | (new)       | Compound replacement.                                                                  |
| 42  | wrap  | (new)                                                                        | —                                             | `Input.Prefix`                                                          | subcomponent | (new)       | Replaces `pre`.                                                                        |
| 43  | wrap  | (new)                                                                        | —                                             | `Input.Suffix`                                                          | subcomponent | (new)       | New surface; symmetric to `Input.Prefix`.                                              |
| 44  | wrap  | (new)                                                                        | —                                             | `Input.ClearButton`                                                     | subcomponent | (new)       | Renders only when `clearable && value`.                                                |
| 45  | wrap  | (new)                                                                        | —                                             | `Input.Spinner`                                                         | subcomponent | (new)       | Renders only when `loading=true`.                                                      |
| 46  | wrap  | (new)                                                                        | —                                             | `Input.Asterisk`                                                        | subcomponent | (new)       | Renders only when `required=true`.                                                     |

**Open decisions**

- Does the `invalid` ↔ `description` ↔ `error` relationship match Core's rule
  that `error` overrides `hint` when present? Encode in adapter, assert in
  tests.
- Confirm `readOnly` rename does not have a `readonly` deprecation alias on the
  shipped surface. If it does, mark `readonly` as `deprecated` here.

---

## Dialog

**Current state:** not started. No `packages/react-spar/src/components/dialog/`.
No alignment worksheet yet.

**Sources surveyed**

- `takeoff-ui/packages/core/src/components/tk-dialog/tk-dialog.tsx`
- `spar/packages/spar/src/components/Dialog/`

**Decision table**

| #   | Layer | Source name                             | Source type                                              | Wrapper name           | Wrapper kind | Disposition | Rationale                                                                                        |
| --- | ----- | --------------------------------------- | -------------------------------------------------------- | ---------------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------ |
| 1   | core  | `visible`                               | `boolean`                                                | `visible`              | prop         | preserve    | Public controlled API.                                                                           |
| 2   | core  | (initial visible)                       | (Core uses prop directly)                                | `defaultVisible`       | prop         | adapt       | React-idiomatic uncontrolled name.                                                               |
| 3   | core  | `tk-visible-change`                     | `boolean`                                                | `onVisibleChange`      | callback     | rename      | React idiom.                                                                                     |
| 4   | core  | `tk-open`                               | `void`                                                   | `onOpen`               | callback     | rename      | Lifecycle callback.                                                                              |
| 5   | core  | `tk-close`                              | `void`                                                   | `onClose`              | callback     | rename      | Lifecycle callback.                                                                              |
| 6   | core  | `variant`                               | `'success' \| 'info' \| 'warning' \| 'danger'`           | `variant`              | prop         | preserve    | Default `'info'`.                                                                                |
| 7   | core  | `headerType`                            | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'` | `headerType`           | prop         | preserve    | Default `'basic'`.                                                                               |
| 8   | core  | `maskVariant`                           | `'lightest' \| 'light' \| 'base' \| 'dark' \| 'darkest'` | `maskVariant`          | prop         | preserve    | Default `'base'`.                                                                                |
| 9   | core  | `isMaskBlur`                            | `boolean`                                                | `isMaskBlur`           | prop         | preserve    | Default `false`.                                                                                 |
| 10  | core  | `hideBackdrop`                          | `boolean`                                                | `hideBackdrop`         | prop         | preserve    | Default `false`. When `true`, `Dialog.Mask` renders `null`.                                      |
| 11  | core  | `preventDismiss`                        | `boolean`                                                | `preventDismiss`       | prop         | preserve    | Maps to Spar dismissal blocking; documented behavior in port note.                               |
| 12  | core  | `showCloseButton`                       | `boolean`                                                | (compound)             | —            | omitted     | New port. Mount or omit `Dialog.CloseButton`. No flat prop.                                      |
| 13  | core  | `showHeader`                            | `boolean`                                                | (compound)             | —            | omitted     | Mount or omit `Dialog.Header`. No flat prop.                                                     |
| 14  | core  | `showVariantSign`                       | `boolean`                                                | (compound)             | —            | omitted     | Mount or omit `Dialog.SignIcon`. No flat prop.                                                   |
| 15  | core  | `header`                                | `string`                                                 | (compound)             | —            | omitted     | New port. Use `Dialog.Title`.                                                                    |
| 16  | core  | `subheader`                             | `string`                                                 | (compound)             | —            | omitted     | Use `Dialog.Description`.                                                                        |
| 17  | core  | `containerStyle`                        | `CSSStyleProperties`                                     | (slotProps)            | —            | omitted     | Use `slotProps.panel`.                                                                           |
| 18  | core  | `<slot name="header">`                  | —                                                        | `Dialog.Header`        | subcomponent | compound    | Inherited if Spar exposes one; otherwise react-enhancement.                                      |
| 19  | core  | `<slot name="content">`                 | —                                                        | `Dialog.Body`          | subcomponent | compound    | React-enhancement.                                                                               |
| 20  | core  | `<slot name="footer">`                  | —                                                        | `Dialog.Footer`        | subcomponent | compound    | React-enhancement.                                                                               |
| 21  | core  | `<slot name="footer-actions">`          | —                                                        | `Dialog.FooterActions` | subcomponent | compound    | React-enhancement.                                                                               |
| 22  | core  | `<slot name="container">`               | —                                                        | `Dialog.Panel`         | subcomponent | compound    | Maps to Spar `DialogContent`; inherited.                                                         |
| 23  | core  | `open()` method                         | imperative                                               | (controlled state)     | —            | omitted     | Set `visible=true` or use `defaultVisible`.                                                      |
| 24  | core  | `close()` method                        | imperative                                               | (controlled state)     | —            | omitted     | Set `visible=false`.                                                                             |
| 25  | spar  | `open` / `defaultOpen` / `onOpenChange` | string-keyed                                             | (adapter)              | —            | omitted     | Mapped to `visible` / `defaultVisible` / `onVisibleChange`.                                      |
| 26  | spar  | `modal`                                 | `boolean`                                                | —                      | —            | omitted     | Always `true` on this wrapper. Re-introduce only with an ADR.                                    |
| 27  | spar  | `forceMount`                            | `boolean`                                                | —                      | —            | omitted     | Animation library hook; not a Takeoff vocabulary surface.                                        |
| 28  | spar  | `DialogTrigger`                         | render-props part                                        | —                      | —            | omitted     | Trigger is consumer-controlled via `setVisible(true)`. No wrapper trigger primitive.             |
| 29  | spar  | `DialogContent`                         | part                                                     | `Dialog.Panel`         | subcomponent | compound    | Inherited.                                                                                       |
| 30  | spar  | `DialogTitle`                           | part                                                     | `Dialog.Title`         | subcomponent | compound    | Inherited. Provides `aria-labelledby` link.                                                      |
| 31  | spar  | `DialogClose`                           | part                                                     | `Dialog.CloseButton`   | subcomponent | compound    | Inherited. Calls `setVisible(false)` via context.                                                |
| 32  | spar  | `DialogOverlay`                         | part                                                     | `Dialog.Mask`          | subcomponent | compound    | Inherited where Spar provides it. ADR-0003 requires the upstream part be rendered, not bypassed. |
| 33  | wrap  | (new)                                   | —                                                        | `Dialog.Description`   | subcomponent | (new)       | Inherited if Spar exposes `DialogDescription`; else react-enhancement.                           |
| 34  | wrap  | (new)                                   | —                                                        | `Dialog.SignIcon`      | subcomponent | (new)       | React-enhancement. Visual sign per `variant`.                                                    |

**Open decisions**

- Confirm Spar's `DialogOverlay` is renderable as `Dialog.Mask` without a
  bypass. If Spar's overlay ergonomics conflict with `hideBackdrop=true`,
  document the bypass per ADR-0003.
- `showCloseButton` is a shipped Core prop. The wrapper's compound-only approach
  drops it entirely. Document the migration: "to hide the close button, do not
  mount `Dialog.CloseButton`".

---

## Snapshot of follow-on tasks

These are surfaced by the audit and feed back into the plan:

- ~~**Accordion type/mode refactor** (TS-009 sub-task).~~ **Done.** `mode` prop
  shipped, `type='compact'` is a deprecated back-compat alias with a one-time
  dev warning. Final type narrowing scheduled for the next major.
- **Checkbox compound surface ports** (TS-014). Ship `Checkbox.Label`,
  `Checkbox.Description`, `Checkbox.Icon`. Mark `label`, `description`,
  `renderIcon` `@deprecated` with runtime warning.
- **Input compound surface ports** (TS-018). Ship the missing `Input.*`
  subcomponents and `@deprecated` markers on every flat content prop and every
  `renderX` prop.
- **Button port** (TS-011, TS-012). New from scratch following the table above.
- **Dialog port** (TS-015, TS-016). New from scratch following the table above.
- **NumberInput, ChipsInput, PasswordInput, MaskedInput** (TS-019). Separate
  decision sheets and ports, each anchored against the base Input contract.
- **Sibling components** (`AvatarCheckbox`, `Radio`, …): out of scope for this
  audit batch.
