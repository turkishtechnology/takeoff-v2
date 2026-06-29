---
'@takeoff-ui/react-spar': patch
---

Widen the `@takeoff-design/tokens` peer dependency to `>=0.1.2 <1.0.0` and
enable Changesets' `onlyUpdatePeerDependentsWhenOutOfRange` so a tokens minor
(0.2.0) no longer force-bumps `@takeoff-ui/react-spar` to a major. react-spar
stays 0.x.
