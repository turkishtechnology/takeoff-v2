# @takeoff-ui/react-spar

## 0.2.0

### Minor Changes

- [#110](https://github.com/turkishtechnology/takeoff-v2/pull/110)
  [`54e8401`](https://github.com/turkishtechnology/takeoff-v2/commit/54e8401842b3e2ef5c39fb76b2b8e4e0695f922e)
  Thanks [@harun-demir](https://github.com/harun-demir)! - Add accessible
  labeling for the `Chip` remove button. Its accessible name defaults to
  "Remove" and can be customized through the standard slot mechanism, matching
  `Alert.Close`.

  To set a custom label, pass it via the `remove` slot:
  `<Chip slotProps={{ remove: { 'aria-label': '…' } }} />`.

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

- [#120](https://github.com/turkishtechnology/takeoff-v2/pull/120)
  [`2d05b26`](https://github.com/turkishtechnology/takeoff-v2/commit/2d05b268ab669aca55acf2e12e2377167b6e6028)
  Thanks [@harun-demir](https://github.com/harun-demir)! - Add the props-first
  `Table` component (RFC §`docs/rfc-table-component.md`) — the catalog's first
  TanStack-backed component (state engine is `@tanstack/react-table`, not a Spar
  primitive). Phase 1 ships a single `<Table data columns getRowId />` surface
  plus the column-def + slot escape hatch (Tier 1.5): custom `cell`/`header`
  render-props, `meta`/`align`/`sticky`/ `width` cell-container knobs,
  multi-sort with `aria-sort`, column filters in a Spar `Popover`
  (text/checkbox/radio), expandable rows, client/server data (`manual` + bundled
  `onDataRequest`), row selection (single/multiple + select-all) via Spar
  `Checkbox`, pagination via Spar `Select`/`Button`, sticky header + pinned
  columns with the documented `border-collapse: separate` z-index/offset
  contract, density (`size`)/`striped`, native `<table>` a11y, and the data-only
  `getExportRows()` projection (the export engine stays consumer-side). The full
  compound surface (Tier 2) and grouping/virtualization/ inline-edit are
  deferred to post-Phase 1 and do not break the Phase 1 API.

### Patch Changes

- [#109](https://github.com/turkishtechnology/takeoff-v2/pull/109)
  [`7e04360`](https://github.com/turkishtechnology/takeoff-v2/commit/7e0436013b47f3169a0a7bc1efa421a60d81744e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  compound Alert component with variant and appearance styling, actions, close
  handling, docs, and token-driven alert recipes.

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

- [#132](https://github.com/turkishtechnology/takeoff-v2/pull/132)
  [`332b98c`](https://github.com/turkishtechnology/takeoff-v2/commit/332b98c057f5c5de4509656bb382a9b6e2470e1e)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Fix React
  SPAR documentation and wrapper edge cases:

  - Update the README to match the current exported component surface (including
    `Table` and `Toast`) and provider behavior.
  - Compose `slotProps` event handlers for `Alert.Close`, `Chip`, and the
    `Input.Increment` / `Input.Decrement` / `Input.ClearButton` /
    `Input.RevealButton` controls instead of letting them replace internal
    behavior.
  - Keep `Alert.Close`'s `onClose` unconditional: a decorative `onClick` that
    calls `preventDefault` no longer suppresses the alert's dismissal.
  - Stop a non-disabled `Chip` keydown handler and a removable-only `Chip`'s
    remove click from leaking past the `disabled` guard / from blocking event
    bubbling.
  - Preserve custom non-dismissible dismiss handlers in `Drawer.Panel`, matching
    `Dialog.Panel`.
  - Preserve renderable falsy content such as `0` in `Button` and `Badge` slots
    while keeping empty-string content from rendering an empty wrapper, via a
    shared `isRenderableNode` helper used consistently across `Button`, `Badge`,
    `Chip`, and `Alert.Close`.

- [#107](https://github.com/turkishtechnology/takeoff-v2/pull/107)
  [`6b26c62`](https://github.com/turkishtechnology/takeoff-v2/commit/6b26c62e303fff9d809f9aae920623adedef4c81)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the new
  `Chip` component to `@takeoff-ui/react-spar` with token-driven styles in
  `@takeoff-design/tokens`.

  The new component includes clickable and removable variants,
  keyboard-accessible interaction behavior, disabled states, and matching visual
  feedback for interactive chips.

- [#56](https://github.com/turkishtechnology/takeoff-v2/pull/56)
  [`520fcd0`](https://github.com/turkishtechnology/takeoff-v2/commit/520fcd0983739abcfbf277ed9f0b85a3be6739b9)
  Thanks [@ulasturann](https://github.com/ulasturann)! - Fix Input action and
  field correctness bugs:

  - `Input.Increment` / `Input.Decrement` no longer throw when composed with a
    non-number field — `stepUp()` / `stepDown()` are now guarded so a text input
    is a safe no-op instead of an uncaught `InvalidStateError`.
  - `Field.Description` and `Field.ErrorMessage` no longer render a stray
    leading icon when they have no (or empty) content.
  - The password reveal state is reset when the field unmounts, so a later
    password field can't mount already revealed and leak its value as plain
    text.
  - `Input.RevealButton` re-hides the password on form submit even when the form
    or field mounts after the button.
  - `useControllableState` latches controlled vs. uncontrolled mode on the first
    render (matching React's native inputs), so a `value` that flips between
    `undefined` and a real value no longer silently drops internal state.
  - `Input.Strength` is hoisted below the bordered row by component reference
    instead of a `displayName` string, so it still works in minified builds.
  - Perf: the Input context value is memoized (consumers no longer re-render on
    every keystroke) and `Input.Field`'s value-mirror effect only runs when the
    controlled value changes rather than on every render.
  - Internal: centralize the native-value-setter and number-stepping DOM helpers
    shared by the action parts.

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

- [`f6036d6`](https://github.com/turkishtechnology/takeoff-v2/commit/f6036d672cf6c5c0b63c5d4097f15f5b65038da4)
  Thanks [@harun-demir](https://github.com/harun-demir)! - Widen the
  `@takeoff-design/tokens` peer dependency to `>=0.1.2 <1.0.0` and enable
  Changesets' `onlyUpdatePeerDependentsWhenOutOfRange` so a tokens minor (0.2.0)
  no longer force-bumps `@takeoff-ui/react-spar` to a major. react-spar stays
  0.x.

- [#101](https://github.com/turkishtechnology/takeoff-v2/pull/101)
  [`f3c5c27`](https://github.com/turkishtechnology/takeoff-v2/commit/f3c5c2744fb2a495abe3edb00412468e611c15c7)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add dialog
  component

- [#99](https://github.com/turkishtechnology/takeoff-v2/pull/99)
  [`7efc892`](https://github.com/turkishtechnology/takeoff-v2/commit/7efc8922d79cef1f3cb00c9ba6899d39492f7474)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add
  optional prop to field component

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

- [#124](https://github.com/turkishtechnology/takeoff-v2/pull/124)
  [`e5d2339`](https://github.com/turkishtechnology/takeoff-v2/commit/e5d2339ae392c2e44af2373cfb3c90b3484b2f4a)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - **Breaking
  (visual default):** Changed the default `variant` of `Tooltip.Content` and
  `Popover.Content` from `dark` to `white`. Default (no-prop) usages now render
  differently and emit `data-variant="white"` instead of `data-variant="dark"`
  on the content slot.

  Migration:

  - To keep the previous appearance, set the variant explicitly:
    `<Tooltip.Content variant="dark">` / `<Popover.Content variant="dark">`.
  - Retarget any CSS/selectors on `[data-variant="dark"]` for the default state,
    since the default now stamps `data-variant="white"`.

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

- [#97](https://github.com/turkishtechnology/takeoff-v2/pull/97)
  [`39000d2`](https://github.com/turkishtechnology/takeoff-v2/commit/39000d2fda272e631550604f2389187a78ea1091)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Create
  label component

- [#66](https://github.com/turkishtechnology/takeoff-v2/pull/66)
  [`ac14c1d`](https://github.com/turkishtechnology/takeoff-v2/commit/ac14c1d8d3b624a3d1b6402bce77102b7df0a92d)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - **Breaking
  (Button):** Renamed the `isLoading` and `isPressed` props to `loading` and
  `pressed`.

  Migration — find-and-replace on `<Button>` usages:

  - `<Button isLoading>` / `isLoading={x}` → `<Button loading>` / `loading={x}`
  - `<Button isPressed>` / `isPressed={x}` → `<Button pressed>` / `pressed={x}`

  `onPressedChange` is unchanged.

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

- Updated dependencies [415e689]
  - @takeoff-design/tokens@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [5e186be]
  - @takeoff-design/tokens@0.1.1

## 0.1.0

### Patch Changes

- b74c836: Narrow `@takeoff-design/tokens` peer dependency from `>=0.1.0-beta.0`
  to the exact `0.1.0-beta.0`. Required so Changesets can automatically bump the
  peer pin when tokens is re-released; range specifiers (`>=`, `^`, `~`) are not
  managed by the cross-package propagation rule and would otherwise drift. From
  this point forward every tokens release is paired with a react-spar patch that
  updates the peer pin.
- Updated dependencies [90eff3d]
  - @takeoff-design/tokens@0.1.0
