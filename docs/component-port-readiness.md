# Component Port Readiness

The merge gate enforced before a component lands in `@takeoff-ui/react-spar`. A
port is **not** ready until every box below is checked. The gate is
authoritative — `CODING_STANDARDS.md` and individual port notes refer here.

> Existing skill
> `python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py <Name>`
> automates the artifact half of this gate. The decisions and reviews are still
> human work.

## Pre-flight: decision sheet

Before any code lands, the component has a completed decision sheet under
`tools/<component>-api-alignment.html`:

- [ ] Every Stencil prop, event, slot, method has a row with one of the six
      dispositions.
- [ ] Every Spar prop, callback, part has a row.
- [ ] Every wrapper-only surface has a row and an ADR reference.
- [ ] All `adapt`, `rename`, `deprecated`, `omitted` rows have a written
      rationale.
- [ ] If any row introduces a behavior change beyond Core, an ADR exists in
      [`decisions/`](./decisions/).
- [ ] The exported markdown is attached to the port PR description.

## Artifact manifest

The wrapper, recipe, docs, smoke scenario, changeset, and export must all exist.
The verifier script enforces this list.

- [ ] `packages/react-spar/src/components/<component-name>/` exists with the
      five required files (see
      [`component-architecture.md`](./component-architecture.md#folder-layout)).
- [ ] `packages/react-spar/src/components/index.ts` re-exports the local barrel.
- [ ] `packages/react-spar/src/styling/slot-registry.ts` lists every slot class
      for the component.
- [ ] `packages/react-spar/dist` (after `pnpm build`) emits **no** CSS for this
      component.
- [ ] `apps/docs/docs/components/<component-name>.mdx` exists with Usage, API,
      Anatomy, Migration, Accessibility sections.
- [ ] `apps/react-app/src/App.tsx` has at least one smoke scenario for the
      compound anatomy, against the real `@takeoff-design/tokens` CSS.
- [ ] `.changeset/<component>-component.md` describes the shipped surface.
- [ ] If any surface is `react-enhancement` (no upstream Spar part), the port
      note documents the archetype classification.
- [ ] If any surface is `bypass`, an inline `// exemption: <reason>` lives at
      the render site **and** a `@bypass <reason>` line lives in the base file.

## Public API

- [ ] Public prop names follow Takeoff vocabulary (`variant`, `type`, `size`,
      `mode`, `visible`, `activeIndex`, `clearable`, ...).
- [ ] Event names follow the React `onX` policy from
      [`contract-model.md`](./contract-model.md#event-naming-policy).
- [ ] Controlled / uncontrolled pairs use the
      [state model policy](./contract-model.md#state-model-policy).
- [ ] No render-override props on new ports. (`renderIcon`, `renderSpinner`,
      etc.) Existing render-override props are marked `@deprecated` per
      [ADR-0004](./decisions/0004-no-render-overrides.md).
- [ ] No flat content props on new ports. (`label`, `header`, `subheader`,
      `description`, `error`, `footerActions`, ...). Existing flat content props
      on shipped surfaces are marked `@deprecated` and have the compound
      replacement shipped in the same release.
- [ ] Subcomponents are exported only through the root, never as named exports
      from `src/components/index.ts`.
- [ ] Defaults are mirrored in `Base.defaultProps` and `@defaultValue` JSDoc.

## Behavior

- [ ] Spar owns keyboard, focus, and ARIA. The wrapper does not re-implement
      anything Spar already provides.
- [ ] If the wrapper bypasses an upstream Spar part, the bypass has a documented
      rationale and proves no behavior is silently re-implemented in React.
- [ ] Controlled / uncontrolled adapter has been tested for: initial mount,
      controlled-only, uncontrolled-only, mixed (with warning), callback call
      count.
- [ ] Callbacks fire once per user-visible state change. Asserted in tests.
- [ ] For interactive components, focus visible state, disabled state, and
      readOnly state behave as users expect.

## Styling contract

- [ ] Every slot owner node carries the canonical `tk-*` class.
- [ ] Every slot owner node carries `data-slot="<kebab-case>"`.
- [ ] Every state hook follows
      [`DATA_ATTRIBUTE_VOCABULARY.md`](../packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md).
- [ ] Variant / size / type / mode hooks emit `data-variant`, `data-size`,
      `data-type`, `data-mode` on the root.
- [ ] No anonymous wrapper nodes that only add DOM weight.
- [ ] No bundled component CSS in `@takeoff-ui/react-spar/dist`.

## Tests

`pnpm --filter @takeoff-ui/react-spar test` passes. Coverage mandates:

- [ ] Default rendering and root slot contract.
- [ ] Canonical anatomy for every subcomponent (class + `data-slot`).
- [ ] Class name merging (theme + instance, with theme appending and instance
      winning where rules say so).
- [ ] Default props and emitted `data-*` hooks.
- [ ] Controlled and uncontrolled paths, including initial mount.
- [ ] Callback signatures and call counts.
- [ ] Conditional subcomponents — both rendered and skipped.
- [ ] `slotProps` reaching the right owner node.
- [ ] Context-boundary error when a subcomponent is used outside its root.
- [ ] One `axe` baseline pass for interactive components.
- [ ] Deprecation warnings fire once per instance for `deprecated` surfaces.

## Validation commands

These are the local boundary commands. CI runs the same set.

- [ ] `pnpm check-types`
- [ ] `pnpm lint`
- [ ] `pnpm --filter @takeoff-ui/react-spar test`
- [ ] `pnpm --filter @takeoff-ui/react-spar build`
- [ ] `python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py <Name> --repo-root .`
- [ ] `pnpm --filter docs verify:generated-api`
- [ ] `pnpm test:e2e -- --project chromium` (smoke scenario passes)

## Documentation

- [ ] Component docs page describes compound usage as the canonical flow.
- [ ] No flat content props appear in primary examples (compound first).
- [ ] Deprecated surfaces appear under a "Deprecated" section with the compound
      replacement next to each row.
- [ ] Migration guide entry exists in `apps/docs/docs/migration/`.
- [ ] Generated API tables under `apps/docs/src/docs-files/` are regenerated.
- [ ] `apps/docs/docs/roadmap.mdx` reflects the component's status.

## Reviews

Two written reviews live in the PR description before merge:

### Parity review

- [ ] Every Core surface accounted for in the decision sheet.
- [ ] Every `omitted` Core surface has a follow-on plan or a stated reason.
- [ ] Emitted `tk-*` classes match Core's class names where they overlap.
- [ ] Emitted `data-slot` values match Core's slot names where they overlap.
- [ ] No undocumented divergence from Core vocabulary.

Template:

```md
## Parity review (<Component>)

| Surface     | Status | Notes                              |
| ----------- | ------ | ---------------------------------- |
| Core props  | ✅     | n/n preserved or compound-replaced |
| Core events | ✅     | n/n renamed to React onX           |
| Core slots  | ✅     | n/n compound subcomponents         |
| Emitted DOM | ✅     | tk-\* and data-slot match Core     |

Divergences (each linked to a row in the decision sheet):

- ...
```

### React-enhancement review

Required only when the wrapper introduces a `react-enhancement` archetype part,
a wrapper-only public surface, or a `bypass`.

- [ ] Each react-enhancement part has no upstream equivalent.
- [ ] Each bypass part has a `@bypass` rationale and proves no Spar behavior is
      silently re-implemented in React.
- [ ] Each wrapper-only public surface has an ADR.

Template:

```md
## React-enhancement review (<Component>)

- Part `Component.X` — react-enhancement. No upstream Spar part. Pure styling
  chrome.
- Part `Component.Y` — bypass. Reason: ... Behavior owned by: ...
- Public prop `wrapperOnlyProp` — wrapper-only. ADR: <link>.
```

## When the gate blocks you

If a checkbox below "Pre-flight: decision sheet" cannot be ticked, the work is
upstream of the port. Pause and resolve there:

- Missing rationale → add it to the decision sheet.
- Behavior conflict between Core and Spar → write an ADR.
- Test infrastructure gap → fix the shared utility, then continue.

If a checkbox under "Artifact manifest" cannot be ticked because the
infrastructure is genuinely missing, mark the omission with an inline
`// exemption: <reason>` comment at the deletion site **and** record it in the
port note. Exemption is not silent.
