# @takeoff-ui/react-spar

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
