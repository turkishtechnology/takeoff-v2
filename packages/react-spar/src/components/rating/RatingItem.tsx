import type { ElementType } from 'react';
import { RadioItem as SparRadioItem, useRadioContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { RatingItemBase } from './base';
import { useRatingContext } from './context';
import { LEVEL_COUNT } from './defaults';
import { RatingGlyph } from './glyphs';
import type { RatingFill, RatingItemProps } from './types';

const resolveFill = (score: number, itemValue: number): RatingFill => {
  if (score >= itemValue) return 'full';
  return score >= itemValue - 0.5 ? 'half' : 'empty';
};

// Buckets a score over `max` into Core's five-step colour scale.
const resolveLevel = (itemValue: number, max: number): number => Math.min(LEVEL_COUNT, Math.max(1, Math.ceil((itemValue * LEVEL_COUNT) / max)));

const padScore = (score: number): string => String(score).padStart(2, '0');

export const RatingItem = <T extends ElementType = 'span'>(props: RatingItemProps<T>) => {
  const theme = useComponentTheme('RatingItem');
  const { type, max, showValue, itemLabel } = useRatingContext('Rating.Item');
  // The group value lives in Spar; reading it back keeps a single source of
  // truth for controlled and uncontrolled roots alike.
  const group = useRadioContext();
  const { value: itemValue } = props as RatingItemProps<'span'>;

  const score = Number(group.value);
  const fill = resolveFill(Number.isFinite(score) ? score : 0, itemValue);
  const isChecked = group.value === String(itemValue);

  const { rootAttrs, rest } = composeRootAttrs(RatingItemBase, props as RatingItemProps<'span'>, theme, {
    stateAttrs: () => ({
      'data-fill': fill,
      'data-level': type === 'number' ? String(resolveLevel(itemValue, max)) : undefined,
    }),
  });

  const { 'value': _value, children, 'aria-label': ariaLabel, ref, ...sparProps } = rest;

  const slotOptions = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };

  const content =
    typeof children === 'function'
      ? children({ value: itemValue, fill, isChecked })
      : (children ?? (
          <>
            <span {...buildSlotAttrs(RatingItemBase.getSlotProps('icon'), 'icon', slotOptions)} aria-hidden="true">
              {type === 'number' ? padScore(itemValue) : <RatingGlyph type={type} />}
            </span>
            {showValue && type !== 'number' && (
              <span {...buildSlotAttrs(RatingItemBase.getSlotProps('value'), 'value', slotOptions)} aria-hidden="true">
                {padScore(itemValue)}
              </span>
            )}
          </>
        ));

  return (
    <SparRadioItem {...sparProps} {...rootAttrs} value={String(itemValue)} aria-label={ariaLabel ?? formatLabel(itemLabel, { value: itemValue, max })} ref={ref}>
      {content}
    </SparRadioItem>
  );
};

RatingItem.displayName = 'Rating.Item';
