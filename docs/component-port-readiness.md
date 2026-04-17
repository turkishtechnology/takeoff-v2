---
title: Component-Port Readiness Gate
status: canonical
owner: takeoff-spar
updated: 2026-04-17
---

# Component-Port Readiness Gate

This doc is the gate a new component must pass before it can ship in
`@takeoff-ui/react-spar`. It consolidates the rules that were previously
scattered across `CODING_STANDARDS.md`, the component-port skill, and the
per-doc "final report" templates, and wires them to one programmatic check.

It exists because Milestone 7 of the monorepo professionalization plan required
a single gate that future component work can reuse without reopening
foundational contract questions. Before this doc, the rules were truthful but
distributed — a port author had to stitch four files together to know they were
done.

Scope sibling documents:

- [`contract-model.md`](./contract-model.md) — what the library promises
- [`api-decision-framework.md`](./api-decision-framework.md) — how API shapes
  are decided per component
- [`decisions/`](./decisions/README.md) — durable repo-wide decisions
- [`.agents/skills/takeoff-component-port/`](../.agents/skills/takeoff-component-port/)
  — the executable skill that drives a port end to end

## How to use this doc

1. Start from the skill: run
   `python3 .agents/skills/takeoff-component-port/scripts/check_port_context.py <Name> --repo-root .`
   and read the printed file list first.
2. Work through [the readiness checklist](#readiness-checklist) as the port
   progresses.
3. Before opening a PR, produce either the
   [parity-review report](#parity-review-template) or the
   [react-enhancement review report](#react-enhancement-review-template) —
   usually both, one per classification present in the change.
4. Run the gate:
   `pnpm lint && pnpm check-types && pnpm --filter @takeoff-ui/react-spar test && pnpm build && python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py <Name> --repo-root .`
5. The `verify_port_artifacts.py` script enforces the artifact manifest
   programmatically. If it fails, the gate fails.

## Readiness checklist

The checklist is organized by phase. A port is not ready to merge until every
non-exempted box is either ticked or has an inline `exemption: <reason>` noted
in the final report.

### Phase A — Research and decisions

- [ ] `../takeoff-ui/packages/core/src/components/tk-<name>/` read in full,
      including its tests and Stencil metadata.
- [ ] `../spar/packages/spar/src/components/<Name>/` read when present;
      primitive mapping decided explicitly.
- [ ] `../takeoff-design/packages/tokens/tokens/component/<name>.json` read when
      present; dimensional tokens vs visual recipe split recorded.
- [ ] Archetype chosen per
      [`archetypes.md`](../.agents/skills/takeoff-component-port/references/archetypes.md)
      (leaf / form / compound / overlay / layout).
- [ ] Customization surface decision made per component and per slot, following
      [`adaptation-policy.md`](../.agents/skills/takeoff-component-port/references/adaptation-policy.md)
      and the [API decision framework](./api-decision-framework.md).
- [ ] Every difference classified as `strict-parity`, `technical-adaptation`,
      `react-enhancement`, or `forbidden-divergence`. Forbidden divergences do
      not ship.

### Phase B — Implementation

- [ ] [Artifact manifest](#artifact-manifest) produced; every artifact exists at
      the expected location.
- [ ] Wrapper stays thin; primitive owns behavior and accessibility unless an
      explicit `technical-adaptation` is recorded.
- [ ] Stencil event names converted to idiomatic React callbacks. No `tk-*` or
      `onTk*` names leak into the React surface.
- [ ] Slot classes emitted by the wrapper match the names declared in the
      `ComponentNameBase.slots` map and are mirrored in
      `src/styling/slot-registry.ts`.
- [ ] Structural slot owner nodes stay intact across wrapper, `slotProps`,
      render overrides, and compound parts. Render overrides replace content,
      not ownership.
- [ ] No CSS emitted from `packages/react-spar/dist`. Styling lives in
      `@takeoff-design/tokens` recipes only.
- [ ] Every recipe selector is backed by a rendered class name or `data-*` hook.
      `verify_port_artifacts.py` enforces this.

### Phase C — Public contract

- [ ] Exported from `packages/react-spar/src/components/index.ts`.
- [ ] Docs page at `apps/docs/docs/Components/<Name>.mdx` with usage, props API
      table (auto-generated), customization surface section, and at least one
      example per public surface type.
- [ ] Per-component `xxxClassNames` map exported as a public view of the slot
      contract.
- [ ] `packages/react-spar/README.md` mentions the component where it lists
      supported components.
- [ ] A changeset under `.changeset/<slug>.md` with a correct semver bump
      (`patch` pre-1.0, `minor` for additive public surface, `major` for
      breaking). Scope notes must call out any upstream behavior that is **not**
      ported.

### Phase D — Tests and smoke coverage

- [ ] Unit tests exercise every public surface: wrapper props, `classNames`,
      `slotProps`, render overrides, compound parts (when present), and the
      events vocabulary.
- [ ] Smoke scenario in
      [`apps/react-app/src/App.tsx`](../apps/react-app/src/App.tsx) wires the
      component against the real `@takeoff-design/tokens` CSS, exercises the
      customization paths that matter, and (when applicable) contributes a
      verifier check to `runContractChecks`. Exemptions must be inline as
      `// exemption: <reason>`.
- [ ] Recipe selectors round-trip: `verify_port_artifacts.py` shows no
      `recipe_classes_missing_in_component`.

### Phase E — Gate

- [ ] `pnpm lint` green.
- [ ] `pnpm check-types` green (both `packages/react-spar` and `apps/docs`).
- [ ] `pnpm --filter @takeoff-ui/react-spar test` green.
- [ ] `pnpm build` green.
- [ ] `verify:generated-api` in `apps/docs` reports no drift.
- [ ] `python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py <Name> --repo-root .`
      exits 0.
- [ ] Parity-review report and/or React-enhancement review report written in the
      PR description.

## Artifact manifest

Every shipped component must produce this set of artifacts. The set is the
programmatic contract — `verify_port_artifacts.py` checks the file-level boxes;
the descriptive boxes are covered by the checklist above.

| #   | Artifact                   | Location                                                                                     | Checked by                     |
| --- | -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Wrapper                    | `packages/react-spar/src/components/<name>/<Name>.tsx`                                       | script (component root exists) |
| 2   | Base metadata              | `packages/react-spar/src/components/<name>/<Name>Base.ts`                                    | implied by barrel              |
| 3   | Adapter hook (when needed) | `packages/react-spar/src/components/<name>/use<Name>Adapter.ts`                              | optional                       |
| 4   | Types                      | `packages/react-spar/src/components/<name>/types.ts`                                         | implied                        |
| 5   | Unit tests                 | `packages/react-spar/src/components/<name>/<Name>.test.tsx`                                  | manual / CI                    |
| 6   | Local barrel               | `packages/react-spar/src/components/<name>/index.ts`                                         | script (re-export)             |
| 7   | Package export             | `packages/react-spar/src/components/index.ts` includes `export * from './<name>';`           | script                         |
| 8   | Slot-class mirror          | `packages/react-spar/src/styling/slot-registry.ts`                                           | generator / review             |
| 9   | Tokens recipe              | `../takeoff-design/packages/tokens/styles/recipes/_<name>.scss`, wired through `_index.scss` | script                         |
| 10  | Built theme selector       | `.tk-<name>` present in `../takeoff-design/packages/tokens/dist/css/default/theme.css`       | script                         |
| 11  | Docs page                  | `apps/docs/docs/Components/<Name>.mdx`                                                       | script                         |
| 12  | Smoke scenario             | Referenced in `apps/react-app/src/App.tsx`                                                   | script                         |
| 13  | Changeset                  | `.changeset/<slug>.md` with the package and bump                                             | script                         |
| 14  | README mention             | `packages/react-spar/README.md` and install path still correct                               | manual                         |

Any deviation from this set must be recorded as an `exemption` in the final
report, with a reason.

## Parity-review template

Use this report when the change is classified as `strict-parity` or
`technical-adaptation` for the public contract. Copy into the PR description.

```markdown
## Parity review — <ComponentName>

- **takeoff-ui source**: `tk-<slug>` @ `../takeoff-ui/.../tk-<slug>/`
- **spar primitive**: `<Name>` | none (custom)
- **archetype**: leaf | form | compound | overlay | layout
- **customization surface**: wrapper | + slotProps | + render overrides | +
  compound parts
- **classification**: strict-parity | technical-adaptation

### Prop parity

| core prop        | react-spar prop     | match  | notes                              |
| ---------------- | ------------------- | ------ | ---------------------------------- |
| `disabled`       | `disabled`          | ✓      | same semantics                     |
| `tkChange` event | `onChange` callback | mapped | Stencil → React, payload preserved |

### Event parity

| core event | react-spar callback | payload match | notes |
| ---------- | ------------------- | ------------- | ----- |

### Slot inventory

| slot    | kind       | owner node             | customization           |
| ------- | ---------- | ---------------------- | ----------------------- |
| `root`  | structural | `<div class="tk-...">` | slotProps only          |
| `label` | content    | `<label>`              | slotProps + renderLabel |

### Diff from takeoff-ui/core

- (bullet each non-parity point, with classification and reason)

### Diff from spar primitive

- (bullet each non-parity point, with classification and reason)

### Forbidden divergences avoided

- (bullet changes that were considered but rejected, with reason)
```

## React-enhancement review template

Use this second report when the change introduces any `react-enhancement`
surfaces — new controlled/uncontrolled pairs, `slotProps`, render overrides,
compound parts, or any additive prop with no core analogue. Copy into the PR
description below the parity review.

```markdown
## React-enhancement review — <ComponentName>

Purpose of this section: every react-enhancement is additive, optional, and must
not overlap a parity surface. List each one below and justify that it clears the
three additive tests (additive / optional / documented).

### Enhancements introduced

| surface         | kind                              | parity overlap       | consumer impact                                     |
| --------------- | --------------------------------- | -------------------- | --------------------------------------------------- |
| `renderSpinner` | render override (decorative slot) | none                 | additive                                            |
| `Input.Label`   | public compound part              | mirrors `label` prop | additive; wrapper composes the same part internally |

### Per-enhancement justification

For each row above:

- **`<surface>`**
  - **problem it solves**: <why a parity-only wrapper cannot serve this need>
  - **why additive**:
    <how it layers on top of the parity path without changing it>
  - **canonical-owner preservation**: <how structural owner + data-slot stay
    intact>
  - **tests**: <path(s) to the test(s) pinning it>
  - **docs**: <path to the docs surface describing it>

### Precedence rules observed

- instance `classNames` / `slotProps` win over provider theme-level values
- controlled props win over uncontrolled fallbacks
- render overrides replace content inside canonical owner nodes only

### Residual risks

- (bullet any risk that future changes could inadvertently break)
```

## Recommended rollout order

Working order for Phase B component ports, validated on 2026-04-17 against the
current `../takeoff-ui`, `../spar`, and `../takeoff-design` sibling repos. The
ordering is deliberate: foundations land before the components that compose on
top of them (notably Popover before Tooltip / Dropdown / Select), and each step
reuses patterns the previous step proved.

Legend: ✓ = present, ✗ = missing, ~ = partial or combined.

| #   | React component        | `tk-*` core   | spar primitive | tokens JSON             | tokens recipe    | Notes                                                                                                                               |
| --- | ---------------------- | ------------- | -------------- | ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Input** ✓ shipped    | `tk-input`    | `Input`        | `input.json`            | `_input.scss`    | reference port; shipped 2026-04-16                                                                                                  |
| 2   | **Checkbox** ✓ shipped | `tk-checkbox` | `Checkbox`     | `radio-checkbox.json` ~ | `_checkbox.scss` | shipped 2026-04-17; recipe consumes `radio-checkbox.json` card tokens and stamps state via data-\* attrs from the spar primitive    |
| 3   | **Radio**              | `tk-radio`    | `Radio`        | `radio-checkbox.json` ~ | ✗                | reuses Checkbox recipe scaffolding                                                                                                  |
| 4   | **Toggle**             | `tk-toggle`   | `Switch`       | ✗                       | ✗                | **naming adaptation**: React wrapper is `Toggle` (parity with core), primitive is spar's `Switch`. Record as `technical-adaptation` |
| 5   | **Popover**            | `tk-popover`  | `Popover`      | `popover.json` ✓        | ✗                | foundation; must ship before Tooltip / DropdownMenu / Select                                                                        |
| 6   | **Tooltip**            | `tk-tooltip`  | `Tooltip`      | `tooltip.json` ✓        | ✗                | composes on Popover floating-ui layer                                                                                               |
| 7   | **DropdownMenu**       | `tk-dropdown` | `DropdownMenu` | `dropdown.json` ✓       | ✗                | composes on Popover                                                                                                                 |
| 8   | **Tabs**               | `tk-tabs`     | `Tabs`         | `tabs.json` ✓           | ✗                | independent of Popover; compound archetype                                                                                          |
| 9   | **Select**             | `tk-select`   | `Select`       | ✗                       | ✗                | composes on Popover + Input; needs new tokens and recipe                                                                            |

Each row marked `✗` under recipe means `takeoff-design` must land that recipe
before the react-spar port can pass `verify_port_artifacts.py`. For ports where
tokens are missing, `takeoff-design` must also land the component tokens file.
This is a cross-repo coordination cost that should be scheduled into the port PR
plan, not treated as surprise.

### Naming adaptations carried forward

- **Toggle vs Switch**: `takeoff-ui/core` ships `tk-toggle`; `spar` ships
  `Switch`. Per
  [`api-decision-framework.md § 1`](./api-decision-framework.md#1-prop-parity),
  parity with the core component name wins for the public React surface. The
  wrapper is `Toggle`, the primitive is spar's `Switch`, and the divergence is
  classified as `technical-adaptation`.
- **DropdownMenu vs Dropdown**: spar ships `DropdownMenu`; `takeoff-ui/core`
  ships `tk-dropdown`. The React wrapper should expose `Dropdown` (or
  `DropdownMenu` if a migration ADR approves the rename). A decision note must
  land in [`decisions/`](./decisions/README.md) before the port begins.

## M7 follow-up status

- **Playwright smoke verifier CI** — LANDED 2026-04-17.
  - `@playwright/test@^1.59.1` installed at the workspace root.
  - [`playwright.config.ts`](../playwright.config.ts) spawns `vite preview` via
    the `webServer` hook against `127.0.0.1:4173` with `strictPort`;
    `reuseExistingServer` is on locally and off in CI (so stale processes cannot
    mask failures). Chromium-only project; CI retries = 2;
    `trace: on-first-retry`; reporters are `github` + `html` in CI, `list`
    locally.
  - [`e2e/smoke-verifier.spec.ts`](../e2e/smoke-verifier.spec.ts) navigates to
    `/`, waits for `[data-verifier-panel]`, and asserts
    `data-verifier-status="pass"`.
  - CI wiring in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) lands
    after the build step, caches `~/.cache/ms-playwright` keyed on
    `pnpm-lock.yaml`, installs chromium with `--with-deps` on cache miss
    (system-deps-only on cache hit), runs `pnpm exec playwright test`, and
    uploads the HTML report as an artifact on failure with 14-day retention.
  - Gate is still non-blocking for gating future component ports through
    `verify_port_artifacts.py`; its job is to catch regressions in the smoke
    verifier itself, not to substitute for the per-port manifest checks.

## When this gate is wrong

If a port uncovers a rule in this doc that no longer matches the repo, fix the
doc in the same PR that ships the port. This doc is load-bearing only while it
is accurate. Do not duplicate any of its rules into another proposal or README.
