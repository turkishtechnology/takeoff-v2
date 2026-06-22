import type { Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type SpinnerSize = 'small' | 'base' | 'large' | 'xlarge';

export type SpinnerAppearance = 'rounded' | 'dots' | 'lines' | 'pulse' | 'threeDots' | 'loader' | 'logo';

export type SpinnerVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning';

export type SpinnerSlot = 'root' | 'indicator';

export interface SpinnerProps extends Omit<TakeoffHTMLProps<'span'>, 'children'> {
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: SpinnerSize;
  /**
   * Visual spinner style.
   * @defaultValue 'rounded'
   */
  appearance?: SpinnerAppearance;
  /**
   * Color variant.
   * @defaultValue 'neutral'
   */
  variant?: SpinnerVariant;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<SpinnerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<SpinnerSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Spinner: import('../../core').ComponentThemeConfig<SpinnerProps, SpinnerSlot>;
  }
}
