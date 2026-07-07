import type { ElementType } from 'react';
import { useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { isDevelopment } from '../../utils';

import { ProgressBase } from './base';
import { ProgressProvider } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_ARIA_LABEL, DEFAULT_MAX, DEFAULT_MIN, DEFAULT_RANGE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import { ProgressTrack } from './ProgressTrack';
import type { ProgressProps } from './types';

// Resolves the numeric surface in one place so the root data-* hooks, the
// ARIA attributes, and the context can never disagree: non-finite bounds fall
// back to the defaults, a max at or below min falls back to a DEFAULT_RANGE
// span above min, and the value clamps into [min, max] (min when absent).
const resolveRange = ({ value: rawValue, min: rawMin = DEFAULT_MIN, max: rawMax = DEFAULT_MAX }: Pick<ProgressProps<'div'>, 'value' | 'min' | 'max'>) => {
  const min = Number.isFinite(rawMin) ? rawMin : DEFAULT_MIN;
  const max = Number.isFinite(rawMax) && rawMax > min ? rawMax : min + DEFAULT_RANGE;
  const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? Math.min(Math.max(rawValue, min), max) : min;
  return { min, max, value };
};

// Dev-only: dedupes the inverted-range warning per distinct message so a
// progress whose value animates (re-rendering every tick) can't flood the
// console — while a second instance with a different broken range still gets
// its own warning.
const warnedRanges = new Set<string>();

export const Progress = <T extends ElementType = 'div'>(props: ProgressProps<T>) => {
  const theme = useComponentTheme('Progress');
  // Composing inside a Field wires the accessible name and disabled state for
  // free: Field.Label always renders with the context labelId, and the field's
  // disabled flag propagates unless the instance prop overrides it.
  const field = useOptionalFieldContext();

  // Companion to resolveRange for the enumerable state; lives in the
  // component because the disabled fallback reads the Field context. Both the
  // data-* hooks and the ARIA surface below resolve through here so the two
  // cannot drift apart.
  const resolveState = ({
    indeterminate = false,
    appearance = DEFAULT_APPEARANCE,
    size = DEFAULT_SIZE,
    variant = DEFAULT_VARIANT,
    disabled = field?.disabled ?? false,
  }: Pick<ProgressProps<'div'>, 'indeterminate' | 'appearance' | 'size' | 'variant' | 'disabled'>) => ({ indeterminate, appearance, size, variant, disabled });

  const { rootAttrs, rest } = composeRootAttrs(ProgressBase, props as ProgressProps<'div'>, theme, {
    stateAttrs: merged => {
      const { indeterminate, appearance, size, variant, disabled } = resolveState(merged);
      const { max, value } = resolveRange(merged);
      return {
        'data-type': appearance,
        'data-size': size,
        'data-variant': variant,
        'data-disabled': disabled ? '' : undefined,
        'data-indeterminate': indeterminate ? '' : undefined,
        // Styling hook for the finished state (e.g. a success fill at 100%);
        // meaningless while indeterminate, so dropped alongside the value.
        'data-complete': !indeterminate && value === max ? '' : undefined,
      };
    },
  });

  const {
    // Consumed through resolveState/resolveRange (and as root data-* hooks
    // above); destructured so the <div> doesn't receive unknown DOM
    // attributes.
    value: _value,
    min: _min,
    max: rawMax,
    indeterminate: _indeterminate,
    appearance: _appearance,
    disabled: _disabled,
    size: _size,
    variant: _variant,
    as,
    children,
    ref,
    ...nativeProps
  } = rest;

  const { indeterminate, appearance, disabled } = resolveState(rest);
  const { min, max, value } = resolveRange(rest);

  if (isDevelopment() && typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax <= min) {
    const message = `[Progress] \`max\` (${rawMax}) must be greater than \`min\` (${min}); falling back to ${max}.`;
    if (!warnedRanges.has(message)) {
      warnedRanges.add(message);
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  }

  const effectiveLabelledBy = nativeProps['aria-labelledby'] ?? field?.labelId;
  const accessibilityAttrs = {
    'role': nativeProps.role ?? 'progressbar',
    'aria-valuemin': min,
    'aria-valuemax': max,
    // Per the progressbar pattern, an indeterminate bar exposes no
    // aria-valuenow — assistive tech then announces it as busy rather than
    // stuck at a bogus percentage.
    'aria-valuenow': indeterminate ? undefined : value,
    'aria-labelledby': effectiveLabelledBy,
    'aria-label': nativeProps['aria-label'] ?? (effectiveLabelledBy ? undefined : DEFAULT_ARIA_LABEL),
    'aria-disabled': disabled || undefined,
  };

  const Component = (as ?? 'div') as ElementType;

  return (
    <ProgressProvider value={{ value, min, max, appearance, indeterminate }}>
      <Component {...nativeProps} {...accessibilityAttrs} {...rootAttrs} ref={ref}>
        {/* Same default anatomy for both appearances; the track renders the
            rail its appearance calls for and fills itself with the default
            indicator. */}
        {children ?? <ProgressTrack />}
      </Component>
    </ProgressProvider>
  );
};

Progress.displayName = 'Progress';
