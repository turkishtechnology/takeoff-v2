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

| Category     | Value shape               | Examples                          |
| ------------ | ------------------------- | --------------------------------- |
| **Anatomy**  | kebab-case string         | `data-slot`                       |
| **State**    | presence or finite string | `data-disabled`, `data-state`     |
| **Variant**  | string from a closed set  | `data-variant`, `data-size`       |
| **Semantic** | presence (layout/content) | `data-full-width`, `data-rounded` |

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
| `data-disabled`       | presence     | Root                        | Component is disabled               |
| `data-loading`        | presence     | Root                        | Component is in loading state       |
| `data-state`          | finite-str   | Primitive-owned element     | Mutually exclusive primitive state  |
| `data-state="open"`   | presence-str | Spar Accordion item/trigger | Disclosure is open (Spar-emitted)   |
| `data-state="closed"` | presence-str | Spar Accordion item/trigger | Disclosure is closed (Spar-emitted) |

### Variant

| Attribute      | Scope            | Example values                             | Notes                                            |
| -------------- | ---------------- | ------------------------------------------ | ------------------------------------------------ |
| `data-variant` | Root             | `primary`, `danger`, `neutral`             | Semantic color treatment                         |
| `data-size`    | Root, Item       | `base`, `large`, `small`                   | Duplicated to Accordion items by design (rule 7) |
| `data-mode`    | Root, Item       | `button`, `link`, `default`, `compact`     | Rendering or behavior mode                       |
| `data-type`    | Root **or** Item | `filled`, `outlined`, `grouped`, `divided` | Owner depends on component — see Accordion below |

### Semantic

| Attribute             | Component             | Meaning                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| `data-full-width`     | Button                | Stretches to container width                    |
| `data-icon-only`      | Button                | No label content, only icon                     |
| `data-rounded`        | Button                | Circular icon-only shape                        |
| `data-underline`      | Button                | Label is underlined                             |
| `data-icon-kind`      | Button, AccordionItem | Distinguishes string icons from ReactNode icons |
| `data-hide-arrows`    | Accordion root        | Auto-rendered arrows are hidden                 |
| `data-arrow-position` | Accordion root        | Layout intent for trigger arrows                |

### Out-of-band attributes

These are emitted outside the component composition pipeline (`composeRootAttrs`
/ `buildSlotAttrs`). They follow the same rules but live at different layers.

| Attribute               | Layer                                                                 | Purpose                                          |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `data-theme`            | [`<SparReactProvider>`](../src/provider.tsx) — written to `<html>`    | Active theme name (consumed by token CSS)        |
| `data-placeholder-icon` | [`src/icons/placeholderIcons.tsx`](../src/icons/placeholderIcons.tsx) | Marks default decorative SVGs for swap targeting |

## Component-specific decisions

This section records intentional deviations from the default rules. Each entry
should explain **why** the deviation exists so reviewers do not "fix" it later.

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
