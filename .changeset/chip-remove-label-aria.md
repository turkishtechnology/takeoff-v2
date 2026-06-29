---
'@takeoff-ui/react-spar': minor
---

Add accessible labeling for the `Chip` remove button. Its accessible name
defaults to "Remove" and can be customized through the standard slot mechanism,
matching `Alert.Close`.

To set a custom label, pass it via the `remove` slot:
`<Chip slotProps={{ remove: { 'aria-label': '…' } }} />`.
