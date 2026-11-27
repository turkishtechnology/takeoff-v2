import { Avatar as AvatarRoot } from './Avatar';
import { AvatarImage } from './AvatarImage';
import { AvatarFallback } from './AvatarFallback';
export { useAvatarContext } from './hooks';

const Avatar = AvatarRoot as typeof AvatarRoot & {
  Root: typeof AvatarRoot;
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
};

Avatar.Root = AvatarRoot;
Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback };

export type { AvatarProps, AvatarImageProps, AvatarFallbackProps, AvatarImageLoadingStatus, AvatarContextValue } from './types';
