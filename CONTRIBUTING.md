# Contributing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for
versioning and publishing.

## Workflow

1. Branch from `develop`, work on your change.
2. **Before opening a PR**, add a changeset:

   ```bash
   pnpm changeset
   ```

   The CLI will ask:
   - which packages changed
   - the semver bump level for each (`patch` / `minor` / `major`)
   - a one-line summary that lands in the package's `CHANGELOG.md`

   A markdown file appears under `.changeset/`. Commit it with your code.

3. Open the PR. The Changeset Bot comments with a preview of the impending
   release; the `changeset-check` job fails if no changeset is present (override
   below).

4. Merge to `develop`. Two things happen automatically:
   - **Auto-snapshot**: a snapshot version is published to npm under the `next`
     dist-tag (e.g. `0.1.0-next-abc1234`). Beta-testers can pull this
     immediately with `pnpm add @takeoff-ui/react-spar@next`.
   - **Version Packages PR**: the Changesets bot opens (or updates) a single PR
     that aggregates all pending changesets. Merging this PR is what triggers
     the real `latest` release.

## Bump level guide

| Change                                                                                    | Level   |
| ----------------------------------------------------------------------------------------- | ------- |
| Bug fix, internal refactor with no API change, style tweak                                | `patch` |
| New prop, new exported component, additive token, new opt-in behavior                     | `minor` |
| Removed/renamed prop, removed component, default behavior change, breaking type signature | `major` |

For prerelease (`0.x`) packages, `minor` and `major` follow npm's prerelease
rules — `0.1.0` → `0.2.0` is treated as breaking by Changesets.

## Cross-package bumps

You don't need to write a changeset for downstream packages. When you bump
`@takeoff-design/tokens` (a peer of `@takeoff-ui/react-spar`), Changesets
automatically propagates a `patch` bump to `react-spar`. The
`updateInternalDependencies` config controls this.

## When to skip a changeset

For changes that don't ship to npm (docs site copy, internal scripts, repo
config, the `apps/docs` package), open an **empty changeset**:

```bash
pnpm changeset --empty
```

Or add the `release:none` label to the PR.

## What NOT to do

- Don't write changeset summaries from commit message subjects — write them for
  the changelog reader. "Fixed bug" is useless; "Select panel no longer steals
  focus when opened with a controlled `defaultValue`" is useful.
- Don't bump versions in `package.json` by hand. Changesets owns the
  `package.json` `version` field once a release PR is created.
- Don't publish from a feature branch. All releases go through the Version
  Packages PR flow.
- Don't use a caret (`^`) range when one workspace package depends on another.
  Internal deps are exact-pinned to prevent runtime version drift in consumers.
