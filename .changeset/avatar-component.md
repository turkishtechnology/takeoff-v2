---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
'@turkish-technology/spar': minor
---

Add `Avatar`, a person's or entity's picture with a fallback. `Avatar.Image`
mounts its `<img>` only once the picture has loaded, and `Avatar.Fallback`
(initials, or a person glyph without children) shows while it is missing,
loading or broken, optionally after `delayMs`.

- Seven sizes from `xxsmall` (20px) to `xxlarge` (160px), `variant`,
  `appearance` (`filled` / `filledLight`), `rounded`, and `hideShadow`.
- `name` makes the avatar one `role="img"` named by it.
- `Avatar.Badge` pins a Takeoff `Badge` (a dot, or a count) to the corner,
  scaled to the avatar.
- `Avatar.Group` overlaps its avatars, passes `size` / `rounded` down, collapses
  the ones past `max` into a `+N` avatar (`overflowLabel` /
  `overflowAriaLabel`), and has a `compact` pill layout.

`@turkish-technology/spar` adds the headless `Avatar` / `AvatarImage` /
`AvatarFallback` primitive that tracks the image loading status (`data-status`,
`onLoadingStatusChange`). `@takeoff-design/tokens` ships the `tk-avatar` recipe.
