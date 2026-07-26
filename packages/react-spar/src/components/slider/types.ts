import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Axis the rail runs along. A vertical rail runs bottom-to-top: the bottom edge is `min`. */
export type SliderOrientation = 'horizontal' | 'vertical';

/** Visual scale. */
export type SliderSize = 'small' | 'base' | 'large';

/** Fill color variant. */
export type SliderVariant = 'primary' | 'info' | 'success' | 'danger' | 'warning';

/** When the drag value bubble is shown. */
export type SliderTooltip = 'auto' | 'always' | 'never';

/** How the rail fill renders. `none` drops the fill but keeps the rail. */
export type SliderTrackMode = 'normal' | 'inverted' | 'none';

/**
 * Committed slider value. A single `number` when `range` is unset, an ascending
 * array when `range` is set. Takeoff Core's `tk-slider` commits a `[min, max]`
 * pair only; the array widens that so a range can carry more than two handles.
 */
export type SliderValue = number | number[];

export type SliderSlot = 'root';
export type SliderTrackSlot = 'root';
export type SliderRangeSlot = 'root';
export type SliderThumbSlot = 'root' | 'tooltip' | 'arrow';
export type SliderTicksSlot = 'root' | 'tick';
export type SliderValueSlot = 'root';

/**
 * Value surface for a single-thumb slider. `range` is optional here so the
 * single form stays the zero-config default.
 */
export interface SliderSingleValueProps {
  /**
   * Renders a multi-handle slider that commits an array instead of a number.
   * `range` is a discriminated union (`false` vs `true`), not a plain
   * `boolean`, so a value typed `boolean` matches neither arm — to toggle mode
   * at runtime, branch on the flag and render the single vs range `<Slider>`
   * explicitly rather than passing `range={isRange}`.
   * @defaultValue false
   */
  range?: false;
  /**
   * Controlled value. Clamped into `[min, max]` and snapped to `step`. Takes
   * precedence: passing this alongside `defaultValue` makes the slider
   * controlled and ignores `defaultValue` (a dev-only warning is logged).
   */
  value?: number;
  /**
   * Initial value for uncontrolled usage. Ignored when `value` is also given.
   * Controlled/uncontrolled mode is latched on the first render, so a `value`
   * that later becomes `undefined` does not hand control back.
   * @defaultValue `min`
   */
  defaultValue?: number;
  /** Fired on every committed value change while interacting — each drag frame, keystroke, or track press. */
  onValueChange?: (value: number) => void;
  /**
   * Fired once at the end of an interaction with the final value: on pointer
   * release after a drag or track press, and once per committed keystroke. Use
   * it when only the settled value matters (persist, refetch, validate), while
   * `onValueChange` streams the live value.
   */
  onValueChangeEnd?: (value: number) => void;
}

/** Value surface for a two-thumb range slider. */
export interface SliderRangeValueProps {
  /**
   * Renders one thumb per entry of `value` / `defaultValue` (two by default)
   * and commits an ascending array.
   */
  range: true;
  /**
   * Controlled values, one per handle — its length decides how many thumbs
   * render. Fewer than two entries fall back to `[min, max]`, as with
   * `defaultValue`. Each entry is clamped into `[min, max]`, snapped to `step`,
   * and the array is ordered ascending. Takes precedence: passing this alongside
   * `defaultValue` makes the slider controlled and ignores `defaultValue`.
   */
  value?: number[];
  /**
   * Initial values for uncontrolled usage, one per handle. Fewer than two
   * entries falls back to `[min, max]`. Ignored when `value` is also given.
   * Controlled/uncontrolled mode is latched on the first render, so a `value`
   * that later becomes `undefined` does not hand control back.
   * @defaultValue `[min, max]`
   */
  defaultValue?: number[];
  /** Fired on every committed value change while interacting — each drag frame, keystroke, or track press. */
  onValueChange?: (value: number[]) => void;
  /**
   * Fired once at the end of an interaction with the final values: on pointer
   * release after a drag or track press, and once per committed keystroke.
   */
  onValueChangeEnd?: (value: number[]) => void;
}

/**
 * Props owned by takeoff-v2. There is no Spar Slider primitive to `Pick`
 * from — the whole surface is wrapper-owned (see the react-enhancement
 * rationale in `base.ts`).
 */
export interface SliderOwnProps {
  /**
   * Lowest selectable value. Non-finite values fall back to the default.
   * @defaultValue 0
   */
  min?: number;
  /**
   * Highest selectable value. Non-finite values and values at or below `min`
   * fall back to `min + 100` (with a dev-only console warning, since an
   * inverted range is a consumer bug).
   * @defaultValue 100
   */
  max?: number;
  /**
   * Granularity the value snaps to, counted from `min`. Non-finite and
   * non-positive values fall back to the default.
   * @defaultValue 1
   */
  step?: number;
  /**
   * Minimum gap kept between adjacent thumbs of a range, in value units. With a
   * positive gap the handles can no longer cross — dragging one into another
   * stops it against its neighbour instead of swapping. Ignored by a single
   * slider; initial values are not reshaped, so seed them at least this far apart.
   * @defaultValue 0
   */
  minDistance?: number;
  /**
   * Blocks interaction and mutes the fill. Inherits the surrounding `Field`'s
   * disabled state when composed inside one.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Renders the value but blocks every value-changing interaction. Inherits
   * the surrounding `Field`'s read-only state when composed inside one.
   * @defaultValue false
   */
  readOnly?: boolean;
  /**
   * Marks the slider as required for form validation. Inherits the
   * surrounding `Field`'s required state when composed inside one.
   * @defaultValue false
   */
  required?: boolean;
  /**
   * Applies the invalid treatment and sets `aria-invalid` on every thumb.
   * Inherits the surrounding `Field`'s invalid state when composed inside one.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Axis the rail runs along. A vertical rail runs bottom-to-top and fills its
   * container's height (as a horizontal rail fills its width), so give the
   * parent a height.
   * @defaultValue 'horizontal'
   */
  orientation?: SliderOrientation;
  /**
   * Visual scale — changes track thickness and thumb diameter.
   * @defaultValue 'base'
   */
  size?: SliderSize;
  /**
   * Fill color variant.
   * @defaultValue 'primary'
   */
  variant?: SliderVariant;
  /**
   * How the rail fill renders. `normal` fills from the start to the thumb (or
   * between a range's thumbs); `inverted` fills the *complement* instead — from
   * the thumb to the end for a single slider, and outside the two handles for a
   * range; `none` drops the fill entirely, leaving just the rail and the thumbs.
   * @defaultValue 'normal'
   */
  track?: SliderTrackMode;
  /**
   * When the drag value bubble is shown. `auto` reveals it while the handle is
   * dragged or keyboard-focused; `always` pins it open; `never` hides it
   * entirely — handy when a `Slider.Value` already surfaces the number. A
   * disabled slider hides the bubble regardless.
   * @defaultValue 'auto'
   */
  tooltip?: SliderTooltip;
  /**
   * Formats a value for every readout — the drag tooltip, `Slider.Value`, and
   * `aria-valuetext`. Returns a string, so it formats the value rather than
   * overriding the rendered node; use `Slider.Thumb` / `Slider.Value` children
   * for richer content. When omitted, the raw number is shown and
   * `aria-valuetext` is dropped.
   */
  formatValue?: (value: number) => string;
  /**
   * Name submitted with the form. A single slider submits one entry under this
   * exact name; a two-handle range submits `-min` / `-max`, and a range with
   * more handles submits each value under a 1-based `-1`, `-2`, … suffix so no
   * handle is dropped.
   */
  name?: string;
  /** `id` of the form the hidden inputs belong to. */
  form?: string;
  /**
   * Optional anatomy override. When omitted, `Slider` renders the default
   * anatomy — `Slider.Track`, wrapping `Slider.Range` and one thumb per value.
   * Compose the parts explicitly to add an indicator such as `Slider.Ticks`
   * below the rail.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderSlot>;
}

/**
 * Public props for the Slider root — the layout wrapper and state owner.
 * Each thumb is the `role="slider"` a11y owner, so a range root additionally
 * takes `role="group"` to tie the pair together. Renders the default anatomy
 * when no children are given. Compose inside a `Field` with `Field.Label` for
 * an automatically wired visible label.
 */
export type SliderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, SliderOwnProps & (SliderSingleValueProps | SliderRangeValueProps)>;

export interface SliderTrackOwnProps {
  /**
   * Track anatomy override. When omitted, `Slider.Track` renders the default
   * `Slider.Range` plus one thumb per value.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderTrackSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderTrackSlot>;
}

/**
 * Public props for `Slider.Track` — the rail the thumbs travel along. Owns
 * the press-to-seek interaction: pressing the rail moves the nearest thumb to
 * that position and starts dragging it.
 */
export type SliderTrackProps = SliderTrackOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLDivElement>;
  };

export interface SliderRangeOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderRangeSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderRangeSlot>;
}

/**
 * Public props for `Slider.Range` — the filled portion of the track. Takes no
 * children; its offset and length are written inline from the committed
 * values (a continuous value is not a `data-*` hook).
 */
export type SliderRangeProps = SliderRangeOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLSpanElement>;
  };

/** State handed to `Slider.Thumb` function-children. */
export interface SliderThumbRenderProps {
  /** Committed value of this thumb. */
  value: number;
  /** `value` passed through the root's `formatValue`, or stringified when the root has no formatter. */
  formatted: string;
  /** Which value this thumb controls. */
  index: number;
  /** Whether the pointer currently controls this thumb. */
  isDragging: boolean;
  /** Whether this thumb holds keyboard focus. */
  isFocused: boolean;
}

export interface SliderThumbOwnProps {
  /**
   * Which value this thumb controls. The default anatomy renders index `0`
   * (and `1` for a range slider); pass it explicitly only when composing the
   * thumbs by hand.
   * @defaultValue 0
   */
  index?: number;
  /**
   * Disables just this handle: it cannot be moved by pointer or keyboard and is
   * skipped as a drag target, while the other thumbs stay interactive. A
   * neighbouring thumb dragged into a disabled one stops against it rather than
   * pushing it. The whole slider's `disabled` still disables every thumb.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Content of the value bubble. When omitted, the formatted value renders. A
   * plain node replaces it with static content; a function receives this
   * thumb's `value` / `formatted` / `index` / `isDragging` / `isFocused` for
   * content that reacts to the drag. Either form swaps only what the bubble
   * shows — the handle and the bubble chrome are always the thumb's.
   */
  children?: ReactNode | ((state: SliderThumbRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderThumbSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderThumbSlot>;
}

/**
 * Public props for `Slider.Thumb` — the draggable handle and the
 * `role="slider"` a11y owner (keyboard, ARIA value surface, focus). Renders a
 * CSS-positioned value bubble whose content `children` replace.
 */
export type SliderThumbProps = SliderThumbOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLSpanElement>;
  };

export interface SliderTicksOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderTicksSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderTicksSlot>;
}

/**
 * Public props for `Slider.Ticks` — decorative (`aria-hidden`) marks at every
 * step. Opt-in: compose it after `Slider.Track` to show the step grid.
 */
export type SliderTicksProps = SliderTicksOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLDivElement>;
  };

/** State handed to `Slider.Value` function-children. */
export interface SliderValueRenderProps {
  /** Committed thumb values — one entry, or two ascending entries for a range. */
  values: number[];
  /** Each value passed through the root's `formatValue`, or stringified when the root has no formatter. */
  formatted: string[];
  /** Mirrors the root's `range` prop. */
  range: boolean;
}

export interface SliderValueOwnProps {
  /**
   * Readout content. When omitted, `Slider.Value` renders the formatted
   * value — both entries joined by an en dash for a range. A function receives
   * the committed values and their formatted strings, which is the only way to
   * read the value of an **uncontrolled** slider without lifting state out of
   * the component.
   */
  children?: ReactNode | ((state: SliderValueRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SliderValueSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SliderValueSlot>;
}

/**
 * Public props for `Slider.Value` — decorative (`aria-hidden`) value readout.
 * Each value is already announced through its thumb's `aria-valuenow`, so the
 * text carries no accessibility semantics. Opt-in: compose it alongside
 * `Slider.Track`.
 */
export type SliderValueProps = SliderValueOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLSpanElement>;
  };

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Slider: import('../../core').ComponentThemeConfig<SliderProps, SliderSlot>;
    SliderTrack: import('../../core').ComponentThemeConfig<SliderTrackProps, SliderTrackSlot>;
    SliderRange: import('../../core').ComponentThemeConfig<SliderRangeProps, SliderRangeSlot>;
    SliderThumb: import('../../core').ComponentThemeConfig<SliderThumbProps, SliderThumbSlot>;
    SliderTicks: import('../../core').ComponentThemeConfig<SliderTicksProps, SliderTicksSlot>;
    SliderValue: import('../../core').ComponentThemeConfig<SliderValueProps, SliderValueSlot>;
  }
}
