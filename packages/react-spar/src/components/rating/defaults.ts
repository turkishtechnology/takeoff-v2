import type { RatingType } from './types';

export const DEFAULT_MAX = 5;
export const DEFAULT_TYPE: RatingType = 'star';
export const DEFAULT_ITEM_LABEL = '{value} of {max}';
// Number items map their score onto Core's five-step red-to-green scale.
export const LEVEL_COUNT = 5;
