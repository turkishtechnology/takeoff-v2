# Data Attribute Vocabulary

Internal reference for `data-*` attributes emitted by components in
[`packages/react-spar/src/components`](../src/components). This document defines
the vocabulary and the rules for adding to it. The component
[Coding Standards](./coding-standards.md) governs how those attributes are
composed onto slot owner nodes.

## Categories

Every `data-*` attribute this package emits falls into exactly one category. The
category determines the value convention (presence vs string), where it belongs
in the DOM (root vs slot owner), and how CSS should consume it.

| Category     | Value shape               | Examples                         |
| ------------ | ------------------------- | -------------------------------- |
| **Anatomy**  | kebab-case string         | `data-slot`                      |
| **State**    | presence or finite string | `data-disabled`, `data-state`    |
| **Variant**  | string from a closed set  | `data-variant`, `data-size`      |
| **Semantic** | presence (layout/content) | `data-rounded`, `data-icon-only` |

A new `data-*` hook that does not fit a category is a design smell — surface it
in the component contract before shipping.

## Rules

Numbered for cross-reference from code comments and review notes.

1. **Slot keys are `lowerCamelCase`; `data-slot` values are `kebab-case`.**
   `createComponentBase().getSlotProps(...)` performs the conversion. Wrappers
   must not hand-write `data-slot` values unless a lower-level primitive already
   owns the slot node.
2. **Single-uppercase-boundary slot keys only.** `leadingIcon` is correct;
   `leadingICON` produces `data-slot="leading-i-c-o-n"`. The same rule is
   restated in
   [coding-standards.md → Slot names](./coding-standards.md#slot-names-and-emitted-classes).
3. **`data-slot` belongs on the canonical slot owner node**, not on arbitrary
   helper wrappers. Render overrides may replace content inside the owner node,
   but they must not remove the owner node itself.
4. **`slotProps` target the canonical slot owner node** — the same node that
   carries `data-slot`. Public compound parts must emit the same canonical
   `data-slot` anchors as the parity wrapper path.
5. **Boolean states use empty-string presence.** Pass `''` when active,
   `undefined` when inactive — `composeRootAttrs` drops `undefined` entries.
   This matches the `[data-disabled]` CSS selector pattern.
6. **Finite states use string values.** When a primitive exposes mutually
   exclusive states (`open`/`closed`, `loading`/`idle`/`error`), use a
   string-valued `data-state` rather than three separate presence attrs.
7. **State lives on the root** unless the underlying primitive already owns a
   state attribute on a child slot (e.g. Spar Accordion's per-item
   `data-state`).
8. **Variant attrs are always present on the root when they apply.** They are
   never omitted even when the value equals the default — recipes rely on stable
   presence for specificity.
9. **Every emitted `data-*` hook must have a real consumer** in styling,
   semantics, or docs. Speculative or "reserved" attrs do not ship. Add the
   attribute when the consumer lands, not before.
10. **One-off attributes require explicit justification** in the component's
    `base.ts`. Prefer extending an existing vocabulary entry over inventing a
    new one.

## Reference tables

These tables describe what is currently emitted by the package. They are the
source of truth — if code and tables disagree, the code is canonical and the
table needs updating.

### Anatomy

| Attribute   | Value     | Scope               | Purpose                                      |
| ----------- | --------- | ------------------- | -------------------------------------------- |
| `data-slot` | kebab-str | Every rendered slot | Identifies the logical part of the component |

### State

| Attribute             | Value        | Scope                       | Meaning                             |
| --------------------- | ------------ | --------------------------- | ----------------------------------- |
| `data-complete`       | presence     | Root (Progress)             | Determinate value reached `max`     |
| `data-disabled`       | presence     | Root                        | Component is disabled               |
| `data-indeterminate`  | presence     | Root, Indicator (Progress)  | Indeterminate; indicator animates   |
| `data-invalid`        | presence     | Root                        | Component is visually invalid       |
| `data-loading`        | presence     | Root                        | Component is in loading state       |
| `data-state`          | finite-str   | Primitive-owned element     | Mutually exclusive primitive state  |
| `data-state="open"`   | presence-str | Spar Accordion item/trigger | Disclosure is open (Spar-emitted)   |
| `data-state="closed"` | presence-str | Spar Accordion item/trigger | Disclosure is closed (Spar-emitted) |

### Variant

| Attribute          | Scope            | Example values                                                           | Notes                                                                 |
| ------------------ | ---------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `data-variant`     | Root             | `primary`, `danger`, `neutral`                                           | Semantic color treatment                                              |
| `data-size`        | Root, Item       | `base`, `large`, `small`                                                 | Duplicated to items by design where recipes need item-local selectors |
| `data-mode`        | Root, Item       | `button`, `link`, `default`, `compact`                                   | Rendering or behavior mode                                            |
| `data-type`        | Root **or** Item | `filled`, `outlined`, `grouped`, `divided`, `card`, `linear`, `circular` | Owner depends on component — see component decisions below            |
| `data-orientation` | Root             | `horizontal`, `vertical`                                                 | Axis of the component's layout or line                                |

### Semantic

| Attribute             | Component              | Meaning                                          |
| --------------------- | ---------------------- | ------------------------------------------------ |
| `data-icon-only`      | Button                 | No label content, only icon                      |
| `data-rounded`        | Button                 | Circular icon-only shape                         |
| `data-underline`      | Button                 | Label is underlined                              |
| `data-icon-kind`      | Button, AccordionItem  | Distinguishes string icons from ReactNode icons  |
| `data-hide-arrows`    | Accordion root         | Auto-rendered arrows are hidden                  |
| `data-arrow-position` | Accordion root         | Layout intent for trigger arrows                 |
| `data-position`       | Radio root/item        | Indicator placement (`left` / `right`)           |
| `data-spread`         | Radio root             | Items share available space along the group axis |
| `data-level`          | Input strength segment | Strength tier for filled password meter segments |

### Out-of-band attributes

These are emitted outside the component composition pipeline (`composeRootAttrs`
/ `buildSlotAttrs`). They follow the same rules but live at different layers.

| Attribute               | Layer                                                                 | Purpose                                          |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `data-theme`            | [`<TakeoffSparProvider>`](../src/provider.tsx) — written to `<html>`  | Active theme name (consumed by token CSS)        |
| `data-placeholder-icon` | [`src/icons/placeholderIcons.tsx`](../src/icons/placeholderIcons.tsx) | Marks default decorative SVGs for swap targeting |

## Component-specific decisions

This section records intentional deviations from the default rules. Each entry
should explain **why** the deviation exists so reviewers do not "fix" it later.

### Progress

Progress is **v2-owned** with no upstream Spar primitive (Table precedent), so
its attributes are wrapper-emitted. Recorded here per rule 10.

- **Root carries the variants and state:** `data-type` (`linear` | `circular` —
  shape, mapped from the `appearance` prop per the Spinner/Badge precedent),
  `data-size` (`small` | `base` | `large` — visual scale), `data-variant` (fill
  color), `data-disabled` (presence — from the own `disabled` prop or inherited
  through `useOptionalFieldContext` from a surrounding Field),
  `data-indeterminate` (presence — from the `indeterminate` prop, which takes
  precedence over `value`; `aria-valuenow` is dropped alongside it), and
  `data-complete` (presence — the clamped value reached `max` on a determinate
  root; a styling hook for finished states, e.g. a success fill at 100%. It
  flips the instant the value reaches `max`, while the recipe's 0.3s fill
  transition may still be catching up — completion styling leads the fill
  slightly).
- **Parts re-emit what their recipes key off** (Tabs precedent): every part
  stamps `data-type`, and the indicator also stamps `data-indeterminate` to
  drive the looping sweep animation.
- **The progress value is not a data attribute.** It is a continuous number, not
  a finite state, so the rendered indicator writes it inline: the bar `width`
  (linear) or the arc circle's `stroke-dashoffset` (circular) — both as inline
  **style**, because a presentation attribute would lose to any stylesheet rule.
  Skipped entirely while indeterminate, where the recipe animates instead.
  `Progress` renders the default anatomy; `Progress.Track` and
  `Progress.Indicator` remain available when consumers need slot overrides.

### Accordion

- **`data-type` lives on `AccordionItem`, not on the root.** Spar's
  `<Accordion>` root already emits its own `data-type="multiple"|"single"` for
  behavior mode. Adding takeoff-spar's visual `data-type="grouped"|"divided"` to
  the same element would shadow Spar's attribute and confuse CSS that relies on
  either vocabulary. Style accordion visual types via
  `.tk-accordion-item[data-type="grouped"]` /
  `.tk-accordion-item[data-type="divided"]`.
- **`data-mode` and `data-size` are emitted on both the root and the item.**
  Both elements receive the same value (cascade through context). The root copy
  is the global cascade anchor; the item copy gives CSS recipes a
  higher-specificity per-item selector without requiring an ancestor lookup
  (`.tk-accordion-item[data-mode="compact"][data-size="large"] { ... }`). This
  duplication is intentional, not a redundancy bug.
- **Open/closed state is owned by Spar.** `Accordion.Item` and
  `Accordion.Content` expose Spar's `data-state="open"` / `data-state="closed"`
  when they render. Do not mirror the same state with wrapper-owned attributes
  or local value matching — see rule 7 in the [Rules section](#rules).
- **`data-arrow-position` and `data-hide-arrows` live on the root.** They
  describe layout intent for the whole accordion and cascade naturally to every
  trigger via descendant selectors.

### Radio

- **`data-size`, `data-type`, and `data-position` are emitted on both the root
  and each item.** The root copy documents the resolved group defaults; the item
  copy lets the radio recipe style `.tk-radio-item` without an ancestor selector
  and allows per-item `position` overrides.
- **`data-invalid` is Spar-owned, root-only.** Spar emits it on the radiogroup
  root, resolving from its own `isInvalid` ↔ Field context chain. The wrapper
  forwards its `invalid` prop to Spar as `isInvalid` and does not call
  `useOptionalFieldContext` itself — Field resolution stays a single source of
  truth inside Spar. Per-item invalid styling is driven by the recipe's ancestor
  selector (`.tk-radio[data-invalid] .tk-radio-item ...`), so the wrapper does
  not mirror `data-invalid` onto items either. Per-item invalid is not a real
  concept (the wrapper's `invalid` is group-scoped).
- **`data-spread` lives on the root only.** It is a group layout hook. Items do
  not carry it because CSS can stretch direct `.tk-radio-item` children from the
  root selector.
- **Checked/unchecked state stays Spar-owned.** `Radio.Item` exposes Spar's
  `data-state="checked" | "unchecked"`; the wrapper recipe consumes that state
  for the indicator fill instead of mirroring selection in React.

### Divider

Divider is **v2-owned** (no upstream Spar primitive), so the wrapper emits its
own vocabulary. All attributes live on the root.

- **`data-orientation`** (`horizontal` | `vertical`) mirrors the `orientation`
  prop and the `aria-orientation` the wrapper renders for non-decorative
  separators. The recipe draws the line on the matching axis.
- **`data-type` carries the line style** (`solid` | `dashed` | `dotted`) —
  reusing the `appearance` → `data-type` mapping established by Badge instead of
  inventing a `data-line` attribute. Dashed/dotted render via CSS gradients
  (repeating-linear for dashes, tiled radial for dots), not `border-style`, so
  the pattern stays legible at 1px thickness.
- **`data-align`** (`start` | `center` | `end`) positions the optional label
  along the line. It extends Table's `data-align` values with a root-scoped
  owner.
- **The label is a wrapper-owned slot, not a compound part.** Children render
  inside `.tk-divider-label` (`data-slot="label"`) — the same leaf-with-slots
  shape as Spinner's `indicator`.
- **There is intentionally no `data-has-label` attribute.** Both line segments
  are root pseudo-elements that flex-grow, so a label-less divider renders one
  continuous line purely in CSS — no runtime detection exists to mirror.

### Input

- **`data-level` lives on strength segments, not on the Input root.** Filled
  `.tk-input-strength-segment` nodes use `weak`, `medium`, or `strong`; empty
  segments omit the attribute so the neutral segment style remains the base
  state.

### Table

Table is a **v2-owned, TanStack-backed** component with no upstream Spar
primitive, so — unlike the Spar wrappers — it introduces its own `data-*`
vocabulary rather than inheriting one. Recorded here per rule 10. All values
follow the standard conventions (presence = `''`, finite = string).

- **Root carries the visual variants/state.** `.tk-table` emits `data-size`
  (`xsmall` | `small` | `base`), `data-striped`, `data-bordered`,
  `data-sticky-header`, and `data-loading`. Density padding cascades from the
  root via descendant selectors (`.tk-table[data-size='small'] .tk-table-cell`),
  matching the Accordion/Radio root-cascade precedent.
- **`data-scrolled` (State, presence) on the scroll viewport.**
  `.tk-table-viewport` gains it once `scrollTop > 0`, letting the recipe reveal
  the sticky-header shadow only after the body has scrolled under it.
- **`data-align` (Variant) lives on every header + body cell.** `start` |
  `center` | `end`; drives `text-align`. Header cells may override via
  `meta.headerAlign`; otherwise they inherit the column `align`.
- **`data-sticky` (Variant) marks pinned cells.** `left` | `right` on
  `.tk-table-header-cell` / `.tk-table-cell` / the selection + expand utility
  cells. The per-edge offset and 3-layer z-index are inline `style` (computed by
  the wrapper, RFC §6.5); the recipe keys on `data-sticky` only for the opaque
  background + edge shadow. **Pinned columns must be contiguous against their
  edge** (all `left` pins at the start, all `right` pins at the end); the offset
  math sums same-edge widths and assumes no unpinned column sits between them.
  Dev builds warn on a non-contiguous pin set.
- **Sorting splits across two nodes by design.** The `<th>` carries the a11y
  source of truth `aria-sort` plus a `data-sortable` presence flag (cursor); the
  chevron glyph `.tk-table-sort-icon` carries `data-direction` (`asc` | `desc` |
  `none`). `data-direction` is **not** a duplicate of `aria-sort` — it is a
  node-local hook so the recipe can rotate the glyph without an ancestor lookup
  (same rationale as Accordion's per-item mirror).
- **`data-selected` (State, presence) lives on the body `<tr>`.** Row selection
  is React/TanStack-owned (no Spar primitive backs it), so unlike Radio/Checkbox
  the state is wrapper-emitted here.
- **`data-selection-mode` (Variant) on the selection cell.** `single` |
  `multiple` — lets the recipe distinguish the radio vs. checkbox affordance
  column.
- **`data-active` (State, presence) on the filter trigger.** Marks a column
  whose filter currently narrows the data. The trigger is the Spar
  `Popover.Trigger` owner node (which emits its own `data-slot="root"`), so the
  filter button/panel are styled by class (`.tk-table-filter-button` /
  `.tk-table-filter-panel`) rather than a Table `data-slot` anchor.
