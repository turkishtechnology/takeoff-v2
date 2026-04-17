---
'@takeoff-ui/react-spar': patch
---

Add `Checkbox` component. Wraps `@turkish-technology/spar` `Checkbox` primitive
with the Takeoff slot contract (`tk-checkbox` /
`tk-checkbox-{indicator,icon,text,label,description}`).

Supported surfaces:

- parity wrapper with `label`, `description`, `size` (`small` / `base`), `type`
  (`default` / `card`), `disabled`, `readOnly`, `required`, `invalid`, `name`,
  `formValue`, `form`, `autoFocus`, `tabIndex`, `id`, controlled tri-state
  `value` + uncontrolled `defaultValue`, core's `indeterminate` sugar, and an
  `onChange(value: boolean | null)` callback that preserves the core `tk-change`
  payload (`null` = indeterminate)
- `classNames`, `slotProps`, and theme-level `SparReactProvider` defaults for
  every slot
- render override `renderIcon({ checked, indeterminate })` for the check /
  indeterminate glyph; the canonical `<span class="tk-checkbox-icon">` owner
  stays intact so token-recipe state styling continues to drive the fill
- spar's hidden native input renders only when `name` is set, gated by
  `formValue` (defaults to `'on'`) for form-data submission

Scope notes: core's `content` slot is represented as additive `label` and
`description` props (idiomatic React). The Stencil `avatar` card variant is not
in scope for this wrapper; a dedicated `AvatarCheckbox` wrapper will ship
alongside the Radio family when that token recipe lands.
