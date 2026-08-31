# DatePicker Contract

Status: **closed — no component.** A date picker is composed from `Popover` and
`Calendar`; the deliverable is the recipe at
`apps/docs/docs/components/datepicker.mdx` plus two opt-in classes in the tokens
recipe. Supersedes `spar-datepicker-plani.html` (2026-08-27).

This file records **why there is no component**, so the question is not reopened
from scratch. A `contract DatePicker` run produced a full component design first
— root, four compound parts, value model, the lot — and it was rejected in
favour of composition. The reasoning on both sides is below.

## Decision

| Decision                     | Ruling                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| Shape                        | **No `DatePicker` component.** Popover + Calendar, composed per usage.   |
| Reference                    | shadcn/ui `docs/components/base/date-picker` → "Composition".            |
| Where the wiring lives       | In the consumer's component, shown in full on the docs page.             |
| What the design system ships | `tk-datepicker-panel` (opt-in) plus `tk-input-action`, which Input owns. |
| `spar-datepicker-plani.html` | Superseded. Its Approach A is what shipped.                              |

## Why composition

- **Both halves already own their behaviour.** Popover owns the disclosure,
  positioning, dismissal and focus return; Calendar owns the grid, its keyboard
  model, the restriction matchers and all three selection modes. A root
  component would own only the wiring between them.
- **That wiring is short and situational.** Close-on-select is right for a
  single date and wrong for a range. Whether the field is typable, what format
  it uses, whether a form needs an ISO value — each is a per-form answer a
  component has to guess at and then expose a prop to un-guess.
- **The composition stays legible.** The docs page shows the whole thing; there
  is no indirection between what a reader sees and what runs.

## What this costs, recorded honestly

These were the arguments for a component. They did not win, but they are real
and will come back:

- **Takeoff Core's `tk-datepicker` has 38 props.** The authoring contract's
  first rule is that React Spar preserves Core's product vocabulary. With no
  component, `dateFormat`, `disableMask`, `headerType`, `allowApplyButton`,
  `footerType`, `inline` and the time-picker family have nowhere to live. Parity
  with Core is deliberately not claimed for this pattern.
- **Distribution differs from the reference.** shadcn ships copy-paste source,
  so a recipe is the unit a consumer owns and edits. This package is installed,
  so every app re-implements the same wiring — and inherits the same bugs —
  rather than upgrading with a release.
- **The text-field variant is the expensive one.** A button trigger needs one
  line of state. A masked field needs the text/`Date` bridge, the displayed
  month following what is typed, `ArrowDown`, formatting back on select, and
  bounds applied to the mask as well as the grid. That is roughly forty lines,
  per usage.
- **`packages/react-spar/docs/coding-standards.md` mandates the compound-only
  baseline** ("Every component ships a root plus compound subcomponents. That is
  the only authoring model"). A pattern sits outside that model, which is why
  this ships as documentation and CSS rather than as a component.

## If this is revisited

The rejected component design is recoverable from this branch's history. The
trigger for reopening would be the first of these to happen: a second product
needing the masked-field variant, a request for Core parity on `dateFormat` /
`headerType`, or a caret or focus bug reported against a hand-rolled copy of the
recipe.

## Upstream Spar change made along the way

One real bug surfaced while prototyping the composition and was fixed upstream
rather than worked around:

`Input.Field` dropped `disabled` / `required` / `readOnly` when they were passed
on the field itself. `Input` resolves its context to a plain boolean, so an
unset group reported `false` and the context spread silently unset an explicitly
passed prop — `<Input.Field disabled />` rendered an enabled input. The three
now resolve as a disjunction: either the group or the field may set them, and
neither can clear the other's answer. Covered by two tests in
`spar/packages/spar/src/components/Input/__tests__/Input.test.tsx`.
