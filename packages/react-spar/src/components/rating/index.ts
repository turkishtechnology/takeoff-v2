import { Rating as RatingRoot } from './Rating';
import { RatingItem } from './RatingItem';

const Rating = Object.assign(RatingRoot, {
  Item: RatingItem,
});

export { Rating };

export type { RatingFill, RatingItemProps, RatingItemRenderProps, RatingItemSlot, RatingProps, RatingSlot, RatingType } from './types';
