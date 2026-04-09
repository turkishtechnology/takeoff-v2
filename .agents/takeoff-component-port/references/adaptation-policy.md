# Adaptation Policy

Use this file whenever `takeoff-ui`, `spar`, and `takeoff-spar` do not line up
perfectly.

## Classification model

Every difference must be classified as one of these:

- `strict-parity` Public API, user-visible visuals, and core behavior should
  remain identical.
- `technical-adaptation` Internal implementation changes, but the
  consumer-facing contract stays the same. Typical examples:
  - Shadow DOM selectors converted to slot classes or `data-*`
  - Stencil custom events mapped to React callbacks
  - heading, trigger, or content ownership split across more explicit nodes
- `react-enhancement` A React-only ergonomic addition that is additive,
  optional, and documented. Typical examples:
  - clearer controlled and uncontrolled semantics
  - `ReactNode` in place of Web Component slots
  - composition helpers that do not break parity
- `forbidden-divergence` A user-visible or contract-visible change that has no
  explicit approval. Typical examples:
  - changing visual states or default variants
  - removing supported behaviors
  - changing selector ownership without updating recipes and docs
  - rewriting primitive behavior when an acceptable Spar primitive exists

## Primitive rule

If a matching `spar` primitive exists, the default answer is to use it.

Work through these steps in order:

1. Use the primitive as-is if it already fits.
2. Wrap the primitive and translate props, events, or values.
3. Add visual or semantic wrapper nodes around the primitive if needed.
4. Only then consider custom behavior.

Custom behavior is allowed only when the primitive is missing a fundamental
capability and the gap is documented explicitly.

## What React may adapt

React is not bound by Web Component constraints, so these are usually valid
adaptations when documented:

- replace slot APIs with `children` or `ReactNode`
- expose controlled and uncontrolled props clearly
- convert custom events to React callback names without Stencil-specific `tk`
  prefixes
- replace Shadow DOM styling hooks with explicit slot classes and `data-*`
- use more explicit DOM ownership when semantics and styling require it

These are still expected to preserve the original product behavior.

## Where to record adaptation rationale

Keep adaptation reasoning in the final port report and in internal skill-driven
review notes. Public docs and component comments should stay focused on
consumer-visible usage and behavior unless the adaptation changes the public
contract in a way users must know.

## What React should not silently change

- default values
- variant semantics
- size, spacing, and state visuals
- keyboard and focus behavior
- form behavior
- accessibility ownership
- public import or theming instructions

If one of these changes, classify it and justify it.

## DOM ownership rule

For interactive or compound components, identify three owners separately:

- visual owner: which node carries border, radius, spacing, hover, and layout
- interactive owner: which node handles click, keyboard, and focus
- semantic owner: which node carries heading, label, region, or form semantics

Do not assume all three owners should be the same node.

## Exception template

When you deviate from strict parity, state it in this form:

- `classification`: `technical-adaptation` | `react-enhancement` |
  `forbidden-divergence`
- `reason`: concrete limitation or benefit
- `affected surface`: API | DOM | styling | a11y | docs
- `consumer impact`: none | additive | breaking
- `follow-up`: required docs, tests, or validation
