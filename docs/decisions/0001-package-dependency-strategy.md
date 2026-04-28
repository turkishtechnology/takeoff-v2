# ADR-0001: Package dependency strategy

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`packages/react-spar/package.json` declares its two upstream packages with
`link:` paths:

- `"@turkish-technology/spar": "link:../../../spar/packages/spar"`
- `"@takeoff-design/tokens": "link:../../../takeoff-design/packages/tokens"`

`link:` is convenient when the three repos are checked out side by side on a
developer machine. It is also fatal in three places:

- `pnpm install --frozen-lockfile` from a clean checkout fails when the sibling
  repos are absent.
- `npm pack` produces a tarball whose dependency strings are non-resolvable for
  any consumer who does not have those exact paths.
- The package cannot be released to a registry as-is. The published
  `package.json` would still claim a `link:` source.

`@turkish-technology/spar` is not yet published to a public registry.
`@takeoff-design/tokens` is published but currently on the same `link:` strategy
in this repo for in-flight token work.

## Decision

Use **npm `file:` tarballs in CI and a real semver in the published artifact**,
with a build-time substitution rather than maintaining two `package.json` files.

Concretely:

1. The committed `packages/react-spar/package.json` declares **`workspace:*`
   ranges** for both upstream packages. The repo's `pnpm-workspace.yaml` is
   extended to include the sibling repos as nested workspaces during local
   development; CI uses a checkout of all three repos pinned by SHA.
2. The `pnpm publish` command is replaced by a release script that:
   - Publishes a snapshot of `@turkish-technology/spar` to a private GitHub
     Packages registry (or npm, when public).
   - Rewrites the `react-spar` `package.json` to pin a real semver before
     `pnpm pack`.
   - Verifies the resulting tarball with `npm pack --dry-run --json` and a
     downstream install in a scratch directory.
3. `@takeoff-design/tokens` follows the same pattern. As a peer dependency it is
   consumer-facing, not bundled.
4. The `link:` paths stay accepted only for the pre-1.0.0 development cycle when
   sibling repos are required to live side by side; the release script refuses
   to ship a tarball that contains any `link:` or `file:` dependency string.

The decision is intentionally narrow: it solves "how do we ship without a broken
dependency string", not "how do we run all three repos in lockstep". The
lockstep question belongs to the larger monorepo-vs-multirepo discussion, which
is outside this ADR.

## Consequences

- ✅ Published tarballs are resolvable for any consumer with access to
  `@turkish-technology/spar`'s registry.
- ✅ CI on a clean checkout works without sibling repos when running against a
  pinned snapshot.
- ✅ Local developers keep the fast-iteration flow with `link:` / `workspace:*`
  semantics.
- ❌ The release script becomes a piece of infrastructure to maintain.
- ❌ Snapshot publishing of `@turkish-technology/spar` introduces a coupling
  between the two repos' release calendars.

## Alternatives considered

- **Make `@turkish-technology/spar` a peer dependency.** Rejected: the wrapper
  exists specifically to encapsulate Spar; making it the consumer's
  responsibility to install Spar contradicts the premise.
- **Bundle Spar into `react-spar`.** Rejected: doubles bundle size for any
  consumer that also installs Spar elsewhere, and breaks the "single Spar
  instance per app" assumption.
- **Switch all three repos into a single monorepo.** Out of scope for this ADR.
  Would invalidate the `link:` problem at the cost of a substantial reorg.
- **Keep `link:` and refuse to publish until 1.0.0.** Rejected: blocks any beta
  consumer adoption, including internal Turkish Airlines properties.

## References

- `packages/react-spar/package.json`
- `pnpm-workspace.yaml`
- Plan task TS-022.
