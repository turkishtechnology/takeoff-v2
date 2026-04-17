---
title: Milestone M0–M7 Audit Fixes — Corrective Checklist
status: temporary-proposal
class: Temporary proposal
created: 2026-04-17
owner: ulasturann
deletion-criteria:
  Delete this file once every P0 and P1 item is checked off and the validation
  gate at the bottom is green on CI. P2 and P3 items may be absorbed into the
  canonical execution plan or archived.
---

# Milestone M0–M7 Audit Fixes — Corrective Checklist

## Purpose

The monorepo professionalization plan
(`docs/proposals/monorepo-professionalization-execution-plan.md`) marks M0–M7 as
DONE 2026-04-17. A rigorous cross-audit against industry practice (MUI v6
slots/slotProps, Mantine `classNames` factory, Radix `asChild`, Playwright CI
guidance, Changesets release flow, `attw`/`publint`, Diátaxis, Nx taxonomy)
surfaced **concrete drift between the milestone claims and the shipped
artifacts**, plus **amateur signals that would not survive a senior reviewer**.

This file is the **corrective prompt** a Claude session should pick up and
execute. It is a _temporary proposal_ under the `docs/source-of-truth.md`
taxonomy and must be deleted once resolved (see `deletion-criteria` in
frontmatter).

## How to use this file

1. Read `docs/proposals/monorepo-professionalization-execution-plan.md` (the
   master tracker) before starting.
2. Work top-to-bottom. Phase 1 (P0) is release/CI integrity — nothing else ships
   until P0 is green.
3. Each task has: **file refs**, **acceptance criteria**, and an inline
   checkbox. Flip `[ ]` → `[x]` only when the acceptance criteria are provably
   met by a command run locally.
4. After each phase, run the **Validation Gate** block at the bottom. Only
   advance when it is green.
5. When P0+P1 are fully green, delete this file
   (`git rm docs/proposals/milestone-audit-fixes.md`) and land a changeset under
   `.changeset/` naming the fixes. P2/P3 items that survive should be folded
   into the canonical execution plan as a new "Post-audit polish" section.

Ground rules (from plan): no new "source of truth" docs, no duplicate matrices,
no TEMP/DRAFT naming, no re-litigating milestones.

---

## Phase 1 — P0 Release & CI Integrity (must land first)

These items contradict shipped-milestone claims or break the release/validation
story.

- [ ] **1.1 Add `changeset status` PR gate in CI** - Why:
      `.github/workflows/ci.yml` contains zero `changeset` references (grep
      verified). A PR touching `packages/react-spar/src/**` can land with no
      `.changeset/*.md` file, contradicting the contract model. - Change: add a
      step after lint in `ci.yml`:
      `pnpm exec changeset status --since=origin/${{ github.base_ref || 'main' }}`. -
      Accept: a test PR that edits `packages/react-spar/src/**` without a
      changeset fails CI.

- [ ] **1.2 Add release workflow using `changesets/action@v1`** - Why: root
      `package.json` has a `release` script but no workflow ever invokes it.
      `@takeoff-ui/react-spar` is structurally unreleasable from CI today. -
      Change: add `.github/workflows/release.yml` gated on
      `push: branches: [main]` using `changesets/action@v1` with
      `publish: pnpm release`. Add `NPM_TOKEN` + `GITHUB_TOKEN` env bindings. -
      Accept: merging a PR with a changeset on `main` auto-opens a "Version
      Packages" PR.

- [ ] **1.3 Fix Playwright cache key — key on Playwright version, not
      lockfile** - Why: `.github/workflows/ci.yml:61` uses
      `key: ${{ runner.os }}-playwright-${{ hashFiles('pnpm-lock.yaml') }}`. Any
      lockfile change invalidates the cache, defeating the browser cache
      entirely. Official Playwright CI guidance keys on the Playwright
      version. - Change: extract the resolved Playwright version in a step
      (`PW_VERSION=$(node -p "require('@playwright/test/package.json').version")`)
      and key the cache on that value. Add `restore-keys` for partial matches. -
      Accept: lockfile-only PRs reuse the cached browser; Playwright bump
      invalidates it.

- [ ] **1.4 Remove `tsc -b` cargo-cult from `apps/react-app/package.json`** -
      Why: `apps/react-app/package.json:8` is `"build": "tsc -b && vite build"`.
      No tsconfig in the repo is `composite: true` or declares `references: []`
      (ADR 0008 deliberately rejects project references). `tsc -b` in this state
      leaves a stale `tsconfig.tsbuildinfo` and lies to readers about the
      monorepo topology. - Change: either
      `"build": "tsc --noEmit && vite build"` or just `"build": "vite build"`
      (since `check-types` is CI's pure-tsc gate). Delete
      `apps/react-app/tsconfig.tsbuildinfo`. - Accept: no `tsbuildinfo` file in
      git; CI still green.

- [ ] **1.5 Add `attw` + `publint` CI steps** - Why: dual-format ESM+CJS library
      ships without any automated check for the `exports` map, `.d.cts`
      correctness, or dual-package hazards. Industry standard for 2025. -
      Change: add `pnpm exec publint ./packages/react-spar` and
      `pnpm exec attw --pack ./packages/react-spar` after the build step in
      `ci.yml`. - Accept: both run in CI; both pass; output appears in the CI
      log.

- [ ] **1.6 Document the `@takeoff-design/tokens` sibling-repo prerequisite** -
      Why: three `package.json` files pin `@takeoff-design/tokens` via
      `link:../../../takeoff-design/packages/tokens`. A fresh clone of
      takeoff-spar alone will fail `pnpm install --frozen-lockfile` in CI unless
      the sibling repo is cloned alongside. - Change: add a "Prerequisites"
      block to the root `README.md` (checkout order: clone `takeoff-design` to
      the same parent directory). Separately, open a follow-up issue evaluating
      a move to `workspace:*` via a git submodule or a private npm publish. -
      Accept: README lists the prerequisite before any install instruction.

- [ ] **1.7 Collapse the three `as unknown as InternalSlotBag` casts in
      `merge.ts`** - Why: M1 plan claims "ONE variance-bridge cast in
      `merge.ts`." Reality: `merge.ts:104,105,128` have three (verified). The
      JSDoc justifies the hazard once but the cast appears three times. -
      Change: introduce a private helper
      `asInternalBag<T>(x: T): InternalSlotBag` at the top of `merge.ts` with
      the JSDoc-justified single cast inside; call it at the three sites. -
      Accept:
      `grep -n "as unknown as" packages/react-spar/src/customization/merge.ts`
      returns exactly one line (inside the helper).

---

## Phase 2 — P1 Contract & Export Hygiene

- [ ] **2.1 Replace wildcard re-exports in component barrels with explicit named
      re-exports** - Why: `packages/react-spar/src/index.ts` chains
      `export * from './components' → './accordion' → './Accordion' + './AccordionItem' + './types'`.
      M5's "only documented public surface" claim is a point-in-time review, not
      a compile-time contract. Any new `export` inside any component file
      silently becomes public API. - Change: rewrite
      `src/components/<name>/index.ts` to list every public symbol explicitly.
      No `export * from`. Same rule for `src/index.ts`. - Accept:
      `grep -rn "export \* from" packages/react-spar/src/` returns only
      historically justified aggregators (ideally zero).

- [ ] **2.2 Add ESLint rule forbidding `export *` in component barrels** - Why:
      locks in 2.1 — stops regressions. - Change: wire `eslint-plugin-import`'s
      `no-export-from` / custom rule over `src/components/*/index.ts` and
      `src/index.ts`. - Accept: attempting to add `export * from './X'` in a
      barrel fails lint.

- [ ] **2.3 De-duplicate `InternalAccordionItemProps`** - Why: verified — the
      same load-bearing internal type is declared in two places:
      `packages/react-spar/src/components/accordion/useAccordionAdapter.ts:70`
      AND `packages/react-spar/src/components/accordion/AccordionItem.tsx:10`.
      Two copies = refactor trap. - Change: extract to a single internal module
      (e.g. `components/accordion/internal-types.ts`), import from both. -
      Accept: `grep -rn "InternalAccordionItemProps" src/components/accordion/`
      shows exactly one `type|interface` declaration.

- [ ] **2.4 Tighten `buildSlotAttrs` return type; delete the five casts in
      `Input.tsx`** - Why: `buildSlotAttrs` returns `Record<string, unknown>`,
      forcing `Input.tsx:267,293,300,307,317` to cast to
      `{ className: string; [key: string]: unknown }`. Narrowing the return type
      deletes all five casts. - Change: type `buildSlotAttrs` as
      `{ className: string } & Record<string, unknown>`. Remove the five
      casts. - Accept:
      `grep -n "as { className: string" packages/react-spar/src/components/input/Input.tsx`
      returns nothing; type tests green.

- [ ] **2.5 Extend type-level tests to cover all 5 registry entries** - Why:
      `packages/react-spar/src/customization/contracts.test-d.ts` only
      `expectTypeOf`-covers Button. Accordion, AccordionItem, Dialog, Input are
      only guarded by the closed-union test — a future mis-parameterization
      (e.g. `Dialog: ComponentThemeConfig<ButtonProps, ...>`) would slip
      through. - Change: add an
      `expectTypeOf<ComponentCustomizationRegistry['Accordion']>().toEqualTypeOf<ComponentThemeConfig<AccordionProps, AccordionSlot, AccordionSlotProps>>()`
      per component. - Accept: at least one `expectTypeOf` assertion per
      registry key.

- [ ] **2.6 Tighten `verify_port_artifacts.py` smoke-scenario heuristic** - Why:
      current check
      (`.agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py`
      ~L184-190) matches `\bInput\b` OR `tk-input`. A commented-out render block
      with a surviving import still passes. False positives are cheap. - Change:
      require BOTH an `import` line for the component AND a JSX open-tag
      occurrence (`<Input\b`). Flag when only one half is present. - Accept:
      removing the Input JSX block but keeping the import makes the verifier
      exit 1.

- [ ] **2.7 Tighten `verify_port_artifacts.py` changeset heuristic** - Why:
      current check matches any changeset containing `@takeoff-ui/react-spar`
      plus a loose word match. For "Input", any `.md` mentioning the word
      "Input" passes. - Change: require the changeset filename to include the
      component slug (`input.md` / `input-component.md`) OR the changeset body
      to carry a heading line naming the component. - Accept: a random unrelated
      `@takeoff-ui/react-spar` changeset no longer satisfies Input's gate.

- [ ] **2.8 Tighten the "content replaces, owner stays" verifier assertion** -
      Why: `apps/react-app/src/App.tsx:217-222` queries `[data-slot="spinner"]`
      and `[data-verify-render-override="ok"]` as two separate existence checks.
      Both can be true while the override content is hoisted _outside_ the owner
      — the invariant is not actually proven. - Change: replace with a single
      nested selector:
      `[data-verify="render-override"] [data-slot="spinner"].${buttonClassNames.spinner} [data-verify-render-override="ok"]`. -
      Accept: deliberately breaking the nesting (render override at sibling
      scope) fails the verifier.

- [ ] **2.9 Assert provider `variant` default in the verifier** - Why: provider
      `defaultProps` for Button sets both `type` and `variant` but only `type`
      is checked (`App.tsx:181`). Half the config is silently untested. -
      Change: extend the provider-default check to also assert
      `data-variant="secondary"` (or the rendered variant class). - Accept:
      removing `variant: 'secondary'` from the nested provider fails the
      verifier.

- [ ] **2.10 Surface failed check IDs in the Playwright log** - Why:
      `e2e/smoke-verifier.spec.ts` asserts `[data-verifier-status="pass"]` only.
      On regression CI shows "expected pass, got fail" with zero diagnostic
      payload. - Change: on failure,
      `await page.locator('[data-verifier-panel] ul li code').allTextContents()`
      and `console.log` the failed check IDs inside the spec. - Accept: a
      deliberate verifier failure produces a human-readable list of failing IDs
      in the CI log.

- [ ] **2.11 Resolve `workers: 1` + `fullyParallel: true` contradiction** - Why:
      `playwright.config.ts` sets both on CI. `fullyParallel: true` splits tests
      across workers; `workers: 1` negates it. - Change: either drop
      `fullyParallel` for CI, or change `workers: isCI ? 2 : undefined`. Pick
      one story and commit. - Accept: config is internally consistent.

- [ ] **2.12 Extend `merge.test.ts` with function-valued slotProps and nested
      defaults** - Why: current coverage misses (a) `mergeSlotProps` with a
      function attribute (e.g. `onClick`) and (b) `applyThemeDefaults` against a
      nested-object default. The shallow-merge contract is unpinned. - Change:
      add 3 targeted cases. - Accept: test count increases; both semantics
      asserted.

---

## Phase 3 — P2 Docs & Taxonomy Hardening

- [ ] **3.1 Fix the "8 classes" vs 9-row table drift in
      `docs/source-of-truth.md`** - Why: the taxonomy prose claims "eight
      classes" but the rendered table has nine rows (the Tool-boilerplate
      carve-out is an extra row). The plan's M4 entry also says "eight classes …
      plus a tool-boilerplate carve-out". Readers count rows. - Change: either
      relabel the Tool-boilerplate row as "(carve-out, not counted)" in the
      table heading or update the plan and prose to say "nine classes". -
      Accept: row count matches the stated class count.

- [ ] **3.2 Replace the hardcoded GitHub `blob/main` link in
      `apps/docs/docs/theming.mdx`** - Why: `theming.mdx:49` points at a
      `https://github.com/ulasturann/takeoff-spar/blob/main/...#component-customization`
      URL. Brittle — branch name hardcoded, anchor rots if heading moves. -
      Change: use a relative docs-site route or a Docusaurus anchor. - Accept:
      no `https://github.com/.../blob/main/` links under `apps/docs/docs/`.

- [ ] **3.3 Document `HTMLAttributes<HTMLDivElement>` passthrough on
      `SparReactProvider`** - Why: `theming.mdx:45-49` lists three typed props
      but the provider accepts every `HTMLDivElement` attribute (see
      `provider.tsx:25-27`). Consumers get an undocumented win. - Change: add a
      prop-table row "… and any `HTMLAttributes<HTMLDivElement>`" plus a short
      example. - Accept: doc accurately reflects the typed surface.

- [ ] **3.4 Cross-link ADR 0007 from `theming.mdx`** - Why: the
      `display: contents` invariant on the provider is load-bearing and codified
      in ADR 0007, but `theming.mdx:33` does not link it. Matrix says ADRs are
      canonical. - Change: add an inline "see ADR 0007" link. - Accept:
      `theming.mdx` references the ADR.

- [ ] **3.5 Add a CI markdown link-check / frontmatter schema gate** - Why: M3
      progress log admitted a markdown link sweep was "deferred to Milestone 4";
      M4 did not land it. The taxonomy is currently an honor system. - Change:
      add a `lychee` step in `ci.yml` over `**/*.md`/`**/*.mdx`. Optionally add
      a short zod/ajv frontmatter validator over docs/. - Accept: CI rejects a
      broken intra-repo link or malformed frontmatter.

- [ ] **3.6 Link `docs/archive/README.md` explicitly from the Archive row of
      `source-of-truth.md`** - Why: matrix points at the directory, not its
      index. - Change: one-line edit. - Accept: the matrix hyperlinks to
      `docs/archive/README.md`.

- [ ] **3.7 Update `README.md` wording about `docs/proposals/`** - Why: the
      workspace listing calls it "open research and design proposals awaiting
      resolution" while M4 restricts it to the active execution plan. - Change:
      rewrite to "active execution plan(s) only — everything else lives under
      `docs/archive/`". - Accept: wording matches taxonomy.

- [ ] **3.8 Backdate frontmatter on archived checklists** - Why:
      `docs/archive/PHASE_1_*.md` and `PHASE_2_*.md` lack the `status: archive`
      frontmatter the archive README enforces. - Change: add `status: archive`,
      `archived: 2026-04-17` frontmatter. - Accept: every file under
      `docs/archive/` has matching frontmatter.

- [ ] **3.9 Move the execution plan's M3 "minimum repo release gate" to a
      canonical doc** - Why: the plan itself said "will move into a canonical
      doc when M4 absorbs it." M4 did not. - Change: either fold into
      `docs/component-port-readiness.md` as a cross-link or extract to its own
      short `docs/release-gate.md`. Remove the inline section from the proposal
      once moved. - Accept: only one canonical location; the plan references it.

- [ ] **3.10 Sharpen ADR 0006** - Why: ADR 0006 cites only the Docusaurus
      non-strict tsconfig, but the `useComponentTheme` variance cast is also
      load-bearing on a TypeScript variance limitation (TS issues #13195 /
      #47109) that would persist under strict. - Change: add a paragraph citing
      the TS limitation alongside the tsconfig rationale. - Accept: ADR 0006
      names both drivers.

- [ ] **3.11 Explicit "Checked by" column in the 14-row artifact manifest** -
      Why: `docs/component-port-readiness.md:138-153` is honest that some rows
      are "optional/implied/manual" but a reader equating "verifier exit 0" with
      "manifest complete" will be misled. Programmatic coverage is ~9/14. -
      Change: add a column `Checked-by: script | human | n/a` per row. - Accept:
      the table makes programmatic vs manual coverage obvious at a glance.

- [ ] **3.12 DropdownMenu naming ADR: create or downgrade** - Why: the rollout
      table cites "ADR owed" for DropdownMenu naming. No such ADR exists under
      `docs/decisions/`. - Change: either author
      `docs/decisions/0009-dropdownmenu-naming.md` now (before the port starts)
      or downgrade the rollout note to "ADR pending — do not start until
      authored". - Accept: either the ADR file exists or the rollout table says
      "BLOCKED on ADR".

---

## Phase 4 — P3 Polish & Amateur-signal removal

- [ ] **4.1 Remove `splitting: true` from
      `packages/react-spar/tsup.config.ts`** - Why: with a single entry and no
      dynamic imports, splitting does nothing. Decorative. - Change: delete the
      flag, OR add per-component entries (ties into 4.2). - Accept: the flag is
      honest.

- [ ] **4.2 Add per-component subpath exports in
      `packages/react-spar/package.json`** - Why: MUI / Mantine / Chakra all
      ship `./button`, `./dialog`, etc. subpaths. Takeoff ships only `.`,
      forcing consumers through the barrel. - Change: add `"./button"`,
      `"./accordion"`, `"./dialog"`, `"./input"` entries in `exports`; give tsup
      matching multi-entry config. - Accept:
      `import { Button } from '@takeoff-ui/react-spar/button'` resolves in the
      build output.

- [ ] **4.3 Add `default` condition to `exports['.']`** - Why: current order
      `types/import/require` has no last-resort fallback for tools that
      recognize neither `import` nor `require`. - Change: add
      `"default": "./dist/index.mjs"` as the last key. - Accept: node + deno +
      bun all resolve the entry.

- [ ] **4.4 Add `"files": []` to root `tsconfig.json`** - Why: root config has
      no `include`/`exclude`; bare `tsc --noEmit` at root would try to compile
      the whole tree. Defensive. - Change: `"files": []` at root. - Accept: no
      behavior change; defensive guard in place.

- [ ] **4.5 Add `size-limit` gate** - Why: no bundle-size regression guard. MUI
      / Mantine / Radix all have one. - Change: add
      `@size-limit/preset-small-lib` with per-entry budgets; wire into CI. -
      Accept: CI fails on an unjustified bundle regression.

- [ ] **4.6 Pin Playwright to an exact version** - Why: `^1.59.1` drifts
      silently. Combined with a version-based cache key (1.3) exactness is
      required for a deterministic cache. - Change:
      `"@playwright/test": "1.59.1"` (no caret) in `package.json`. - Accept:
      `pnpm list @playwright/test` shows exactly one version.

- [ ] **4.7 Set `provenance: true` in `packages/react-spar/package.json`
      `publishConfig`** - Why: 2026 npm standard. - Change: add the flag. -
      Accept: an npm publish (dry-run) attaches provenance metadata.

- [ ] **4.8 Add `pnpm format:check` to CI** - Why: Prettier is installed,
      `format` scripts exist, but CI never runs `format:check`.
      Husky/lint-staged only guards local commits. - Change: add one step after
      lint. - Accept: an unformatted file fails CI.

- [ ] **4.9 Measure ADR 0008's tripwire** - Why: ADR 0008 states "re-evaluate at
      10 packages or 10s cold typecheck" but there is no measurement running. -
      Change: add a weekly scheduled CI job that runs
      `time pnpm turbo check-types --force` and posts the timing (or fails at
      ≥10s). - Accept: a visible number feeds the tripwire.

- [ ] **4.10 Dev-mode runtime warning for unknown keys in
      `SparReactProvider`** - Why: the typed registry is compile-time only. JS /
      untyped JSX consumers silently drop misspelled keys. MUI and Chakra both
      warn. - Change: in `provider.tsx`, when
      `process.env.NODE_ENV === 'development'`, `console.warn` on unknown
      `components` keys. - Accept: a JS fixture passing `{ Bttton: {...} }` logs
      a warning.

- [ ] **4.11 Lock the `display: contents` invariant at compile time** - Why:
      currently ADR 0007 is runtime-merge only. A consumer CSS selector with
      `!important` can still beat it. - Change: type
      `SparReactProviderElementProps` as
      `Omit<HTMLAttributes<HTMLDivElement>, 'style'>` + expose a narrower
      `style?: Pick<CSSProperties, ...>` that excludes `display`. Or document a
      conscious rejection in the ADR. - Accept: the decision is written down in
      code or ADR; no silent compromise.

- [ ] **4.12 Assess `as` / `asChild` / `render` escape hatch (polymorphic
      root)** - Why: Button's `mode="link"` sniffing (`Button.tsx:11`) +
      `Button.tsx:176-213` has 6 `as` casts around anchor-vs-button
      polymorphism. The milestone story ships "typed customization" while the
      flagship still manually casts in its render path. - Change: evaluate a
      discriminated union over `mode | as | href` OR adopt Radix's
      `Slot`/`asChild` at the root. If rejected, write an ADR capturing the
      rejection. - Accept: either casts deleted or an ADR exists recording the
      trade-off.

- [ ] **4.13 Add a changeset for the M0/M1 work** - Why: `.changeset/` is the
      stated audit trail for milestones. Only `input-component.md` is present. -
      Change: author `.changeset/monorepo-professionalization-m0-m1.md`
      (patch). - Accept: changeset file exists.

- [ ] **4.14 Eliminate `console.error` dead code in `App.tsx`** - Why:
      App.tsx:377 logs on failure but the Playwright spec never reads console —
      the log is dev-only and competes with the DOM-surfaced attribute. -
      Change: either remove, or route it into a `window.__verifierFailures__`
      surface that the spec reads (see 2.10). - Accept: one consistent
      failure-reporting path.

- [ ] **4.15 Add a CI post-build guard: no `*.css` in `dist/`** - Why: ADR 0002
      says the package ships zero CSS. Currently enforced only by review. -
      Change: add
      `[ -z "$(find packages/react-spar/dist -name '*.css' -print)" ]`
      post-build step. - Accept: an accidental CSS import in src fails CI.

---

## Validation Gate — run after each phase, must all be green before declaring phase complete

```bash
# Workspace health
pnpm install --frozen-lockfile

# Pure validation (M3 contract)
pnpm turbo run check-types --force   # time this; compare against ADR 0008 tripwire
pnpm turbo run lint
pnpm format:check                    # will only exist after 4.8
pnpm --filter @takeoff-ui/react-spar test
pnpm --filter docs verify:generated-api

# Build + package-surface
pnpm turbo run build
pnpm exec publint ./packages/react-spar                    # will only exist after 1.5
pnpm exec attw --pack ./packages/react-spar                # will only exist after 1.5
[ -z "$(find packages/react-spar/dist -name '*.css')" ]    # will only exist after 4.15

# Changeset integrity
pnpm exec changeset status --since=origin/main             # will only exist after 1.1

# Component-port readiness (sample: Input must stay green; Checkbox must fail)
python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py Input --repo-root .
python3 .agents/skills/takeoff-component-port/scripts/verify_port_artifacts.py Checkbox --repo-root .  # expect non-zero exit

# Smoke verifier (M6 + M7 Playwright follow-up)
pnpm --filter react-app build
pnpm exec playwright test
```

## Deletion checklist (before `git rm`-ing this file)

- [ ] Every P0 item (1.1–1.7) checked off and reflected in CI green on `main`.
- [ ] Every P1 item (2.1–2.12) checked off and verified locally.
- [ ] At least the doc-truth-affecting P2 items (3.1, 3.2, 3.3, 3.4, 3.5, 3.11)
      landed.
- [ ] A changeset under `.changeset/` names the audit-fix work.
- [ ] The canonical execution plan gets a new "Post-audit polish" section
      absorbing any surviving P2/P3 items.
- [ ] Memory files under `~/.claude/projects/.../memory/` updated: remove the
      "M0–M7 all DONE" claim in favor of "M0–M7 DONE + audit-fixes landed
      <date>".

When all boxes above are checked, delete this file. Do not archive it — it is
scaffolding, not history.
