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

## Decision reminder

If the archetype is compound, treat every named part as a first-class contract:

- root
- item
- trigger
- content
- icon
- label or title
- semantic wrapper if one exists
