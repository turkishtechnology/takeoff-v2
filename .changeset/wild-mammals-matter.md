---
'@takeoff-ui/react-spar': patch
---

**Breaking (Button):** Renamed the `isLoading` and `isPressed` props to
`loading` and `pressed`.

Migration — find-and-replace on `<Button>` usages:

- `<Button isLoading>` / `isLoading={x}` → `<Button loading>` / `loading={x}`
- `<Button isPressed>` / `isPressed={x}` → `<Button pressed>` / `pressed={x}`

`onPressedChange` is unchanged.
