---
'@takeoff-ui/react-spar': patch
---

Render `Slider`'s hidden form field through Spar's `InputField` instead of a
bare `<input>`.

`Slider` is the only wrapper that has to emit its own form value (Spar ships no
Slider primitive, so there is no upstream hidden input to inherit), and it did
so with a raw DOM `<input type="hidden">` — the last bare form element in the
package. It now goes through the same `InputField` primitive every other form
wrapper uses.

No public API or DOM change: the field stays `type="hidden"` (so it adds no tab
stop next to the `role="slider"` thumb), carries no class (so no `.tk-input`
styling leaks in), keeps the `name` / `name-min` / `name-max` / `name-<n>`
submission scheme, and still submits nothing when the slider is disabled. Used
outside an `Input` root the primitive has no context to inherit id / aria /
state from, and its `data-*` hooks stay off for a field that never focuses.
