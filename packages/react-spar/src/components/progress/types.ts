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
export type ProgressTrackSlot = 'root' | 'rail';
export type ProgressIndicatorSlot = 'root';
export type ProgressValueSlot = 'root';

/**
 * Props owned by takeoff-v2. There is no Spar Progress primitive to `Pick`
 * from — the whole surface is wrapper-owned (see the react-enhancement
 * rationale in `base.ts`).
 */
export interface ProgressOwnProps {
  /**
   * Current progress value. Clamped to `[min, max]`; non-finite values
   * resolve to `min`. Ignored while `indeterminate` is set.
   * @defaultValue 0
   */
  value?: number;
  /**
   * Marks the progress as indeterminate — the root drops `aria-valuenow`,
   * emits `data-indeterminate`, and the indicator animates a looping sweep
   * instead of a fill. Takes precedence over `value`.
   * @defaultValue false
   */
  indeterminate?: boolean;
  /**
   * Minimum value the progress starts from. Non-finite values fall back to
   * the default.
   * @defaultValue 0
   */
  min?: number;
  /**
   * Maximum value the progress can reach. Non-finite values and values at or
   * below `min` fall back to `min + 100` (the latter with a dev-only console
   * warning, since an inverted range is a consumer bug).
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
   * anatomy — `Progress.Track` wrapping `Progress.Indicator` — for both
   * appearances.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressSlot>;
}

/**
 * Public props for the Progress root — the a11y owner and layout wrapper
 * (the track is its own part, `Progress.Track`, matching the
 * Root/Label/Track/Indicator anatomy convention). Renders the default
 * anatomy when no children are given. Compose inside a `Field` with
 * `Field.Label` for an automatically wired visible label.
 */
export type ProgressProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ProgressOwnProps>;

export interface ProgressTrackOwnProps {
  /**
   * Track anatomy override. When omitted, `Progress.Track` renders the
   * default `Progress.Indicator`.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressTrackSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressTrackSlot>;
}

/**
 * Public props for `Progress.Track` — the rail the indicator fills. The
 * element is decided by the root's `appearance`: a rail `<div>` for
 * `'linear'`, the ring `<svg>` for `'circular'` — where the rail is drawn
 * as the svg's own `<circle>`, exposed as the `'rail'` slot.
 */
export type ProgressTrackProps = ProgressTrackOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<Element>;
  };

export interface ProgressIndicatorOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressIndicatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressIndicatorSlot>;
}

/**
 * Public props for `Progress.Indicator` — the filled portion. Not
 * polymorphic — the element is decided by the root's `appearance` (linear
 * fill `<span>` / circular arc `<circle>`), and the indicator takes no
 * children.
 */
export type ProgressIndicatorProps = ProgressIndicatorOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<Element>;
  };

export interface ProgressValueOwnProps {
  /**
   * Visible value content — typically the formatted value (e.g. `%60`) or a
   * short status. The component renders no default content; formatting stays
   * with the consumer so locale and design conventions are not baked in.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ProgressValueSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ProgressValueSlot>;
}

/**
 * Public props for `Progress.Value` — decorative (`aria-hidden`) value or
 * status text. The value is announced through the root's `aria-valuenow`,
 * so the value text carries no accessibility semantics. Renders in flow
 * next to the track for `'linear'` and as an overlay centered inside the
 * ring for `'circular'`.
 */
export type ProgressValueProps = ProgressValueOwnProps &
  Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    ref?: Ref<HTMLSpanElement>;
  };

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Progress: import('../../core').ComponentThemeConfig<ProgressProps, ProgressSlot>;
    ProgressTrack: import('../../core').ComponentThemeConfig<ProgressTrackProps, ProgressTrackSlot>;
    ProgressIndicator: import('../../core').ComponentThemeConfig<ProgressIndicatorProps>;
    ProgressValue: import('../../core').ComponentThemeConfig<ProgressValueProps>;
  }
}
