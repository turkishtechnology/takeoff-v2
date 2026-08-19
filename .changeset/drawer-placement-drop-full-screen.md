---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Drop `full-screen` from `Drawer`'s `placement`.

`placement` answers which edge the panel belongs to, and every other value in
the union drives a directional slide off that edge. `full-screen` answered a
different question — how big the panel is — and had to opt out of the axis it
was sitting on: the recipe gave it `transition: none` and `transform: none`,
then reintroduced a scale + opacity pair so it had any entry animation at all.
One value in a four-value enum carrying its own animation model is the shape of
a second concern wearing the first one's clothes.

`DrawerPlacement` is now `'left' | 'right' | 'top' | 'bottom'`, and the
`[data-placement='full-screen']` blocks are gone from the drawer recipe. A
full-screen drawer is built by keeping the edge that owns the slide-in and
stretching `Drawer.Panel` to the viewport with a style override — documented
with a live example on the Drawer docs page. Leave `transform` alone in that
override; the recipe drives the open/close slide through it.

Consumers passing `placement="full-screen"` get a type error and should move to
the override. Nothing else about the drawer changes.
