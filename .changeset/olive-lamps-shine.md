---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add the Progress compound component (`Progress`, `Progress.Track`,
`Progress.Indicator`, `Progress.Value`) with linear and circular appearances,
small/base/large sizes, fill color variants, an indeterminate mode, a disabled
state, and automatic label/disabled wiring when composed inside a `Field` — plus
the matching `tk-progress` recipe in the tokens package. The root emits
`data-complete` when the value reaches `max`, warns in dev on an inverted
`min`/`max` range, and writes the fill/arc progress as inline style so
stylesheet rules cannot override it.
