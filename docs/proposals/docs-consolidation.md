---
name: docs-consolidation-research
description: >
  Research and design task to produce a canonical taxonomy and migration plan
  for every non-generated markdown file in this repo. Evaluates which docs
  should stay as reference, which should be archived, and which belong inside
  the .agents/ skill convention. Not an executable skill yet — the output of
  this research becomes the skill and guardrails.
status: open
type: research-task
owner: tbd
---

# Docs Consolidation & Professionalization

## Problem statement

The repository accumulated markdown files across heterogeneous locations without
a documented lifecycle. Audit of all non-generated `.md` files (excluding
`node_modules`, `dist`, and Docusaurus-rendered content):

| Path                                                                | Class (today)                  | Class feels right?                               |
| ------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| `README.md`                                                         | monorepo entry                 | yes, but rotted (dead links, stale backlog refs) |
| `packages/react-spar/README.md`                                     | package intro                  | yes                                              |
| `apps/docs/README.md`, `apps/react-app/README.md`                   | app intro                      | yes, minimal is fine                             |
| `packages/react-spar/docs/CODING_STANDARDS.md`                      | live reference                 | yes                                              |
| `packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md`             | live reference                 | yes                                              |
| `packages/react-spar/docs/PHASE_1_IMPLEMENTATION_CHECKLIST.md`      | completed execution playbook   | no — it is frozen narrative, not reference       |
| `packages/react-spar/docs/PHASE_2_IMPLEMENTATION_CHECKLIST.md`      | in-progress execution playbook | no — same issue                                  |
| `.agents/skills/generate-component/SKILL.md`                        | skill                          | yes                                              |
| `.agents/skills/takeoff-component-port/SKILL.md` + 5 reference docs | skill                          | yes                                              |
| `.changeset/README.md`                                              | tool boilerplate               | yes, do not touch                                |

Problems:

1. Root `README.md` references `./internal-docs/react-spar/*` — none of those
   files exist on disk. Readers cannot follow "single source of truth" links.
   This has been patched once as part of this research task but the root cause
   (no classification rule) remains.
2. PHASE checklists are execution narratives, not reference material. They read
   as playbooks and age out. Keeping them next to live reference docs
   (`CODING_STANDARDS.md`) blurs lifecycle.
3. `.agents/skills/` is the established home for executable agent skills. It is
   unclear whether completed execution playbooks (PHASE\_\*) should become
   skills, be archived, or stay where they are.
4. No CI guard catches dead intra-repo markdown links.
5. No convention file tells contributors where a new doc belongs.

## Goals

Produce a taxonomy, a migration plan, and a guard mechanism so that:

- every non-generated markdown file has a documented class and canonical home
- contributors can answer "where does this doc go" without asking
- stale backlog / task references cannot silently leak into `README.md`
- execution narratives and reference material live apart
- `.agents/skills/` stays coherent as the agent-facing surface

## Proposed document classes

Candidate taxonomy to validate during research:

1. **Intro** — README at repo, package, or app root. Short. Entry points only.
2. **Reference** — stable contract docs (coding standards, attribute vocab,
   release policy). Live close to the code they govern.
3. **Skill** — executable agent instructions under
   `.agents/skills/<name>/SKILL.md`, with frontmatter and optional
   `references/`, `scripts/`, `agents/` siblings.
4. **Research task / proposal** — open question, design exploration, or
   investigation plan. Lives under `docs/proposals/` until it produces a skill
   or a reference doc, then deleted.
5. **Execution playbook** — phased or milestoned internal work plan (PHASE_1,
   PHASE_2 today). Candidate home: `.agents/_playbooks/<name>/` or
   `docs/archive/` once closed.
6. **Archive** — frozen narratives kept for history only. Never linked from
   README. Immutable.

## Research questions

- Should the PHASE_1 (closed) playbook move to `archive/` and PHASE_2 stay in
  `packages/react-spar/docs/` until closed, or should both move to
  `.agents/_playbooks/` with a `status` frontmatter field?
- Is `packages/react-spar/docs/` the right home for CODING_STANDARDS and
  DATA_ATTRIBUTE_VOCABULARY, or should live reference docs consolidate at the
  repo root under `docs/` so the package `docs/` folder stays for
  package-specific concerns only?
- What frontmatter fields must every non-intro markdown declare? Minimum
  candidate: `name`, `type` (reference | playbook | research | archive),
  `status` (draft | live | closed), `owner`.
- Can we add a CI step (simple Node/Python script or `markdown-link-check`) that
  fails when an intra-repo link is broken?
- Where do ADRs / RFCs go if we introduce them? `.agents/_decisions/` or
  `docs/decisions/`?
- Should `.agents/README.md` be authored to state what a skill is, when to
  create one, and when a markdown file should NOT become a skill?

## Scope

### In scope

- Every non-generated `.md` / `.mdx` outside `node_modules`, `dist`,
  `.changeset/` boilerplate, and the Docusaurus-rendered `apps/docs/docs/`
  product docs.
- `.agents/skills/` skill convention and its relationship to research and
  playbook markdown.
- Root README, package READMEs, app READMEs.

### Out of scope

- `apps/docs/docs/**/*.mdx` user-facing product docs.
- Auto-generated API doc output (`apps/docs/src/docs-files/`).
- License, third-party changelogs, tool boilerplate.

## Deliverables

1. **Inventory** — a machine-readable catalog of every in-scope markdown file:
   path, current class, proposed class, target location, owner, rationale.
   Suggested location: `docs/proposals/docs-inventory.json`.
2. **Taxonomy rule doc** — short, canonical. Suggested location:
   `.agents/README.md`.
3. **Migration plan** — ordered PR list. Each PR moves one class at a time
   (intro → reference → playbook → research → archive). Cross-references must
   update atomically.
4. **CI guard** — a link-check step in `.github/workflows/ci.yml` (pending CI
   existence check) that fails on dead intra-repo markdown links.
5. **SKILL conversion decision** — for every current non-intro markdown, a
   recorded decision: keep-as-is / convert-to-skill / archive / delete.

## Execution phases

1. **Inventory** (~2h) — list every in-scope file, tag with current class,
   last-modified date, size, number of inbound references (grep), and owner
   guess from git history.
2. **Taxonomy proposal** (~half day) — draft the canonical classes, frontmatter
   schema, and naming rules. Circulate for review.
3. **Decision pass** (~half day) — for every inventoried file, record the target
   class and location.
4. **Migration** (~1-2 days) — execute the moves in ordered PRs. Every PR
   updates inbound links. Do not batch classes.
5. **Guard rails** (~half day) — add CI link check, add `.agents/README.md`
   convention doc, delete this research file.

## Exit criteria

- No orphan references in any `README.md`.
- Every in-scope `.md` has a documented class and canonical location.
- PHASE-style narratives live in a single, clearly labeled playbook or archive
  location — not mixed with live reference.
- `.agents/README.md` explains when to create a skill vs a reference vs a
  playbook.
- CI fails on a deliberately-broken intra-repo markdown link in a test PR.
- This `docs/proposals/docs-consolidation.md` file is deleted by the final
  migration PR.

## Non-goals

- No rewrite of the content of any reference doc.
- No new documentation platform (keep plain markdown, no wikis or new tools).
- No renames of SKILL.md frontmatter fields for existing skills unless the
  taxonomy pass concludes it is necessary.

## Known risks

- PHASE checklists are load-bearing internal context — moving them blindly can
  break ongoing work. The migration PR for playbooks must update every inbound
  reference atomically.
- The taxonomy pass must decide whether underscore-prefixed conventions
  (`_playbooks`, `_decisions`) are needed, or whether `docs/` subfolders cover
  every non-skill, non-reference case. `.agents/` is reserved for executable
  skills per Anthropic's SKILL.md spec, so non-skill material cannot live there.
- CI link-check false positives on anchors or case-insensitive paths can erode
  trust. Pilot on one PR before making it a merge gate.
