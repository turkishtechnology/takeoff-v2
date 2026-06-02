<!--
  Thanks for contributing! Keep this PR small and focused.
  See CONTRIBUTING.md for the full workflow, and docs/release-runbook.md for how
  releases are cut.
-->

## Summary

<!-- What does this change do, and why? One or two sentences is plenty. -->

## Changeset

This repo versions and publishes with [Changesets]. The `changeset-check` job
fails a PR that touches publishable code without one. Pick one:

- [ ] I ran `pnpm changeset` and **committed** the generated `.changeset/*.md`
      file. (Bump level: see the "Bump level guide" in
      [CONTRIBUTING.md](../CONTRIBUTING.md).)
- [ ] This PR is **docs / tooling-only** (no npm-shipped change) — I applied the
      `release:none` label.

> Don't bump `package.json` versions by hand — Changesets owns the `version`
> field. Write the changeset **summary for the changelog reader**, not from a
> commit subject (see CONTRIBUTING → "Writing a changeset summary").

## Pre-merge checks

- [ ] `pnpm turbo check-types` passes
- [ ] `pnpm turbo lint` passes
- [ ] `pnpm turbo build` passes
- [ ] If `react-spar` changed:
      `pnpm --filter @takeoff-ui/react-spar lint:spar-pick` passes (Spar prop
      `Pick<>` discipline)

## Docs changelog

- [ ] This is a **user-facing** change. I understand the release manager will
      add the `/changelog` narrative entry at release time — contributors only
      write the changeset summary (see CONTRIBUTING → "Two changelogs, one
      source of truth").
- [ ] Not user-facing — no `/changelog` entry needed.

## Links

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [Release runbook](../docs/release-runbook.md)

[Changesets]: https://github.com/changesets/changesets
