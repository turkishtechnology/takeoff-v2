import type { ElementType } from 'react';
import { Radio as SparRadio } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RatingBase } from './base';
import { RatingProvider } from './context';
import { DEFAULT_ITEM_LABEL, DEFAULT_MAX, DEFAULT_TYPE } from './defaults';
import { RatingItem } from './RatingItem';
import type { RatingProps } from './types';

// Spar's radiogroup is string-valued; the score is a number.
const toRadioValue = (score: number | undefined): string | undefined => (score === undefined ? undefined : String(score));

const resolveMax = (max: number | undefined): number => (max !== undefined && Number.isInteger(max) && max > 0 ? max : DEFAULT_MAX);

export const Rating = <T extends ElementType = 'div'>(props: RatingProps<T>) => {
  const theme = useComponentTheme('Rating');

  // Spar emits the state hooks on the radiogroup itself (`data-disabled`,
  // `data-readonly`, `data-invalid`, `data-required`, `data-orientation`) and
  // resolves them through Field context; the wrapper only adds the glyph type.
  const { rootAttrs, rest } = composeRootAttrs(RatingBase, props as RatingProps<'div'>, theme, {
    stateAttrs: ({ type = DEFAULT_TYPE }) => ({ 'data-type': type }),
  });

  const {
    value,
    defaultValue,
    onValueChange,
    max: rawMax,
    type = DEFAULT_TYPE,
    showValue = false,
    itemLabel,
    // Spar reads `onChange` as its value callback; a native one must not
    // reach it and replace the numeric `onValueChange` wiring.
    onChange: _onChange,
    children,
    ref,
    ...sparProps
  } = rest;

  const max = resolveMax(rawMax);

  return (
    <RatingProvider value={{ type, max, showValue, itemLabel: itemLabel || DEFAULT_ITEM_LABEL }}>
      <SparRadio
        {...sparProps}
        {...rootAttrs}
        orientation="horizontal"
        value={toRadioValue(value)}
        defaultValue={toRadioValue(defaultValue)}
        onChange={next => onValueChange?.(Number(next))}
        ref={ref}
      >
        {children ?? Array.from({ length: max }, (_, index) => <RatingItem key={index + 1} value={index + 1} />)}
      </SparRadio>
    </RatingProvider>
  );
};

Rating.displayName = 'Rating';
