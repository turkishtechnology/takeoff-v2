# @takeoff-design/tokens

## 0.1.0

### Patch Changes

- 90eff3d: Catch up the published package with the form-primitive token recipes
  that have been accumulating in the repo since `0.1.0-beta.0`. Bumps the
  prerelease counter from `beta.0` to `beta.1`.

  New recipe stylesheets:
  - `_checkbox.scss` — Checkbox + Indicator parts, state matrix.
  - `_radio.scss` — Radio compound, including selected/disabled.
  - `_switch.scss` — Switch with size + variant tokens.
  - `_field.scss` — Field wrapper for labelled inputs.
  - `_input.scss` — Input compound styles wired to the new Field.
  - `_popover.scss` — Popover surface + Header + Description.
  - `_drawer.scss` — Drawer surface.
  - `_tooltip.scss` — Tooltip surface + Provider.
  - `_badge.scss` — Badge surface.
  - `_select.scss` — Select recipe added in this batch, plus a follow-up
    refinement that aligns panel + items with the Figma dropdown token family
    (`--dropdown-items-basic-*`, layered `Effect1-Default-Sm` shadow,
    `--background-lightest` hover).

  Token additions are additive — no existing tokens were removed or renamed.
  Consumers on `0.1.0-beta.0` see the new variables but never the absence of an
  old one.
