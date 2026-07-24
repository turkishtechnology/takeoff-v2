import { createComponentBase } from '../../core';

import type { SliderProps, SliderRangeProps, SliderThumbProps, SliderTicksProps, SliderTrackProps, SliderValueProps } from './types';

// @archetype react-enhancement — Spar ships no Slider primitive (same
// no-upstream situation as Progress/Table/Stepper). The wrapper therefore owns
// what would normally be Spar's slice: controlled/uncontrolled reconciliation,
// the step/clamp math, the keyboard surface, pointer dragging, and the
// role="slider" ARIA wiring. Takeoff Core's `tk-slider` only implements
// pointer dragging, so the keyboard and ARIA surfaces are authored here rather
// than ported.
//
// If a Spar Slider primitive lands upstream, these parts must migrate to
// Inherited in the same release and the behavior above must move to Spar
// (composition-archetype rule 3 / the upstream-first rule).
//
// The root is the layout wrapper and state owner; each thumb is its own a11y
// owner (Root/Track/Range/Thumb anatomy, as in Base UI / Radix / Ark). It
// renders the default anatomy — Track wrapping Range and the thumbs — and
// consumers can still compose the parts explicitly for slot overrides or to
// add an indicator such as `Slider.Ticks` below the rail.
// The root emits the size/variant/state hooks plus two wrapper-owned config
// attributes — `data-track` (normal | inverted | none — rail fill mode) and
// `data-tooltip` (auto | always | never — when the value bubble shows). Both
// are v2-owned with no upstream primitive; their rule-10 justification lives in
// the Slider section of `docs/data-attribute-vocabulary.md`.
export const SliderBase = createComponentBase<SliderProps, 'root'>({
  name: 'Slider',
  slots: ['root'] as const,
  classes: { root: 'tk-slider' },
});

// @archetype react-enhancement — no upstream part; the rail the thumbs travel
// along and the press-to-seek interaction owner.
export const SliderTrackBase = createComponentBase<SliderTrackProps, 'root'>({
  name: 'SliderTrack',
  slots: ['root'] as const,
  classes: { root: 'tk-slider-track' },
});

// @archetype react-enhancement — no upstream part; the decorative filled
// portion between the thumbs. Writes its offset/length inline (a continuous
// value is not a data-* hook — data-attribute-vocabulary rule 9).
export const SliderRangeBase = createComponentBase<SliderRangeProps, 'root'>({
  name: 'SliderRange',
  slots: ['root'] as const,
  classes: { root: 'tk-slider-range' },
});

// @archetype react-enhancement — no upstream part. The handle is the
// role="slider" a11y owner; the `tooltip` slot is the default value bubble, a
// CSS-positioned node parented to the handle (NOT the Tooltip component — a
// floating overlay would observe the moving/resizing bubble with a
// ResizeObserver, lagging the drag and tripping the browser's benign
// "ResizeObserver loop" warning). The tradeoff of the parented (non-portaled)
// bubble is that an ancestor with `overflow: hidden`/`auto` clips it — a slider
// near the top of a scrollable `Dialog.Body`, or in a table cell, has its
// readout cut off. Prefer `Slider.Value` (always in flow) in overflow
// containers, or leave `tooltip` at its default `auto` so it only shows
// transiently on drag/focus. A `Slider.Thumb` child — a plain node or a
// render function of the thumb state — swaps only the bubble's *content*; the
// handle and the aria-hidden bubble chrome stay the thumb's, so a child cannot
// surface a real Tooltip to assistive tech (it would render inside the
// aria-hidden bubble). The `arrow`
// slot is the bubble's pointer — a real element (not a pseudo-element) so it can
// be restyled/resized through classNames/slotProps, mirroring the composable
// arrows on Tooltip/Popover/Dropdown/Select; it stays CSS-drawn here since the
// bubble carries no floating-ui.
export const SliderThumbBase = createComponentBase<SliderThumbProps, 'root' | 'tooltip' | 'arrow'>({
  name: 'SliderThumb',
  slots: ['root', 'tooltip', 'arrow'] as const,
  classes: { root: 'tk-slider-thumb', tooltip: 'tk-slider-tooltip', arrow: 'tk-slider-arrow' },
});

// @archetype react-enhancement — no upstream part; decorative (aria-hidden)
// step marks below the track. Opt-in: composed by the consumer, not part of
// the default anatomy.
export const SliderTicksBase = createComponentBase<SliderTicksProps, 'root' | 'tick'>({
  name: 'SliderTicks',
  slots: ['root', 'tick'] as const,
  classes: { root: 'tk-slider-ticks', tick: 'tk-slider-tick' },
});

// @archetype react-enhancement — no upstream part; decorative (aria-hidden)
// value readout. Opt-in, and the only way to surface the value of an
// uncontrolled slider without lifting state out of the component (the drag
// tooltip is transient). Mirrors Progress.Value.
export const SliderValueBase = createComponentBase<SliderValueProps, 'root'>({
  name: 'SliderValue',
  slots: ['root'] as const,
  classes: { root: 'tk-slider-value' },
});
