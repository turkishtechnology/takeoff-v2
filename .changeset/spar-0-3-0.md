---
'@takeoff-ui/react-spar': minor
---

Upgrade to `@turkish-technology/spar` 0.3.0 and drop the wrapper workarounds it
makes redundant.

Behavior changes inherited from Spar:

- Radio: `Radio.Item` renders `<span role="radio">` by default instead of
  `<label>` (which allows no ARIA role), so the documented anatomy passes every
  axe rule. Consumers that queried `label[role="radio"]` must switch to
  `[role="radio"]`; `Radio.Item` refs are `HTMLSpanElement`s. Consumer
  `onKeyDown` / `onFocus` / `onBlur` on `Radio` and `onClick` / `onKeyDown` /
  `onFocus` on `Radio.Item` are now composed with the built-in handlers
  (consumer first, `preventDefault()` vetoes) instead of replacing them. The
  root's extra hidden input is gone (each item's hidden radio is the single
  native representation), `aria-readonly` sits on the radiogroup only,
  `onChange` fires only on real changes, `readOnly` ignores keyboard selection,
  the first enabled item is the tab stop when the checked item is disabled, and
  Enter selects when `selectOnFocus` is `false`.
- Select: `Select.Separator` is presentational by default upstream
  (`role="presentation"`, `aria-hidden`); the wrapper no longer forces those
  attributes and `role="separator"` restores separator semantics.
  `onCloseAutoFocus` is now called before focus returns to the trigger
  (`preventDefault()` keeps focus where it is; not called for outside-pointer
  dismissal), `onEscapeKeyDown` can veto the close, and initially-open selects
  focus the listbox.
- Checkbox: `indeterminate` passes straight through to Spar's new prop; the
  wrapper's state-mirroring workaround is removed. Public behavior is unchanged
  (`onChange` still receives a plain boolean; clearing `indeterminate` from
  `onChange` still takes a single click).
- Dropdown: `onEscapeKeyDown`, `onPointerDownOutside` and `onFocusOutside`
  honour `preventDefault()`. `onFocusOutside` receives a cancelable
  `focusoutside` `FocusEvent` (was `focusin`) whose `target` is the newly
  focused element; for modal menus the veto skips the focus recapture, for
  non-modal menus it keeps the menu open.
- Popover: `onOpenAutoFocus` fires before focus moves with a cancelable event
  (`preventDefault()` skips the auto-focus), `onFocusOutside` /
  `onInteractOutside` receive a cancelable `focusoutside` `FocusEvent` on the
  focus path (`preventDefault()` keeps the popover open), and `Popover.Trigger`
  now carries the documented `${id}-trigger` id (a consumer `id` still wins).
- Tooltip: `onEscapeKeyDown` fires for Escape on the trigger too and
  `preventDefault()` keeps the tooltip open. Spar removed the never-called
  `onPointerDownOutside` / `onOpenAutoFocus` / `onCloseAutoFocus` from
  `Tooltip.Content`; the wrapper never exposed them.
- Tabs: `onValueChange` no longer fires on mount for the automatic first-tab
  selection nor when re-activating the selected tab; Enter/Space respect
  `disabled` on non-button triggers.
- Accordion: arrow / Home / End skip disabled items and follow DOM order.
- Button: the inert-anchor workaround (drop `href`, cancel the click while
  `disabled` / `loading`) is removed from the wrapper — Spar does it.
- Breadcrumb: consumer `onClick` / `onKeyDown` on `Breadcrumb.Link` are composed
  with `onPress` / `onNavigate` (consumer first, `preventDefault()` skips the
  press); disabled links block only Enter/Space.
- Dialog: the render-prop `open()` / `toggle()` are no-ops while disabled.

The JSDoc, docs pages and skills that described the old limitations are updated
accordingly.
