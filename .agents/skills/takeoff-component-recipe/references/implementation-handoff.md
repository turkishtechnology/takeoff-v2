# Implementation handoff prompt

Use this after the recipe has been reviewed and decisions have been approved.

```markdown
# {{Component}} takeoff-spar implementation handoff

You are implementing `{{component}}` only.

Inputs:

- Recipe: `{{component}}.recipe.md`
- Approved decisions: `{{component}}.decisions.md`
- Component: `{{component}}`
- Spar primitive: `{{spar_primitive}}`
- Repo root: `{{repo_root}}`

Architectural gate:

1. `takeoff-ui core` is read-only and is the API/event/slot/class/data-state
   reference.
2. `spar` owns headless behavior: state, a11y, keyboard, focus, SSR id. Modify
   spar only for a real primitive bug or wrapper-impossible gap, with minimal
   diff and tests.
3. `takeoff-spar` owns React API normalization, style/class/data-state mapping,
   public types, ref/passthrough, docs, and tests. Do not reimplement
   state/a11y/keyboard in the wrapper.
4. `takeoff-design` may be changed only when recipe selectors and wrapper
   DOM/data-state contract are inconsistent. No redesign, new token, hard-coded
   visual value, or component-unrelated recipe change.

Scope:

- Touch only files named in the recipe implementation plan, plus directly
  required tests/docs/exports.
- Do not generate generic component infrastructure, task generators, audit
  files, workflows, migrations, or scaffolding.
- Do not change branches or overwrite local work.
- If an in-flight file is dirty and unrelated to this task, do not touch it;
  report it.

Before coding:

- Record cut-off for all four repos: branch, status, last commit.
- Re-check the recipe and decisions for contradictions.
- If a decision is still unresolved and affects public API/DOM/state, stop and
  report `Decision Needed`.

Implementation requirements:

- Align prop names with `takeoff-ui core`; do not rename without approved
  decision.
- Map web component events `tk-foo-change` to React callbacks such as
  `onFooChange`.
- Use compound API where the recipe says so:
  `Object.assign(Root, { Item, ... })` and `displayName: 'Component.Part'` for
  each public part.
- Keep internal-only visual parts private; expose visual customization through
  approved props only.
- Wrap spar state; do not duplicate controlled/uncontrolled state.
- Preserve canonical class names with `cx(canonical, consumerClassName)` or the
  local equivalent.
- Emit only data attributes required by the recipe/design contract.
- Preserve passthrough for `className`, `style`, `id`, `data-*`, `aria-*`, refs,
  and user event handlers.
- Compose event handlers in the repo's existing pattern: consumer first, then
  internal only if not prevented.
- Export all public part props and value/handler types.
- Add `types.test-d.ts` coverage for required, forbidden, and narrow types.

Tests/docs/exports:

- Add wrapper-specific tests from the recipe. Do not retest spar's state
  machine, keyboard navigation, or ARIA internals unless wrapper adds behavior.
- Add docs demos from the recipe: default, major variants, controlled usage, and
  customization/edge scenario that the component truly supports.
- Add API config and generated API docs when required by the repo pattern.
- Update component index exports and package component exports only as required.

Validation: Run, or report why you could not run:

1. `pnpm install`
2. `pnpm exec vitest run {{component}}`
3. `pnpm exec vitest run`
4. `pnpm exec tsc --noEmit`
5. `pnpm exec eslint .`
6. `pnpm build`

Failure triage:

- If a failure is caused by touched files, fix it.
- If a failure is pre-existing or unrelated to `{{component}}`, document
  evidence and continue.
- If validation cannot run because of environment setup, document the blocker
  and remaining risk.

Final report format:

1. Repos & cut-off table
2. Discovery delta from recipe
3. Implementation summary: Public API, DOM contract, A11y, SSR
4. Tests/docs/exports summary
5. Validation table
6. takeoff-design/spar change justification, if any
7. Decision Needed, if any
8. Remaining risks
```
