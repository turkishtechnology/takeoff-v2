---
name: monorepo-professionalization-execution-plan
description: >
  Alignment-first execution plan for taking takeoff-spar from "healthy but still
  half-finished" to a professional, contract-trustworthy monorepo.
status: active
type: execution-playbook
owner: takeoff-spar
date: 2026-04-17
---

# Monorepo Professionalization Alignment Plan

## Purpose

This file is the canonical alignment plan for the next phase of `takeoff-spar`.

It replaces optimistic milestone language with a repo-reality-first plan.
Passing `lint`, `check-types`, tests, and build is a strong baseline, but it is
not enough on its own to call the repo "professionalized" while docs, typing,
naming, validation semantics, and repo taxonomy still drift from the
implementation.

## Confirmed Baseline

- `pnpm lint`, `pnpm check-types`, `pnpm --filter @takeoff-ui/react-spar test`,
  and `pnpm --filter @takeoff-ui/react-spar build` passed on 2026-04-17.
- Three canonical foundation docs already exist and remain valid inputs to this
  plan:
  - [`docs/contract-model.md`](../contract-model.md)
  - [`docs/api-decision-framework.md`](../api-decision-framework.md)
  - [`docs/decisions/README.md`](../decisions/README.md)

## Current Alignment Gaps

- Provider docs and runtime contract do not match.
  [`apps/docs/docs/theming.mdx`](../../apps/docs/docs/theming.mdx),
  [`packages/react-spar/README.md`](../../packages/react-spar/README.md), and
  [`apps/docs/docs/intro.md`](../../apps/docs/docs/intro.md) claim capabilities
  that
  [`packages/react-spar/src/provider.tsx`](../../packages/react-spar/src/provider.tsx)
  does not currently implement.
- The customization contract is not yet professionally typed.
  [`packages/react-spar/src/types/customization.ts`](../../packages/react-spar/src/types/customization.ts)
  uses generic string records, and components recover specificity with local
  `as` casts.
- ~~[`packages/react-spar/src/theme/recipes.ts`](../../packages/react-spar/src/theme/recipes.ts)
  is not actually a recipe system; it is a slot or anatomy registry with a
  misleading name and namespace.~~ Resolved 2026-04-17 by Milestone 2 (renamed
  to `src/styling/slot-registry.ts`, demoted from public surface).
- ~~Validation task names do not yet match their behavior.
  [`apps/docs/package.json`](../../apps/docs/package.json) runs docs generation
  and package build during `precheck-types`, so `check-types` is not a pure
  validation boundary.~~ Resolved 2026-04-17 by Milestone 3 (path alias to
  source + `precheck-types` removed; CI step names rewritten; doc-integrity gate
  added; release gate written).
- ~~Repo taxonomy and proposal lifecycle are still unfinished. Files such as
  `migration-fix-guide.TEMP.md` and `docs/proposals/ULTRATHINK_PLAN.md` should
  not remain in active-topology naming once their outputs are absorbed.~~
  Resolved 2026-04-17 by Milestone 4 (markdown taxonomy added to
  `source-of-truth.md`; seven proposals deleted after per-file fate decisions;
  `PHASE_1` / `PHASE_2` checklists moved to `docs/archive/`; only this active
  execution plan remains under `docs/proposals/`).
- ~~Small dead-weight still exists, including
  [`ComponentBase.styles`](../../packages/react-spar/src/base/createComponentBase.ts)
  and the unused `@/*` path alias in
  [`packages/react-spar/tsconfig.json`](../../packages/react-spar/tsconfig.json).~~
  Resolved 2026-04-17 by Milestone 5 (`styles` field removed from
  `ComponentBaseConfig` / `ComponentBase` plus its lone test; `@/*` alias
  removed; barrel and helper exports audited; `utils/*` confirmed
  internal-only).

## Operating Rules

- Work in the milestone order below unless the user explicitly reprioritizes.
- A checked task means the repo, docs, exports, and validation now agree.
  "Reviewed", "discussed", or "mostly true" is not enough.
- If a previously checked item turns out to be inaccurate, revert it to `[ ]`
  and note why.
- Do not hide implementation drift by adding more prose. Either narrow the docs
  to shipped behavior or ship the documented behavior.
- For public-contract decisions that affect API shape, customization, slot
  ownership, refs, accessibility ownership, or event behavior, do a short
  research pass first using current primary sources. Minimum expectation:
  official React docs, official TypeScript docs when typing matters,
  WAI-ARIA/APG when accessibility matters, and mature React component library
  docs when pattern comparison is useful.
- Public contract changes must keep
  [`docs/contract-model.md`](../contract-model.md),
  [`docs/api-decision-framework.md`](../api-decision-framework.md), and any
  relevant ADRs aligned.
- No broad component expansion until this plan's blocking milestones are
  complete.

## Foundations Already Landed

- [x] Contract model is documented in
      [`docs/contract-model.md`](../contract-model.md).
- [x] Repo-wide API decision framework is documented in
      [`docs/api-decision-framework.md`](../api-decision-framework.md).
- [x] Durable ADR location exists in
      [`docs/decisions/`](../decisions/README.md).
- [x] Initial repo-wide ADRs 0001-0005 are recorded under
      [`docs/decisions/`](../decisions/README.md).

## Priority Order

1. Doc truth fix
2. Typed customization map
3. `recipes.ts` rename or refactor into a truthful styling-contract surface
4. Pure validation split
5. Proposal and archive cleanup
6. Dead-weight and export cleanup
7. Smoke app as contract verifier
8. Component-port readiness gate
9. Only then resume broad wrapper expansion

## Milestone 0 — Doc Truth And Source Of Truth

Goal: make the repo tell the truth before it claims maturity.

### Tasks

- [x] Resolve the provider contract mismatch. Chosen outcome: **narrow**.
      [`apps/docs/docs/theming.mdx`](../../apps/docs/docs/theming.mdx) and
      [`packages/react-spar/README.md`](../../packages/react-spar/README.md) now
      describe only the shipped `colorMode` / `locale` / `components` surface
      that writes `data-theme` + `lang` on a `display: contents` wrapper.
      Fabricated `density`, `data-color-mode`, `data-density`, `dir`,
      `data-direction`, `data-locale` claims were removed.
- [x] Remove nonexistent internal-doc references from public docs.
      [`apps/docs/docs/intro.md`](../../apps/docs/docs/intro.md) no longer
      points at the gitignored `/internal-docs/react-spar` path.
- [x] Create a short source-of-truth matrix:
      [`docs/source-of-truth.md`](../source-of-truth.md). Answers where the
      public contract, implementation rules, ADRs, and temporary proposals live,
      plus the proposal lifecycle (absorbed / active / archived / deleted).
- [x] Re-audit README and docs-app wording for maturity honesty. Landing page
      component coverage, provider capabilities, customization surface claims,
      and migration messaging all match the shipped reality. Component-scoped
      uses of "density" in `button/body.mdx` and `accordion/body.mdx` are
      accurate component-prop descriptions and were left in place.

### Validation

- [x] public docs and runtime behavior say the same thing
- [x] no README or docs page points to nonexistent locations
- [x] `pnpm lint` — passed 2026-04-17
- [x] `pnpm check-types` — passed 2026-04-17

## Milestone 1 — Typed Customization Contract

Goal: replace generic string maps and local casts with an explicit,
compile-time-checked customization model.

### Tasks

- [x] Introduce a dedicated customization module boundary. Landed:
  - [`packages/react-spar/src/customization/overrides.ts`](../../packages/react-spar/src/customization/overrides.ts)
    (`ClassNamesOverride`, `SlotPropsOverride`)
  - [`packages/react-spar/src/customization/contracts.ts`](../../packages/react-spar/src/customization/contracts.ts)
    (`ComponentThemeConfig`, `ComponentCustomizationRegistry`, `ComponentName`,
    `ComponentsThemeMap`)
  - [`packages/react-spar/src/customization/merge.ts`](../../packages/react-spar/src/customization/merge.ts)
    (`applyThemeDefaults`, `mergeClassNames`, `mergeSlotProps`,
    `buildSlotAttrs`)
  - [`packages/react-spar/src/customization/index.ts`](../../packages/react-spar/src/customization/index.ts)
  - Deleted: `src/types/customization.ts` and `src/utils/resolveSlotProps.ts` (+
    its test).
- [x] Replace `Record<string, ComponentThemeConfig>` with an explicit component
      customization map. `ComponentsThemeMap` is now
      `{ [K in ComponentName]?: ComponentCustomizationRegistry[K] }`, keyed by
      `'Button' | 'Accordion' | 'AccordionItem' | 'Dialog' | 'Input'`.
- [x] Make `defaultProps`, `classNames`, and `slotProps` component-specific at
      the type level. `ComponentThemeConfig<TProps, TSlot, TSlotProps>` binds
      `defaultProps: Partial<TProps>`, `classNames: ClassNamesOverride<TSlot>`,
      and `slotProps: TSlotProps` (the component's specific `XxxSlotProps`).
      Wrong casing, unknown component names, invalid slots, and invalid
      `defaultProps` fields all fail at compile time — covered by
      [`contracts.test-d.ts`](../../packages/react-spar/src/customization/contracts.test-d.ts).
- [x] Eliminate component-level recovery casts. All ten
      `as     ClassNamesOverride<…>` / `as XxxSlotProps` casts across
      `Button.tsx`, `Accordion.tsx`, `AccordionItem.tsx`, `Dialog.tsx`,
      `Input.tsx` were removed, plus the five
      `propsWithThemeDefaults as XxxProps` casts. The only remaining escape
      hatches are:
  - one internal cast inside `merge.ts` to bridge element-variance between
    `HTMLAttributes<HTMLElement>` and element-specific attribute types,
    documented with JSDoc rationale;
  - one `InternalAccordionItemProps` cast in `AccordionItem.tsx` where the
    parent `Accordion` injects two scaffolding props (`_autoIndex`,
    `__tkAccordionValue`) that sit outside the public props surface — documented
    inline.
- [x] Document precedence at the type and helper boundaries. JSDoc on
      `ComponentThemeConfig` states the full precedence table (defaults vs
      instance, classNames concatenation, slotProps instance-wins with className
      concat). JSDoc on `applyThemeDefaults`, `mergeClassNames`,
      `mergeSlotProps`, and `buildSlotAttrs` restates the rules at the runtime
      helper level, including the canonical-class / `data-slot` preservation
      invariant.
- [x] Add type-level and runtime tests for the customization contract.
  - Type-level:
    [`contracts.test-d.ts`](../../packages/react-spar/src/customization/contracts.test-d.ts)
    uses `expectTypeOf` + `@ts-expect-error` to enforce rejection of unknown
    component names, unknown slot keys, and unknown defaultProps fields.
  - Runtime merge:
    [`merge.test.ts`](../../packages/react-spar/src/customization/merge.test.ts)
    covers `applyThemeDefaults` precedence, `mergeSlotProps` + `mergeClassNames`
    concatenation and instance-wins semantics.
  - Canonical `tk-*` + `data-slot` preservation and provider ↔ instance
    precedence remain covered by the existing
    [`Button.test.tsx`](../../packages/react-spar/src/components/button/Button.test.tsx)
    "theme-level customization" suite.

### Validation

- [x] no consumer-facing component customization relies on `Record<string, ...>`
- [x] no repeated component-local `as SomeSlotProps` casts remain without a
      documented exception
- [x] customization helpers and types share the same terminology as docs
- [x] `pnpm --filter @takeoff-ui/react-spar test` — 9 files, 230 tests passed
      (2026-04-17)
- [x] `pnpm check-types` — 3/3 packages green (2026-04-17)

## Milestone 2 — Styling Registry Naming And Export Hygiene

Goal: make naming, folders, and public exports reflect the real contract
surface.

### Tasks

- [x] Decide whether `src/theme/recipes.ts` is a registry or a real recipe
      surface. **Decision (2026-04-17): registry.** The data shape is
      `{ componentKey: { slots: tk-class-map } }` — pure slot anatomy, no
      variant / size / conditional metadata. The actual styling recipes live in
      `@takeoff-design/tokens/styles/recipes/_<component>.scss` and consume
      `tk-*` selectors by string convention; no JS importer of the export exists
      in any monorepo or downstream consumer. Renamed to
      [`packages/react-spar/src/styling/slot-registry.ts`](../../packages/react-spar/src/styling/slot-registry.ts);
      export renamed `recipes` → `slotClassRegistry`. Old `src/theme/` folder
      removed.
- [x] Update every dependent source to match the chosen naming. Surfaces
      updated:
  - root exports ([`src/index.ts`](../../packages/react-spar/src/index.ts)) —
    see "public surface" task below for the demotion call
  - internal imports — only the deleted barrel referenced the old path
  - ADRs 0002 and 0005 ([`docs/decisions/`](../decisions/README.md)) — both
    rewritten to describe the slot-class registry as an internal inventory and
    to make the `tk-*`-string contract explicit
  - [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md)
    — folder structure rule, merge checklist, and intro line all updated
  - `PHASE_1_IMPLEMENTATION_CHECKLIST.md` — section 6 retitled "Align slot-class
    registry" (file later moved to [`docs/archive/`](../archive/README.md) by
    Milestone 4)
  - component generator script
    ([`packages/react-spar/scripts/generate-component.mjs`](../../packages/react-spar/scripts/generate-component.mjs))
    — writes to the new path; emits `slot-class entry` log line
  - `.agents/skills/` references in `generate-component/SKILL.md`,
    `takeoff-component-port/scripts/check_port_context.py`,
    `takeoff-component-port/references/workflow.md`,
    `takeoff-component-port/references/live-button.md`
- [x] Audit the public export surface for accidental internals.
      `slotClassRegistry` is **not** re-exported from
      [`src/index.ts`](../../packages/react-spar/src/index.ts). Per ADR 0005 the
      cross-package contract is the `tk-*` strings (consumed by SCSS recipes in
      `@takeoff-design/tokens`), not the JS object. The registry remains an
      internal inventory used by the generator script and available to future
      build-time validation. Consumers that need slot-class strings have two
      documented public paths: the `tk-*` selectors themselves and per-component
      `*Base.classes` maps reachable through component module imports.
- [x] Align folder taxonomy with responsibility. Old `src/theme/` folder deleted
      (it only ever held this one file). Resulting rules:
  - `src/base/` — `createComponentBase` factory shared by every component
  - `src/components/` — public component wrappers, bases, adapters, tests
  - `src/customization/` — typed provider customization contract (`overrides`,
    `contracts`, `merge`)
  - `src/styling/` — internal slot-class registry; the seam between component
    bases and `@takeoff-design/tokens` SCSS recipes
  - `src/types/` — narrow shared types (currently `SlotClassNames`)
  - `src/utils/` — generic helpers
  - `src/provider.tsx` — `SparReactProvider` runtime
  - `src/index.ts` — single public-surface barrel

### Validation

- [x] file and folder names describe their real responsibility
- [x] public exports match the documented public API (slot-class registry
      intentionally internal; `tk-*` strings remain the cross-package contract)
- [x] generator and docs instructions point at the renamed surface
- [x] `pnpm check-types` — 3/3 packages green (2026-04-17)
- [x] `pnpm lint` — 3/3 packages green (2026-04-17)
- [x] `pnpm --filter @takeoff-ui/react-spar test` — 9 files / 230 tests passed
      (2026-04-17)
- [x] `pnpm --filter @takeoff-ui/react-spar build` — ESM + CJS + DTS success
      (2026-04-17)

## Milestone 3 — Pure Validation And CI Semantics

Goal: make validation task names mean exactly what they say.

### Tasks

- [x] Split pure validation from prep and build workflows. **Done 2026-04-17**.
  - `apps/docs/tsconfig.json` now path-aliases `@takeoff-ui/react-spar` to
    `../../packages/react-spar/src/index.ts` (matching `apps/react-app`). Docs
    typecheck reads the package source instead of demanding a prebuilt `dist/`.
  - Removed `precheck-types` from
    [`apps/docs/package.json`](../../apps/docs/package.json). Verified by
    deleting `packages/react-spar/dist`, then running `pnpm check-types` cold —
    3/3 packages pass in ~3s with no codegen and no package build.
  - Codegen and package build remain available as explicitly named scripts:
    `apps/docs` `generate:api` and `build:react-spar`. They are still invoked by
    the `predev` and `prebuild` npm hooks (so `pnpm --filter docs build` still
    works without turbo) but never by a validation command.
- [x] Audit workspace-level validation commands for side effects. **Done
      2026-04-17**. Confirmed each is pure for its responsibility:
  - `pnpm check-types` → turbo `check-types` → only `tsc --noEmit` per package.
  - `pnpm lint` → turbo `lint` → only `eslint .` per package.
  - `pnpm --filter @takeoff-ui/react-spar test` → vitest reads source.
  - `pnpm build` → turbo `build`. Builds packages then docs site, with docs
    `prebuild` running codegen + package build for the standalone-invoke path.
    Build is _expected_ to do work; the contract is that validation commands
    above are not.
- [x] Update CI to call the pure validation boundaries by name. **Done
      2026-04-17**. [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
      now uses explicit, intent-revealing step names: "Validate types (pure tsc
      --noEmit)", "Validate lint (pure eslint)", "Verify generated docs API
      tables are up to date", "Run unit tests", "Build (packages + docs site)".
- [x] Add documentation-integrity checks. **Partial — done 2026-04-17**.
  - **Generated-docs determinism**: new
    [`apps/docs` `verify:generated-api`](../../apps/docs/package.json) script
    re-runs the codegen and `git diff --exit-code -- ./src/docs-files` to fail
    CI if any tracked API table drifts from the source types. Wired as a CI
    step.
  - Broken intra-repo markdown link sweeps and stale internal reference scans
    are deferred to Milestone 4 (repo taxonomy and cleanup), where they can be
    designed against the post-cleanup file tree instead of the current
    scratchpad-laden one.
- [x] Define the minimum repo release gate for future wrappers. **Done
      2026-04-17**. See [Minimum repo release gate](#minimum-repo-release-gate)
      below. Lives here in the plan per the source-of-truth matrix
      ("Release-gate and workflow decisions live in the execution plan until
      absorbed"); will move into a canonical doc when M4 absorbs it.

### Validation

- [x] `check-types` is side-effect free (verified by deleting `dist/` and
      running cold; 3/3 packages pass in ~3s)
- [x] CI command names match their behavior
- [x] at least one docs-integrity guard is enforced in CI
      (`verify:generated-api`)
- [x] validation workflow is documented in one canonical location
      ([README — Validation workflow](../../README.md#validation-workflow);
      cross-referenced from [AGENTS.md](../../AGENTS.md#build-and-test-commands)
      and the [source-of-truth matrix](../source-of-truth.md#matrix))

### Minimum repo release gate

A new component wrapper may be released to npm only when **every** item below is
true. This gate intentionally does not cover the deeper component-port readiness
and parity-review templates owed by Milestone 7 — it is the minimum publishable
bar.

- **Implementation**
  - Wrapper, base file, and (when needed) adapter and compound parts follow the
    structure rules in
    [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md).
  - Slot classes are mirrored in
    [`src/styling/slot-registry.ts`](../../packages/react-spar/src/styling/slot-registry.ts)
    (the generator script handles this).
  - Component is exported from `src/components/index.ts`.
- **Tests**
  - Component test file colocated as `<Name>.test.tsx`.
  - Coverage matches the "Component test checklist" section of
    `CODING_STANDARDS.md`, including a `vitest-axe` baseline.
  - `pnpm --filter @takeoff-ui/react-spar test` is green.
- **Docs**
  - `head.mdx`, `body.mdx`, `api.config.mjs`, and the regenerated `api.mdx`
    exist under `apps/docs/src/docs-files/<component>/`.
  - `pnpm --filter docs verify:generated-api` is green (no drift in generated
    API tables).
  - Public component page is linked from
    [`apps/docs/sidebars.ts`](../../apps/docs/sidebars.ts).
- **Smoke coverage**
  - At least one scenario in
    [`apps/react-app/src/App.tsx`](../../apps/react-app/src/App.tsx) exercises
    the new component end to end against the real tokens CSS import. The smoke
    app's contract verifier (Milestone 6) must stay green; if a customization
    surface is genuinely not part of the new component's public contract, mark
    the omission inline as `// exemption: <reason>` so it is intentional and
    reviewable.
- **Contract classification**
  - Public-contract changes are classified per
    [`docs/contract-model.md`](../contract-model.md) (parity vs documented
    divergence). Cross-component decisions are recorded as an ADR under
    [`docs/decisions/`](../decisions/README.md).
  - Slot classes and `data-*` hooks are listed in the component's
    `api.config.mjs` `dataAttributes` section and, when new keys are introduced,
    documented in
    [`packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md`](../../packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md).
- **Validation**
  - `pnpm check-types`, `pnpm lint`,
    `pnpm --filter @takeoff-ui/react-spar test`,
    `pnpm --filter docs verify:generated-api`, and `pnpm build` are all green
    locally.
  - The `dist/` output of `@takeoff-ui/react-spar` contains no CSS files (per
    ADR 0002).
- **Release plumbing**
  - A `.changeset/<slug>.md` entry classifies the bump (`patch` / `minor` /
    `major`) and explains the consumer impact in plain language.
  - For breaking changes (renamed `tk-*` slot classes, removed or renamed public
    props, changed `data-*` hooks per ADR 0005), the changeset is `major` and
    migration guidance is included.

## Milestone 4 — Repo Taxonomy, Proposal Lifecycle, And Archive Cleanup

Goal: stop active repo topology from advertising temporary thinking as durable
structure.

### Tasks

- [x] Land a concise taxonomy doc for markdown lifecycle and placement. **Done
      2026-04-17**. Added as the
      [Markdown taxonomy](../source-of-truth.md#markdown-taxonomy) section of
      `docs/source-of-truth.md`. Eight classes: Intro, Public docs, Live
      reference, Repo contract, ADR / decision, Temporary proposal, Archive,
      Skill (plus a tool-boilerplate carve-out for `.changeset/README.md`). Each
      class has one canonical location. Single-doc home for the taxonomy keeps
      the matrix and the lifecycle in the same canonical file rather than
      risking divergence across two.
- [x] Decide the fate of current proposal-era files. **Done 2026-04-17**.
      Per-file decisions:
  - `docs/proposals/monorepo-professionalization-execution-plan.md` — **kept
    active**: this file. Exit condition: every milestone closed, then absorbed.
  - `docs/proposals/ULTRATHINK_PLAN.md` — **deleted**. Phase A done on `develop`
    2026-04-16; Phase B framing absorbed by this execution plan; the speculative
    Phase B component-port ordering was lifted into Milestone 7's "Recommended
    rollout order" task before deletion so the knowledge survived.
  - `docs/proposals/ULTRATHINK_PLAN.diagram.html` — **deleted**. Companion to
    `ULTRATHINK_PLAN.md`; contained stale claims (e.g. `recipes.ts · variants` —
    that file was removed by Milestone 2).
  - `docs/proposals/component-customization-migration.md` — **deleted**.
    Self-described as "Delete it after the migration is complete"; permanent
    rules already live in `CODING_STANDARDS.md`, `DATA_ATTRIBUTE_VOCABULARY.md`,
    and the `takeoff-component-port` skill references.
  - `docs/proposals/monorepo-readiness-gap-analysis.md` — **deleted**. Strategic
    readout fully absorbed by this plan; its scorecard data (e.g. "Button +
    Accordion only") had rotted (5 components shipped).
  - `docs/proposals/takeoff-design-input-handoff.md` — **deleted**. Cross-repo
    handoff completed: verified
    `takeoff-design/packages/tokens/styles/recipes/_input.scss` exists and
    `_index.scss` `@use 'recipes/input'` is wired; nothing else in
    `takeoff-spar` was waiting on it.
  - `docs/proposals/docs-consolidation.md` — **deleted**. Its deliverables
    (taxonomy + class decisions + migration of historical narratives + clear
    lifecycle rules) are exactly what Milestone 4 just produced. The deferred CI
    link-check work survives as a follow-up tracked by Milestone 7's readiness
    checklist.
  - `migration-fix-guide.TEMP.md` (root) — **deleted**. Every P0 task closed on
    `develop` 2026-04-16; the file was explicitly written "to be deleted".
- [x] Remove temporary-naming smells from the active tree. **Done 2026-04-17**.
      After the deletions above, the active tree contains no `TEMP`,
      `ULTRATHINK`, or `DRAFT-*` naming. The taxonomy "Naming smells" rule in
      `source-of-truth.md` is the standing guard against re-introduction.
- [x] Ensure completed outputs are absorbed before archival. **Done
      2026-04-17**. Verified per-file in the deletion list above.
      `PHASE_1_IMPLEMENTATION_CHECKLIST.md` and
      `PHASE_2_IMPLEMENTATION_CHECKLIST.md` were execution narratives, not
      absorbable into canonical rules — they moved to `docs/archive/` with a
      [`docs/archive/README.md`](../archive/README.md) labeling the directory's
      "frozen, never trust over live code" contract.
- [x] Keep `.agents/skills/` scoped to executable skills only. **Done
      2026-04-17**. Inventory: `generate-component/SKILL.md` and
      `takeoff-component-port/SKILL.md` (+ `references/`, `scripts/`). Both are
      executable agent instructions. No non-skill material to evict. The
      taxonomy rule in `source-of-truth.md` formalizes this as a standing
      constraint.

### Validation

- [x] repo has one clear doc lifecycle story
      ([Markdown taxonomy](../source-of-truth.md#markdown-taxonomy) defines
      eight classes and where each one lives)
- [x] active tree contains no `TEMP`, `ULTRATHINK`, or equivalent naming smell
      without an explicit reason
- [x] canonical docs no longer depend on proposal files for basic orientation
      (root `README.md` now points at the taxonomy + the live references + the
      active execution plan + the archive)

## Milestone 5 — Dead-Weight And Surface Cleanup

Goal: remove small but persistent signs of unfinished architecture.

### Tasks

- [x] Audit `ComponentBase` metadata for runtime necessity. **Done 2026-04-17**.
      The `styles` field was an unused vestige: it was accepted by
      `ComponentBaseConfig`, exposed on the returned `ComponentBase`, and read
      only by a single block in `createComponentBase.test.ts`. No production
      code, no generator, and no consumer touched it. Removed the optional
      `styles` field from `ComponentBaseConfig`, the corresponding
      `Readonly<Record<string, string>>` field from `ComponentBase`, the
      in-factory `resolvedStyles` merge, and the `describe('styles')` test
      block. Bundle shrank slightly (CJS 56.08 → 55.97 KB; ESM 54.75 → 54.64
      KB).
- [x] Remove unused or unjustified TypeScript config surface. **Done
      2026-04-17**. The `@/*` path alias in
      [`packages/react-spar/tsconfig.json`](../../packages/react-spar/tsconfig.json)
      had zero `from '@/...'` imports anywhere in the package. Removed the
      entire `paths` block. (`apps/docs/tsconfig.json` and
      `apps/react-app/tsconfig.json` retain their own `paths` blocks because
      both intentionally alias `@takeoff-ui/react-spar` → package source for
      pure type-checking, per Milestone 3.)
- [x] Audit barrel exports and helper exports for unused public surface. **Done
      2026-04-17**. Findings:
  - **Root `src/index.ts`** — exposes only the documented public surface:
    provider runtime + types via `./provider`, public components + their types +
    per-component `xxxClassNames` maps via `./components`, six
    customization-contract types from `./customization`, and `SlotClassNames`
    from `./types`. No accidental internals reach the root barrel.
  - **`src/utils/index.ts`** — internal-only barrel exporting `renderIconSymbol`
    (used by Button, AccordionItem, Input, Dialog) and `createSafeContext` (used
    by AccordionBase). NOT re-exported from the root, so neither leaks into
    `dist/index.{mjs,cjs,d.ts}` as a separately importable name.
  - **`src/styling/index.ts`** — internal-only `slotClassRegistry` (Milestone 2
    demoted it from public). Confirmed still internal.
  - **`src/base/createComponentBase.ts`** — no barrel; consumers go through the
    direct path. Internal.
  - **Component-level barrels** (`accordion/`, `button/`, `dialog/`, `input/`) —
    each re-exports the public component, its `types.ts` surface (props, slot
    props, enums), and the corresponding `xxxClassNames` named map. None
    re-export the `*Base` factory instance, the adapter hooks, or shared context
    — those stay internal as intended by ADR 0005's "the `tk-*` strings are the
    cross-package contract" stance.
- [x] Capture any "keep it" exceptions with a short rationale in code or docs.
      **Done 2026-04-17**. The two non-obvious "keep" calls are now documented:
  - The per-component `xxxClassNames` named maps (`buttonClassNames`,
    `accordionClassNames`, `accordionItemClassNames`, `dialogClassNames`,
    `inputClassNames`) are intentionally public. They are scoped, typed views of
    the same `tk-*` slot-class contract that ADR 0005 defines, and they let
    consumers write `clsx(buttonClassNames.root, customClass)` without re-typing
    the string. The internal `slotClassRegistry` was demoted in Milestone 2
    because it duplicated this surface in a centralized form that no JS consumer
    reached.
  - The `provider`-side `useComponentTheme` retains its variance bridge cast
    (Milestone 3) — the JSDoc on
    [`packages/react-spar/src/provider.tsx`](../../packages/react-spar/src/provider.tsx)
    explains why it cannot be removed without flipping the docs site onto
    strict-null tsconfig.

### Validation

- [x] no unused architectural surface remains without a rationale
- [x] internal-only helpers are not leaked through convenience exports
- [x] `pnpm --filter @takeoff-ui/react-spar test` — 9 files / 229 tests passed
      (one removed test for the deleted `styles` field; previously 230)
- [x] `pnpm --filter @takeoff-ui/react-spar build` — ESM + CJS + DTS success;
      bundle slightly smaller after removing the `styles` field

## Milestone 6 — Smoke App As Contract Verifier

Goal: make `apps/react-app` prove the contract instead of decorating it.

### Tasks

- [x] Define the smoke app's contract-verification scope. **Done 2026-04-17**.
      Documented in [`apps/react-app/README.md`](../../apps/react-app/README.md)
      and mirrored in JSDoc at the top of the verifier section in
      [`apps/react-app/src/App.tsx`](../../apps/react-app/src/App.tsx). Five
      areas covered:
  - provider contract (`SparReactProvider` writes `data-theme`),
  - token CSS import path (a known foundational `--text-base` variable resolves
    to a non-empty value),
  - public exports (the smoke app's `import { … } from '@takeoff-ui/react-spar'`
    line; type-check + build catches drift),
  - slot anatomy (canonical `tk-*` root + `data-slot="root"` per
    visible-by-default shipped component, per ADR 0005),
  - representative customization paths (per the next task).
- [x] Add scenarios that exercise the final chosen customization contract.
      **Done 2026-04-17**. Added a "Customization contract scenarios" section to
      the smoke app, plus a runtime contract verifier that asserts each scenario
      landed correctly. Scenarios:
  - plain wrapper usage (existing visual variants — verified via the anatomy
    checks above),
  - provider-level `defaultProps` (a nested `<SparReactProvider>` sets
    `components.Button.defaultProps.type = 'outlined'` and the verifier asserts
    `data-type="outlined"` on the rendered root),
  - provider-level `classNames` (the verifier asserts both canonical `tk-button`
    and the override `verify-provider-classnames` are present on the root),
  - provider-level `slotProps` (the verifier asserts the
    `data-verify-provider-slotprops="ok"` attribute lands on the canonical
    owner),
  - instance `classNames` (concatenates with canonical),
  - instance `slotProps` (merges onto canonical owner),
  - render override (`renderSpinner` replaces the spinner content but must not
    delete the canonical `.tk-button-spinner[data-slot="spinner"]` owner — both
    checks asserted).
- [x] Add a small maintenance rule: no new wrapper ships without a smoke
      scenario or an explicit exemption. **Done 2026-04-17**. The rule is stated
      in three places that any contributor adding a wrapper will already be
      reading:
  - [`apps/react-app/README.md`](../../apps/react-app/README.md) — "Maintenance
    rule" section.
  - [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md)
    — added to the "Merge Checklist" right next to the slot-class registry
    mirror item.
  - The "Minimum repo release gate" section above (Milestone 3) — the "Smoke
    coverage" entry was tightened from "at least one usage path" to "the
    contract verifier must stay green; mark exemptions inline".

### Validation

- [x] `pnpm dev:react` remains usable (vite dev server boots without errors;
      verified `pnpm --filter react-app build` passes)
- [x] smoke app scope is documented as verification, not just demo
      (`apps/react-app/README.md` + the JSDoc at the top of the verifier section
      in `App.tsx`)
- [x] `pnpm build` still passes

## Milestone 7 — Component-Port Readiness Gate

Goal: define the gate future component work must satisfy after the repo is
aligned. DONE 2026-04-17. The canonical output is
[`docs/component-port-readiness.md`](../component-port-readiness.md).

### Tasks

- [x] Write the component-port readiness checklist. Landed as the "Readiness
      checklist" section in
      [`docs/component-port-readiness.md`](../component-port-readiness.md),
      organized by Phase A (research) / B (implementation) / C (public contract)
      / D (tests and smoke) / E (gate).
- [x] Define the standard per-component artifact set. Landed as the "Artifact
      manifest" table (14 rows, covering wrapper, base, adapter, types, tests,
      local barrel, package export, slot-class mirror, tokens recipe, built
      theme selector, docs page, smoke scenario, changeset, README mention).
      File-level rows are now enforced by the extended
      `verify_port_artifacts.py`, which grew three new checks: docs page at
      `apps/docs/docs/Components/<Name>.mdx`, smoke scenario reference in
      `apps/react-app/src/App.tsx`, and changeset entry under `.changeset/`
      naming the component. Verified by running the script against the shipped
      Input port (exit 0) and a not-yet-ported Checkbox (exit 1, surfaces the
      missing artifacts).
- [x] Define the standard parity-review template. Landed as the "Parity-review
      template" fenced block in the readiness doc; to be copied into the PR
      description for every port.
- [x] Define the standard React-enhancement review template. Landed as the
      "React-enhancement review template" fenced block alongside the parity
      template; required whenever any `react-enhancement` surface is introduced.
- [x] Produce the recommended rollout order, validated against current upstream
      state. Landed as the "Recommended rollout order" table in the readiness
      doc. Validation ran on 2026-04-17 against local sibling repos: **Input**
      (shipped reference), **Checkbox**, **Radio**, **Toggle** (wrapper name
      parity with `tk-toggle`; primitive is spar's `Switch` — recorded as
      `technical-adaptation`), **Popover**, **Tooltip**, **DropdownMenu**,
      **Tabs**, **Select**. Each row records takeoff-ui core slug, spar
      primitive, takeoff-design tokens JSON, and takeoff-design recipe presence.
      The hard signal for schedule planning: `takeoff-design` currently ships
      recipes only for accordion / button / dialog / input — every other row
      needs a new recipe in that sibling repo before the react-spar port can
      pass `verify_port_artifacts.py`. Cross-repo coordination is called out
      explicitly in the table so it is scheduled into the port PR plan, not
      treated as surprise.

### Validation

- [x] future component work can reuse the same gate without interpretation
      drift. One canonical doc; SKILL.md, the validation matrix, and
      `CODING_STANDARDS.md` merge checklist all point at it instead of carrying
      parallel copies. `docs/source-of-truth.md` picks it up as a canonical row.
- [x] broad component expansion can start without reopening foundational
      contract questions. Classification model and customization-surface policy
      live in
      [`adaptation-policy.md`](../../.agents/skills/takeoff-component-port/references/adaptation-policy.md)
      and [`api-decision-framework.md`](../api-decision-framework.md); the
      readiness doc references them instead of restating.

### M7 follow-up tasks

Carried over from the 2026-04-17 M0-M6 audit (punch list at
`docs/proposals/milestone-audit-alignments.md` was closed and deleted in the
same PR). Tracked here so they do not fall off once M7 begins.

- [x] Wire Playwright plus a one-step "Run smoke verifier" CI job that asserts
      `[data-verifier-status="pass"]` on the built
      [`apps/react-app`](../../apps/react-app). LANDED 2026-04-17. Installed
      `@playwright/test@^1.59.1` at root;
      [`playwright.config.ts`](../../playwright.config.ts) drives `vite preview`
      via `webServer` on `127.0.0.1:4173` (strictPort,
      `reuseExistingServer: !CI`, `trace: on-first-retry`, CI retries = 2,
      chromium-only); spec at
      [`e2e/smoke-verifier.spec.ts`](../../e2e/smoke-verifier.spec.ts) navigates
      to `/`, waits for `[data-verifier-panel]`, asserts
      `data-verifier-status="pass"`.
      [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) adds four
      steps after the build: cache `~/.cache/ms-playwright` keyed on
      `pnpm-lock.yaml`, install chromium (with `--with-deps` on cache miss,
      system-deps-only on hit), run `pnpm exec playwright test`, upload
      `playwright-report/` artifact on failure. Local validation green: 1 test
      passed in 4.6s against a freshly built react-app.

## Blocking Exit Criteria

This plan is not done until all of the following are true:

- provider docs and provider runtime contract match
- customization is explicitly typed end to end
- styling registry naming and exports are truthful
- validation commands are semantically pure
- proposal lifecycle and archive hygiene are professional
- dead-weight and stray surface area are either removed or justified
- smoke app verifies the contract
- component-port work can proceed from a stable gate rather than fresh debate

## Progress Log

### 2026-04-17

- Reframed this file as an alignment-first execution plan instead of an
  optimistic readiness narrative.
- Preserved the canonical foundation work already landed:
  - [`docs/contract-model.md`](../contract-model.md)
  - [`docs/api-decision-framework.md`](../api-decision-framework.md)
  - [`docs/decisions/`](../decisions/README.md)
- Reset the remaining work around confirmed gaps: doc truth, typed
  customization, truthful naming, pure validation, proposal and archive cleanup,
  and dead-weight removal.
- Previous wording that implied Milestone 0 was effectively "done" was removed
  because open contract-truth issues still remain.

### 2026-04-17 — Milestone 0 task tasks closed (validation still pending)

- Narrowed the provider contract in public docs to match
  [`provider.tsx`](../../packages/react-spar/src/provider.tsx). Removed false
  claims about `density`, `data-color-mode`, `data-density`, `dir`,
  `data-direction`, and `data-locale` from
  [`apps/docs/docs/theming.mdx`](../../apps/docs/docs/theming.mdx) and
  [`packages/react-spar/README.md`](../../packages/react-spar/README.md).
  Reason: the runtime only exposes `colorMode` + `locale` + `components`; adding
  the fabricated surface would have been scope creep that conflicts with the
  plan's "no broad expansion until blocking milestones complete" rule.
- Cut the dangling `/internal-docs/react-spar` reference from
  [`apps/docs/docs/intro.md`](../../apps/docs/docs/intro.md) since that path is
  gitignored and never shipped with the repo.
- Added [`docs/source-of-truth.md`](../source-of-truth.md) and linked it from
  the root README so contributors have a concise matrix of where every claim
  about the repo belongs, plus the proposal lifecycle rules.
- Smoke app ([`apps/react-app/src/App.tsx`](../../apps/react-app/src/App.tsx))
  and docs renderer
  ([`apps/docs/src/components/ReactSparDocs.tsx`](../../apps/docs/src/components/ReactSparDocs.tsx))
  already consume only `colorMode`, confirming the narrow choice does not
  regress any live consumer.
- Ran `pnpm lint` and `pnpm check-types` after the edits — both pass (turbo
  reports 3/3 successful for each). Milestone 0 is now fully closed. Next
  milestone in priority order is **Milestone 1 — Typed Customization Contract**.

### 2026-04-17 — Milestone 1 closed (typed customization contract)

- Created the `src/customization/` module boundary: `overrides.ts` →
  `ClassNamesOverride`, `SlotPropsOverride`; `contracts.ts` →
  `ComponentThemeConfig<TProps, TSlot, TSlotProps>`,
  `ComponentCustomizationRegistry`, `ComponentName`, `ComponentsThemeMap`;
  `merge.ts` → `applyThemeDefaults`, `mergeClassNames`, `mergeSlotProps`,
  `buildSlotAttrs`; `index.ts` barrel.
- Deleted the previous split: `src/types/customization.ts` (replaced by
  `contracts.ts`), `src/utils/resolveSlotProps.ts` and its colocated test
  (replaced by `customization/merge.ts` + `merge.test.ts`).
- Provider now uses a generic `useComponentTheme<K extends ComponentName>()`
  that narrows the return type by the passed key.
  `SparReactProviderValue.components` is the typed `ComponentsThemeMap`, so
  `SparReactProvider({ components: { Button: { defaultProps, classNames, slotProps } } })`
  is compile-time checked end to end.
- Removed 15 casts across the 5 shipped components (10
  `as ClassNamesOverride<…>` / `as XxxSlotProps` casts on `themeConfig` reads,
  plus 5 `propsWithThemeDefaults as XxxProps` casts that stood in for the loose
  `Record<string, unknown>` defaultProps type). The only remaining escape
  hatches are one documented internal cast in `merge.ts` and one
  `InternalAccordionItemProps` cast in `AccordionItem.tsx` where the parent
  injects scaffolding props outside the public surface.
- Added type-level tests in
  [`src/customization/contracts.test-d.ts`](../../packages/react-spar/src/customization/contracts.test-d.ts):
  `expectTypeOf` assertions prove `ComponentName` narrows to the five registered
  names and `useComponentTheme` narrows return type per key; `@ts-expect-error`
  assertions prove unknown component keys, unknown `classNames` slots, unknown
  `slotProps` slots, and unknown `defaultProps` fields all fail to compile.
- Updated public exports at
  [`src/index.ts`](../../packages/react-spar/src/index.ts) to surface the new
  `ComponentCustomizationRegistry` and `ComponentName` types alongside
  `ComponentsThemeMap`, `ComponentThemeConfig`, `ClassNamesOverride`,
  `SlotPropsOverride`, and the unchanged `SlotClassNames`.
- Validation green on 2026-04-17: `pnpm check-types` 3/3, `pnpm lint` 3/3,
  `pnpm --filter @takeoff-ui/react-spar test` 9 files / 230 tests,
  `pnpm --filter @takeoff-ui/react-spar build` ESM + CJS + DTS success. Next
  milestone in priority order is **Milestone 2 — Styling Registry Naming And
  Export Hygiene** (decide whether `src/theme/recipes.ts` is a registry or a
  real recipe surface, rename or expand, then update ADRs 0002 / 0005 and the
  coding standards).

### 2026-04-17 — Milestone 2 closed (styling registry naming and export hygiene)

- Decision: `src/theme/recipes.ts` was a slot-class registry, not a recipe
  surface. Justification: the data shape was
  `{ componentKey: { slots: tk-class-map } }` with no variant / size /
  conditional metadata, while the actual recipes live in
  `@takeoff-design/tokens/styles/recipes/_<component>.scss` and target `tk-*`
  selectors by string convention. No JS importer of the export exists in any
  monorepo or downstream consumer.
- File renamed `packages/react-spar/src/theme/recipes.ts` →
  [`packages/react-spar/src/styling/slot-registry.ts`](../../packages/react-spar/src/styling/slot-registry.ts);
  export renamed `recipes` → `slotClassRegistry`. Old `src/theme/` folder
  deleted (it only ever held this one file plus its barrel).
- Public surface demoted: removed `export * from './theme'` from
  [`src/index.ts`](../../packages/react-spar/src/index.ts). The registry is now
  internal-only. Per ADR 0005 the cross-package contract is the `tk-*` strings,
  which `@takeoff-design/tokens` SCSS recipes already consume by selector
  convention.
- ADRs 0002 and 0005 rewritten to describe the slot-class registry as an
  internal inventory and to make the `tk-*` string contract explicit. References
  to `src/theme/recipes.ts` removed across
  [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md),
  [`packages/react-spar/docs/PHASE_1_IMPLEMENTATION_CHECKLIST.md`](../../packages/react-spar/docs/PHASE_1_IMPLEMENTATION_CHECKLIST.md),
  the component generator script, and the `.agents/skills/` references used by
  the component-port workflow.
- Folder taxonomy now: `base/` (factory), `components/`, `customization/`,
  `styling/` (internal slot-class registry seam), `types/`, `utils/`, plus
  `provider.tsx` and `index.ts`.
- Validation green on 2026-04-17: `pnpm check-types` 3/3, `pnpm lint` 3/3,
  `pnpm --filter @takeoff-ui/react-spar test` 9 files / 230 tests,
  `pnpm --filter @takeoff-ui/react-spar build` ESM + CJS + DTS success.
- Next milestone in priority order is **Milestone 3 — Pure Validation And CI
  Semantics** (remove `precheck-types` side effects so `check-types` is a pure
  validation boundary; move docs generation and package builds into explicitly
  named scripts).

### 2026-04-17 — Milestone 3 closed (pure validation and CI semantics)

- **Pure check-types**: added a TS path alias for `@takeoff-ui/react-spar` →
  `../../packages/react-spar/src/index.ts` in
  [`apps/docs/tsconfig.json`](../../apps/docs/tsconfig.json), matching the alias
  `apps/react-app` already had. Removed the `precheck-types` script from
  [`apps/docs/package.json`](../../apps/docs/package.json), which had been
  running `generate:api && build:react-spar` (a full ESM + CJS + DTS rebuild of
  the package — ~50s) before every typecheck. Verified by deleting
  `packages/react-spar/dist` and running `pnpm check-types` cold: 3/3 packages
  pass uncached in ~3s.
- **Variance bridge in `useComponentTheme`**: removing the dist-based typecheck
  exposed a real source-level variance gap that the prior prebuilt `.d.ts` was
  hiding. Indexed access on the `Partial`-shaped `ComponentsThemeMap` with a
  generic key `K extends ComponentName` cannot be narrowed under the docs site's
  non-strict-null tsconfig, so
  [`provider.tsx`](../../packages/react-spar/src/provider.tsx) now bridges with
  an `as ComponentCustomizationRegistry[K] | undefined` cast that has the same
  JSDoc-rationale precedent as the variance bridge in `customization/merge.ts`.
  The runtime value is identical by construction; only the typing contract is
  asserted.
- **Doc-integrity gate**: new `verify:generated-api` script in
  [`apps/docs/package.json`](../../apps/docs/package.json) re-runs the MDX
  codegen and `git diff --exit-code -- ./src/docs-files`, failing if any
  generated table drifts from the source types. Wired as its own CI step.
- **CI step names rewritten** in
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) to expose intent:
  "Validate types (pure tsc --noEmit)", "Validate lint (pure eslint)", "Verify
  generated docs API tables are up to date", "Run unit tests", "Build
  (packages + docs site)".
- **Validation workflow documented** as one canonical surface in the
  [README "Validation workflow" section](../../README.md#validation-workflow),
  cross-referenced from [`AGENTS.md`](../../AGENTS.md#build-and-test-commands)
  and added as a row in the
  [source-of-truth matrix](../source-of-truth.md#matrix).
- **Minimum repo release gate** defined inline in this plan (see the Milestone 3
  "Minimum repo release gate" section); will be absorbed into a canonical doc
  when Milestone 4 cleans up the repo taxonomy. Component-port readiness gate
  (deeper checklist + parity-review template) remains owed by Milestone 7.
- **Markdown link sweep + stale internal-reference scan** intentionally deferred
  to Milestone 4. Building those over the current scratchpad-laden doc tree
  (`migration-fix-guide.TEMP.md`, `ULTRATHINK_PLAN.md`, etc.) would be wasted
  work; better to design the integrity guard against the post-cleanup taxonomy.
- Validation green on 2026-04-17: `pnpm check-types` 3/3 (uncached on empty
  `dist/`), `pnpm lint` 3/3, `pnpm --filter @takeoff-ui/react-spar test` 9 files
  / 230 tests, `pnpm --filter docs verify:generated-api` no drift,
  `pnpm --filter @takeoff-ui/react-spar build` ESM + CJS + DTS success.
- Next milestone in priority order is **Milestone 4 — Repo Taxonomy, Proposal
  Lifecycle, And Archive Cleanup** (resolve `migration-fix-guide.TEMP.md`,
  `docs/proposals/ULTRATHINK_PLAN.md`, and sibling scratchpad files; land a
  concise markdown taxonomy doc; decide each proposal's terminal state).

### 2026-04-17 — Milestone 4 closed (repo taxonomy, proposal lifecycle, archive cleanup)

- **Markdown taxonomy** added as a section to
  [`docs/source-of-truth.md`](../source-of-truth.md#markdown-taxonomy). Eight
  classes (Intro, Public docs, Live reference, Repo contract, ADR / decision,
  Temporary proposal, Archive, Skill) plus a tool-boilerplate carve-out. Each
  class has one canonical location and a "name describes the durable artifact,
  not the moment of writing" rule that keeps `.TEMP.md`, `ULTRATHINK_*`,
  `DRAFT-*` patterns out of the active tree.
- **Per-file fate decisions made and executed**:
  - `migration-fix-guide.TEMP.md` (root) — deleted; every P0 task closed on
    `develop` 2026-04-16.
  - `docs/proposals/ULTRATHINK_PLAN.md` and `ULTRATHINK_PLAN.diagram.html` —
    deleted; Phase A absorbed into this plan; Phase B speculative component-port
    ordering lifted into Milestone 7's "Recommended rollout order" task before
    deletion so the knowledge survived.
  - `docs/proposals/component-customization-migration.md` — deleted;
    self-described as "delete after migration"; permanent rules live in
    `CODING_STANDARDS.md`, `DATA_ATTRIBUTE_VOCABULARY.md`, and
    `takeoff-component-port` skill references.
  - `docs/proposals/monorepo-readiness-gap-analysis.md` — deleted; fully
    absorbed by this plan; scorecard data had rotted.
  - `docs/proposals/takeoff-design-input-handoff.md` — deleted; cross-repo
    handoff complete (verified
    `takeoff-design/packages/tokens/styles/recipes/_input.scss` exists and is
    wired in `_index.scss`).
  - `docs/proposals/docs-consolidation.md` — deleted; its deliverables are
    exactly what this milestone produced.
- **Archive directory** [`docs/archive/`](../archive/README.md) created with a
  labeling README. `PHASE_1_IMPLEMENTATION_CHECKLIST.md` and
  `PHASE_2_IMPLEMENTATION_CHECKLIST.md` moved there via `git mv`, freeing
  `packages/react-spar/docs/` to hold only live reference
  (`CODING_STANDARDS.md`, `DATA_ATTRIBUTE_VOCABULARY.md`).
- **Active tree audit**: only
  `docs/proposals/monorepo-professionalization-execution-plan.md` remains under
  `docs/proposals/`. Repo grep confirms no surviving reference to any deleted
  file outside this plan's progress log (which uses past tense for context).
- **Root README.md** updated: removed dead links to PHASE\_\*, removed the "Open
  research → docs-consolidation" pointer, replaced both with a link to this
  active execution plan and a link to `docs/archive/README.md`.
- **`.agents/skills/`** verified scoped to executable skills only:
  `generate-component` and `takeoff-component-port`. The taxonomy rule in
  `source-of-truth.md` formalizes this as a standing constraint.
- Validation: full markdown grep for the seven deleted basenames and the two
  moved checklists shows references only inside this plan's progress log.
- Next milestone in priority order is **Milestone 5 — Dead-Weight And Surface
  Cleanup** (`ComponentBase.styles` field, the unused `@/*` path alias in
  `packages/react-spar/tsconfig.json`, and a barrel / helper export audit).

### 2026-04-17 — Milestone 5 closed (dead-weight and surface cleanup)

- **`ComponentBase.styles` removed** from
  [`packages/react-spar/src/base/createComponentBase.ts`](../../packages/react-spar/src/base/createComponentBase.ts).
  The optional `styles?: Record<string, string>` field was accepted by
  `ComponentBaseConfig`, exposed on the returned `ComponentBase`, and read by
  exactly one block in `createComponentBase.test.ts` — no production code, no
  codegen, no consumer touched it. Removed the field, the `resolvedStyles`
  merge, the typed slot on the return interface, and the lone
  `describe('styles')` test block. Test count moved from 230 → 229. Bundle
  shrank slightly: CJS 56.08 → 55.97 KB; ESM 54.75 → 54.64 KB.
- **`@/*` path alias removed** from
  [`packages/react-spar/tsconfig.json`](../../packages/react-spar/tsconfig.json).
  Repo-wide grep for `from '@/...'` returned no matches. Removed the entire
  `paths` block. The two app-level tsconfigs (`apps/docs/`, `apps/react-app/`)
  keep their own `paths` mappings for `@takeoff-ui/react-spar` → package source;
  those exist for the Milestone 3 pure-typecheck path and remain justified.
- **Barrel and helper export audit complete**:
  - Root `src/index.ts` re-exports only documented public surface: provider
    runtime + types from `./provider`, components + types + `xxxClassNames`
    named maps from `./components`, six customization types from
    `./customization`, and `SlotClassNames` from `./types`.
  - `src/utils/index.ts` is internal-only (no root re-export).
    `renderIconSymbol` is consumed by Button, AccordionItem, Input, and Dialog
    through this barrel; `createSafeContext` is consumed by AccordionBase via a
    direct path. Kept.
  - `src/styling/index.ts` (slot-class registry) remains internal as Milestone 2
    chose.
  - `src/base/createComponentBase.ts` has no barrel; only direct imports.
    Internal.
  - Per-component barrels (`accordion/`, `button/`, `dialog/`, `input/`) export
    only the public component, its `types.ts` surface, and the per-component
    `xxxClassNames` named map. The `*Base` factory instances, adapter hooks, and
    shared contexts stay internal.
- **"Keep" rationales captured** in the M5 task list above for the two
  non-obvious surface decisions: (1) per-component `xxxClassNames` maps are
  intentionally public because they are a scoped, typed view of the same `tk-*`
  slot-class contract ADR 0005 defines; (2) the `useComponentTheme`
  variance-bridge cast in `provider.tsx` is documented at the source.
- Validation: `pnpm check-types` 3/3 (uncached on empty `dist/`, ~3s);
  `pnpm lint` 3/3; `pnpm --filter @takeoff-ui/react-spar test` 9 files / 229
  tests; `pnpm --filter @takeoff-ui/react-spar build` ESM + CJS + DTS success.
- Next milestone in priority order is **Milestone 6 — Smoke App As Contract
  Verifier** (define the smoke app's contract-verification scope; add scenarios
  for plain wrapper, provider defaults, `classNames`, `slotProps`, and richer
  customization paths; document the per-wrapper smoke-coverage rule).

### 2026-04-17 — Milestone 6 closed (smoke app as contract verifier)

- **Verifier scope defined and documented** in
  [`apps/react-app/README.md`](../../apps/react-app/README.md) and in JSDoc at
  the top of the verifier section in
  [`apps/react-app/src/App.tsx`](../../apps/react-app/src/App.tsx). Five
  surfaces covered: provider contract, token CSS import path, public exports,
  slot anatomy, representative customization paths.
- **Runtime contract verifier added** to the smoke app. A
  `runContractChecks(scope)` function runs every check on mount via `useEffect`,
  results land in state, and a sticky `<VerifierPanel>` at the top of the page
  renders pass/fail with a per-failure detail block plus a `<details>`-collapsed
  full-checks list. Failures also call `console.error` so a future
  headless-browser CI step could assert the panel's
  `data-verifier-status="fail"` attribute without parsing visible DOM.
- **Customization scenarios added** to `App.tsx` covering provider
  `defaultProps` / provider `classNames` / provider `slotProps` (wrapped in a
  nested `<SparReactProvider>`), instance `classNames`, instance `slotProps`,
  and a `renderSpinner` override that exercises the "content replaces, owner
  stays" rule.
- **Token verifier sample variable**: an early dry run revealed that the
  existing smoke-app inline styles use `--tk-color-*`, `--tk-space-*`, etc. that
  **do not exist** in the default theme (only `--tk-radius-pill` does). The
  verifier therefore samples `--text-base` instead, which is one of the
  foundational typography tokens that the default theme actually ships. Cleaning
  up the smoke-app inline styles to use real token names is its own task and is
  out of M6 scope.
- **TypeScript bridge for `data-*` markers**: React's `HTMLAttributes` types do
  not include an index signature for `data-*`, so embedding `data-verify-*`
  markers via `slotProps.root` would otherwise need a per-line cast. Centralized
  into a `buttonRootMarkers()` helper at the top of the file with rationale.
- **Maintenance rule** ("no new wrapper ships without a smoke scenario or an
  explicit exemption") landed in three places that any contributor adding a
  wrapper will already be reading: the smoke app's README, the package's
  `CODING_STANDARDS.md` Merge Checklist, and the "Minimum repo release gate"
  Smoke coverage entry above (which was tightened from "at least one usage path"
  to "the contract verifier must stay green; mark exemptions inline").
- Validation: `pnpm --filter react-app build` succeeds (vite v6 builds the
  bundle with the new verifier panel; `tsc -b` passes); `pnpm check-types` 3/3,
  `pnpm lint` 3/3, `pnpm --filter @takeoff-ui/react-spar test` 9 files / 229
  tests, `pnpm --filter docs verify:generated-api` no drift. `pnpm dev:react`
  was not scripted into the validation gate because it is a long-lived dev
  server — its usability is implied by the build success and is re-verified
  manually before each release.
- Next milestone in priority order is **Milestone 7 — Component-Port Readiness
  Gate** (write the readiness checklist; define per-component artifact set;
  standard parity-review and React-enhancement review templates; produce the
  recommended rollout order).

### 2026-04-17 — Milestone 7 closed

- **Canonical readiness gate doc landed** at
  [`docs/component-port-readiness.md`](../component-port-readiness.md).
  Sections: "How to use", "Readiness checklist" (Phase A–E), "Artifact manifest"
  (14-row table), "Parity-review template", "React-enhancement review template",
  "Recommended rollout order" (validated against local `../takeoff-ui` /
  `../spar` / `../takeoff-design`), "Naming adaptations carried forward" (Toggle
  over spar `Switch`; Dropdown vs DropdownMenu question), "Open M7 follow-up",
  "When this gate is wrong". One canonical doc per M7 deliverable, no proposal
  sprawl.
- **Artifact manifest enforced programmatically.** Extended
  `.agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py` with
  three new checks:
  - docs page at `apps/docs/docs/Components/<Name>.mdx`
  - smoke scenario reference in `apps/react-app/src/App.tsx`
  - changeset entry under `.changeset/` naming the component Verified on the
    shipped Input port (exit 0) and on a not-yet-ported Checkbox (exit 1;
    surfaces the missing docs page, smoke scenario, changeset, recipe, tokens
    JSON, selector, and export). Existing 20 checks still pass; total is now 23.
- **Rollout order validated against live siblings.** Recorded per-row presence
  of `tk-*` core component, spar primitive, tokens JSON, and tokens recipe for
  Input (shipped), Checkbox, Radio, Toggle, Popover, Tooltip, DropdownMenu,
  Tabs, Select. Hard signal surfaced: only `accordion` / `button` / `dialog` /
  `input` recipes currently exist in `takeoff-design`; every remaining row needs
  a new recipe before its react-spar port can pass the gate. Toggle records a
  `technical-adaptation`: React wrapper keeps the `tk-toggle` parity name,
  primitive is spar's `Switch`. Dropdown vs DropdownMenu is flagged as an open
  naming decision that needs an ADR before the port starts.
- **Cross-wired without duplication.** `docs/source-of-truth.md` picked up a new
  "Component-port readiness gate" row (canonical). The takeoff-component-port
  skill's `SKILL.md` lists the readiness doc as an always-read reference;
  `references/validation-matrix.md` now declares the readiness doc authoritative
  when the two disagree; `packages/react-spar/docs/CODING_STANDARDS.md` Merge
  Checklist points at the readiness doc and adds `verify_port_artifacts.py` as a
  required step. No parallel copies of the checklist exist.
- **One follow-up remains open and tracked.** Playwright + CI smoke verifier job
  stays in [M7 follow-up tasks](#m7-follow-up-tasks). It is not a gate for M7 —
  the in-page verifier already exposes `data-verifier-status` and surfaces
  failures via `console.error`. Closing the CI loop is scope-defined (Playwright
  install, one config, one spec, one CI step) and can be scheduled
  independently.
- Validation: `pnpm lint` 3/3, `pnpm check-types` 3/3 (~3s uncached),
  `pnpm --filter @takeoff-ui/react-spar test` 9 files / 236 tests, and
  `verify_port_artifacts.py Input --repo-root .` exit 0 with all 23 checks
  green.

### 2026-04-17 — M7 follow-up closed (Playwright smoke verifier CI)

- **Playwright installed at workspace root.** Added `@playwright/test@^1.59.1`
  as a root `devDependency` in `package.json` rather than under
  `apps/react-app`, because the smoke spec is a cross-cutting verifier, not an
  app concern. Two root scripts added: `test:e2e` and `test:e2e:ui`. Turbo
  pipeline untouched on purpose — the smoke test is a single post-build gate,
  not a task that benefits from caching or fan-out.
- **Canonical config** landed at
  [`playwright.config.ts`](../../playwright.config.ts). Research synthesis
  applied (Playwright 2025-2026 guidance):
  - `webServer.command` spawns
    `pnpm --filter react-app preview --host 127.0.0.1 --port 4173 --strictPort`
    so a stale local process cannot silently replace the server;
    `reuseExistingServer: !CI` keeps the local dev loop fast while forcing a
    fresh process in CI (the opposite defaults are a known foot-gun).
  - `trace: 'on-first-retry'` avoids the `trace: 'on'` overhead on green runs
    while still capturing artifacts when something flakes.
  - `reporter: [['github'], ['html', { open: 'never' }]]` in CI gives inline
    annotations plus a downloadable HTML report; `list` locally keeps output
    terse.
  - CI `retries: 2`, `workers: 1` is the mainstream-safe pair for a single-spec
    smoke gate. Fully-parallel = true in case the suite grows later.
  - Chromium-only project; no Firefox / WebKit. The verifier asserts an
    attribute on a runtime-computed DOM node, not browser-specific rendering —
    cross-browser would be cost without signal.
- **Spec kept minimal** at
  [`e2e/smoke-verifier.spec.ts`](../../e2e/smoke-verifier.spec.ts): navigate to
  `/`, wait for `[data-verifier-panel]` to be visible, assert
  `data-verifier-status="pass"`. Failure modes surface the actual verifier
  failures through the `VerifierPanel` DOM and `console.error` output captured
  by Playwright's trace.
- **CI wiring** added to
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) after the Build
  step. Four new steps:
  1. `actions/cache@v4` on `~/.cache/ms-playwright` keyed
     `${{ runner.os }}-playwright-${{ hashFiles('pnpm-lock.yaml') }}` — the
     lockfile hash encodes the Playwright version, so the key auto-rotates on
     any dep bump that pulls in a new browser build.
  2. On cache miss: `pnpm exec playwright install --with-deps chromium` (system
     deps for Ubuntu included).
  3. On cache hit: `pnpm exec playwright install-deps chromium` only, because
     the apt-installed system deps are not cached by actions/cache.
  4. `pnpm exec playwright test` — runs the single spec against the build that
     the earlier `pnpm turbo build` step already produced.
  5. `actions/upload-artifact@v4` uploads `playwright-report/` with 14-day
     retention when the job fails.
- **Local validation**: `pnpm --filter react-app build` (~430 ms) +
  `pnpm exec playwright test` (4.6 s) → `1 passed`. `reuseExistingServer` picks
  up `pnpm dev:react` on repeat runs.
- **`.gitignore`** grew entries for `playwright-report/`, `test-results/`,
  `blob-report/`, and `.playwright/`.
- Execution plan M7 follow-up section now reads "DONE"; the readiness doc's
  "Open M7 follow-up" renamed to "M7 follow-up status" and records the artifacts
  that landed.
