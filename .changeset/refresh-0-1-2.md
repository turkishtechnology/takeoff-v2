---
'@takeoff-design/tokens': patch
'@takeoff-ui/react-spar': patch
---

Refresh release to recover the `latest` dist-tag.

The 0.1.1 release stalled in an inconsistent state: the auto-snapshot step
published `0.1.1` (instead of `0.1.1-next-<sha>`) to the `next` dist-tag, and
when the Version Packages PR for 0.1.1 was merged the stable publish was skipped
with "version 0.1.1 is already published." That left `latest` pointing at
`0.1.0` while `next` pointed at `0.1.1`.

This bump publishes both packages as `0.1.2` and restores `latest` to the
intended head. No source changes since 0.1.1 — the published artifact for 0.1.2
is byte-equivalent to the 0.1.1 already on `next`.
