---
'@takeoff-design/tokens': patch
---

Input: gate the counter look on an explicit `data-layout="counter"` hook.

The counter treatment (centered value with brand-coloured flanking
increment/decrement buttons) is selected by setting `data-layout="counter"` on
the `Input` root. Without the attribute, the same markup renders as a plain
left-aligned number field, so the styled treatment is an explicit, documented
opt-in rather than something inferred from element placement.

```tsx
<Input data-layout="counter">
  <Input.Decrement />
  <Input.Field type="number" />
  <Input.Increment />
</Input>
```

The change is entirely in the `tk-input` recipe; no `@takeoff-ui/react-spar`
component code changes (the `Input` root already forwards arbitrary `data-*`
attributes to the DOM).
