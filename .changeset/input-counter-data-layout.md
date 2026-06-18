---
'@takeoff-design/tokens': patch
---

Input: select the counter look with an explicit `data-layout="counter"` instead
of DOM placement.

**BREAKING (visual) — counter no longer keys on DOM placement.** Previously the
counter treatment (centered value, brand-coloured flanking buttons) was selected
structurally by the recipe: `Input.Decrement` / `Input.Increment` placed as
direct children flanking `Input.Field` (outside `Input.Stepper`). That recipe is
removed. The counter look now responds only to `data-layout="counter"` on the
`Input` root.

Migrate by adding the attribute:

```tsx
// before — selected by placement
<Input>
  <Input.Decrement />
  <Input.Field type="number" />
  <Input.Increment />
</Input>

// after — explicit opt-in
<Input data-layout="counter">
  <Input.Decrement />
  <Input.Field type="number" />
  <Input.Increment />
</Input>
```

Without the attribute the same markup renders as a plain left-aligned number
field. This trades fragile, undocumented placement detection — wrapping or
reordering the buttons silently broke the look — for an explicit styling hook.
The change is entirely in the `tk-input` recipe; no `@takeoff-ui/react-spar`
component code changes (the `Input` root already forwards arbitrary `data-*`
attributes to the DOM).
