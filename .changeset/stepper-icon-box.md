---
'@takeoff-design/tokens': patch
---

Size Stepper indicator icons to the Figma icon box (20px in the 32px base
indicator, scaled per size) instead of filling the whole indicator, so the
larger `@takeoff-icons` 0.5.0 check no longer touches the indicator ring. This
applies to every svg in the indicator, so the error icon and custom svg
indicators shrink accordingly; `<img>` indicators still fill it.
