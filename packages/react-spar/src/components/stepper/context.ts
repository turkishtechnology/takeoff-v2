import { createSafeContext } from '../../hooks';

import type { StepperMode, StepperStepClickDetail, StepperStepStatus } from './types';

/**
 * Per-step behavior facts the root needs for selection gating. Registered by
 * each item so `canSelectStep` can consult any step — in particular the
 * currently active one for the linear next-step rule.
 */
export interface StepperStepMeta {
  error: boolean;
  disabled: boolean;
  isClickable: boolean;
}

export interface StepperStepStatusOptions {
  index: number;
  error: boolean;
  disabled: boolean;
}

export interface StepperContextValue {
  /** Resolved active step index. */
  active: number;
  mode: StepperMode;
  /** Resolves a step's mutually exclusive visual/behavior status. */
  getStepStatus: (options: StepperStepStatusOptions) => StepperStepStatus;
  /**
   * Registers a step's behavior facts under its index. Returns the matching
   * unregister cleanup for effect use.
   */
  registerStep: (index: number, meta: StepperStepMeta) => () => void;
  /**
   * Whether pressing the step at `index` may change the active step. The
   * registry fills in effects, so pre-mount callers (first paint, SSR) pass
   * their own behavior facts as `selfMeta`; neighbor lookups under `linear`
   * resolve optimistically until the registry catches up.
   */
  canSelectStep: (index: number, selfMeta?: StepperStepMeta) => boolean;
  /** Activates the step at `index` when selection gating allows it. */
  selectStep: (index: number) => void;
  /** Forwards a step press to the root `onStepClick` callback. */
  emitStepClick: (detail: StepperStepClickDetail) => void;
}

export const [StepperProvider, useStepperContext] = createSafeContext<StepperContextValue>('StepperProvider');

/**
 * Position handed to each `Stepper.Item` by the root, derived from the item's
 * placement in the root's children.
 */
export interface StepperItemIndexContextValue {
  index: number;
}

export const [StepperItemIndexProvider, useStepperItemIndex] = createSafeContext<StepperItemIndexContextValue>('StepperItemIndexProvider');
