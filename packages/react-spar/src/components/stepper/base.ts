import { createComponentBase } from '../../core';

import type { StepperDescriptionProps, StepperItemProps, StepperItemSlot, StepperProps, StepperTitleProps } from './types';

// @archetype react-enhancement — Spar ships no Stepper primitive (same
// no-upstream situation as Table and Input.Chips). The wrapper owns the
// active-step state, the step registry, and the DOM anatomy; if a Spar
// Stepper primitive lands upstream, these parts must migrate to Inherited
// in the same release (composition-archetype rule 3).
//
// One-off data-* justification (data-attribute-vocabulary.md rule 10):
// - `data-linear` / `data-reverse` (Semantic, root): presence flags for the
//   linear-progression and flipped-layout treatments, consumed by the recipe.
export const StepperBase = createComponentBase<StepperProps, 'root'>({
  name: 'Stepper',
  slots: ['root'] as const,
  classes: { root: 'tk-stepper' },
});

// @archetype react-enhancement — no upstream part. The <li> is the position
// anchor for the rail; the inner `trigger` <button> owns interaction and the
// accessible name (from Title/Description text). `rail` and `indicator` are
// decorative internal slots (aria-hidden); the indicator's default glyph is
// status-driven and the empty basic-mode indicator is painted by the recipe.
export const StepperItemBase = createComponentBase<StepperItemProps, StepperItemSlot>({
  name: 'StepperItem',
  slots: ['root', 'trigger', 'rail', 'indicator', 'content'] as const,
  classes: {
    root: 'tk-stepper-item',
    trigger: 'tk-stepper-trigger',
    rail: 'tk-stepper-rail',
    indicator: 'tk-stepper-indicator',
    content: 'tk-stepper-content',
  },
});

// @archetype react-enhancement — no upstream part; canonical step title node.
export const StepperTitleBase = createComponentBase<StepperTitleProps, 'root'>({
  name: 'StepperTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-stepper-title' },
});

// @archetype react-enhancement — no upstream part; canonical step description node.
export const StepperDescriptionBase = createComponentBase<StepperDescriptionProps, 'root'>({
  name: 'StepperDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-stepper-description' },
});
