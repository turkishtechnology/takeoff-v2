# @takeoff-design/tokens

## 0.2.0

### Minor Changes

- [#56](https://github.com/turkishtechnology/takeoff-v2/pull/56)
  [`520fcd0`](https://github.com/turkishtechnology/takeoff-v2/commit/520fcd0983739abcfbf277ed9f0b85a3be6739b9)
  Thanks [@ulasturann](https://github.com/ulasturann)! - Complete Input parity
  with takeoff-ui: chips, counter, and styling fixes.

  - Added `Input.Chips` and `Input.Chip` for chips/tags inputs. `Input.Chips`
    owns a `string[]` value (controlled `value` / `onValueChange` or
    uncontrolled `defaultValue`), commits the trimmed field text on Enter or an
    optional `separator`, removes the last tag on Backspace, and supports `max`
    / `allowDuplicates`. `Input.Chip` is a removable token with a focusable,
    labelled remove button. v1 is `string[]`-only (no object values /
    `chipLabelKey` / `chipOptions` / `chipDisabled`).
  - Added the **counter** treatment: placing `Input.Decrement` /
    `Input.Increment` as direct children flanking `Input.Field` (outside
    `Input.Stepper`) now centers the value and paints the step buttons in the
    brand colour, matching takeoff-ui. No `mode` prop is introduced.
  - Added `useControllableState` and a `PlaceholderAdd` glyph.
  - Parity fixes: read-only field text is no longer dimmed (matches takeoff-ui),
    and the strength-meter gap and prefix/suffix dividers now use design tokens
    (`--spacing-xs` / `--spacing-px`).
  - Documented that masking/formatting is consumer-owned (via `Input.Field`
    `onChange`), the password reveal is a keyboard-accessible toggle, and number
    stepping is native-only.

- [#56](https://github.com/turkishtechnology/takeoff-v2/pull/56)
  [`520fcd0`](https://github.com/turkishtechnology/takeoff-v2/commit/520fcd0983739abcfbf277ed9f0b85a3be6739b9)
  Thanks [@ulasturann](https://github.com/ulasturann)! - Refactor Input compound
  anatomy and complete design-system parity.

  - Removed `Input.Container`.
  - Moved the bordered row onto the `Input` root.
  - Added `Input.LeadingIcon` and `Input.TrailingIcon`.
  - Added `Input.ClearButton`, `Input.Spinner`, and `Input.RevealButton`.
  - Added `Input.Strength`, a four-segment password strength meter that grades
    the field value and renders below the bordered row.
  - Added `Input.Stepper`, `Input.Decrement`, and `Input.Increment` for native
    number input stepping.
  - Reshaped the placeholder eye / eye-off icons to the design system's Material
    Symbols glyphs and added a matching `lock` icon.
  - `Field.Description` and `Field.ErrorMessage` now render a leading info /
    error icon, matching the design system's helper-text anatomy.

  **Breaking — migration.** `Input.Container` and its types/CSS are removed; the
  bordered row is now the `Input` root itself.

  - Markup: move the field, prefix/suffix, and icons directly inside `<Input>`.
    Old `startContent` / `endContent` move to the new `Input.LeadingIcon` /
    `Input.TrailingIcon` parts (these render `aria-hidden`; for interactive
    trailing content use `Input.ClearButton` / `Input.RevealButton` instead).

    ```tsx
    // before (0.1.2)
    <Input>
      <Input.Container startContent={<SearchIcon />} endContent={<ClearIcon />}>
        <Input.Field />
      </Input.Container>
    </Input>

    // after
    <Input>
      <Input.LeadingIcon>
        <SearchIcon />
      </Input.LeadingIcon>
      <Input.Field />
      <Input.TrailingIcon>
        <ClearIcon />
      </Input.TrailingIcon>
    </Input>
    ```

  - Types: replace `InputContainerProps` (and `InputContainerOwnProps` /
    `InputContainerSlot`) with `InputProps`, or the relevant part props
    (`InputLeadingIconProps` / `InputTrailingIconProps`).
  - CSS: retarget custom selectors — `.tk-input-container` → `.tk-input` (the
    row box, border, `:hover`, `:focus-within`, and the `[data-invalid]` /
    `[data-disabled]` / `[data-readonly]` state hooks now live on the
    `.tk-input` root); `.tk-input-start-content` → `.tk-input-leading-icon`
    (`Input.LeadingIcon`); `.tk-input-end-content` → `.tk-input-trailing-icon`
    (`Input.TrailingIcon`).

- [#104](https://github.com/turkishtechnology/takeoff-v2/pull/104)
  [`8c11f76`](https://github.com/turkishtechnology/takeoff-v2/commit/8c11f76c6bd2c38d3b9c911ec03625bd38260765)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Drawer:
  rename the `dismissable` prop and the `Drawer.CloseButton` part, and add an
  opt-in `blur` prop to `Drawer.Overlay`.

  > **Heads-up for consumers — these are breaking renames.** They are released
  > as `minor` (not `major`) on purpose while the library has a single consumer,
  > to avoid churning the major version during this phase. A find-and-replace
  > covers the migration:
  >
  > - **Prop:** `<Drawer dismissable={false}>` → `<Drawer dismissible={false}>`
  > - **Part:** `<Drawer.CloseButton>` → `<Drawer.Close>`
  > - **Type:** `DrawerCloseButtonProps` → `DrawerCloseProps`
  > - **CSS class:** `.tk-drawer-close-button` → `.tk-drawer-close`
  >
  > New: `<Drawer.Overlay blur />` adds a soft backdrop blur (emits
  > `data-blur`).

### Patch Changes

- [#109](https://github.com/turkishtechnology/takeoff-v2/pull/109)
  [`7e04360`](https://github.com/turkishtechnology/takeoff-v2/commit/7e0436013b47f3169a0a7bc1efa421a60d81744e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  compound Alert component with variant and appearance styling, actions, close
  handling, docs, and token-driven alert recipes.

- [#126](https://github.com/turkishtechnology/takeoff-v2/pull/126)
  [`98c787d`](https://github.com/turkishtechnology/takeoff-v2/commit/98c787d2cbb0fd81766a882cfe792f91d49a9395)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Update
  colors of headers for dark mode in card, dialog and drawer components

- [#112](https://github.com/turkishtechnology/takeoff-v2/pull/112)
  [`9f778a8`](https://github.com/turkishtechnology/takeoff-v2/commit/9f778a8c056c20a78d1afa402fb970163072491f)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the new
  Spinner component with size, variant, and appearance options, accessibility
  defaults, decorative `aria-hidden` handling, token recipe styles, and
  documentation.

- [#103](https://github.com/turkishtechnology/takeoff-v2/pull/103)
  [`624a7f4`](https://github.com/turkishtechnology/takeoff-v2/commit/624a7f4a37c8f4645bd95cf50175323c37c55a08)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add Card
  component with compound sections, styles, and docs

- [#94](https://github.com/turkishtechnology/takeoff-v2/pull/94)
  [`36b535d`](https://github.com/turkishtechnology/takeoff-v2/commit/36b535d7bcfc9be7e1de8bd170d41a58e2920a78)
  Thanks [@ulasturann](https://github.com/ulasturann)! - Add the compound
  `Breadcrumb` component (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`,
  `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`) along with its
  design-system styles and docs.

- [#107](https://github.com/turkishtechnology/takeoff-v2/pull/107)
  [`6b26c62`](https://github.com/turkishtechnology/takeoff-v2/commit/6b26c62e303fff9d809f9aae920623adedef4c81)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the new
  `Chip` component to `@takeoff-ui/react-spar` with token-driven styles in
  `@takeoff-design/tokens`.

  The new component includes clickable and removable variants,
  keyboard-accessible interaction behavior, disabled states, and matching visual
  feedback for interactive chips.

- [#131](https://github.com/turkishtechnology/takeoff-v2/pull/131)
  [`b05ba5f`](https://github.com/turkishtechnology/takeoff-v2/commit/b05ba5f5786aced57fae99ab50c64e12ef310445)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Update
  close button styles in alert dialog and drawer components

- [#56](https://github.com/turkishtechnology/takeoff-v2/pull/56)
  [`520fcd0`](https://github.com/turkishtechnology/takeoff-v2/commit/520fcd0983739abcfbf277ed9f0b85a3be6739b9)
  Thanks [@ulasturann](https://github.com/ulasturann)! - More Input fixes from
  the review:

  - `Input.Chips` ignores keystrokes during IME composition, so pressing Enter
    to confirm a CJK candidate no longer commits a half-composed chip.
  - `Input.Chips`'s key handling now re-binds when the field element is replaced
    (e.g. a re-keyed/remounted `Input.Field`), so Enter/Backspace keep working.
  - `Input.ClearButton` now clears chips too: it stays visible while there are
    committed tags (not only typed text) and one click wipes the typed text and
    every tag. Content-owning parts register a reset with the Input so a single
    clear empties the whole field.
  - Drop 5 dead positional parameters from the `input-size` SCSS mixin (their
    bodies were removed in the anatomy refactor); compiled CSS is unchanged.

- [#56](https://github.com/turkishtechnology/takeoff-v2/pull/56)
  [`520fcd0`](https://github.com/turkishtechnology/takeoff-v2/commit/520fcd0983739abcfbf277ed9f0b85a3be6739b9)
  Thanks [@ulasturann](https://github.com/ulasturann)! - Input: gate the counter
  look on an explicit `data-layout="counter"` hook.

  The counter treatment (centered value with brand-coloured flanking
  increment/decrement buttons) is selected by setting `data-layout="counter"` on
  the `Input` root. Without the attribute, the same markup renders as a plain
  left-aligned number field, so the styled treatment is an explicit, documented
  opt-in rather than something inferred from element placement.

  ```tsx
  <Input data-layout="counter">
    <Input.Decrement />
    <Input.Field type="number" />
    <Input.Increment />
  </Input>
  ```

  The change is entirely in the `tk-input` recipe; no `@takeoff-ui/react-spar`
  component code changes (the `Input` root already forwards arbitrary `data-*`
  attributes to the DOM).

- [#91](https://github.com/turkishtechnology/takeoff-v2/pull/91)
  [`f9a14e8`](https://github.com/turkishtechnology/takeoff-v2/commit/f9a14e8b54ed87790ae8ea06825aefd771e4148a)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Update the
  styling of the switch component according to the design system

- [#92](https://github.com/turkishtechnology/takeoff-v2/pull/92)
  [`bcfc8c4`](https://github.com/turkishtechnology/takeoff-v2/commit/bcfc8c45cd4c40d17f4446c433f6e8c723ccc637)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Update
  styles of the select component according to the design system

- [#65](https://github.com/turkishtechnology/takeoff-v2/pull/65)
  [`aa60d5b`](https://github.com/turkishtechnology/takeoff-v2/commit/aa60d5b2fa4be70acdc3a9eaa06c55aa7c1ef5ba)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Refine
  button styles

- [#64](https://github.com/turkishtechnology/takeoff-v2/pull/64)
  [`c5ab13f`](https://github.com/turkishtechnology/takeoff-v2/commit/c5ab13fcdce3af5532b9e328da045204ac51a19b)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Refine
  drawer styles

- [#101](https://github.com/turkishtechnology/takeoff-v2/pull/101)
  [`f3c5c27`](https://github.com/turkishtechnology/takeoff-v2/commit/f3c5c2744fb2a495abe3edb00412468e611c15c7)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add dialog
  component

- [#63](https://github.com/turkishtechnology/takeoff-v2/pull/63)
  [`c64f340`](https://github.com/turkishtechnology/takeoff-v2/commit/c64f340050781f46c62b5310055bf3c0aa0dc961)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Refine
  popover styles

- [#120](https://github.com/turkishtechnology/takeoff-v2/pull/120)
  [`2d05b26`](https://github.com/turkishtechnology/takeoff-v2/commit/2d05b268ab669aca55acf2e12e2377167b6e6028)
  Thanks [@harun-demir](https://github.com/harun-demir)! - Add a customizable
  disclosure indicator to `Select`, mirroring `Accordion.Indicator`.
  `Select.Trigger` now renders a chevron at its trailing edge by default — it
  flips direction and turns the primary color when open. The new `indicator`
  prop on `Select.Trigger` overrides it: pass a node for a custom static icon, a
  render function `({ isOpen }) => …` to swap icons by open state, or `false` to
  hide it. A standalone `Select.Indicator` compound part (default chevron +
  render-prop children) is also available for full layout control inside the
  trigger's render-prop children.

  A render-function `children` on `Select.Trigger` opts out of the built-in
  indicator and value wrapper entirely, so full-layout-control usages own every
  node without a doubled chevron. The trigger's value region and indicator are
  now addressable slots (`value` / `indicator`) via `classNames` / `slotProps`.

  Chevrons come from the official `@takeoff-icons/react` set (outlined/rounded);
  `Accordion.Indicator` is switched to the same icons so both stay consistent.

  > **Heads-up (visual breaking) — released as `minor` on purpose.** Because the
  > trigger now shows a chevron by default, existing `Select` usages gain a
  > disclosure indicator without any code change. Per the 0.x release policy we
  > ship this as `minor` (not `major`) while the library has a single consumer,
  > to avoid churning the major version during this phase. Pass
  > `indicator={false}` to opt out.

- [#88](https://github.com/turkishtechnology/takeoff-v2/pull/88)
  [`aeb9c58`](https://github.com/turkishtechnology/takeoff-v2/commit/aeb9c587fe126e143b125420df7066fcb037ae4e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! -
  **Breaking:** Removed the `type` prop (`'default' | 'card'`) from `Radio`,
  together with the `card` variant. The exported `RadioType` type, the
  `data-type` attribute on `.tk-radio` / `.tk-radio-item`, and the
  `[data-type='card']` style recipe are all gone.

  Updated Radio styles and docs after the API removal, including focus,
  disabled, and invalid focus visuals for the remaining variants.

  Migration:

  - Remove the `type` prop: `<Radio type="card">` → `<Radio>` (and drop the
    no-op `type="default"`). The built-in `card` (bordered-row) presentation no
    longer exists — wrap the radio in your own bordered container (or the
    Takeoff `Card` tokens) if you need it.
  - Remove any `import type { RadioType } from '@takeoff-ui/react-spar'`; there
    is no replacement type.
  - Retarget custom CSS: selectors on `.tk-radio[data-type='card']` /
    `.tk-radio-item[data-type='card']` will never match again — replace them
    with your own class/wrapper.

- [#51](https://github.com/turkishtechnology/takeoff-v2/pull/51)
  [`6260d67`](https://github.com/turkishtechnology/takeoff-v2/commit/6260d6711b2e08ea00668b0faaa194167fed732d)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add teal,
  white, dark badge variants; fix outlined border colors and update dot size to
  8px

- [#89](https://github.com/turkishtechnology/takeoff-v2/pull/89)
  [`548cfc4`](https://github.com/turkishtechnology/takeoff-v2/commit/548cfc42e92ee3716582d2f0a13be1967301de8e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! -
  **Breaking:** Removed the `type` prop (`'default' | 'card'`) from `Checkbox`,
  together with the `card` variant. The exported `CheckboxType` type, the
  `data-type` attribute on the checkbox root, and the
  `.tk-checkbox[data-type='card']` style recipe are all gone.

  Updated Checkbox styles and docs to match the simplified API, including
  disabled, focus, and invalid focus visuals for the remaining default variant.

  Migration:

  - Remove the `type` prop: `<Checkbox type="card">` → `<Checkbox>` (and drop
    the no-op `type="default"`). The built-in `card` (bordered-row) presentation
    no longer exists — wrap the checkbox in your own bordered container (or the
    Takeoff `Card` tokens) if you need it.
  - Remove any `import type { CheckboxType } from '@takeoff-ui/react-spar'`;
    there is no replacement type.
  - Retarget custom CSS: selectors on `.tk-checkbox[data-type='card']` /
    `[data-type='default']` will never match again — replace them with your own
    class/wrapper.

- [#100](https://github.com/turkishtechnology/takeoff-v2/pull/100)
  [`9263be0`](https://github.com/turkishtechnology/takeoff-v2/commit/9263be048ad5cabbe9a24238514f6f869395a501)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add `Tabs`
  component built on the Spar primitive, with horizontal and vertical
  orientation, four appearances (`basic`, `compact`, `divided`, `expanded`),
  three color variants (`primary`, `info`, `neutral`), and three sizes (`small`,
  `base`, `large`). Exposes the compound `Tabs.List` / `Tabs.Trigger` /
  `Tabs.Content` API and forwards Spar's controlled/uncontrolled selection
  state.

- [#119](https://github.com/turkishtechnology/takeoff-v2/pull/119)
  [`04ecf50`](https://github.com/turkishtechnology/takeoff-v2/commit/04ecf504f641fa81305cb5f354ac92a1c6ea069a)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  Toast component and toaster styles.

  - Added React Spar `Toast`, `Toaster`, and `createToaster` exports powered by
    the Spar headless toast controller.
  - Added default Alert-based toast rendering with title, description, close,
    and action anatomy.
  - Added support for toast types, appearances, promise toasts, updates,
    persistent toasts, duration, max visible toasts, page-idle pausing, custom
    rendering, positions, and overlap stacks.
  - Added token recipe styles for toast viewport placement, default layout,
    enter/exit motion, overlap expansion, width constraints, and stacked z-index
    ordering.
  - Added Toast documentation, API tables, and demos.

- [#62](https://github.com/turkishtechnology/takeoff-v2/pull/62)
  [`d9eed3b`](https://github.com/turkishtechnology/takeoff-v2/commit/d9eed3b19fa9ac2a11cc7d3809adc6c172261a1e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Refine
  tooltip styles

- [#97](https://github.com/turkishtechnology/takeoff-v2/pull/97)
  [`39000d2`](https://github.com/turkishtechnology/takeoff-v2/commit/39000d2fda272e631550604f2389187a78ea1091)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Create
  label component

- [#93](https://github.com/turkishtechnology/takeoff-v2/pull/93)
  [`1363a3b`](https://github.com/turkishtechnology/takeoff-v2/commit/1363a3b5273cac88f3582b3f14269c7d75a52612)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Set tk-font

## 0.1.2

### Patch Changes

- 415e689: Refresh release to recover the `latest` dist-tag.

  The 0.1.1 release stalled in an inconsistent state: the auto-snapshot step
  published `0.1.1` (instead of `0.1.1-next-<sha>`) to the `next` dist-tag, and
  when the Version Packages PR for 0.1.1 was merged the stable publish was
  skipped with "version 0.1.1 is already published." That left `latest` pointing
  at `0.1.0` while `next` pointed at `0.1.1`.

  This bump publishes both packages as `0.1.2` and restores `latest` to the
  intended head. No source changes since 0.1.1 — the published artifact for
  0.1.2 is byte-equivalent to the 0.1.1 already on `next`.

## 0.1.1

### Patch Changes

- 5e186be: Remove `width: fit-content`, `max-width: 100%`, and the
  `&[data-full-width]` escape hatch from the `.tk-button` recipe. The default
  `display: inline-flex` already shrink-to-fits like a native `<button>`, so the
  explicit declarations only served to override consumer-supplied width
  utilities (e.g. Tailwind `w-full`) when the recipe stylesheet loaded after
  them in the cascade.

  The `data-full-width` attribute was a workaround inherited from takeoff-ui's
  Web Component era, where Shadow DOM isolation made consumer CSS unreachable.
  In react-spar consumers style buttons directly with class names or inline
  styles, so the attribute had no remaining purpose and is also removed from the
  data-attribute vocabulary doc.

  No DOM API changes — `<Button>` does not gain or lose any prop.

## 0.1.0

### Patch Changes

- 90eff3d: Catch up the published package with the form-primitive token recipes
  that have been accumulating in the repo since `0.1.0-beta.0`. Bumps the
  prerelease counter from `beta.0` to `beta.1`.

  New recipe stylesheets:
  - `_checkbox.scss` — Checkbox + Indicator parts, state matrix.
  - `_radio.scss` — Radio compound, including selected/disabled.
  - `_switch.scss` — Switch with size + variant tokens.
  - `_field.scss` — Field wrapper for labelled inputs.
  - `_input.scss` — Input compound styles wired to the new Field.
  - `_popover.scss` — Popover surface + Header + Description.
  - `_drawer.scss` — Drawer surface.
  - `_tooltip.scss` — Tooltip surface + Provider.
  - `_badge.scss` — Badge surface.
  - `_select.scss` — Select recipe added in this batch, plus a follow-up
    refinement that aligns panel + items with the Figma dropdown token family
    (`--dropdown-items-basic-*`, layered `Effect1-Default-Sm` shadow,
    `--background-lightest` hover).

  Token additions are additive — no existing tokens were removed or renamed.
  Consumers on `0.1.0-beta.0` see the new variables but never the absence of an
  old one.
