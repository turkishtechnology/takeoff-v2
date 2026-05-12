# Anti-patterns to flag

## Scope anti-patterns

- Creating a new skill, task generator, workflow, migration, or audit scaffold
  inside the implementation.
- Touching multiple components to make one component work.
- Changing `takeoff-ui core` to match wrapper output.
- Large `pnpm-lock.yaml` churn without dependency intent.

## Architecture anti-patterns

- Wrapper owns `useState` for open/selected/value when spar already provides
  controlled/uncontrolled state.
- Wrapper has custom keyboard navigation logic.
- Wrapper generates ids that conflict with spar `useId` or hydration.
- Wrapper rewrites focus management.
- A11y roles/aria attributes are duplicated or contradicted by wrapper.
- Primitive bug is hidden by a wrapper hack instead of a minimal spar fix.

## API anti-patterns

- Renaming core prop names without decision.
- Exposing raw spar vocabulary when core uses a different public vocabulary and
  wrapper should normalize.
- Exporting internal-only visual parts as public compound API.
- Missing public prop exports for compound parts.
- Using broad `any` for value or event payload types.
- Adding a new customization API when existing `slotProps`/`classNames` pattern
  exists.

## DOM/style anti-patterns

- `className={consumer}` replacing canonical `tk-*` class.
- Data attributes invented from intuition rather than recipe selectors.
- Data attributes placed at root while recipe expects item/content level.
- `forceMount` content marked open when it is merely mounted.
- Hard-coded styles or tokens in wrapper.

## Test anti-patterns

- Testing spar keyboard/state internals in wrapper tests while wrapper adds
  nothing.
- Missing type tests for public props.
- Snapshot-only tests for a DOM contract that needs explicit class/data
  assertions.
- Docs examples using an API not exported by package entrypoints.

## Report anti-patterns

- Final report says validation passed without commands/logs.
- Pre-existing failures are claimed but not evidenced.
- Decisions are omitted after implementation.
- Risks are hidden in prose rather than listed.
