---
'@takeoff-ui/react-spar': minor
---

`Input.Field` accepts `mask` and `onValueChange`.

Masking is a Spar capability, and this exposes it rather than reimplementing it:
`mask` and `onValueChange` are picked straight from Spar's field types, so the
contract a consumer writes against is the one Spar validates. Formatting used to
be something each app wired into `onChange` by hand, which meant every app also
inherited the caret bugs that come with rewriting a controlled input's value.

A mask is one of four things. A shape lays characters into blocks and puts a
delimiter between them
(`{ blocks: [4, 4, 4, 4], delimiter: ' ', numericOnly: true }`). The `date` /
`time` / `number` presets additionally interpret the value — clamping a month to
12, a minute to 59, or regrouping an integer as it grows. A `regex` is matched
one character at a time, so a pattern written for the final value also accepts
every legal prefix. Anything else is a resolver function.

`number` derives its separators and group sizes from `Intl.NumberFormat`, so
`numberLocale: 'tr-TR'` gives `1.234.567,89` and `'en-IN'` gives lakh grouping
without a second option, and `meta.iso` is always a `Number()`-parseable string.

Prefer `onValueChange(value, meta)` over `onChange` on a masked field: Spar
applies deletions and undo/redo directly to the control, so those edits never
surface as a React change event. `meta` carries `raw`, `completed` and — when
the mask defines a canonical form — `iso`.

`createDateMask`, `createTimeMask`, `createNumberMask` and the `Mask*` types are
re-exported from the package, so a resolver that wraps a built-in is an ordinary
typed function. The presets are themselves resolvers, so a built-in has no
capability your own mask lacks.

Omitting `mask` leaves the field exactly as it was.
