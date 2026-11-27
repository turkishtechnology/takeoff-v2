---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
'@turkish-technology/spar': minor
---

Add `ColorPicker` (Core `tk-color-picker`): a typable color field that opens a
panel with a saturation/brightness area, hue and alpha sliders, typed HEX / RGB
/ HSL channel fields, an eyedropper and preset swatches. Render
`ColorPicker.Panel` alone for the inline picker; `orientation="horizontal"` is
Core's second layout. The value is a CSS string in the active `format`, and
typed text is parsed in any of the three notations.

```tsx
<Field>
  <Field.Label>Brand color</Field.Label>
  <ColorPicker value={color} onValueChange={setColor} format="rgb" />
</Field>
```

Spar adds `FieldReset`, which ends the surrounding `Field` scope for a subtree,
so a composite control's own sub-controls do not take the Field's label and id.
