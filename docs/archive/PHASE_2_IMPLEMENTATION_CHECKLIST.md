# Phase 2 Implementation Checklist

Historical planning snapshot only. Some ideas here landed, others were
superseded by live coding standards and component-port workflow references. Use
the live reference docs first when making current decisions.

Phase 2 builds on the Phase 1 base-driven structure.

Phase 2 goal: Standardize state and slot contracts, then pilot a more modern
internal authoring model for complex components without introducing public API
drift.

This phase is about consistency and scale, not about adding abstraction for its
own sake.

## Preconditions

Phase 2 should not start until Phase 1 is effectively complete:

- the base-driven file structure is stable
- Button and Accordion are accepted as internal references
- the package builds cleanly
- docs generation is stable
- the public API is unchanged after Phase 1

If those conditions are not true, stop and finish Phase 1 first.

## Expected outcome

At the end of Phase 2:

- slot and state hooks follow a documented vocabulary
- new components have fewer ad hoc decisions around DOM hooks
- at least one pilot implementation proves a more scalable internal pattern
- the team has a clear rule for what belongs in base metadata versus adapter
  logic
- no consumer-facing contract breaks are introduced

## Scope

Included in Phase 2:

- state and variant hook normalization
- slot contract normalization
- one internal pilot for richer slot-prop composition
- one internal pilot for extracting non-trivial adapter logic
- validator improvements where they protect the new rules

Not required in Phase 2:

- a breaking rename of all current attributes
- a redesign of public component APIs
- a large framework-like runtime layer
- migration of every existing component in one pass
- speculative abstractions for components that do not exist yet

## 1. Define the canonical state and variant vocabulary

- Write down the preferred internal hook language for rendered DOM.
- Separate these concerns explicitly:
  - anatomy hooks
  - state hooks
  - variant hooks
  - semantic hooks
- Keep `data-slot` as the anatomy anchor.
- Define preferred state naming for future work:
  - `data-state`
  - `data-disabled`
  - `data-loading`
  - `data-selected`
  - `data-open`
  - `data-invalid`
  - other state hooks only when clearly justified
- Define preferred variant naming for future work:
  - `data-variant`
  - `data-size`
  - `data-mode`
  - `data-type`

Decision rule:

- use one canonical state hook when it cleanly captures the state
- keep explicit boolean hooks when they are materially better for readability,
  styling clarity, or backward compatibility

Acceptance criteria:

- the package has one documented internal vocabulary
- future components do not invent one-off state attribute names without reason

## 2. Decide the compatibility strategy

Do not force a big-bang cleanup.

- Audit current live hooks used by Button and Accordion.
- Classify each hook as:
  - keep as-is
  - support as compatibility layer
  - replace in future components only
  - deprecate internally
- Prefer compatibility over churn where styling is already stable.

Required output:

- a short internal compatibility table
- a list of hooks that are now considered canonical
- a list of hooks that remain legacy but supported

Acceptance criteria:

- no accidental recipe breakage
- no docs churn unless consumer-visible behavior changed

## 3. Pilot slot-prop composition on one component

The next authoring step should be proven, not assumed.

Choose one component for a controlled pilot:

- preferred pilot: Accordion
- fallback pilot: Button only if Accordion is too risky at the moment

Pilot objective:

- reduce repeated `className`, `data-slot`, and `data-*` composition
- keep render code easier to read, not harder
- avoid creating a generic abstraction that hides ownership

Possible direction:

- a small internal API such as `getSlotProps('header')`
- or a constrained `slotProps.header(...)`

The pilot must compose only:

- stable class name
- `data-slot`
- stable state and variant hooks
- optional caller className merge

The pilot must not:

- own business logic
- hide semantic ownership
- silently attach side effects
- become a public API

Acceptance criteria:

- the pilot reduces repetition measurably
- the resulting JSX is easier to review
- the team can explain when to use it and when not to use it

## 4. Pilot extraction of non-trivial adapter logic

Compound components will eventually need a clearer split between render and
state adaptation.

Pick one real example:

- Accordion value normalization and event translation

Evaluate whether a focused internal hook or adapter module improves the code:

- possible direction: `useAccordionAdapter`

The extraction should happen only if it improves all of these:

- readability
- testability
- reusability within the same component family

Do not extract logic just because it is long.

Decision rule:

- keep logic in the component if the render remains easy to reason about
- extract only when the mapping layer becomes independently meaningful

Acceptance criteria:

- render files become more readable
- extracted logic remains specific and does not become a generic state framework

## 5. Draw a strict boundary for base metadata

Phase 2 must clarify what should never be pushed into `ComponentBase.ts`.

`ComponentBase.ts` should own:

- anatomy
- classes
- defaults
- light static helpers
- light context setup when tightly coupled to component structure

`ComponentBase.ts` should not own:

- heavy render branching
- long state machines
- business-level behavior
- opaque generic utility layers

If a base file starts absorbing too much logic, split deliberately instead of
letting it become a dumping ground.

Acceptance criteria:

- contributors know when to stop adding to the base file
- the pattern stays maintainable as the package grows

## 6. Strengthen validation around the new contract

Once the vocabulary and pilot are real, validators should protect them.

Add checks for:

- stale slot classes that are not backed by rendered DOM
- undocumented state hooks
- unexpected one-off `data-*` attributes
- drift between base slot definitions and theme registration
- drift between base defaults and docs defaults when feasible

Validation should stay pragmatic:

- enforce what is stable
- do not encode experiments too early

Acceptance criteria:

- validators catch real contract drift
- they do not create noisy false positives that the team learns to ignore

## 7. Define the migration rule for existing and future components

Phase 2 must make the rollout strategy explicit.

Use this rule:

- new components use the Phase 2 vocabulary by default
- touched existing components move toward the Phase 2 vocabulary when the change
  is low risk
- stable components are not rewritten only for stylistic purity

This prevents a costly repo-wide churn while still moving the codebase forward.

Acceptance criteria:

- the team can evolve the package incrementally
- no one feels pressure to do a disruptive sweep

## 8. Keep the public contract stable

Every Phase 2 change must be evaluated against these constraints:

- no new public exports without explicit product need
- no breaking prop renames
- no docs changes that expose internal migration mechanics
- no CSS packaging changes
- no behavior rewrites when the primitive already covers the need

If a Phase 2 refactor needs public API change, it is not a normal Phase 2 task
anymore and should be treated as a separate design decision.

Acceptance criteria:

- consumers should not feel this phase as churn
- most gains should remain internal engineering gains

## 9. Validation and review gates

Minimum commands:

- `pnpm --filter @takeoff-ui/react-spar run check-types`
- `pnpm --filter @takeoff-ui/react-spar run lint`
- `pnpm --filter @takeoff-ui/react-spar build`
- `pnpm --filter docs run build`

Required review points:

- does the pilot actually reduce complexity
- are state hooks more consistent than before
- did any public contract move unintentionally
- are validators catching useful failures

Phase 2 should be reviewed as an engineering quality initiative, not as a pure
refactor diff.

## 10. Team sign-off questions

Before closing Phase 2, answer these explicitly:

- Is there now a documented canonical hook vocabulary for anatomy, state, and
  variants?
- Did the pilot prove a better pattern, or just a different one?
- Is the new pattern clearly internal and non-breaking?
- Did validation improve enough to protect the new contract?
- Does the code read more clearly than it did before?

If the answers are mixed, keep the pilot local and do not broaden the pattern
yet.

## Suggested execution order

1. Define canonical hook vocabulary.
2. Decide compatibility strategy.
3. Pilot slot-prop composition on one component.
4. Pilot extraction of non-trivial adapter logic.
5. Tighten the boundary of `ComponentBase.ts`.
6. Strengthen validation.
7. Apply the migration rule to touched components only.
8. Run validation and review.

## Exit criteria

Phase 2 is complete when:

- the internal hook language is standardized
- one scalable pilot pattern has been proven in real code
- validation protects the new rules
- the public API remains stable
- the team has enough confidence to use the Phase 2 model on the next new
  component
