---
'@takeoff-design/tokens': patch
---

Fix floating-layer stacking so popovers, selects and tooltips are never painted
behind a Dialog/Drawer.

These surfaces all portal to `<body>`, so their stacking against a modal is
decided by z-index, not DOM order — yet they sat below the modal band (overlay
`1500` / panel `1501`). A column filter (or any popover/select) opened inside a
Drawer was therefore painted behind it.

The floating-layer scale is reordered to sit above the modal band, matching
Chakra/MUI:

- Select content: `800` → `1600`
- Popover content: `1300` → `1600` (same tier as Select; a Select opened inside
  a Popover resolves by DOM order since it portals later)
- Tooltip content: `1300` → `2100` (ceiling, above Toast `2000` — a tooltip can
  annotate a control inside a toast)

Final order: overlay `1500` < modal `1501` < select/popover `1600` < toast
`2000` < tooltip `2100`.
