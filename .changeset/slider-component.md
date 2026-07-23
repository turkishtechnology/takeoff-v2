---
'@takeoff-design/tokens': minor
'@takeoff-ui/react-spar': minor
---

Add the `Slider` component for picking a number, a range, or any set of ordered
values from a continuous scale.

`Slider` is v2-owned — Spar ships no slider primitive — so the wrapper owns the
value math, pointer dragging, and the accessibility surface. Takeoff Core's
`tk-slider` implements only pointer dragging, so full keyboard support and the
`role="slider"` ARIA model are authored here: each thumb is its own slider
element with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, arrow keys
move by `step`, Page Up/Down by ten steps, and Home/End jump to the bounds.

Set `range` for a multi-handle slider: the value becomes an array and one thumb
renders per entry, so `defaultValue={[20, 50, 80]}` gives three handles (two by
default). Dragging one handle past another swaps them so the committed array
stays ascending; the keyboard clamps each thumb against its neighbours instead.
This widens Takeoff Core's `tk-slider`, whose `range` commits a `[min, max]`
pair only. Composing inside a `Field` inherits `disabled` / `readOnly` /
`invalid` / `required` and wires the label to the first thumb.

`orientation="vertical"` runs the rail bottom-to-top — the bottom edge is `min`,
dragging upward increases the value, and each thumb reports the axis through
`aria-orientation`. A vertical rail has no intrinsic length, so it fills its
container's height (as a horizontal rail fills its width) — give the parent a
height.

The default anatomy is `Slider.Track` wrapping `Slider.Range` and one
`Slider.Thumb` per value; all parts stay composable when a layout needs them
placed by hand. `Slider.Ticks` (step marks) and `Slider.Value` (value readout)
are opt-in. `Slider.Value` also takes function-children, which is the only way
to read an uncontrolled slider's value without lifting state out of it.

Each thumb carries a value bubble that appears while it is dragged or focused.
By default it is a lightweight CSS-positioned node parented to the handle — not
the `Tooltip` component — because a floating overlay observes the moving,
continuously-resizing bubble with a ResizeObserver, which lags the drag and
trips the browser's benign "ResizeObserver loop" warning. The CSS bubble is
`aria-hidden` (the value is announced once, through the thumb) and `classNames`
/ `slotProps.tooltip` style it.

`Slider.Thumb` children replace the bubble's content — a plain node for static
content, or a function receiving the thumb's value, formatted string, index, and
drag/focus state for content that reacts to the drag. The handle and the bubble
chrome are always the thumb's; children swap only what the bubble shows.

Core's `type` prop and its bounds-label row are deliberately not carried over.
An indicator below the rail is anatomy, not a variant, so `Slider.Ticks` is
composed in when wanted — the same treatment Core's Input `mode` received.
