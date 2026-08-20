# @takeoff-design/tokens

## 0.4.0

### Minor Changes

- [#183](https://github.com/turkishtechnology/takeoff-v2/pull/183)
  [`de05dc2`](https://github.com/turkishtechnology/takeoff-v2/commit/de05dc251633de7e90dcf9839703c9abd433b044)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Drop
  `full-screen` from `Drawer`'s `placement`.

  `placement` answers which edge the panel belongs to, and every other value in
  the union drives a directional slide off that edge. `full-screen` answered a
  different question — how big the panel is — and had to opt out of the axis it
  was sitting on: the recipe gave it `transition: none` and `transform: none`,
  then reintroduced a scale + opacity pair so it had any entry animation at all.
  One value in a four-value enum carrying its own animation model is the shape
  of a second concern wearing the first one's clothes.

  `DrawerPlacement` is now `'left' | 'right' | 'top' | 'bottom'`, and the
  `[data-placement='full-screen']` blocks are gone from the drawer recipe. A
  full-screen drawer is built by keeping the edge that owns the slide-in and
  stretching `Drawer.Panel` to the viewport with a style override — documented
  with a live example on the Drawer docs page. Leave `transform` alone in that
  override; the recipe drives the open/close slide through it.

  Consumers passing `placement="full-screen"` get a type error and should move
  to the override. Nothing else about the drawer changes.

- [#177](https://github.com/turkishtechnology/takeoff-v2/pull/177)
  [`74eae25`](https://github.com/turkishtechnology/takeoff-v2/commit/74eae2587456961722a841ca96470a86e3db5bca)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  `Upload` file control — a click-to-browse trigger, a drag-and-drop dropzone, a
  per-file list with previews and status, validation, and a read-only view mode
  — plus the matching `tk-upload` recipes in the tokens package.

  `Upload` is composition-first: the root owns the value and the validation, and
  every capability comes from placing the matching part rather than toggling a
  prop — no `Upload.Dropzone`, no drag-and-drop. The anatomy is
  `Upload.Dropzone`, `Upload.Actions`, `Upload.Trigger`, `Upload.Submit`, and
  `Upload.List` with an `Upload.Item` per file, whose `Upload.ItemPreview` /
  `Upload.ItemContent` / `Upload.ItemActions` regions render by default and are
  replaced by composing that part in the row.

  It owns selection, validation, and drag-and-drop only — no part performs the
  network upload, `Upload.Submit` included. That stays the consumer's: started
  from `onFileAccept` as files are accepted, or from `Upload.Submit`'s `onClick`
  when the user sends the batch. `status` / `progress` are consumer-owned for
  the same reason. The component only displays them (`idle` / `uploading` /
  `processing` / `completed` / `error`), and the progress bar draws only while
  `uploading` with a numeric `progress`.

  `Upload.Submit` is a `Button` that disables itself whenever sending makes no
  sense — while the value is empty, and while a batch is already going (any file
  `uploading` or `processing`), which is the double-submit guard the status
  vocabulary makes cheap. It takes `Upload.Trigger`'s `outlined` / `neutral`
  treatment rather than Button's own. Its place is beside the Trigger, in the
  zone — browse and send are one decision — and since the zone stacks its
  children, the two go in an `Upload.Actions`: a layout row that holds whatever
  is put in it, `--spacing-m-base` apart, so a third control or a file count
  sits on the same line just as well. `readOnly` leaves Submit live, since
  handing a fixed list upstream does not change it.

  The value is an `UploadFile` that points at a `File` rather than being one — a
  plain object with no constructor to import, so an attachment that already
  lives on the server is described with a `url` and an optional `thumbUrl`.
  Validation runs on `accept`, `maxFileSize`, `maxFileCount`, and `multiple`;
  rejected files never enter `value`, and `onFilesReject` hands back the limit
  that broke (`file-too-large`, `file-invalid-type`, `too-many-files`) rather
  than a sentence. `onFileAccept` reports only the entries that just arrived.

  `Upload.ItemAction` is the single per-file control: `action` names it and is
  mirrored as `data-action`, `'download'` and `'remove'` arrive wired, and any
  other name — `'preview'`, `'retry'` — takes its behavior from `onClick`, its
  glyph from `children`, and its wording from `label`. Built-in behavior runs
  after `onClick` unless it is `preventDefault()`ed — the same veto
  `Upload.Trigger` honours, and one `Upload.Dropzone` deliberately does not,
  since on a drop `preventDefault()` is required boilerplate rather than an
  intent. The part is polymorphic, so `as="a"` with an `href` hands the download
  to the platform, and an `as`-rendered control stays activatable from the
  keyboard.

  `Upload.ItemPreview` draws an image thumbnail (`thumbUrl`, or the file itself
  through an object URL revoked on unmount), a shipped Takeoff icon for the
  known formats, or the uppercased extension as a badge — matched on extension
  first, MIME type second, with a failed image falling back to the icon.

  Every word the component renders on its own comes from a root prop, one per
  string — `uploadingLabel`, `processingLabel`, `completedLabel`, `errorLabel`,
  `progressLabel`, `downloadLabel`, `removeLabel` — so a localized app sets them
  app-wide through the provider's `components` map. The accessible-name three
  take `{name}` as a placeholder rather than a suffix, so a translation can move
  the file name inside the sentence; emptying a status string silences it, while
  the other three are accessible names on icon-only controls and cannot be
  silenced. File size is a number, not a label, so `Intl` formats it in the
  runtime's locale.

  `readOnly` keeps files rendered and downloadable but drops the remove action
  entirely and freezes `Upload.Trigger` in place; `disabled` changes no shape
  and goes inert under the root's `data-disabled`; `invalid` is the danger
  treatment. All three resolve as `own prop ?? Field ?? false`, and composing
  inside a `Field` wires the label and helper/error text to the root's
  `role="group"`.

  The docs API generator changed with it: `escapeMarkdownCell` now writes `{`
  and `}` as entities outside inline code spans, because a JSDoc `@defaultValue`
  carrying a `{name}` placeholder reached the mdx unescaped and MDX parsed it as
  a JSX expression, failing SSG. It is shared infrastructure rather than an
  Upload detail — every generated API table goes through it, so re-running
  `gen:api` can reflow cells on component pages that have nothing to do with
  this change.

### Patch Changes

- [#178](https://github.com/turkishtechnology/takeoff-v2/pull/178)
  [`11a602a`](https://github.com/turkishtechnology/takeoff-v2/commit/11a602a841b11852783e43a5d93efb367481d552)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Stop Button
  and Chip from thickening the icons they hold.

  Both recipes coloured the SVGs in their icon slots with `fill: currentColor`
  **and** `stroke: currentColor` — a defensive pair carried since the first
  Button commit, so that a glyph would take the control's colour whether it was
  drawn as a fill or as a stroke. On the Takeoff icon set, which draws every
  glyph as a filled path, the second declaration is not a no-op: it paints SVG's
  default 1-unit-wide outline centred on each path edge, adding a full unit to a
  24-unit glyph. A close mark's arms went from ~1.5 units to ~2.5 — roughly 1.6x
  the intended weight, and visibly heavier than the same icon rendered outside a
  button (an Upload row's status marks next to its action buttons made the
  difference obvious).

  The `stroke` is dropped from `.tk-button-content svg` /
  `.tk-button-spinner svg` and `.tk-chip-remove svg`. The eight icons that
  genuinely are stroke-drawn (`funnel`, `filter-horizontal`) carry their own
  `stroke="currentColor"` and `stroke-width` attributes, so they keep colouring
  correctly — which is also why the fix is a removal rather than a
  `stroke: none`, since that would override those attributes and erase the
  glyphs entirely.

- [#184](https://github.com/turkishtechnology/takeoff-v2/pull/184)
  [`04aad7d`](https://github.com/turkishtechnology/takeoff-v2/commit/04aad7d8610a0570e76a7499562e28d0829d54de)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Give
  `Field`'s label and the standalone `Label` the inset their design tokens have
  always defined for them.

  `.tk-field-label` and `.tk-label` carried no padding at all, so a label sat
  flush against the edge of its wrapper while the `input-external-label-*`
  family — the same family `Input` and `Select` already read their padding, gap,
  and radius from — shipped `label-h-padding` / `label-v-padding` entries that
  no recipe consumed. Both recipes now apply them: `8px` horizontal, `0`
  vertical. `Field` steps down to the small variant (`6px`) when the control it
  wraps reports `data-size="small"`, matching how `Input` and `Select` scale;
  the standalone `Label` has no size context to read, so it stays on the large
  inset.

  Two hand-written offsets go away in the same pass. The required asterisk's
  `margin-inline-start: 0.125rem` is dropped so `*` sits tight against the label
  text as the design shows it — on `Field`'s `.tk-field-asterisk` span and on
  `Label`'s `[data-required]::after` alike. The helper text's
  `margin-block-start: var(--spacing-xxs)` is dropped too, because `Field`'s
  root already spaces its rows with `--input-external-label-base-div-gap`; the
  extra `2px` stacked on top of that gap and pushed description and error
  messages `6px` below the control instead of the intended `4px`.

  Styling only — no markup, class name, token value, or API changes.

- [#190](https://github.com/turkishtechnology/takeoff-v2/pull/190)
  [`d71dfad`](https://github.com/turkishtechnology/takeoff-v2/commit/d71dfad6299c609efd3ed5be196343c644cece89)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Move the
  wrapper icons onto the official Takeoff set and settle a batch of panel / row
  sizing issues that came out of it.

  **Official glyphs.** `Alert.Close`, `Chip`'s remove control,
  `Input.ClearButton`, `Input.Increment` / `Input.Decrement` and
  `Field.ErrorMessage` now render `@takeoff-icons/react` glyphs (`close`,
  `chevron-top` / `chevron-bottom`, `alert-circle`) instead of the inline
  Lucide-derived placeholders, and `Checkbox.Indicator` renders the official
  `check` / `remove`. The placeholder module keeps only the three glyphs the
  icon set does not ship — `info` and `eye` / `eye-off` are still missing as of
  `@takeoff-icons/react` 0.2.0, so `Field.Description` and `Input.RevealButton`
  stay on their inline SVGs; the stroked Lucide base and every replaced glyph
  are deleted.

  Swapping the art changes its optical size, because the official glyphs are
  drawn well inside the 24×24 grid: the check spans ~9.3 units against the
  placeholder's 17. Two recipes compensate so nothing looks bigger or smaller
  than before. The Checkbox icon box scales the svg per size and per state (base
  22px / 14px, small 18px / 12px, with `flex: none` so the icon box cannot
  squash it back down), which keeps the painted mark's width within ~0.2px of
  the placeholder's at both sizes. `Field.ErrorMessage`'s icon drops to the
  helper-text size and lifts 1px, since the edge-to-edge official glyph read
  larger and lower than the inset placeholder the description still renders.

  **Alert.** The filled surface's action colour is qualified with `.tk-button`
  (`.tk-alert-action.tk-button`). The rule and the Button's own variant colour
  were both `(0,4,0)`, so the winner came down to source order — and CSS
  minifiers reorder equal-specificity rules, which is why a filled toast's
  action label rendered light in dev and variant-coloured (dark green on green,
  ~1.9:1 contrast) in a production build. The gradient appearance now takes a
  `$gradient-border-color` (defaulting to the variant's base colour) instead of
  inheriting the sub-base border, and `Alert.Close` anchors to the top-right of
  the row rather than being centred.

  **Chip / Input.** `chip-size` sets `height` instead of `min-height`, so the
  size token is the outer box: with the root's `box-sizing: border-box` the
  border and padding resolve inside it and a chip measures exactly 20 / 24 /
  28px instead of overshooting to 22 / 26 / 34. Chips inside an Input are
  additionally pinned to the field's own line box, so committing the first tag
  no longer pushes the bordered row open — the row keeps its height whether it
  is empty or full.

  **Tabs.** In the horizontal `divided` type the strip's rule moves from the
  list's `border-bottom` into its padding box as a 1px background line. The list
  is a scroll container, and a scroll container clips its children at the
  padding box, so a trigger could never paint over a rule that lived in the
  border area. Every divided tab now carries the same bottom border pulled 1px
  down over that line and only its colour flips on selection, so the active tab
  merges into the panel without the 1px height jump and the grey `currentColor`
  flash the previous version animated through.

  **Select / Dropdown group headings.** Both panels' group headings now carry
  their own divider: `Select.Label` and `Dropdown.Label` are flex rows whose
  `::after` rule runs out to the panel edge, so consecutive groups read as
  banded sections and neither panel needs a `Select.Separator` /
  `Dropdown.Separator` between them (the parts stay, for separating plain
  items). The headings also drop the uppercase / letter-spacing treatment and
  move to `--text-dark` at 400 weight, with an 8px inline inset — the same one
  the items use, so the rule stays flush at every size — 10px between text and
  rule, and a type step per size: 11px in `small`, `--desktop-body-xs-size` in
  `base`, `--desktop-body-s-size` in `large`.

- [#192](https://github.com/turkishtechnology/takeoff-v2/pull/192)
  [`2ae641f`](https://github.com/turkishtechnology/takeoff-v2/commit/2ae641fc543bda895cd7f867ca405d26ca989ed8)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Retire the
  last inlined glyphs now that `@takeoff-icons` 0.3.0 ships them:
  `Field.Description` uses `info` and `Input.RevealButton` uses `eye-open` /
  `eye-closed`, so the `placeholderIcons` module is gone and every glyph
  react-spar renders comes from the official icon set.

  With both helper-text glyphs now drawn edge to edge on the official 24x24
  grid, the field recipe's size-and-lift correction folds back from an
  error-only override into the shared description/error icon rule, so the two
  line up identically.

  Also drops `renderIconSymbol`, dead since the compound API landed: nothing
  called it, it was never exported from the package root, and no component emits
  the `data-icon-kind` attribute it documented.

- [#192](https://github.com/turkishtechnology/takeoff-v2/pull/192)
  [`2ae641f`](https://github.com/turkishtechnology/takeoff-v2/commit/2ae641fc543bda895cd7f867ca405d26ca989ed8)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Give the
  table's sort and pagination controls glyphs that read unambiguously. Sorting
  now uses up/down arrows instead of chevrons, which already mean disclosure
  both in the table's own row-expand toggle and across the library, and
  first/last page use double chevrons instead of plain arrows that were easy to
  mistake for previous/next.

## 0.3.0

### Minor Changes

- [#154](https://github.com/turkishtechnology/takeoff-v2/pull/154)
  [`1c08ee7`](https://github.com/turkishtechnology/takeoff-v2/commit/1c08ee748f491159fdf6da715d8673a845fa58d9)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Give the
  `Tooltip` and `Popover` pointer arrows a border that continues the bubble's
  outline.

  The arrow now draws a border on its two outer edges in the variant's border
  color, while the neck where it joins the content stays open (no seam line).
  This holds across every variant and on all four placements.

  `Tooltip.Arrow` / `Popover.Arrow` render this by default; passing your own
  `children` still overrides it.

- [#148](https://github.com/turkishtechnology/takeoff-v2/pull/148)
  [`2c740ee`](https://github.com/turkishtechnology/takeoff-v2/commit/2c740ee4247be57aeedad51fc5d7690963b3bb13)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  Stepper compound component (`Stepper`, `Stepper.Item`, `Stepper.Title`,
  `Stepper.Description`) with controlled/uncontrolled active-step state, linear
  progression gating, status indicators, compact mode, and
  orientation/size/reverse variants — plus the matching `tk-stepper` recipe in
  the tokens package.

  Accessibility and API surface:

  - Localizable status suffixes through the root `completedLabel`/`errorLabel`
    props (default `'completed'`/`'error'`; an empty string drops the suffix).
  - `Stepper.Description` links to the trigger via `aria-describedby` instead of
    inflating the accessible name, and now requires rendering inside
    `Stepper.Item`.
  - `indicator` also accepts a `(state: StepperIndicatorState) => ReactNode`
    render function; returning `undefined` falls back to the built-in glyphs, so
    numbered steps surface the check once completed.
  - Arrow keys (following `orientation`), Home, and End move focus between step
    triggers.
  - `data-clickable` is no longer present on the active step — its press
    re-emits `onStepClick` but cannot change the selection — and a non-clickable
    active step no longer emits `onStepClick`.

  Recipe:

  - Rail endpoints are bound to `--stepper-items-rail-gap` and keep a symmetric
    clearance from the adjacent indicators.
  - Reverse layouts mirror the default content/indicator spacing instead of
    double-counting the gap.
  - Indicator surfaces and glyph colors use the theme-adaptive `--static-light`
    (dark-mode safe), with hover feedback on clickable steps and color
    transitions on the indicator.

- [#147](https://github.com/turkishtechnology/takeoff-v2/pull/147)
  [`0259edf`](https://github.com/turkishtechnology/takeoff-v2/commit/0259edf676b85e8600baecf66684b760b548af83)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add Divider
  component: horizontal/vertical separator with `appearance`
  (solid/dashed/dotted), `align` label placement, and `decorative` a11y opt-out.
  The line follows `currentColor`, dashed/dotted render via CSS gradients
  (legible at 1px, with forced-colors/print border fallback), and children
  render in a wrapper-owned `label` slot.

- [#150](https://github.com/turkishtechnology/takeoff-v2/pull/150)
  [`a944956`](https://github.com/turkishtechnology/takeoff-v2/commit/a944956633b37949432b7c339b6788bb319674a4)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  Progress compound component (`Progress`, `Progress.Track`,
  `Progress.Indicator`, `Progress.Value`) with linear and circular appearances,
  small/base/large sizes, fill color variants, an indeterminate mode, a disabled
  state, and automatic label/disabled wiring when composed inside a `Field` —
  plus the matching `tk-progress` recipe in the tokens package. The root emits
  `data-complete` when the value reaches `max`, warns in dev on an inverted
  `min`/`max` range, and writes the fill/arc progress as inline style so
  stylesheet rules cannot override it.

- [#151](https://github.com/turkishtechnology/takeoff-v2/pull/151)
  [`2a38d63`](https://github.com/turkishtechnology/takeoff-v2/commit/2a38d6375a26756ba49e70faa8da77aa007bc252)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add
  `Select.Viewport` and `Select.Arrow` compound parts.

  - **`Select.Viewport`** — headless scroll region that wraps the options.
    Select now uses a viewport-only scroll model: the panel itself no longer
    scrolls, so wrap long option lists in `Select.Viewport` (bounded height +
    the shared `takeoff-scrollbar`).
  - **`Select.Arrow`** — optional pointer from the panel to the trigger,
    positioned by Floating UI and filled to match the panel surface. Render it
    inside `Select.Content` as a sibling of `Select.Viewport`.

  **Breaking:** `.tk-select-content` no longer scrolls — a long list without a
  `Select.Viewport` wrapper will overflow instead of scrolling.

- [#149](https://github.com/turkishtechnology/takeoff-v2/pull/149)
  [`c51d4e5`](https://github.com/turkishtechnology/takeoff-v2/commit/c51d4e563f9900f9e5bc450133d76f6038477072)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  Skeleton loading-placeholder component with `rectangle`/`circle` shapes, a
  shimmer animation matching the Figma spec (fixed 48px highlight band,
  compositor-only transform sweep, hidden under `prefers-reduced-motion`),
  width/height sizing through CSS custom properties, and default `aria-hidden` —
  plus the matching `tk-skeleton` recipe in the tokens package.

- [#165](https://github.com/turkishtechnology/takeoff-v2/pull/165)
  [`b12d164`](https://github.com/turkishtechnology/takeoff-v2/commit/b12d1641b1930b25decc4b0dee1505f483678e4b)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Add the
  `Slider` component for picking a number, a range, or any set of ordered values
  from a continuous scale.

  `Slider` is v2-owned — Spar ships no slider primitive — so the wrapper owns
  the value math, pointer dragging, and the accessibility surface. Takeoff
  Core's `tk-slider` implements only pointer dragging, so full keyboard support
  and the `role="slider"` ARIA model are authored here: each thumb is its own
  slider element with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, arrow
  keys move by `step`, Page Up/Down by ten steps, and Home/End jump to the
  bounds.

  Set `range` for a multi-handle slider: the value becomes an array and one
  thumb renders per entry, so `defaultValue={[20, 50, 80]}` gives three handles
  (two by default). Dragging one handle past another swaps them so the committed
  array stays ascending; the keyboard clamps each thumb against its neighbours
  instead. This widens Takeoff Core's `tk-slider`, whose `range` commits a
  `[min, max]` pair only. Composing inside a `Field` inherits `disabled` /
  `readOnly` / `invalid` / `required` and wires the label to the first thumb.

  `orientation="vertical"` runs the rail bottom-to-top — the bottom edge is
  `min`, dragging upward increases the value, and each thumb reports the axis
  through `aria-orientation`. A vertical rail has no intrinsic length, so it
  fills its container's height (as a horizontal rail fills its width) — give the
  parent a height.

  The default anatomy is `Slider.Track` wrapping `Slider.Range` and one
  `Slider.Thumb` per value; all parts stay composable when a layout needs them
  placed by hand. `Slider.Ticks` (step marks) and `Slider.Value` (value readout)
  are opt-in. `Slider.Value` also takes function-children, which is the only way
  to read an uncontrolled slider's value without lifting state out of it.

  Each thumb carries a value bubble that appears while it is dragged or focused.
  By default it is a lightweight CSS-positioned node parented to the handle —
  not the `Tooltip` component — because a floating overlay observes the moving,
  continuously-resizing bubble with a ResizeObserver, which lags the drag and
  trips the browser's benign "ResizeObserver loop" warning. The CSS bubble is
  `aria-hidden` (the value is announced once, through the thumb) and
  `classNames` / `slotProps.tooltip` style it.

  `Slider.Thumb` children replace the bubble's content — a plain node for static
  content, or a function receiving the thumb's value, formatted string, index,
  and drag/focus state for content that reacts to the drag. The handle and the
  bubble chrome are always the thumb's; children swap only what the bubble
  shows.

  Core's `type` prop and its bounds-label row are deliberately not carried over.
  An indicator below the rail is anatomy, not a variant, so `Slider.Ticks` is
  composed in when wanted — the same treatment Core's Input `mode` received.

### Patch Changes

- [#152](https://github.com/turkishtechnology/takeoff-v2/pull/152)
  [`369209d`](https://github.com/turkishtechnology/takeoff-v2/commit/369209db4a071d53e6230b20342c82f123688b74)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Fix
  floating-layer stacking so popovers, selects and tooltips are never painted
  behind a Dialog/Drawer.

  These surfaces all portal to `<body>`, so their stacking against a modal is
  decided by z-index, not DOM order — yet they sat below the modal band (overlay
  `1500` / panel `1501`). A column filter (or any popover/select) opened inside
  a Drawer was therefore painted behind it.

  The floating-layer scale is reordered to sit above the modal band, matching
  Chakra/MUI:

  - Select content: `800` → `1600`
  - Popover content: `1300` → `1600` (same tier as Select; a Select opened
    inside a Popover resolves by DOM order since it portals later)
  - Tooltip content: `1300` → `2100` (ceiling, above Toast `2000` — a tooltip
    can annotate a control inside a toast)

  Final order: overlay `1500` < modal `1501` < select/popover `1600` < toast
  `2000` < tooltip `2100`.

- [#142](https://github.com/turkishtechnology/takeoff-v2/pull/142)
  [`8614c56`](https://github.com/turkishtechnology/takeoff-v2/commit/8614c564504577e22c330c89df27d23cf8ddbd57)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Remove the
  Breadcrumb separator variant API and render the default separator with the
  Takeoff chevron-right icon. Custom separators now compose through
  `Breadcrumb.Separator` children.

- [#143](https://github.com/turkishtechnology/takeoff-v2/pull/143)
  [`945c496`](https://github.com/turkishtechnology/takeoff-v2/commit/945c4967cc773fde11def7936abbe41ad635c7d1)
  Thanks [@pinaryalcinduran](https://github.com/pinaryalcinduran)! - Create new
  Dropdown component, including a scrollable `Dropdown.Viewport` region that
  keeps the highlighted item in view during keyboard navigation.

  Requires the upstream Spar `DropdownMenuViewport` support from
  turkishtechnology/spar#188.

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
