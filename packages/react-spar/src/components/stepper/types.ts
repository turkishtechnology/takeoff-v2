import type { ElementType, ReactNode } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Layout axis of the step list. */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Display mode. `'default'` renders indicators with connecting rails; `'compact'`
 * drops the rails in favor of a progress border on each step.
 */
export type StepperMode = 'default' | 'compact';

/** Density scale for indicators and typography. */
export type StepperSize = 'large' | 'base' | 'small' | 'xsmall';

/**
 * Resolved progress status of a step. Error and disabled are exposed as
 * separate modifier states so an active/completed step can also be errored.
 */
export type StepperStepStatus = 'inactive' | 'active' | 'completed';

/** Payload of the root `onStepClick` callback. */
export interface StepperStepClickDetail {
  /** Zero-based index of the pressed step. */
  index: number;
  /** Status of the pressed step at press time. */
  status: StepperStepStatus;
}

/** State passed to a `Stepper.Item` `indicator` render function. */
export interface StepperIndicatorState {
  /** Resolved progress status of the step. */
  status: StepperStepStatus;
  /** Zero-based index of the step. */
  index: number;
}

export type StepperSlot = 'root';
export type StepperItemSlot = 'root' | 'trigger' | 'rail' | 'indicator' | 'content';
export type StepperTitleSlot = 'root';
export type StepperDescriptionSlot = 'root';

/**
 * Props owned by takeoff-v2. There is no Spar Stepper primitive to `Pick`
 * from — the whole surface is wrapper-owned (see the react-enhancement
 * rationale in `base.ts`).
 */
export interface StepperOwnProps {
  /**
   * Currently active step index (controlled). Not clamped: an out-of-range
   * index renders every step completed (or inactive) with no active step.
   */
  active?: number;
  /**
   * Initially active step index (uncontrolled).
   * @defaultValue 0
   */
  defaultActive?: number;
  /** Fires with the new step index when the active step changes. */
  onActiveChange?: (index: number) => void;
  /**
   * Fires on selectable step presses, and on the active step when pressed again,
   * with the step's index and progress status. Disabled, non-clickable, and
   * linear-blocked steps emit nothing.
   */
  onStepClick?: (detail: StepperStepClickDetail) => void;
  /**
   * Layout axis of the step list.
   * @defaultValue 'horizontal'
   */
  orientation?: StepperOrientation;
  /**
   * Display mode — indicators with connecting rails (`'default'`) or a progress
   * border per step without rails (`'compact'`).
   * @defaultValue 'default'
   */
  mode?: StepperMode;
  /**
   * Restricts navigation to a linear progression: any previous step, or the
   * next step when the current one is neither errored nor disabled.
   * @defaultValue false
   */
  linear?: boolean;
  /**
   * Density scale for indicators and typography.
   * @defaultValue 'base'
   */
  size?: StepperSize;
  /**
   * Flips indicators and content along the cross axis.
   * @defaultValue false
   */
  reverse?: boolean;
  /**
   * Accessible status suffix appended to a completed step's name — the check
   * glyph alone is invisible to assistive technology. Localize per stepper;
   * an empty string drops the suffix.
   * @defaultValue 'completed'
   */
  completedLabel?: string;
  /**
   * Accessible status suffix appended to an errored step's name — the error
   * glyph alone is invisible to assistive technology. Localize per stepper;
   * an empty string drops the suffix.
   * @defaultValue 'error'
   */
  errorLabel?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<StepperSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<StepperSlot>;
}

/**
 * Public props for the Stepper root. Children must be `Stepper.Item`
 * elements — the root derives each step's index from its position in
 * `children`. Arrays (e.g. `items.map(...)`) flatten into one index per
 * item, but Fragments do not: items wrapped in `<>…</>` share a single
 * index, so render items directly or from arrays.
 *
 * Wrapping `Stepper.Item` in an intermediary component keeps click gating
 * correct, but first-paint/SSR gating reads `error`/`disabled`/`isClickable`
 * off each direct child's props — forward them on the wrapper (or accept a
 * one-paint `data-clickable`/`aria-disabled` correction after hydration).
 *
 * Arrow keys (following `orientation`), Home, and End move focus between
 * step triggers; Tab still reaches every clickable step.
 *
 * Overriding `as` on the root leaves items rendering `<li>` — override the
 * item's `as` in tandem to keep the markup valid.
 */
export type StepperProps<T extends ElementType = 'ol'> = PolymorphicProps<'ol', T, StepperOwnProps>;

export interface StepperItemOwnProps {
  /** Marks the step as errored without changing its progress status. */
  error?: boolean;
  /**
   * Disables the step. The trigger renders as a natively disabled button:
   * unfocusable, unselectable, and silent.
   */
  disabled?: boolean;
  /**
   * Whether the step can be activated by pressing it. Non-clickable steps
   * stay visible in the flow but are removed from the tab order.
   * @defaultValue true
   */
  isClickable?: boolean;
  /**
   * Custom indicator content. Replaces the built-in status glyph (check,
   * close, or dot) for every status except `disabled`. Pass a function to
   * render by status — returning `undefined` falls back to the built-in
   * glyphs, so numbered steps can surface the check once completed.
   */
  indicator?: ReactNode | ((state: StepperIndicatorState) => ReactNode);
  /** Step content — typically `Stepper.Title` and `Stepper.Description`. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<StepperItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<StepperItemSlot>;
}

export type StepperItemProps<T extends ElementType = 'li'> = PolymorphicProps<'li', T, StepperItemOwnProps>;

export interface StepperTitleOwnProps {
  /** Step title content. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<StepperTitleSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<StepperTitleSlot>;
}

// Defaults to `span` (not a heading/div): the title renders inside the
// item's <button> trigger, whose content model is phrasing content.
export type StepperTitleProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, StepperTitleOwnProps>;

export interface StepperDescriptionOwnProps {
  /** Step description content. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<StepperDescriptionSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<StepperDescriptionSlot>;
}

export type StepperDescriptionProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, StepperDescriptionOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Stepper: import('../../core').ComponentThemeConfig<StepperProps>;
    StepperItem: import('../../core').ComponentThemeConfig<StepperItemProps, StepperItemSlot>;
    StepperTitle: import('../../core').ComponentThemeConfig<StepperTitleProps>;
    StepperDescription: import('../../core').ComponentThemeConfig<StepperDescriptionProps>;
  }
}
