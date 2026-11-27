import type { ElementType, KeyboardEventHandler, ReactNode } from 'react';
import type { PolymorphicProps, RadioItemProps as SparRadioItemProps, RadioProps as SparRadioProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Glyph drawn for each score. `number` renders numbered boxes instead. */
export type RatingType = 'star' | 'heart' | 'dot' | 'number';

/** How much of an item the current value fills. */
export type RatingFill = 'full' | 'half' | 'empty';

export type RatingSlot = 'root';
export type RatingItemSlot = 'root' | 'icon' | 'value';

/** State handed to a `Rating.Item` render-prop child. */
export interface RatingItemRenderProps {
  /** The score this item stands for. */
  value: number;
  /** How much of this item the current value fills. */
  fill: RatingFill;
  /** Whether this item is the selected score. */
  isChecked: boolean;
}

export interface RatingOwnProps {
  /**
   * Controlled score. A fractional value (e.g. `3.5`) is display-only: it
   * draws a half fill, but no item reads as checked and nothing is submitted.
   */
  value?: number;
  /** Uncontrolled initial score. Same fractional rule as `value`. */
  defaultValue?: number;
  /** Called with the picked score (always a whole number). */
  onValueChange?: (value: number) => void;
  /**
   * Number of items rendered when the root has no children.
   * @defaultValue 5
   */
  max?: number;
  /**
   * Glyph drawn for each item.
   * @defaultValue 'star'
   */
  type?: RatingType;
  /**
   * Prints the zero-padded score under each glyph. Number items already show
   * their score, so it has no effect on `type="number"`.
   * @defaultValue false
   */
  showValue?: boolean;
  /**
   * Accessible-name template for each item. `{value}` and `{max}` are
   * replaced; an empty string falls back to the default.
   * @defaultValue '{value} of {max}'
   */
  itemLabel?: string;
  /**
   * Native keydown handler on the radiogroup root. Runs before Spar's
   * Arrow / Home / End navigation; `event.preventDefault()` vetoes it.
   */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<RatingSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<RatingSlot>;
  /** `Rating.Item`s for custom content. Omit to render `max` default items. */
  children?: ReactNode;
}

export type RatingProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  RatingOwnProps &
    // Spar radiogroup form, state and focus surface. Spar's string-typed
    // `value` / `defaultValue` / `onChange` are replaced by the numeric triple
    // above; `orientation` (always horizontal) and `selectOnFocus` (arrows
    // always pick) are fixed by the design and not exposed.
    Pick<SparRadioProps, 'id' | 'name' | 'disabled' | 'readOnly' | 'required' | 'invalid' | 'autoFocus'>
>;

export interface RatingItemOwnProps {
  /** The whole score this item stands for. */
  value: number;
  /** Per-slot class name overrides — `root` plus the internal `icon` / `value` slots. */
  classNames?: ClassNamesMap<RatingItemSlot>;
  /** Per-slot HTML attribute overrides — `root` plus the internal `icon` / `value` slots. */
  slotProps?: SlotPropsMap<RatingItemSlot>;
  /**
   * Replaces the default glyph (and value text). A function receives the
   * item's fill state.
   */
  children?: ReactNode | ((state: RatingItemRenderProps) => ReactNode);
}

export type RatingItemProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  RatingItemOwnProps &
    // Per-item disable from Spar. Spar's string `value` is replaced by the
    // numeric one above, and its render-prop `children` by RatingItemRenderProps.
    Pick<SparRadioItemProps, 'disabled'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Rating: import('../../core').ComponentThemeConfig<RatingProps, RatingSlot>;
    RatingItem: import('../../core').ComponentThemeConfig<RatingItemProps, RatingItemSlot>;
  }
}
