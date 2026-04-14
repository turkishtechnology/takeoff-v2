---
name: monorepo-readiness-gap-analysis
description: >
  Temporary task to measure how close takeoff-spar and takeoff-design are to the
  intended Takeoff ecosystem architecture, identify fragile or amateur areas,
  and define a phased professionalization plan.
status: open
type: research-task
owner: tbd
---

# Monorepo Readiness Gap Analysis

## Summary

This temporary task measures readiness on three axes at the same time:

- release readiness
- architecture parity
- component coverage

Primary focus:

- `takeoff-spar`
- `takeoff-design`

Reference-only baseline:

- `spar`
- `takeoff-ui`

Success for this task is not "ship more code immediately." Success is a
decision-complete view of:

1. how close the two target repos are to the intended ecosystem shape
2. where the current setup still feels brittle, amateur, or misleading
3. what order the cleanup work should happen in

## Target Model

Target chain for the current phase:

- `takeoff-design` is the styling source of truth: tokens, theme outputs, and
  Tailwind distribution.
- `spar` is the behavior and accessibility engine: headless primitives only.
- `takeoff-spar` is the React 19 visual adapter layer on top of Spar and Takeoff
  tokens.
- `takeoff-ui` is a parity reference only for this phase, not the implementation
  target and not a runtime dependency.

Implications:

- `takeoff-spar` should be judged by adapter quality, release safety, and honest
  scope communication, not by pretending to already match the legacy Stencil
  surface.
- `takeoff-design` should be judged by token pipeline reliability, output
  ownership, and repeatable validation, not only by the existence of generated
  files.

## Evidence Snapshot

Verified from the local repos during this task:

- `takeoff-spar` workspace contains `packages/react-spar`, `apps/docs`,
  `apps/react-app`, `.changeset`, and `docs/proposals`.
- `@takeoff-ui/react-spar` currently exports a narrow public surface centered on
  `Button`, `Accordion`, `AccordionItem`, `SparReactProvider`, and theme
  helpers.
- `pnpm --filter @takeoff-ui/react-spar test` passed with `119` tests.
- `pnpm --filter @takeoff-ui/react-spar check-types` passed.
- `pnpm --filter @takeoff-ui/react-spar build` passed.
- `takeoff-design` contains two main packages: `@takeoff-design/tokens` and
  `@takeoff-design/tailwind`.
- `@takeoff-design/tokens` builds CSS, SCSS, JS, and Tailwind outputs from the
  token source tree.
- `pnpm --filter @takeoff-design/tokens validate` passed all content checks but
  then failed while writing `.cache/previous-variables.txt`, so the command is
  not a read-only validator today.
- `pnpm --filter @takeoff-design/tokens test` failed in the current workspace
  with `vitest: command not found`, so the package test path is not reliably
  executable from a clean local state.
- `spar` already has primitives for `Accordion`, `Button`, `Checkbox`,
  `Collapsible`, `Dialog`, `DropdownMenu`, `Input`, `Popover`, `Radio`,
  `Select`, `Switch`, `Tabs`, and `Tooltip`.
- `takeoff-design` already has component token files for `accordion`, `button`,
  `dialog`, `dropdown`, `input`, `popover`, `tabs`, `tooltip`, and many more.
- `takeoff-spar` currently wraps only `accordion` and `button`.

## Readiness Scorecards

### `takeoff-spar`

| Axis                             | Score | Evidence                                                                                                                                | Readout                                                  |
| -------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Monorepo boundaries              | Green | Workspace, package, docs app, smoke app, and changesets are clearly separated.                                                          | The repo shape already looks professional and scalable.  |
| Package architecture             | Green | `@takeoff-ui/react-spar` explicitly treats `takeoff-ui` as parity-only and `@turkish-technology/spar` as the runtime primitive.         | The intended layer boundary is mostly clear.             |
| Build / test / typecheck health  | Green | Package test, build, and typecheck commands passed.                                                                                     | Current surface is technically healthy.                  |
| Release readiness                | Amber | Release tooling exists, but the public surface is still small compared with ecosystem ambition.                                         | Infra is ahead of actual coverage.                       |
| Docs and source-of-truth clarity | Amber | Live references, phase checklists, and proposal docs coexist in active areas; the repo already has an open docs consolidation proposal. | The narrative is still transitional.                     |
| Verification / guardrails        | Amber | Good unit coverage exists for the current package, but cross-repo contract checks are still informal.                                   | Safe for a small surface, not yet hardened for scale.    |
| Component coverage               | Red   | Only `Button` and `Accordion` are implemented while upstream primitives and token sets already cover a much larger overlap set.         | The repo is structurally ready but not surface-complete. |

### `takeoff-design`

| Axis                       | Score | Evidence                                                                                                                             | Readout                                                                  |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Monorepo boundaries        | Green | Tokens and Tailwind packages map cleanly to their outputs and responsibilities.                                                      | Package ownership is understandable.                                     |
| Pipeline architecture      | Green | Style Dictionary build, Tailwind export, and token taxonomy are already in place.                                                    | The repo direction is correct and non-amateur.                           |
| Build / validation health  | Amber | Validation logic passes its checks, but the command mutates baseline state.                                                          | The validator is useful but not CI-grade yet.                            |
| Test executability         | Red   | The package exposes a test script that did not run in the current workspace because `vitest` was not found.                          | The feedback loop is not dependable enough.                              |
| Output ownership           | Amber | Dist and generated artifacts exist, but the repo does not make artifact policy explicit enough.                                      | Generated-file discipline needs tightening.                              |
| Docs / operational clarity | Amber | README explains the package intent well, but does not pin down validation semantics, baseline ownership, or generated-output policy. | The repo looks mature, but some critical rules are still implicit.       |
| Component-token coverage   | Green | Token coverage is broad and already ahead of the React wrapper surface.                                                              | Design readiness is not the main bottleneck for the next few components. |

## Overlap Matrix

The highest-confidence next wave should come from the overlap between:

- a real `spar` primitive
- a real `takeoff-design` component token file
- a missing `takeoff-spar` wrapper

Current verified overlap candidates:

| Candidate                   | `spar` primitive exists | `takeoff-design` token exists     | `takeoff-spar` wrapper exists |
| --------------------------- | ----------------------- | --------------------------------- | ----------------------------- |
| `Dialog`                    | Yes                     | Yes                               | No                            |
| `Dropdown` / `DropdownMenu` | Yes                     | Yes                               | No                            |
| `Input`                     | Yes                     | Yes                               | No                            |
| `Tabs`                      | Yes                     | Yes                               | No                            |
| `Tooltip`                   | Yes                     | Yes                               | No                            |
| `Popover`                   | Yes                     | Yes                               | No                            |
| `Checkbox` / `Radio`        | Yes                     | Shared `radio-checkbox` token set | No                            |

Interpretation:

- `takeoff-spar` is not blocked by missing lower-layer capability for its next
  few components.
- The main blockers are adapter throughput, contract discipline, and release
  honesty.

## Key Findings

### 1. `takeoff-spar` is architecturally ahead of its real product surface

**Observation**  
The monorepo shape, package boundaries, docs app, smoke app, and release tools
already look like a scaled package, but the current public component surface is
still limited to `Button` and `Accordion`.

**Why it matters**  
This creates a risk that internal language, docs, or release posture imply a
larger ecosystem maturity than the package actually delivers today.

**Impact**  
Roadmaps, release notes, and contributor expectations can drift away from the
real state of the package.

**Proposed fix**  
Keep a visible readiness matrix in the repo and separate "platform readiness"
from "component coverage" in all planning and internal status reporting.

### 2. `takeoff-spar` still mixes stable references with transitional execution docs

**Observation**  
Live standards, vocabulary docs, phase checklists, and active proposals all
coexist close to the package entrypoints.

**Why it matters**  
This makes it harder for contributors to know what is canonical versus what is
temporary context.

**Impact**  
The repo can feel less professional than the actual code quality warrants.

**Proposed fix**  
Finish the documentation taxonomy work so that live references, playbooks,
proposals, and archives no longer compete for the same mental slot.

### 3. `apps/react-app` is useful, but still underused as a contract check

**Observation**  
The smoke app exercises provider wiring, theme variables, and current wrapper
surface, but it is primarily a manual playground today.

**Why it matters**  
The repo has cross-layer assumptions around provider attributes, token imports,
slot classes, and recipe registration that are not yet formally checked.

**Impact**  
Small integration drifts can survive even when unit tests pass.

**Proposed fix**  
Promote the smoke app from "demo only" to a lightweight contract verifier with
explicit scenarios for provider data attributes, class-name anatomy, and token
import expectations.

### 4. `takeoff-design` validation is not side-effect-safe

**Observation**  
The validator successfully checks token outputs, symmetry, and generated theme
artifacts, but it also writes `.cache/previous-variables.txt` as part of the
same command.

**Why it matters**  
A validation command should be safe to run in CI and in local checks without
silently mutating tracked or semi-tracked state.

**Impact**  
The command is harder to trust as a clean guardrail and harder to integrate into
professional release checks.

**Proposed fix**  
Split the behavior into a read-only `validate` path and an explicit
`baseline:update` or `snapshot:update` path.

### 5. `takeoff-design` exposes a test path that is not reliably runnable

**Observation**  
`@takeoff-design/tokens` has a `test` script, but the command failed in the
current workspace because `vitest` was not available at execution time.

**Why it matters**  
A repo feels amateur when its advertised validation paths cannot be trusted from
a normal local setup.

**Impact**  
Contributors lose confidence in the test surface and start treating validation
as optional.

**Proposed fix**  
Make the package test command executable from a clean install and ensure the
root contributor workflow clearly states which commands are expected to pass.

### 6. Generated-output policy is still too implicit in `takeoff-design`

**Observation**  
Generated `dist/` and `lib/` outputs exist in the repo and can show local
changes, but the repo does not clearly state when generated files should be
committed, rebuilt, or ignored.

**Why it matters**  
Ambiguous generated artifact policy creates noisy diffs and weakens review
discipline.

**Impact**  
Reviewers spend time guessing whether a changed file is expected output, stale
output, or an accidental commit.

**Proposed fix**  
Document one artifact policy and back it with a consistent verify flow.

### 7. Cross-repo contract checks are weaker than the repo narratives

**Observation**  
The intended chain is clear in prose, but the link between token output, wrapper
anatomy, recipe registration, and smoke usage is still enforced mostly by
convention.

**Why it matters**  
As soon as `takeoff-spar` adds more wrappers, convention-only enforcement will
stop scaling.

**Impact**  
The first wave of growth can introduce subtle drift without immediate failure.

**Proposed fix**  
Add a small set of contract checks that prove:

- wrapper slot maps match emitted DOM anatomy
- recipe registration matches wrapper base metadata
- required token imports and provider assumptions remain explicit

## Professionalization Backlog

### Phase A — Guardrails First

- Split `@takeoff-design/tokens` validation into read-only validation and
  explicit baseline update flows.
- Make `@takeoff-design/tokens test` reliably runnable from a normal workspace
  install.
- Document generated-output ownership for `takeoff-design` and decide whether
  generated outputs are committed artifacts, release artifacts, or verification
  artifacts.
- Add one visible readiness matrix to `takeoff-spar` so package maturity is not
  confused with future-state ecosystem intent.
- Finish the `takeoff-spar` documentation classification work so reference docs
  and playbooks stop mixing.
- Turn the `takeoff-spar` smoke app into an explicit integration check for the
  current surface.

### Phase B — Architecture Cleanup

- Codify the three-layer contract in both repos:
  `takeoff-design -> spar -> takeoff-spar`.
- Add lightweight contract verification between wrapper slot metadata, theme
  recipe registration, and smoke-verified DOM output.
- Align provider attributes, slot anatomy language, and state/data-attribute
  vocabulary across docs and code.
- Keep parity language honest: `takeoff-ui` remains a reference baseline, not a
  hidden implementation dependency.
- Clarify what counts as "done" for a wrapper: adapter, tests, docs, smoke
  coverage, and release notes.

### Phase C — Surface Expansion

- Expand only from the verified overlap matrix, not from wish lists.
- Prioritize wrappers in this order unless product priorities override it:
  `Dialog`, `Dropdown`, `Input`, `Tabs`, `Tooltip`, `Popover`, `Checkbox` /
  `Radio`.
- Require each new wrapper to ship with: base metadata, adapter logic when
  needed, package tests, docs coverage, and a smoke-app scenario.
- Track coverage explicitly so release communication never implies a broader
  component set than the repo actually ships.

## Exit Criteria

### `takeoff-spar`

- The repo has one explicit readiness matrix separating delivered components
  from future-state goals.
- Reference docs and execution playbooks no longer compete as equal sources of
  truth.
- The smoke app is part of the expected integration verification path.
- Cross-repo contract assumptions are documented and at least partially checked.
- Internal and release language no longer implies parity beyond the real
  surface.

### `takeoff-design`

- Validation can run without mutating baselines by default.
- Baseline updates use an explicit command or mode.
- Package tests run from a clean contributor setup.
- Generated-output policy is documented and enforced consistently.
- Root contributor guidance clearly states which build, validate, and test
  commands are expected to pass before release work.

### Cross-Repo

- The next wrapper roadmap is derived from verified overlap, not from vague
  ecosystem ambition.
- `takeoff-design`, `spar`, and `takeoff-spar` responsibilities stay explicit
  enough that each repo can evolve independently without contract drift.

## Assumptions and Defaults

- This task is a temporary planning artifact, not a migration PR.
- `takeoff-ui` remains parity/reference only during the current phase.
- `takeoff-spar` remains React 19 only until `@turkish-technology/spar`
  explicitly broadens compatibility.
- `@takeoff-design/tokens` remains the styling source of truth; `react-spar`
  does not bundle component CSS.
- The first remediation work should focus on trust, guardrails, and contract
  clarity before expanding the wrapper surface.
