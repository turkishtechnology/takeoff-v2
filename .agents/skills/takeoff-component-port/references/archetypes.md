# Archetypes

Classify the component before porting it. The archetype determines where drift
usually appears.

## Leaf component

Examples:

- button-like presentational controls
- badges
- small stateless wrappers

Priorities:

- prop and variant parity
- slot/class/data contract
- disabled, loading, and focus-visible states

Default approach:

- prefer a single primitive or native element
- keep DOM shallow

Customization default:

- always support the parity wrapper
- usually support `slotProps` on root and stable subparts
- render overrides are usually limited to label, adornment, or spinner-like
  content
- public compound parts are usually unnecessary

## Form control

Examples:

- input-like components
- checkbox, radio, select, switch

Priorities:

- controlled vs uncontrolled behavior
- form submission and labeling
- validation, disabled, and focus behavior

Default approach:

- keep the native form surface intact or let the primitive own it
- never hide form behavior behind a purely visual wrapper

Customization default:

- always support the parity wrapper
- prefer `slotProps` for root, label, helper, and message nodes
- allow render overrides for adornments or helper content only when the
  canonical node stays intact
- add public compound parts only when the control becomes a field family rather
  than a single control

## Compound or disclosure component

Examples:

- accordion
- tabs
- dropdown-like grouped structures

Priorities:

- sub-part ownership
- semantic vs visual vs interactive nodes
- keyboard navigation
- open or selected state propagation

Default approach:

- map each sub-part explicitly
- avoid collapsing the whole component into one monolithic wrapper
- use Spar compound primitives first when they exist

Customization default:

- keep the parity wrapper for the Takeoff contract
- public compound parts are usually required
- `slotProps` should exist on canonical sub-parts
- render overrides should stay limited to content-bearing or decorative slots

## Overlay component

Examples:

- dialog
- drawer
- popover

Priorities:

- focus trapping
- dismiss behavior
- layering and portals
- screen reader semantics

Default approach:

- let the primitive own behavior
- keep React adaptation focused on slots, props, and styling hooks

Customization default:

- keep the parity wrapper for the Takeoff contract
- public compound parts are usually required when trigger/content/overlay
  ownership matters
- structural slots should not be replaced by render props
- render overrides usually belong on icon, title adjunct, or action regions

## Layout or structural component

Examples:

- containers
- panels
- stack or grid wrappers

Priorities:

- spacing, radius, and token extraction
- lightweight DOM
- predictable slot classes

Default approach:

- use native HTML unless a primitive adds real value

Customization default:

- wrapper + `slotProps` is usually enough
- render overrides are appropriate for named content regions
- public compound parts are optional and should be added only when the layout
  regions become first-class consumer-owned slots

## Decision reminder

If the archetype is compound, treat every named part as a first-class contract:

- root
- item
- trigger
- content
- icon
- label or title
- semantic wrapper if one exists

Use this decision checklist before exposing public compound parts:

- Do consumers need to reorder or omit structural regions?
- Does any slot own focus, keyboard handling, or ARIA linkage?
- Do token recipes rely on multiple named sub-parts?
- Would a render prop be forced to replace a structural slot owner?

If the answer is yes to two or more, a public compound surface is usually the
safer default.
