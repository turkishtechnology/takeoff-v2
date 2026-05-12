---
name: takeoff-component-recipe
description:
  Use before starting a new or migrated takeoff-spar component. Discover the
  takeoff-ui core contract, spar primitive behavior, takeoff-design recipe
  selectors, and current takeoff-spar wrapper; then produce a decision-oriented
  component recipe as Markdown and optional static HTML UI.
---

# Takeoff Component Recipe Skill

Use this skill when the user is about to start a new `takeoff-spar` component
and wants a reliable, reviewable recipe before implementation.

This skill **does not implement the component by default**. It creates the
component recipe, records open decisions, and produces handoff material that can
be fed into the implementation task.

## Required inputs

Ask for missing values before running the workflow:

- `component`: kebab/lowercase component name used by `takeoff-spar`, for
  example `accordion`.
- `spar_primitive`: spar primitive folder name when different from `component`.
- `workspace`: resolved by the Workspace Resolution Gate (see below). Never
  hardcode an author-specific path such as `/Users/<name>/Desktop/...`.
- Desired outputs: Markdown only, HTML UI only, or both.
- Any known constraints, pre-approved decisions, or files that are in-flight and
  must not be touched.

Normalize names once:

- `{{component}}`: lowercase/kebab folder name.
- `{{Component}}`: PascalCase public React root name.
- `tk-{{component}}`: web component / canonical CSS prefix.
- `{{spar_primitive}}`: spar primitive folder, defaulting to `{{component}}`.

## Hard rules

- Work read-only during recipe generation. Do not edit source code, configs,
  docs, tests, lockfiles, or branches.
- Do not create generic component infrastructure, task generators, audit
  scaffolding, workflows, migrations, or repo-level conventions.
- Do not change branches, reset files, stash files, or overwrite local work.
- Treat `takeoff-ui core` as the read-only source of
  API/event/slot/class/data-state intent.
- Treat `spar` as the source of headless behavior: state, a11y, keyboard, focus,
  SSR id behavior.
- Treat `takeoff-design` as the source of recipe selector and token
  expectations.
- Treat `takeoff-spar` as the React wrapper layer: API normalization, types,
  class/data-state mapping, passthrough, docs, and tests.
- Unknown information must be labeled `Unknown`, not guessed.
- Any unstable API or behavior must become `Decision Needed`; do not silently
  choose and bury it in a plan.

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
- include the resolved workspace object in the recipe output

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

Hard rule:

- recipe cannot produce a final verdict until workspace resolution succeeds
- unresolved workspace means `blocked`
- stale or invalid cached workspace must be ignored and re-resolved

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

## Evidence-first self-check protocol

This skill must force an observable self-check without exposing hidden
chain-of-thought. Do not output private reasoning. Instead, output a compact
evidence ledger and an audit table that shows the questions asked, the evidence
used, the conclusion, and the resulting status.

### Local evidence gate

A recipe is not ready unless the local versions of all four source areas have
been inspected or the user explicitly supplies equivalent excerpts:

1. `{{repoRoots.takeoffUi}}/packages/core/src/components/tk-{{component}}/**`
2. `{{repoRoots.spar}}/packages/spar/src/components/{{spar_primitive}}/**`
3. `{{repoRoots.takeoffDesign}}/packages/tokens/styles/recipes/_{{component}}.scss`
   and component token JSON when present
4. `{{repoRoots.takeoffSpar}}/packages/react-spar/src/components/{{component}}/**`
   plus docs/API/export patterns when present

If local evidence is unavailable, stop with:

```text
STOP: LOCAL_EVIDENCE_REQUIRED
Run scripts/collect_contract_context.py locally or provide source excerpts for takeoff-ui core, spar, takeoff-design, and takeoff-spar.
```

Do not create a final recipe from memory, naming conventions, old examples, or
assumptions.

### Required self-check passes

Run these passes before finalizing the recipe and summarize the result in
`selfChecks`. The first two are workspace gates (`W-Q01`, `W-Q02`); the rest are
content passes.

0. **Workspace pass (W-Q01)** — Did I resolve the user's local workspace without
   relying on an author-specific hardcoded path? Status must reference
   `workspace.resolvedBy` and `workspace.repoRoots`. If blocked, ask the user
   for `workspaceRoot` or per-repo roots before continuing.
1. **Marker pass (W-Q02)** — Did I verify all four local repos with required
   markers before reading component contracts? Status must reference
   `workspace.repoRoots` plus marker validation. If any marker is missing, stop
   and ask for the corrected repo path.

2. **Source pass** — What exact local files did I inspect in each repo? Which
   required files were missing?
3. **Core API pass** — Which props, defaults, events, slots, classes, and data
   attributes are directly supported by `takeoff-ui core`? Which are not?
4. **Spar ownership pass** — Which state, a11y, keyboard, focus, SSR id, and
   mounting behaviors are already owned by `spar`? Would my wrapper plan
   duplicate any of them?
5. **Design selector pass** — Which classes/data attributes/selectors are
   required by `takeoff-design`, and at which DOM level?
6. **Wrapper pattern pass** — Which existing `takeoff-spar` patterns must be
   reused for exports, compound parts, refs, `className`, `slotProps`,
   `classNames`, tests, docs, and events?
7. **Contradiction pass** — Does any source disagree with another source? Record
   the conflict instead of choosing silently.
8. **Assumption kill pass** — Is any API, event payload, DOM attr, visual part,
   or test plan not backed by local evidence? Convert it to `Decision Needed` or
   `Unknown`.
9. **Implementation safety pass** — Would the proposed plan require touching
   `takeoff-ui`, generic infra, unrelated components, or repo-level workflows?
   If yes, block or split the task.

### Evidence ledger fields

For every derived claim that affects API, events, compound structure,
DOM/data-state, spar compatibility, docs, tests, exports, or validation, record
a ledger row:

```json
{
  "id": "E001",
  "claim": "Root must emit tk-accordion class.",
  "repo": "takeoff-design",
  "path": "packages/tokens/styles/recipes/_accordion.scss",
  "lines": "12-31 or Unknown",
  "evidence": "Short excerpt or summary, not a full source dump.",
  "status": "Direct evidence | Derived | Unknown | Contradicted",
  "confidence": "High | Medium | Low",
  "decisionId": "D001 or null"
}
```

A high-confidence claim requires direct local evidence or a direct derivation
from multiple evidenced rows. A low-confidence or unknown claim cannot become
implementation instruction unless it is tied to an approved decision.

## Skill folder contents

- `assets/component-recipe-template.html`: static, dependency-free UI template
  for readable component recipes and decision export.
- `scripts/resolve_workspace.py`: resolves and caches the local Takeoff
  workspace (workspaceRoot + per-repo roots). Required for the Workspace
  Resolution Gate.
- `scripts/collect_contract_context.py`: read-only local repo snapshot and file
  discovery helper. Required unless equivalent local excerpts are provided.
- `scripts/validate_recipe_evidence.py`: checks that a recipe has source
  coverage, evidence rows, self-checks, and explicit decisions for unknowns.
- `scripts/render_recipe.py`: renders `recipe.json` to `recipe.html` and
  optionally `recipe.md`.
- `references/discovery-checklist.md`: detailed discovery prompts per repo.
- `references/recipe-output-contract.md`: required Markdown and JSON output
  contract.
- `references/decision-model.md`: how to structure decisions and obstacles.
- `references/reasoning-gates.md`: observable self-check questions and evidence
  rules.
- `references/local-evidence-protocol.md`: local repo evidence requirements and
  stop conditions.
- `references/implementation-handoff.md`: prompt to use after recipe decisions
  are approved.

## Workflow

### 1. Cut-off snapshot

For each repo (`takeoff-ui`, `spar`, `takeoff-design`, `takeoff-spar`) collect:

```bash
git branch --show-current
git status --short
git log -1 --oneline
```

Record path, branch, last commit, and dirty status. If a repo has uncommitted
work, mark it as `dirty` and list affected files. The recipe may still read
those files, but the implementation handoff must say not to overwrite unrelated
in-flight work.

For worktrees, check the `takeoff-spar` symlink risk only as a note:

```bash
pwd
ls packages/react-spar/node_modules/@turkish-technology/spar/dist/
```

Do not fix the symlink during recipe generation. Only note it as an
implementation preflight action if needed.

### 1a. Build and inspect the local evidence pack

Prefer running the collector first. The script resolves the workspace via the
gate above, so no hardcoded `--root` is required:

```bash
python takeoff-component-recipe/scripts/collect_contract_context.py \
  --component {{component}} \
  --spar-primitive {{spar_primitive}} \
  --out /tmp/{{component}}.recipe.seed.json
```

Manual override only when discovery would be ambiguous:

```bash
python takeoff-component-recipe/scripts/collect_contract_context.py \
  --component {{component}} \
  --spar-primitive {{spar_primitive}} \
  --workspace-root /absolute/path/to/workspace \
  --out /tmp/{{component}}.recipe.seed.json
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

Then inspect the local excerpts and metadata in the seed. The seed is not the
recipe; it is the source pack that prevents guessing. If a required repo or file
is missing, record it as `Not found`, add a `Decision Needed` or risk when it
affects the contract, and do not mark the recipe ready.

### 2. Discovery

Inspect only the component-relevant files. Use
`references/discovery-checklist.md` as the checklist.

Collect from `takeoff-ui core`:

- `tk-{{component}}.tsx`, related `tk-{{component}}-*` parts, and SCSS.
- Props, default values, reflected attributes, events such as `tk-...-change`,
  slots, modifier classes, and `Host` data attributes.
- Any naming that must drive React API alignment.

Collect from `spar`:

- Exported root/parts and public types.
- Controlled/uncontrolled vocabulary.
- Context hooks and state ownership.
- `useId`, SSR, focus, keyboard, `forceMount`, `hidden=until-found`, and a11y
  behavior.
- Existing tests under `__tests__/`.

Collect from `takeoff-design`:

- `packages/tokens/styles/recipes/_{{component}}.scss`.
- `packages/tokens/tokens/component/{{component}}.json` if present.
- Required canonical classes, selectors, state data attributes, variant data
  attributes, and selector levels.

Collect from `takeoff-spar`:

- Existing wrapper source, parts, props, types, tests, docs, API config, and
  package exports.
- Existing patterns for `className`, `classNames`, `slotProps`, event
  composition, and `displayName`.

### 3. Derive the component recipe

Create a recipe that answers these questions without implementation code:

- What is the public React API, and which `takeoff-ui core` facts justify it?
- Which web component events map to which React handlers?
- Which slots become public compound parts?
- Which primitive parts are internal-only visual details?
- Which spar primitive behavior is directly reusable?
- Which behavior is missing in spar and cannot be solved cleanly in the wrapper?
- Which DOM classes and data attributes are mandatory because `takeoff-design`
  expects them?
- Which files should be created or edited during implementation?
- Which tests and docs are required?
- Which validation commands must run?
- Which choices are blocked by missing or contradictory information?

### 4. Decide the spar compatibility stance

For every capability, assign one status:

- `Aligned`: spar already provides the behavior and wrapper should only map
  API/DOM.
- `Wrapper mapping`: spar provides the behavior, but `takeoff-spar` must
  normalize names, values, classes, events, or passthrough.
- `Spar gap`: primitive has a real headless bug or missing behavior that wrapper
  cannot solve without duplicate state or a hack.
- `Design gap`: recipe selector and wrapper DOM contract disagree.
- `Decision Needed`: naming, public exposure, fallback, or behavior has multiple
  plausible choices.
- `Not applicable`: the component does not need this capability.

### 5. Produce the outputs

Always produce Markdown. Produce HTML when requested or when the user wants a
visual review.

Recommended output names:

```text
{{component}}.recipe.json
{{component}}.recipe.md
{{component}}.recipe.html
{{component}}.decisions.md
```

The Markdown recipe must follow `references/recipe-output-contract.md`.

The HTML recipe must be generated from `assets/component-recipe-template.html`,
either by `scripts/render_recipe.py` or by copying the template and injecting
`window.__TAKEOFF_RECIPE__` data. The UI must be simple, readable, offline, and
dependency-free.

### 5a. Rich recipe UI content

When the recipe needs structured evidence, use the template's `contentBlocks`
instead of forcing everything into plain text. Supported blocks include `code`,
`diff`, `table`, `keyValue`, `checklist`, `callout`, `cards`, `steps`,
`details`, `fileTree`, `list`, `quote`, and `markdown`.

Use code blocks only for short API, selector, or event-shape examples. Use
tables for contract comparison. Use callouts for blockers and `Decision Needed`
notes. Use `details` for secondary evidence that should not dominate the UI.

### 6. Decision loop

If the recipe has blockers or unstable choices:

1. Put each issue under `Decision Needed` with a stable ID such as `D001`.
2. Show the impact, options, recommendation, and what must change after the
   decision.
3. In HTML, render editable decision notes and provide copy/download Markdown
   actions.
4. Do not convert a recommendation into an implementation decision unless the
   user approves it.

After the user chooses decisions, create or update `{{component}}.decisions.md`
and include it in the implementation handoff.

### 7. Implementation handoff

When the recipe is approved, produce a compact handoff prompt using
`references/implementation-handoff.md`.

The handoff must include:

- Component name and primitive name.
- Links or paths to `{{component}}.recipe.md` and `{{component}}.decisions.md`.
- Scope boundaries.
- Required public API, compound structure, DOM contract, tests, docs, exports,
  validation, and final report format.
- Explicit `Decision Needed` items that remain unresolved.

## Output style

Use short, scannable sections. Prefer tables for contracts and decisions. Every
derived fact must name its source repo/file when available. Use `Unknown` or
`Not found` when evidence is missing.

## Stop conditions

Stop and ask the user before handoff if:

- `component` cannot be normalized safely.
- The target repos cannot be located.
- `takeoff-ui core` has no corresponding source and the user has not approved
  creating a wrapper without a legacy contract.
- `takeoff-design` selectors are missing and the UI depends on unstated design
  behavior.
- There is an unresolved blocker that changes the public API.
