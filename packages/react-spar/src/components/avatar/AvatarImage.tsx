import type { ElementType } from 'react';
import { AvatarImage as SparAvatarImage, type AvatarImageProps as SparAvatarImageProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AvatarImageBase } from './base';
import { useAvatarOwnContext } from './context';
import type { AvatarImageProps } from './types';

export const AvatarImage = <T extends ElementType = 'img'>(props: AvatarImageProps<T>) => {
  const theme = useComponentTheme('AvatarImage');
  const { named } = useAvatarOwnContext('Avatar.Image');

  const { rootAttrs, rest } = composeRootAttrs(AvatarImageBase, props as AvatarImageProps<'img'>, theme);
  const { alt, ref, ...sparProps } = rest;

  return <SparAvatarImage {...(sparProps as SparAvatarImageProps<'img'>)} {...rootAttrs} alt={named ? '' : alt} ref={ref} />;
};

AvatarImage.displayName = 'Avatar.Image';
