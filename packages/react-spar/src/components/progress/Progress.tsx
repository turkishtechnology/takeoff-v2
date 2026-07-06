import type { ElementType } from 'react';
import { useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ProgressBase } from './base';
import { ProgressProvider } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_ARIA_LABEL, DEFAULT_MAX, DEFAULT_MIN, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import { ProgressIndicator } from './ProgressIndicator';
import type { ProgressProps } from './types';

export const Progress = <T extends ElementType = 'div'>(props: ProgressProps<T>) => {
  const theme = useComponentTheme('Progress');
  // Composing inside a Field wires the accessible name and disabled state for
  // free: Field.Label always renders with the context labelId, and the field's
  // disabled flag propagates unless the instance prop overrides it.
  const field = useOptionalFieldContext();

  const { rootAttrs, rest } = composeRootAttrs(ProgressBase, props as ProgressProps<'div'>, theme, {
    stateAttrs: ({
      appearance = DEFAULT_APPEARANCE,
      size = DEFAULT_SIZE,
      variant = DEFAULT_VARIANT,
      disabled = field?.disabled ?? false,
    }) => ({
      'data-type': appearance,
      'data-size': size,
      'data-variant': variant,
      'data-disabled': disabled ? '' : undefined,
    }),
  });

  const {
    value: rawValue,
    min: rawMin = DEFAULT_MIN,
    max: rawMax = DEFAULT_MAX,
    appearance = DEFAULT_APPEARANCE,
    disabled = field?.disabled ?? false,
    // Consumed only as a root data-* hook above; destructured so the <div>
    // doesn't receive unknown DOM attributes.
    size: _size,
    variant: _variant,
    as,
    children,
    ref,
    ...nativeProps
  } = rest;

  const min = Number.isFinite(rawMin) ? rawMin : DEFAULT_MIN;
  const max = Number.isFinite(rawMax) && rawMax > min ? rawMax : min + DEFAULT_MAX;
  const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? Math.min(Math.max(rawValue, min), max) : min;

  const effectiveLabelledBy = nativeProps['aria-labelledby'] ?? field?.labelId;
  const accessibilityAttrs = {
    'role': nativeProps.role ?? 'progressbar',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-labelledby': effectiveLabelledBy,
    'aria-label': nativeProps['aria-label'] ?? (effectiveLabelledBy ? undefined : DEFAULT_ARIA_LABEL),
    'aria-disabled': disabled || undefined,
  };

  const Component = (as ?? 'div') as ElementType;

  return (
    <ProgressProvider value={{ value, min, max, appearance }}>
      <Component {...nativeProps} {...accessibilityAttrs} {...rootAttrs} ref={ref}>
        {children ?? <ProgressIndicator />}
      </Component>
    </ProgressProvider>
  );
};

Progress.displayName = 'Progress';
