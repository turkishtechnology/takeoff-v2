# Release Runbook

This document is for the **release manager**. It walks through cutting a stable
release, publishing to npm, and writing the docs changelog entry that goes with
it.

If you are a contributor working on a PR, you don't need this document — see
[CONTRIBUTING.md](../CONTRIBUTING.md) instead.

## What "release manager" means here

One person per cycle owns:

- Deciding **when** to cut a release (cadence, blockers, freeze windows).
- Merging the Version Packages PR.
- Writing the docs changelog entry that gives the release its narrative.

The role rotates; nothing in tooling enforces it. The expectation is that
exactly one person drives each release end-to-end so the docs entry has a
consistent voice and nothing slips through.

## Two changelogs, recap

A release produces output in two places. Both must be in sync before the release
is considered shipped.

| Surface                           | Generated how                                 | Audience                        |
| --------------------------------- | --------------------------------------------- | ------------------------------- |
| `packages/*/CHANGELOG.md`         | Changesets, from `.changeset/*.md` files      | Engineers auditing a version    |
| `apps/docs/src/data/changelog.ts` | Hand-written narrative, one entry per release | Consumers upgrading / migrating |

The docs page (`/changelog`) renders the narrative entry and embeds the parsed
package CHANGELOG bodies under a "Package details" disclosure. The link between
them is the `packageVersions` field on each entry.

## Release checklist

Run through these in order. The whole flow typically takes 20–30 minutes if the
Version Packages PR is clean.

### 1 · Pre-flight

- [ ] `develop` is green (CI, type check, tests).
- [ ] No open merge-blocking PRs that should ship in this release.
- [ ] No active merge freeze (check the project memo if there's an ongoing
      release window from another team).
- [ ] Skim the open Version Packages PR — it should already exist if any
      changesets have been merged. If it's missing, the Changesets bot is stuck;
      re-run the workflow or push an empty commit to `develop`.

### 2 · Inspect the Version Packages PR

Before merging, **read the diff**. You're looking for:

- The set of bumped packages matches what you expect.
- Bump levels look right (a `major` bump on `0.x` propagates as `minor` — this
  is correct, not a bug; see
  [CONTRIBUTING.md](../CONTRIBUTING.md#bump-level-guide)).
- The generated `packages/*/CHANGELOG.md` entries are readable. If a contributor
  wrote a thin summary (`"Fix Select"`), this is your last chance to push back
  and ask them to rewrite the changeset before merge.
- No accidental version bumps on packages excluded from publishing (`docs` is
  the only one today; see `.changeset/config.json` `ignore`).

If anything looks wrong, **don't merge yet** — fix the source changeset on
`develop` and let the bot regenerate the PR.

### 3 · Merge the Version Packages PR

Merge to `develop`. CI takes over:

- Publishes each bumped package to npm with the `latest` dist-tag.
- Tags the commit **per package** (`@takeoff-ui/react-spar@0.1.4`,
  `@takeoff-design/tokens@0.1.4`, …). There is **no single repo-version tag**
  like `v0.1.4` — `.changeset/config.json` has empty `fixed`/`linked`, so each
  package versions and tags independently.
- Pushes git tags to the remote.

Verify on npm that the new versions are reachable before moving on:

```bash
npm view @takeoff-ui/react-spar versions --json | tail -5
npm view @takeoff-design/tokens versions --json | tail -5
```

### 4 · Generate the docs changelog draft

Switch to the docs app context and run the skill:

```
/generate-changelog 0.1.4 21.05.2026
```

The skill (defined in `.agents/skills/generate-changelog/SKILL.md`):

- Resolves the commit range for the new tag.
- Categorizes commits into sections (Highlights, Fixes, Docs, Infrastructure).
- Flips long sections (>5 items) to `collapsible: true`.
- Writes a new entry into `apps/docs/src/data/changelog.ts`.

> Note: because tags are **per package** (there is no `v0.1.4` tag), the skill's
> `git rev-parse v0.1.4` lookup won't resolve. It falls back to the
> last-changelog-entry date and collects commits since then up to `HEAD`. That's
> the expected path here — not an error.

The skill produces a **draft**, not a finished entry. The next step is to
rewrite it.

### 5 · Rewrite the draft into a user-facing narrative

Open `apps/docs/src/data/changelog.ts` and edit the new entry. The bar is:

- **Title** — one sentence, names the headline change. Not "v0.1.4 release" but
  "Select polish: Spar 0.2.0-beta.1, Figma-aligned styles, contentWidth".
- **Summary** — two to four sentences. What changed at the API level, why it
  matters, and the one thing a consumer needs to know to upgrade.
- **Highlights section** — three to five bullets. Lift the strongest items from
  the contributor changeset summaries; rewrite into user voice. Inline backtick
  code (`` `Select.contentWidth` ``) renders as `<code>`.
- **Breaking changes section** (if any) — every breaking change needs a
  before/after code block. The contributor's changeset summary should already
  have enough material for this; if not, push back next time.
- **Fixes / Infrastructure** — only if non-trivial; let the skill's draft guide
  you.
- **Media** (optional) — screenshot or GIF if the release has a visual change
  worth showing.

### 6 · Wire the packageVersions field

This is the **only step that connects the docs entry to the package
changelogs**. Add a `packageVersions` field to the new entry:

```ts
{
  id: 'v0-1-4-some-slug',
  date: '2026-05-21',
  version: '0.1.4',
  title: '...',
  packageVersions: {
    'react-spar': '0.1.4',
    'tokens': '0.1.4',
    // 'tailwind': '...', // only if Tailwind shipped a new version
  },
  summary: '...',
  sections: [ /* ... */ ],
}
```

The keys must match those in `apps/docs/plugins/package-changelogs.ts`
(`react-spar`, `tokens`, `tailwind`). The values must match the **exact**
version strings as they appear in the corresponding `CHANGELOG.md`. If either
side mismatches, the disclosure silently omits that package — there is no error,
so verify by viewing the page locally:

```bash
cd apps/docs
pnpm run dev
# open http://localhost:3000/changelog, expand "Package details"
```

If a package didn't bump in this release, **omit its key** rather than listing
the previous version. The disclosure is about what shipped now, not what's
currently installed.

### 7 · Open the docs PR

Open a PR with the changelog entry alone (no other doc edits). Keep it small so
reviewers can focus on tone and accuracy. Once merged, the docs deploy picks up
the new entry on the next build.

### 8 · Announce

Drop a link to `/changelog` in the team channel. Include:

- The release version(s).
- One sentence on the headline change.
- A note if there's a breaking change consumers need to migrate.

## Edge cases

### A package bumped but you don't want it in the docs entry

Omit its key from `packageVersions`. The package CHANGELOG.md still reflects the
bump (Changesets owns that); the docs entry just doesn't link to it. Use this
when a transitive bump (e.g. `react-spar` patched only because `tokens` patched)
doesn't add anything to the narrative.

### Two releases land on the same day

Each release gets its own entry. The `date` field can be the same; the `id` must
be unique. The feed shows them in the order they appear in the array (newest
first), so put the later release at the top.

### A pre-release / snapshot

Snapshot publishes to the `next` dist-tag don't get a docs entry. They are for
internal validation only. The narrative entry is written when the stable
`latest` publish lands.

### The release goes wrong

If a stable publish gets stuck in a half-shipped state (e.g. `latest` points to
an older version than `next`), follow the recovery pattern from 0.1.1 → 0.1.2:

- Add a changeset that bumps every affected package by `patch`.
- Use the changeset summary to document the recovery (consumers will read this
  in `CHANGELOG.md`).
- Merge the Version Packages PR.
- Note the recovery in the docs entry summary so consumers understand the
  version gap.

## Pointers

- **Bump level decisions:**
  [CONTRIBUTING.md#bump-level-guide](../CONTRIBUTING.md#bump-level-guide)
- **Cross-package propagation:**
  [CONTRIBUTING.md#cross-package-bumps](../CONTRIBUTING.md#cross-package-bumps)
- **Changelog data shape:** `apps/docs/src/data/changelog.ts` (type definitions
  at the top of the file).
- **Generator skill:** `.agents/skills/generate-changelog/SKILL.md`
- **Plugin that parses package CHANGELOGs:**
  `apps/docs/plugins/package-changelogs.ts`
