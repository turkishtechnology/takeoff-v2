---
name: takeoff-component-review
description:
  Use after a takeoff-spar component implementation or AI output to audit it
  against the approved component recipe, decisions, repo diff, validation logs,
  and architectural gates. Produces a severity-based review and merge readiness
  verdict.
---

# Takeoff Component Review Skill

Use this skill after an AI or developer produces a `takeoff-spar` component
implementation. The goal is to decide whether the output is safe to continue,
needs fixes, or must be stopped before merge.

This skill is **read-only by default**. Do not modify code unless the user
explicitly asks for fixes after the review.

## Required inputs

Ask for missing inputs before reviewing:

- `component`: component folder name, for example `accordion`.
- `spar_primitive`: spar primitive folder if different from `component`.
- Approved recipe: `{{component}}.recipe.md` or `{{component}}.recipe.json`.
- Approved decisions: `{{component}}.decisions.md`, when decisions existed.
- Implementation output: final report, code diff, file list, PR patch, or repo
  working tree.
- Validation logs or command results.
- `workspace`: resolved by the Workspace Resolution Gate (see below). Never
  hardcode an author-specific path such as `/Users/<name>/Desktop/...`.

If only a final narrative is provided, review what is evidenced and mark missing
proof as `Needs evidence`.

## Hard rules

- Do not accept claims without evidence from diff, file paths, recipe,
  decisions, tests, docs, or validation logs.
- Do not ask for broad rewrites when a small targeted fix is enough.
- Do not request spar or takeoff-design changes unless the recipe or diff proves
  wrapper-only implementation would duplicate state, create a hack, or mismatch
  selectors.
- Do not approve work that touches `takeoff-ui core`; it is read-only for these
  tasks.
- Do not approve generic component infrastructure, task generators, audit files,
  workflows, migration scaffolding, or repo-wide unrelated changes.
- Do not retest spar-owned behavior as a wrapper requirement unless the wrapper
  changed or duplicated that behavior.
- Missing evidence is not a blocker by itself unless it hides a public API, DOM
  contract, state, a11y, export, or validation risk.

## Workspace Resolution Gate — mandatory

Do not hardcode any author-specific absolute path such as
`/Users/.../Desktop/http`.

Before reading local repositories, resolve the user's workspace exactly once and
store it as:

```json
{
  "workspaceRoot": "<absolute parent workspace path>",
  "repoRoots": {
    "takeoffUi": "<absolute path to takeoff-ui repo>",
    "spar": "<absolute path to spar repo>",
    "takeoffDesign": "<absolute path to takeoff-design repo>",
    "takeoffSpar": "<absolute path to takeoff-spar repo>"
  },
  "resolvedBy": "cli | env | repo-env | cache | cwd | scan | user",
  "checkedAt": "<iso timestamp>"
}
```

Resolution order:

1. Explicit CLI input:
   - `--root`
   - `--workspace-root`
2. Environment variable:
   - `TAKEOFF_WORKSPACE_ROOT`
3. Per-repository environment variables:
   - `TAKEOFF_UI_ROOT`
   - `SPAR_ROOT`
   - `TAKEOFF_DESIGN_ROOT`
   - `TAKEOFF_SPAR_ROOT`
4. Cached local resolution:
   - `~/.takeoff-skills/workspace.json`
5. Current working directory discovery:
   - if the current directory is inside one of the four repos, walk upward until
     a parent containing the required repo set is found
   - if the current directory is already the workspace root, use it
6. Limited local scan:
   - check common user workspace folders under `$HOME`
   - do not perform an unlimited filesystem scan

Required repo markers:

```text
takeoff-ui:
  packages/core/src

spar:
  packages/spar/src

takeoff-design:
  packages/tokens

takeoff-spar:
  packages/react-spar/src
```

If exactly one valid workspace is found:

- persist it to `~/.takeoff-skills/workspace.json`
- use `repoRoots.*` for every local path
- include the resolved workspace object in the review output

If more than one valid workspace is found:

- stop
- do not guess
- ask the user to choose one

Ask exactly:

```text
Birden fazla Takeoff workspace adayı buldum. Hangisini kullanmalıyım?

1. <candidate-a>
2. <candidate-b>

Lütfen sadece birini şu formatta gönder:
workspaceRoot=/absolute/path/to/workspace
```

If no valid workspace is found:

- stop
- do not continue discovery
- do not invent paths
- ask the user for the missing path clearly

Ask exactly:

```text
Local Takeoff workspace kökünü bulamadım.

Aradığım yapı şu:
<workspaceRoot>/
  takeoff-ui/
  spar/
  takeoff-design/
  takeoff-spar/

Lütfen bir kez şu formatta gönder:
workspaceRoot=/absolute/path/to/workspace

Eğer repolar aynı klasör altında değilse şu formatı kullan:
takeoffUiRoot=/absolute/path/to/takeoff-ui
sparRoot=/absolute/path/to/spar
takeoffDesignRoot=/absolute/path/to/takeoff-design
takeoffSparRoot=/absolute/path/to/takeoff-spar
```

Workspace verdict limits:

- If workspace resolution is missing, verdict cannot be `PASS`.
- If any required repo root is missing or invalid, verdict must be `BLOCKED`.
- If local evidence was collected from a hardcoded author path, verdict must be
  `FAIL`.
- If multiple workspace candidates exist and none was selected by the user,
  verdict must be `BLOCKED`.

## Local Repository Map

Use only the resolved repo roots:

```text
takeoff-ui:
  {{repoRoots.takeoffUi}}

spar:
  {{repoRoots.spar}}

takeoff-design:
  {{repoRoots.takeoffDesign}}

takeoff-spar:
  {{repoRoots.takeoffSpar}}
```

Never derive paths from a hardcoded username, machine path, or previous author's
local directory.

## Evidence-first skeptical review protocol

This skill must not approve an implementation by trusting the final report
alone. It must re-open the local evidence pack or inspect the current local
repos and compare the implementation against the approved recipe, decisions, and
source-of-truth repositories. Do not output hidden chain-of-thought. Output an
auditable `reviewSelfChecks` table and issue evidence.

### Local review evidence gate

A review cannot be `PASS` or `PASS WITH NOTES` unless it has current evidence
from:

1. the approved recipe and decisions,
2. the implementation diff or working tree,
3. current local source files from `takeoff-ui core`, `spar`, `takeoff-design`,
   and `takeoff-spar`,
4. validation logs or explicit not-run triage.

If local repo evidence is missing, the maximum verdict is `CONDITIONAL`; if
missing evidence hides public API, DOM/data-state, state ownership, exports,
build, or validation risk, return `FAIL` or a blocking issue.

Prefer running. The script resolves the workspace via the gate above, so no
hardcoded `--root` is required:

```bash
python takeoff-component-review/scripts/collect_review_context.py \
  --component {{component}} \
  --spar-primitive {{spar_primitive}} \
  --out /tmp/{{component}}.review.local-evidence.json \
  --diff-out /tmp/{{component}}.diff.patch
```

Manual override only when discovery would be ambiguous:

```bash
python takeoff-component-review/scripts/collect_review_context.py \
  --component {{component}} \
  --spar-primitive {{spar_primitive}} \
  --workspace-root /absolute/path/to/workspace \
  --out /tmp/{{component}}.review.local-evidence.json \
  --diff-out /tmp/{{component}}.diff.patch
```

Or seed the resolver once via env vars:

```bash
export TAKEOFF_WORKSPACE_ROOT=/absolute/path/to/workspace
# Repos in different parents:
export TAKEOFF_UI_ROOT=/absolute/path/to/takeoff-ui
export SPAR_ROOT=/absolute/path/to/spar
export TAKEOFF_DESIGN_ROOT=/absolute/path/to/takeoff-design
export TAKEOFF_SPAR_ROOT=/absolute/path/to/takeoff-spar
```

### Required skeptical passes

Run these passes and summarize them in `reviewSelfChecks`. The first is the
workspace gate (`RW-Q01`); the rest are review passes.

0. **Workspace pass (RW-Q01)** — Was the review based on the current user's
   resolved local workspace, not on a hardcoded path from the original prompt?
   Status must reference `workspace.resolvedBy`, `workspace.repoRoots`, and the
   local evidence timestamp. If blocked, ask for `workspaceRoot` before giving a
   verdict.

1. **Scope red-team pass** — Did the output touch forbidden or unrelated files?
2. **Source-of-truth pass** — Does each public API/event/DOM claim still match
   local `takeoff-ui core` and `takeoff-design`, not just the recipe text?
3. **Responsibility inversion pass** — Did the wrapper implement state, a11y,
   keyboard, focus, SSR id, or primitive behavior that belongs to `spar`?
4. **Selector proof pass** — Can every required class/data attribute be tied to
   a design selector or approved decision?
5. **Decision drift pass** — Were approved decisions followed, rejected options
   avoided, and unresolved decisions kept explicit?
6. **Evidence credibility pass** — Are validation commands actually shown, and
   are failures triaged as related or pre-existing with proof?
7. **Counterexample pass** — What would make this review verdict wrong? Check
   that area before finalizing.

Every blocker/major issue must include the exact evidence artifact: diff path,
local source path, recipe row, decision ID, or validation excerpt.

## Skill folder contents

- `scripts/resolve_workspace.py`: resolves and caches the local Takeoff
  workspace (workspaceRoot + per-repo roots). Required for the Workspace
  Resolution Gate.
- `scripts/review_output.py`: heuristic Markdown/HTML reviewer for recipe,
  decisions, diff, final report, validation logs, and optional local evidence.
- `scripts/collect_review_context.py`: read-only local repo/diff collector for
  review evidence.
- `assets/review-template.html`: static, dependency-free review dashboard
  template.
- `references/review-rubric.md`: severity levels and gates.
- `references/review-checklist.md`: detailed review checklist.
- `references/anti-patterns.md`: common failure modes to search for.
- `references/review-reasoning-gates.md`: skeptical self-check questions and
  verdict limits.
- `references/local-review-evidence-protocol.md`: local evidence requirements
  for merge-readiness review.

## Review workflow

### 1. Input completeness

Record which artifacts are present:

- Recipe
- Decisions
- Diff or working tree
- Final report
- Validation logs
- Docs/API output evidence
- Tests and type-test evidence

If a required artifact is missing, mark the affected review areas as
`Needs evidence`.

### 1a. Current local evidence refresh

Before judging the output, refresh local evidence from the four repos or read
the provided local evidence JSON. Compare the refreshed files against the
recipe, because the recipe may be stale or the implementation may rely on a
pattern that changed locally.

Record:

- repo cut-off for `takeoff-ui`, `spar`, `takeoff-design`, and `takeoff-spar`,
- touched files and whether each is allowed, conditional, or forbidden,
- relevant local source excerpts for core, primitive, design recipe/tokens, and
  wrapper,
- diff excerpt and validation excerpt.

If this evidence cannot be obtained, mark the review as at most `CONDITIONAL`
and explain exactly which risk cannot be verified.

### 2. Scope review

Compare touched files with allowed scope:

Allowed by default:

- `packages/react-spar/src/components/{{component}}/**`
- component-specific tests under the same component folder or existing repo
  pattern
- `apps/docs/docs/components/{{component}}.mdx`
- component API config for `{{component}}`
- `packages/react-spar/src/components/index.ts`
- `packages/react-spar/src/components/{{component}}/index.ts`
- package exports directly required by existing pattern

Conditionally allowed with justification:

- `spar/packages/spar/src/components/{{spar_primitive}}/**` only for a real
  primitive gap.
- `takeoff-design/packages/tokens/styles/recipes/_{{component}}.scss` or
  component token JSON only for selector/contract mismatch.

Forbidden unless a new approved task exists:

- `takeoff-ui` component source.
- Generic component infra.
- task generators.
- audit or migration scaffolding.
- repo workflows.
- unrelated components.
- lockfile churn not tied to install/update evidence.

### 3. Architectural gate review

Check that responsibilities remain separated:

- `takeoff-ui core`: read-only source of contract.
- `spar`: headless behavior source. Any spar change must be minimal, tested, and
  justified by a wrapper-impossible gap.
- `takeoff-spar`: React wrapper only. It may normalize API, map classes/data
  attributes, export types, pass refs/props, compose handlers, and document/test
  wrapper contract.
- `takeoff-design`: selector alignment only. No visual redesign, new tokens, or
  hard-coded design values unless separately approved.

Block the output if wrapper duplicates state machines, keyboard navigation,
focus management, or SSR id behavior already owned by spar.

### 4. Public API review

Compare implementation against the recipe and decisions:

- Prop names align with `takeoff-ui core` unless an approved decision says
  otherwise.
- Web component events map to React handlers correctly: `tk-foo-change` ->
  `onFooChange`.
- Controlled/uncontrolled names and default semantics match recipe.
- Scalar/array or key/index value transformations are intentional and tested.
- Every public part has exported `XxxProps`.
- Value and handler types are exported.
- Native prop collisions use the repo's `Omit<...>` pattern.
- Refs are typed for every public part.
- Forbidden/internal props are not public.
- Deprecation aliases, if any, are normalized in wrapper only.

### 5. Compound review

Check compound structure:

- Root uses `Object.assign(Root, { Part, ... })` or the existing local
  equivalent.
- Every public part has `displayName: 'Component.Part'`.
- Internal-only parts such as arrow/indicator remain private unless approved.
- Docs demonstrate public compound API.
- Tests verify display names and part exports when applicable.

### 6. DOM / class / data-state review

Check against `takeoff-design` recipe:

- Root class is `tk-{{component}}`.
- Part classes are `tk-{{component}}-{{part}}`.
- Consumer `className` never drops canonical classes.
- Required state and variant data attributes are emitted at the right DOM level.
- Wrapper does not invent unstyled data attributes as if they were part of the
  design contract.
- `forceMount` or mounted/hidden behavior does not create false open/closed
  data-state.
- Visual-only spans/icons have `aria-hidden="true"`.

### 7. Passthrough and event composition review

Check:

- `className`, `style`, `id`, `data-*`, `aria-*`, and refs pass through.
- User event handlers such as `onClick`, `onKeyDown`, `onFocus`, `onBlur`
  compose with internal handlers using the repo pattern.
- Consumer handler runs first; internal handler is skipped when default is
  prevented, if that is the local convention.
- `slotProps` and `classNames` reuse existing repo conventions; no new
  customization API is invented without a decision.

### 8. Tests, docs, and exports review

Required evidence:

- Wrapper-specific tests for API normalization.
- DOM contract tests for canonical classes and data-state mapping.
- displayName tests for compound parts.
- visual prop tests for component-specific arrow/icon/indicator behavior.
- `className`, `slotProps`, or `classNames` composition tests when those APIs
  exist.
- `types.test-d.ts` for required prop guard, forbidden prop guard, and narrow
  type assertions.
- Docs MDX with LiveCode examples: default, major variants, controlled,
  customization or edge scenario.
- API table/config generation evidence when repo pattern requires it.
- Component index exports and package exports.

Do not require wrapper tests for spar's own state machine, keyboard navigation,
or ARIA internals unless wrapper adds behavior.

### 9. Validation review

Review each command:

1. `pnpm install`
2. `pnpm exec vitest run {{component}}`
3. `pnpm exec vitest run`
4. `pnpm exec tsc --noEmit`
5. `pnpm exec eslint .`
6. `pnpm build`

For failures, require triage:

- related to touched files -> must fix before pass.
- pre-existing/unrelated -> acceptable only with evidence.
- not run -> record as remaining risk; blocker if no alternative evidence exists
  for public API/types/build.

### 10. Decision review

For every recipe decision:

- Confirm approved decisions were followed.
- Confirm unresolved decisions remain in final `Decision Needed`, not silently
  implemented.
- Confirm any new uncertainty found during implementation is listed as
  `Decision Needed`.

### 11. Verdict

Use one verdict:

- `PASS`: no blockers or majors; validation sufficient.
- `PASS WITH NOTES`: only minor/nit issues or documented unrelated validation
  noise.
- `CONDITIONAL`: no known unsafe code, but missing evidence or not-run
  validation must be resolved before merge.
- `FAIL`: blocker exists or architecture/scope/API/DOM contract is unsafe.

## Output format

Use this exact high-level structure:

```markdown
# {{Component}} implementation review

## Verdict

## Evidence reviewed

## Reviewer self-checks

## Blocking issues

## Major issues

## Minor issues

## Nits

## Good / confirmed

## Contract coverage matrix

## Validation assessment

## Decision follow-up

## Recommended next action
```

Each issue must include:

- Severity
- Evidence
- Why it matters
- Minimal fix
- Owner area: wrapper, spar, takeoff-design, docs, tests, validation, or
  decision

## Stop conditions

Return `FAIL` immediately if:

- The implementation changed `takeoff-ui core`.
- The wrapper reimplemented spar-owned state/a11y/keyboard/focus/SSR behavior
  without an approved reason.
- Public API contradicts approved decisions.
- DOM/data-state contract contradicts takeoff-design and no decision/recipe
  update exists.
- Generic infrastructure, workflow, migration, audit, or task-generator files
  were created.

## Rich review evidence blocks

The review HTML template can render optional `contentBlocks`, `evidenceBlocks`,
`validationBlocks`, `coverageBlocks`, `verdictBlocks`, `nextBlocks`, and
issue-level `blocks`. Supported block types are `code`, `diff`, `table`,
`keyValue`, `checklist`, `callout`, `cards`, `details`, `fileTree`, `list`,
`quote`, and light `markdown`.

Use these blocks to show small diffs, failing validation excerpts, API
mismatches, DOM contract tables, or decision follow-up without dumping full
files.
