---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Refactor Input compound anatomy and complete design-system parity.

- Removed `Input.Container`.
- Moved the bordered row onto the `Input` root.
- Added `Input.LeadingIcon` and `Input.TrailingIcon`.
- Added `Input.ClearButton`, `Input.Spinner`, and `Input.RevealButton`.
- Added `Input.Strength`, a four-segment password strength meter that grades the
  field value and renders below the bordered row.
- Added `Input.Stepper`, `Input.Decrement`, and `Input.Increment` for native
  number input stepping.
- Reshaped the placeholder eye / eye-off icons to the design system's Material
  Symbols glyphs and added a matching `lock` icon.
- `Field.Description` and `Field.ErrorMessage` now render a leading info / error
  icon, matching the design system's helper-text anatomy.

**Breaking — migration.** `Input.Container` and its types/CSS are removed; the
bordered row is now the `Input` root itself.

- Markup: move the field, prefix/suffix, and icons directly inside `<Input>`.
  Old `startContent` / `endContent` move to the new `Input.LeadingIcon` /
  `Input.TrailingIcon` parts (these render `aria-hidden`; for interactive
  trailing content use `Input.ClearButton` / `Input.RevealButton` instead).

  ```tsx
  // before (0.1.2)
  <Input>
    <Input.Container startContent={<SearchIcon />} endContent={<ClearIcon />}>
      <Input.Field />
    </Input.Container>
  </Input>

  // after
  <Input>
    <Input.LeadingIcon>
      <SearchIcon />
    </Input.LeadingIcon>
    <Input.Field />
    <Input.TrailingIcon>
      <ClearIcon />
    </Input.TrailingIcon>
  </Input>
  ```

- Types: replace `InputContainerProps` (and `InputContainerOwnProps` /
  `InputContainerSlot`) with `InputProps`, or the relevant part props
  (`InputLeadingIconProps` / `InputTrailingIconProps`).
- CSS: retarget custom selectors — `.tk-input-container` → `.tk-input` (the row
  box, border, `:hover`, `:focus-within`, and the `[data-invalid]` /
  `[data-disabled]` / `[data-readonly]` state hooks now live on the `.tk-input`
  root); `.tk-input-start-content` → `.tk-input-leading-icon`
  (`Input.LeadingIcon`); `.tk-input-end-content` → `.tk-input-trailing-icon`
  (`Input.TrailingIcon`).
