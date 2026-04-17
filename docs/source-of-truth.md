---
title: Source-of-Truth Matrix
status: canonical
owner: takeoff-spar
updated: 2026-04-17
---

# Source-of-Truth Matrix

This doc answers one question: **for any claim about `takeoff-spar`, where is
the canonical source?** Contributors and agents should consult this matrix
before copying wording into a README, doc page, or proposal.

## Matrix

| Concern                                    | Canonical location                                                                                                                                     | Status         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Public contract (parity, divergence rules) | [`docs/contract-model.md`](./contract-model.md)                                                                                                        | canonical      |
| Public API decision framework              | [`docs/api-decision-framework.md`](./api-decision-framework.md)                                                                                        | canonical      |
| Component-port readiness gate              | [`docs/component-port-readiness.md`](./component-port-readiness.md)                                                                                    | canonical      |
| Repo-wide architectural decisions          | [`docs/decisions/`](./decisions/README.md) (ADRs 0001-0008 landed)                                                                                     | canonical      |
| Implementation rules (code conventions)    | [`packages/react-spar/docs/CODING_STANDARDS.md`](../packages/react-spar/docs/CODING_STANDARDS.md)                                                      | live reference |
| Data-attribute vocabulary                  | [`packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md`](../packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md)                                    | live reference |
| Component public API (per component)       | Component base + JSDoc under `packages/react-spar/src/components/<name>/` and the published `apps/docs/docs/Components/` page                          | live reference |
| Provider runtime contract                  | [`packages/react-spar/src/provider.tsx`](../packages/react-spar/src/provider.tsx)                                                                      | code-is-truth  |
| Validation workflow and CI semantics       | [`README.md` — Validation workflow](../README.md#validation-workflow); CI step names live in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | canonical      |
| Release-gate and workflow decisions        | [`docs/proposals/monorepo-professionalization-execution-plan.md`](./proposals/monorepo-professionalization-execution-plan.md) until absorbed           | execution plan |
| Temporary design proposals / RFCs          | [`docs/proposals/`](./proposals/)                                                                                                                      | temporary      |
| Agent-executable skills                    | [`.agents/skills/<name>/SKILL.md`](../.agents/skills/)                                                                                                 | canonical      |
| Historical execution baselines             | [`docs/archive/`](./archive/)                                                                                                                          | archive        |

## Rules

### Reading

- When a claim contradicts the canonical location, the canonical location wins.
  Narrate the drift and either fix the doc or fix the code — do not leave both.
- Intros (root/package/app READMEs) summarize, but never define. If a README
  disagrees with a canonical doc, the README is wrong.

### Writing

- New contract rules go into `docs/contract-model.md` or a new ADR under
  `docs/decisions/`, not into proposal files.
- New implementation rules go into
  `packages/react-spar/docs/CODING_STANDARDS.md`, not into the repo README.
- New component docs go under `apps/docs/docs/Components/`. Internal-only
  context lives in the component folder's code or a dedicated reference doc.

### Proposal lifecycle

A file under `docs/proposals/` must end in **exactly one** of these states:

1. **Absorbed** — its outputs have been folded into a canonical doc or ADR, and
   the proposal file is deleted in the same PR that absorbs it.
2. **Active proposal** — it has a documented exit condition (acceptance criteria
   or a linked ADR to produce) and is still generating decisions.
3. **Archived** — kept for history only, moved under `docs/archive/` if we
   decide it is worth preserving, and never linked from canonical docs.
4. **Deleted** — the proposal never produced durable output and nothing else
   depends on it.

A proposal that has been "almost done" for more than one milestone cycle must
either move to archive or be deleted. Long-lived proposals become a second
source of truth and erode this matrix.

### Naming smells

Files whose names telegraph temporariness or scratchpad status (`.TEMP.md`,
`ULTRATHINK_*.md`, `DRAFT-*.md`) must not live in the active tree. They must be
renamed to a durable title, moved to `docs/archive/`, or deleted. Milestone 4 of
the execution plan closed the original instances on 2026-04-17 — re-introducing
them is a regression.

## Markdown taxonomy

Every non-generated `.md` / `.mdx` in this repo (excluding `node_modules`, build
output, the Docusaurus-rendered product docs under `apps/docs/docs/Components/`,
and the auto-generated API tables under `apps/docs/src/docs-files/`) belongs to
exactly one of seven classes. Adding a new doc means picking one and putting the
file in the matching location.

| Class                  | Purpose                                                                    | Canonical location                                                                            |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Intro**              | Short orientation surface read first by new contributors.                  | `README.md` (repo, package, app). One per scope.                                              |
| **Public docs**        | Consumer-facing docs rendered by the docs site.                            | `apps/docs/docs/**/*.mdx`.                                                                    |
| **Live reference**     | Authoring rules and contract vocab the package follows now.                | `packages/react-spar/docs/*.md` (e.g. `CODING_STANDARDS.md`, `DATA_ATTRIBUTE_VOCABULARY.md`). |
| **Repo contract**      | Cross-component contract docs and the matrix.                              | `docs/contract-model.md`, `docs/api-decision-framework.md`, `docs/source-of-truth.md`.        |
| **ADR / decision**     | Durable architectural decision; immutable except for clerical.             | `docs/decisions/NNNN-<slug>.md`.                                                              |
| **Temporary proposal** | Open RFC / migration playbook; lives only until absorbed.                  | `docs/proposals/<slug>.md` with `status` frontmatter.                                         |
| **Archive**            | Frozen historical narrative kept for context, never linked from live docs. | `docs/archive/<slug>.md`.                                                                     |
| **Skill**              | Executable agent instructions.                                             | `.agents/skills/<name>/SKILL.md` plus optional `references/`, `scripts/`, `agents/`.          |
| **Tool boilerplate**   | Generated by an external tool (changesets, etc).                           | Wherever the tool puts it (`.changeset/README.md`). Do not move.                              |

Rules:

- A doc that names a milestone, phase, or sprint is an execution narrative —
  once closed, it is **archive**, not live reference.
- Live reference and archive must not share a directory. If they do, the archive
  material moves to `docs/archive/`.
- `.agents/skills/` is reserved for executable skills only. Strategy notes,
  retrospectives, or playbooks-without-an-agent must not live there — they
  belong in `docs/proposals/` (until absorbed) or `docs/archive/` (once frozen).
- Names must describe the durable artifact, not the moment of writing. No
  `.TEMP.md`, no `ULTRATHINK_*`, no `DRAFT-*` in the active tree.

## When this matrix is wrong

If you find a claim in this file that no longer matches the repo, fix this file
in the same PR that introduces the change. This doc is load-bearing only while
it is accurate.
