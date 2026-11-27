import { Avatar as AvatarRoot } from './Avatar';
import { AvatarBadge } from './AvatarBadge';
import { AvatarFallback } from './AvatarFallback';
import { AvatarGroup } from './AvatarGroup';
import { AvatarImage } from './AvatarImage';

const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Badge: AvatarBadge,
  Group: AvatarGroup,
});

export { Avatar };

export type {
  AvatarAppearance,
  AvatarBadgeProps,
  AvatarFallbackProps,
  AvatarGroupProps,
  AvatarImageLoadingStatus,
  AvatarImageProps,
  AvatarProps,
  AvatarSize,
  AvatarVariant,
} from './types';
