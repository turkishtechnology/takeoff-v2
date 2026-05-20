# @takeoff-design/tokens

## 0.1.1

### Patch Changes

- 5e186be: Remove `width: fit-content`, `max-width: 100%`, and the
  `&[data-full-width]` escape hatch from the `.tk-button` recipe. The default
  `display: inline-flex` already shrink-to-fits like a native `<button>`, so the
  explicit declarations only served to override consumer-supplied width
  utilities (e.g. Tailwind `w-full`) when the recipe stylesheet loaded after
  them in the cascade.

  The `data-full-width` attribute was a workaround inherited from takeoff-ui's
  Web Component era, where Shadow DOM isolation made consumer CSS unreachable.
  In react-spar consumers style buttons directly with class names or inline
  styles, so the attribute had no remaining purpose and is also removed from the
  data-attribute vocabulary doc.

  No DOM API changes — `<Button>` does not gain or lose any prop.

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
