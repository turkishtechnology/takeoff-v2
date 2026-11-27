import { createSafeContext } from '../../hooks';

import type { RatingType } from './types';

export interface RatingContextValue {
  type: RatingType;
  max: number;
  showValue: boolean;
  itemLabel: string;
}

export const [RatingProvider, useRatingContext] = createSafeContext<RatingContextValue>('RatingProvider');
