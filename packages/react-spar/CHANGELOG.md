# @takeoff-ui/react-spar

## 0.1.2

### Patch Changes

- 415e689: Refresh release to recover the `latest` dist-tag.

  The 0.1.1 release stalled in an inconsistent state: the auto-snapshot step
  published `0.1.1` (instead of `0.1.1-next-<sha>`) to the `next` dist-tag, and
  when the Version Packages PR for 0.1.1 was merged the stable publish was
  skipped with "version 0.1.1 is already published." That left `latest` pointing
  at `0.1.0` while `next` pointed at `0.1.1`.

  This bump publishes both packages as `0.1.2` and restores `latest` to the
  intended head. No source changes since 0.1.1 — the published artifact for
  0.1.2 is byte-equivalent to the 0.1.1 already on `next`.

- Updated dependencies [415e689]
  - @takeoff-design/tokens@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [5e186be]
  - @takeoff-design/tokens@0.1.1

## 0.1.0

### Patch Changes

- b74c836: Narrow `@takeoff-design/tokens` peer dependency from `>=0.1.0-beta.0`
  to the exact `0.1.0-beta.0`. Required so Changesets can automatically bump the
  peer pin when tokens is re-released; range specifiers (`>=`, `^`, `~`) are not
  managed by the cross-package propagation rule and would otherwise drift. From
  this point forward every tokens release is paired with a react-spar patch that
  updates the peer pin.
- Updated dependencies [90eff3d]
  - @takeoff-design/tokens@0.1.0
