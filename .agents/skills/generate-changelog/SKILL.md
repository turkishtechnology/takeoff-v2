---
name: generate-changelog
description:
  Add a new release entry to the react-spar docs changelog. Parses a version +
  date from the user, walks the git history for the matching tag range (or a
  fallback range when no tag exists yet), categorizes commits into sections
  (Highlights, Fixes, Docs, Infrastructure), flips long sections to collapsible,
  and writes the entry to apps/docs/src/pages/changelog.data.ts. Use when the
  user asks to generate release notes, add a changelog entry, or invokes
  /generate-changelog.
argument-hint: '[version] [date]'
---

# Generate changelog entry

Add exactly one entry to `apps/docs/src/pages/changelog.data.ts`. Do **not**
modify `changelog.tsx`, `changelog.module.css`, or the type exports in
`changelog.data.ts` — only the `CHANGELOG_ENTRIES` array.

## 1 · Collect inputs

The user passes `[version] [date]` as args. If either is missing, ask **once**,
concisely:

> "What version and date should this entry use?"

Accepted forms:

- **Version** — `v0.3`, `0.3.0`, `0.3`, `Phase C`, `Phase D`. Strip a leading
  `v`/`V` for semver; keep phase labels verbatim.
- **Date** — English (`Apr 12`, `April 12, 2026`), Turkish (`nisan 12`,
  `12 nisan`), ISO (`2026-04-12`), or dotted (`12.04.2026`). Resolve Turkish
  months: ocak→1, şubat→2, mart→3, nisan→4, mayıs→5, haziran→6, temmuz→7,
  ağustos→8, eylül→9, ekim→10, kasım→11, aralık→12. If the year is missing,
  assume the current year.

Normalize to:

- `version`: short label (e.g. `0.3` or `Phase C`).
- `dateIso`: `YYYY-MM-DD` (goes into the `date` field).
- `dateDisplay`: `MMM D, YYYY` (only for the draft preview — the page formats at
  render time).

If you cannot confidently parse an input, ask the user to clarify. Never guess.

## 2 · Resolve the commit range

```bash
git fetch --tags --quiet 2>/dev/null || true

# Try both the raw input and a v-prefixed form.
TARGET="$(git rev-parse "$VERSION^{commit}" 2>/dev/null \
       || git rev-parse "v$VERSION^{commit}" 2>/dev/null \
       || echo "")"
```

### Tag resolves → normal path

```bash
PREV="$(git describe --tags --abbrev=0 "$TARGET^" 2>/dev/null || echo "")"
# First release: fall back to the root commit.
if [ -z "$PREV" ]; then
  PREV="$(git rev-list --max-parents=0 HEAD | tail -1)"
fi
```

### Tag doesn't resolve → fallback

The repo may have no tags yet (common pre-1.0). Ask the user to pick one:

1. **Last-entry fallback** (default, safest): read the most-recent entry's
   `date` from `CHANGELOG_ENTRIES`. Use commits whose author-date is strictly
   after that date up to `HEAD`.
   ```bash
   SINCE="<date of CHANGELOG_ENTRIES[0].date>"
   git log --since="$SINCE 23:59:59" --no-merges --pretty=format:'%h%x00%ad%x00%s' --date=short HEAD
   ```
2. **Explicit range**: the user provides `a..b`.
3. **Abort** if neither works.

### Collect commits

```bash
git log "$PREV..$TARGET" --no-merges --pretty=format:'%h%x00%s'
```

Strip tree-only touches (lockfiles, generated mdx, pure whitespace) from
consideration when drafting items; keep everything in memory so you can explain
what was dropped if the user asks.

## 3 · Categorize

Match each subject line against conventional-commit prefixes:

| Prefix                                                             | Section        |
| ------------------------------------------------------------------ | -------------- |
| `feat:`, `feat(…):`                                                | Highlights     |
| `fix:`, `fix(…):`                                                  | Fixes          |
| `docs:`, `docs(…):`                                                | Docs           |
| `chore:`, `build:`, `ci:`, `refactor:`, `perf:`, `test:`, `style:` | Infrastructure |
| no prefix                                                          | Highlights     |

Rewriting rules:

- Drop the `type(scope):` prefix when writing the item text.
- Full sentence, sentence case, ending with a period.
- Fold multiple commits that describe the same change into a single item (e.g.
  two `fix:` commits on the same component).
- Drop reverts and pure refactors with no user-visible effect.
- Within a section, order by user-facing impact (strongest first).

Drop any section that ends up empty.

## 4 · Mark long sections collapsible

Set `collapsible: true` on any section with **more than 5 items**. The page
renders collapsibles as native `<details>` at the bottom of the entry, after
always-open sections. Practical shape: Highlights stays open; Fixes /
Infrastructure collapse when they grow.

**Never** set `collapsible: true` on `Highlights`. It's the centerpiece.

## 5 · Write title and summary

- `title`: one line, sentence case. Name the release's centerpiece. Examples:
  - ✅ "Form primitives: Button, Checkbox, and Input"
  - ❌ "feat: add button, checkbox, input components"
- `summary`: 2–4 sentences. Lead with the most user-visible change; mention the
  supporting work briefly. Match the tone of existing entries (calm, editorial,
  a little terse).

## 6 · Show the draft, wait for confirmation

Print a compact preview and **wait**. Do not touch disk yet.

```
Draft — Phase C, Apr 25, 2026

Title:   Table primitive lands with selection and sticky header
Summary: The first data-display component ships as a fully-compound Table…

Sections
  • Highlights        (3)
  • Fixes             (2)
  • Infrastructure    (7, collapsible)

Ship as-is, edit, or rewrite?
```

If the user requests edits, apply them and re-render the preview before writing.

## 7 · Write the entry

Insert as the **first** element of `CHANGELOG_ENTRIES` (newest first). Preserve
existing formatting: single-quote strings, trailing commas, two-space indent.

```ts
{
  id: '<kebab-slug>',
  date: '<YYYY-MM-DD>',
  version: '<label>',
  title: '<title>',
  summary: '<summary>',
  sections: [
    { title: 'Highlights', items: ['…'] },
    { title: 'Infrastructure', collapsible: true, items: ['…'] },
  ],
},
```

`id` recipe:

- Semver releases → `v<major>-<minor>-<slug>` (e.g. `v0-3-form-polish`).
- Phase labels → `phase-<letter>-<slug>` (e.g. `phase-c-table`).
- Slug → 2–3 words, kebab-case.
- Never reuse an existing id.

## 8 · Verify

```bash
pnpm --filter docs check-types
```

Must stay green. If it fails, the fix is in `changelog.data.ts` (usually a stray
quote or unescaped backtick in a string). Do not touch any other file to make it
pass.

## 9 · Report

One concise message:

- The entry `id`.
- Section counts, with collapsible flagged.
- The file path that changed.
- "Nothing committed — review and commit yourself."

## Guardrails

- **Never commit or push.** The user reviews and commits.
- **Never modify** `changelog.tsx`, `changelog.module.css`, or the type exports
  in `changelog.data.ts`. Only the `CHANGELOG_ENTRIES` array.
- **Never invent** features that aren't in the commit range. If the range is
  empty or trivial, tell the user and abort.
- **Never skip the draft-confirmation step.** The user must see and approve the
  draft before it lands on disk.
- **Never reuse an id.** If the natural slug collides, append a suffix (`-2`).
- **Don't widen scope.** This skill writes one entry. Related-but-separate work
  (updating the Entry component, adding a new section title style, wiring a real
  Accordion) is out of scope.
