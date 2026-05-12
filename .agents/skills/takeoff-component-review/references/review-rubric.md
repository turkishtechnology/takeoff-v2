# Review rubric

Use severity consistently. A review should be useful for a developer to fix
without re-reading the full task.

## Verdicts

### PASS

Use only when:

- No blocker or major issue exists.
- Required validation ran or equivalent evidence exists.
- Recipe and approved decisions are followed.
- Remaining risks are low and documented.

### PASS WITH NOTES

Use when:

- Only minor or nit issues exist.
- Validation has unrelated/pre-existing noise with evidence.
- Missing evidence does not affect public API, DOM, types, build, exports, docs,
  or state responsibilities.

### CONDITIONAL

Use when:

- No known unsafe code exists, but evidence is incomplete.
- Validation did not run and must run before merge.
- A non-blocking decision remains open.
- Docs/tests need small follow-up but implementation contract appears safe.

### FAIL

Use when any blocker exists:

- `takeoff-ui core` was modified.
- Scope includes generic infra/workflows/migration/audit/task generator.
- Wrapper duplicates spar-owned state/a11y/keyboard/focus/SSR behavior.
- Public API contradicts core or approved decisions.
- DOM/data-state contract breaks takeoff-design selectors.
- Types/exports are missing in a way consumers cannot use the component safely.
- Related validation fails.

## Issue severity

### Blocker

Must be fixed before continuing. Examples:

- Wrong public API or event naming.
- State machine copied into wrapper while spar already owns it.
- `takeoff-ui core` changed.
- Required root/part class missing.
- Related build/type/test failure.
- Unresolved public API decision silently implemented.

### Major

Likely breaks consumers, maintainability, or docs, but may not be immediately
unsafe. Examples:

- Missing exported public type.
- Missing package export.
- Missing controlled/uncontrolled test for wrapper normalization.
- `className` composition drops consumer or canonical class in some path.
- Docs omit controlled usage for a controllable component.

### Minor

Should be fixed, but does not block basic safety. Examples:

- Missing edge demo that recipe requested but component works.
- Test name unclear.
- Final report lacks one discovery detail but evidence exists elsewhere.

### Nit

Style or clarity only. Examples:

- Slightly inconsistent wording in docs.
- Nonessential report formatting issue.

### Good / confirmed

Record positive evidence too:

- Core prop names preserved.
- Spar behavior wrapped without duplicate state.
- Design data attributes mapped at correct levels.
- Validation passed.

## Evidence-backed verdict limits

A review cannot be `PASS` or `PASS WITH NOTES` without current local source
evidence for `takeoff-ui core`, `spar`, `takeoff-design`, and `takeoff-spar`.
Missing local evidence caps the verdict at `CONDITIONAL`, unless the missing
evidence hides a public API, DOM/data-state, state ownership, export, build, or
validation risk; then use `FAIL` or a blocking issue.
