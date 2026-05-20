---
'@takeoff-design/tokens': patch
---

Remove `width: fit-content`, `max-width: 100%`, and the `&[data-full-width]`
escape hatch from the `.tk-button` recipe. The default `display: inline-flex`
already shrink-to-fits like a native `<button>`, so the explicit declarations
only served to override consumer-supplied width utilities (e.g. Tailwind
`w-full`) when the recipe stylesheet loaded after them in the cascade.

The `data-full-width` attribute was a workaround inherited from takeoff-ui's Web
Component era, where Shadow DOM isolation made consumer CSS unreachable. In
react-spar consumers style buttons directly with class names or inline styles,
so the attribute had no remaining purpose and is also removed from the
data-attribute vocabulary doc.

No DOM API changes — `<Button>` does not gain or lose any prop.
