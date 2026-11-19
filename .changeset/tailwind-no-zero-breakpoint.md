---
'@takeoff-design/tokens': minor
'@takeoff-design/tailwind': minor
---

Tailwind no longer gets the `0px` `xs` breakpoint. Tailwind breakpoints are
min-width queries, so `xs` matched every screen. Its `xs:` variant did nothing,
and the `container` utility turned it into `max-width: 0px` below 600px, so a
`container` collapsed to nothing on phones. `container` now starts at the `sm`
breakpoint (600px), like the other breakpoints.

The `xs:` variant is no longer generated. Classes that used it now need no
prefix: `xs:hidden md:block` becomes `hidden md:block`. The `--breakpoint-xs`
token and CSS variable are unchanged.
