# Data Attribute Vocabulary

Internal reference for `data-*` attributes used by components in
`packages/react-spar/src/components`.

## Slot naming convention

Slot keys in `*Base.ts` use **camelCase** because they are JavaScript
identifiers. The corresponding `data-slot` value in rendered DOM uses
**kebab-case** because it is a CSS and DOM hook. This is deliberate.

Example: `leadingIcon` (key) → `data-slot="leading-icon"` (DOM).

`createComponentBase().getSlotProps(...)` performs this conversion. Component
wrappers should not hand-write `data-slot` values unless a lower-level primitive
already owns the slot node.

## Anatomy hooks

| Attribute   | Purpose                                      | Convention                                                     |
| ----------- | -------------------------------------------- | -------------------------------------------------------------- |
| `data-slot` | Identifies the logical part of the component | Always present on every rendered element. Value is kebab-case. |

## Customization ownership rules

- `data-slot` belongs on the canonical slot owner node, not on arbitrary helper
  wrappers.
- `slotProps` target the canonical slot owner node.
- Render overrides may replace content inside a canonical slot owner node, but
  they must not remove the slot owner node itself.
- Public compound parts must emit the same canonical `data-slot` anchors as the
  parity wrapper path.

## State hooks

Boolean presence attributes use an empty string when active and are omitted when
inactive. Primitive-owned finite states use string values.

| Attribute             | Meaning                       | Values       | Scope                                    |
| --------------------- | ----------------------------- | ------------ | ---------------------------------------- |
| `data-disabled`       | Component is disabled         | presence     | Root                                     |
| `data-loading`        | Component is in loading state | presence     | Root                                     |
| `data-state='open'`   | Disclosure item is open       | presence     | Spar Accordion item/header/trigger/panel |
| `data-state='closed'` | Disclosure item is closed     | presence     | Spar Accordion item/header/trigger/panel |
| `data-state`          | Primitive finite state        | string value | Primitive-owned state                    |
| `data-selected`       | Item is selected              | presence     | Root (reserved for future use)           |
| `data-invalid`        | Input is invalid              | presence     | Root (reserved for future use)           |

## Variant hooks

String value attributes. Always present on root when they apply.

| Attribute      | Meaning                    | Example values                             |
| -------------- | -------------------------- | ------------------------------------------ |
| `data-variant` | Semantic color treatment   | `primary`, `danger`, `neutral`             |
| `data-size`    | Component size             | `base`, `large`, `small`                   |
| `data-mode`    | Rendering or behavior mode | `button`, `link`, `default`, `compact`     |
| `data-type`    | Visual style category      | `filled`, `outlined`, `grouped`, `divided` |

## Semantic hooks

Boolean presence attributes for layout or content semantics.

| Attribute         | Meaning                                         | Component             |
| ----------------- | ----------------------------------------------- | --------------------- |
| `data-full-width` | Stretches to container width                    | Button                |
| `data-icon-only`  | No label content, only icon                     | Button                |
| `data-rounded`    | Circular icon-only shape                        | Button                |
| `data-underline`  | Label is underlined                             | Button                |
| `data-icon-kind`  | Distinguishes string icons from ReactNode icons | Button, AccordionItem |

## Compatibility table

| Attribute                                 | Component             | Classification | Notes                                     |
| ----------------------------------------- | --------------------- | -------------- | ----------------------------------------- |
| `data-type`                               | Button                | keep           | Visual type, distinct from `data-variant` |
| `data-state='open'`/`data-state='closed'` | AccordionItem         | keep           | Provided by Spar Accordion primitives     |
| `data-icon-kind`                          | Button, AccordionItem | keep           | Stable hook for icon styling              |

## Decision rules for new components

1. State on root only unless the underlying primitive already owns a state
   attribute on a child slot.
2. Boolean states use empty-string presence / absence pattern.
3. Compound `data-state` values are allowed when a primitive already exposes
   mutually exclusive state on the same element.
4. Every emitted `data-*` hook must have a real consumer in styling, semantics,
   or docs.
5. One-off attributes require explicit justification in the component base file.
6. Structural slots keep their canonical `data-slot` anchor even when render
   overrides are supported.
7. Public compound parts must not invent a second slot vocabulary.
