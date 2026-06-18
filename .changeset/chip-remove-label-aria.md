---
'@takeoff-ui/react-spar': minor
---

**Breaking:** Remove the `Chip` `removeLabel` prop. The remove button's
accessible name now defaults to "Remove" and is customized through the standard
slot mechanism instead of a dedicated prop, matching `Alert.Close`.

Migration: replace `<Chip removeLabel="…" />` with
`<Chip slotProps={{ remove: { 'aria-label': '…' } }} />`.
