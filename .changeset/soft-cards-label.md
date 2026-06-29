---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

**Breaking:** Removed the `type` prop (`'default' | 'card'`) from `Checkbox`,
together with the `card` variant. The exported `CheckboxType` type, the
`data-type` attribute on the checkbox root, and the
`.tk-checkbox[data-type='card']` style recipe are all gone.

Updated Checkbox styles and docs to match the simplified API, including
disabled, focus, and invalid focus visuals for the remaining default variant.

Migration:

- Remove the `type` prop: `<Checkbox type="card">` → `<Checkbox>` (and drop the
  no-op `type="default"`). The built-in `card` (bordered-row) presentation no
  longer exists — wrap the checkbox in your own bordered container (or the
  Takeoff `Card` tokens) if you need it.
- Remove any `import type { CheckboxType } from '@takeoff-ui/react-spar'`; there
  is no replacement type.
- Retarget custom CSS: selectors on `.tk-checkbox[data-type='card']` /
  `[data-type='default']` will never match again — replace them with your own
  class/wrapper.
