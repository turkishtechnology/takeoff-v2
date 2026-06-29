---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

Add the Toast component and toaster styles.

- Added React Spar `Toast`, `Toaster`, and `createToaster` exports powered by
  the Spar headless toast controller.
- Added default Alert-based toast rendering with title, description, close, and
  action anatomy.
- Added support for toast types, appearances, promise toasts, updates,
  persistent toasts, duration, max visible toasts, page-idle pausing, custom
  rendering, positions, and overlap stacks.
- Added token recipe styles for toast viewport placement, default layout,
  enter/exit motion, overlap expansion, width constraints, and stacked z-index
  ordering.
- Added Toast documentation, API tables, and demos.
