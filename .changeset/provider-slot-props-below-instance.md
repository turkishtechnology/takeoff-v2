---
'@takeoff-ui/react-spar': patch
---

Provider `slotProps` no longer override what an instance sets itself, and
classes land in the documented order.

The provider's layers are documented to sit below the instance, but a theme
`slotProps.root` value replaced the instance's own attribute or handler of the
same name: a `title` or `onClick` passed to the component lost to the theme's.
Every component root spreads its props before the composed attrs, so this is
fixed once in `buildSlotAttrs`. A theme key the instance sets is left out, a
theme `style` merges key by key under the instance `style`, and classes still
add up.

Two class bugs on the same path are fixed with it. The instance `className` now
follows the provider's classes (canonical, provider, instance, as documented),
and a `className` passed through `slotProps` is added instead of silently
dropped.
