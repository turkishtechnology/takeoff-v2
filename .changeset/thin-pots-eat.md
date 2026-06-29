---
'@takeoff-ui/react-spar': patch
---

**Breaking (visual default):** Changed the default `variant` of
`Tooltip.Content` and `Popover.Content` from `dark` to `white`. Default
(no-prop) usages now render differently and emit `data-variant="white"` instead
of `data-variant="dark"` on the content slot.

Migration:

- To keep the previous appearance, set the variant explicitly:
  `<Tooltip.Content variant="dark">` / `<Popover.Content variant="dark">`.
- Retarget any CSS/selectors on `[data-variant="dark"]` for the default state,
  since the default now stamps `data-variant="white"`.
