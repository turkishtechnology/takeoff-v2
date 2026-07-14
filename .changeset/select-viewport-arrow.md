---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Select.Viewport` and `Select.Arrow` compound parts.

- **`Select.Viewport`** — headless scroll region that wraps the options. Select
  now uses a viewport-only scroll model: the panel itself no longer scrolls, so
  wrap long option lists in `Select.Viewport` (bounded height + the shared
  `takeoff-scrollbar`).
- **`Select.Arrow`** — optional pointer from the panel to the trigger,
  positioned by Floating UI and filled to match the panel surface. Render it
  inside `Select.Content` as a sibling of `Select.Viewport`.

**Breaking:** `.tk-select-content` no longer scrolls — a long list without a
`Select.Viewport` wrapper will overflow instead of scrolling.
