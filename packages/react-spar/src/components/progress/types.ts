import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Shape of the progress indicator. */
export type ProgressAppearance = 'linear' | 'circular';

/** Visual scale. */
export type ProgressSize = 'small' | 'base' | 'large';

/** Fill color variant. */
export type ProgressVariant = 'primary' | 'info' | 'success' | 'danger' | 'warning';

export type ProgressSlot = 'root';
export type ProgressIndicatorSlot = 'root';

/**
 * Props owned by takeoff-v2. There is no Spar Progress primitive to `Pick`
 * from — the whole surface is wrapper-owned (see the react-enhancement
 * rationale in `base.ts`).
 */
export interface ProgressOwnProps {
  /**
   * Current progress value. Clamped to `[min, max]`; non-finite values
   * resolve to `min`.
   * @defaultValue 0
   */
  value?: number;
  /**
   * Minimum value the progress starts from. Non-finite values fall back to
   * the default.
   * @defaultValue 0
   */
  min?: number;
  /**
   * Maximum value the progress can reach. Values at or below `min` fall back
   * to `min + 100`.
   * @defaultValue 100
   */
  max?: number;
  /**
   * Shape of the progress indicator — a horizontal bar (`'linear'`) or a
   * ring (`'circular'`).
   * @defaultValue 'linear'
   */
  appearance?: ProgressAppearance;
  /**
   * Visual scale. Linear progress changes track height; circular progress
   * changes ring diameter.
   * @defaultValue 'base'
   */
  size?: ProgressSize;
  /**
   * Fill color variant.
   * @defaultValue 'primary'
   */
  variant?: ProgressVariant;
  /**
   * Mutes the fill color and sets `aria-disabled`. Inherits the surrounding
   * `Field`'s disabled state when composed inside one.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Optional anatomy override. When omitted, `Progress` renders the default
   * `Progress.Indicator`.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressSlot>;
}

/**
 * Public props for the Progress root. The root doubles as the track and
 * renders `Progress.Indicator` by default. Compose inside a `Field` with
 * `Field.Label` for an automatically wired visible label.
 */
export type ProgressProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ProgressOwnProps>;

export interface ProgressIndicatorOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressIndicatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressIndicatorSlot>;
}

/**
 * Public props for `Progress.Indicator`. Not polymorphic — the element is
 * decided by the root's `appearance` (linear fill `<span>` / circular ring
 * `<svg>`), and the indicator takes no children.
 */
export type ProgressIndicatorProps = ProgressIndicatorOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<Element>;
  };

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Progress: import('../../core').ComponentThemeConfig<ProgressProps, ProgressSlot>;
    ProgressIndicator: import('../../core').ComponentThemeConfig<ProgressIndicatorProps>;
  }
}
