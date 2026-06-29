---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

**Breaking:** Removed the `type` prop (`'default' | 'card'`) from `Radio`,
together with the `card` variant. The exported `RadioType` type, the `data-type`
attribute on `.tk-radio` / `.tk-radio-item`, and the `[data-type='card']` style
recipe are all gone.

Updated Radio styles and docs after the API removal, including focus, disabled,
and invalid focus visuals for the remaining variants.

Migration:

- Remove the `type` prop: `<Radio type="card">` → `<Radio>` (and drop the no-op
  `type="default"`). The built-in `card` (bordered-row) presentation no longer
  exists — wrap the radio in your own bordered container (or the Takeoff `Card`
  tokens) if you need it.
- Remove any `import type { RadioType } from '@takeoff-ui/react-spar'`; there is
  no replacement type.
- Retarget custom CSS: selectors on `.tk-radio[data-type='card']` /
  `.tk-radio-item[data-type='card']` will never match again — replace them with
  your own class/wrapper.
