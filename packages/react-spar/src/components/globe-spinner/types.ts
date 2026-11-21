import type { Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';
import type { SpinnerVariant } from '../spinner';

export type GlobeSpinnerSize = 'base' | 'large' | 'xlarge';

export type GlobeSpinnerVariant = SpinnerVariant;

export type GlobeSpinnerSlot = 'root' | 'indicator';

export type GlobeSpinnerLabelSlot = 'root';

export interface GlobeSpinnerProps extends TakeoffHTMLProps<'span'> {
  /**
   * Size scale. The arc text is not legible below `base`.
   * @defaultValue 'base'
   */
  size?: GlobeSpinnerSize;
  /**
   * Accent color of the arc. For a color outside the variant palette, set the
   * `--tk-globe-spinner-accent` custom property instead.
   * @defaultValue 'primary'
   */
  variant?: GlobeSpinnerVariant;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<GlobeSpinnerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<GlobeSpinnerSlot>;
}

export interface GlobeSpinnerLabelProps {
  /** Text that rides inside the arc. Keep it short (around 20 characters). */
  children?: string;
  /** Extra class on the label's `<text>` node. */
  className?: string;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<GlobeSpinnerLabelSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<GlobeSpinnerLabelSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    GlobeSpinner: import('../../core').ComponentThemeConfig<GlobeSpinnerProps, GlobeSpinnerSlot>;
    GlobeSpinnerLabel: import('../../core').ComponentThemeConfig<GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot>;
  }
}
