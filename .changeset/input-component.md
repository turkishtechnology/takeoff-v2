---
'@takeoff-ui/react-spar': patch
---

Add `Input` component. Wraps `@turkish-technology/spar` `Input`, `InputField`,
`InputLabel`, `InputDescription`, and `InputErrorMessage` primitives with the
Takeoff slot contract (`tk-input` /
`tk-input-{label,asterisk,container,field,leading-icon,trailing-icon,prefix,suffix,clear-button,clear-icon,spinner,description,error-message}`).

Supported surfaces:

- parity wrapper with `label`, `description`, `error`, `invalid`, `required`,
  `disabled`, `readOnly`, `size`, `type`, `placeholder`, `clearable`, `loading`,
  `icon` + `iconPosition`, `leadingIcon`, `trailingIcon`, `prefix`, `suffix`,
  controlled `value` + uncontrolled `defaultValue`, `onChange`, `onClearClick`
- `classNames`, `slotProps`, and theme-level `SparReactProvider` defaults for
  every slot
- render overrides for content-only slots (`renderLeadingIcon`,
  `renderTrailingIcon`, `renderSpinner`, `renderClearIcon`); structural
  `<button>` clear-button owner stays intact
- public compound parts: `Input.Label`, `Input.Description`,
  `Input.ErrorMessage`

Scope notes: Stencil `password`, `counter`, `chips`, and Cleave.js-based `mask`
modes are deliberately **not** ported in this release. They will ship as
separate wrappers (`PasswordInput`, `NumberInput`, `ChipsInput`) when their
upstream primitives and scope are ready.
