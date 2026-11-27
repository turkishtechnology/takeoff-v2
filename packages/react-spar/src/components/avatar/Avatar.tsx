import type { ElementType } from 'react';
import { Avatar as SparAvatar } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AvatarBase } from './base';
import { AvatarOwnProvider, useAvatarGroupContext } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { AvatarProps } from './types';

export const Avatar = <T extends ElementType = 'span'>(props: AvatarProps<T>) => {
  const theme = useComponentTheme('Avatar');
  const group = useAvatarGroupContext();
  const own = props as AvatarProps<'span'>;

  // Group defaults sit between the theme and the instance: an avatar's own prop wins.
  const layered: AvatarProps<'span'> = group ? { ...own, size: own.size ?? group.size, rounded: own.rounded ?? group.rounded } : own;

  const { rootAttrs, rest } = composeRootAttrs(AvatarBase, layered, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, rounded, hideShadow }) => ({
      'data-size': size,
      'data-variant': variant,
      'data-type': appearance,
      'data-rounded': rounded ? '' : undefined,
      'data-hide-shadow': hideShadow ? '' : undefined,
    }),
  });

  const { size: _size, variant: _variant, appearance: _appearance, rounded: _rounded, hideShadow: _hideShadow, name, children, ref, ...sparProps } = rest;
  const named = Boolean(name);

  return (
    <AvatarOwnProvider value={{ named }}>
      <SparAvatar {...(named ? { 'role': 'img', 'aria-label': name } : undefined)} {...sparProps} {...rootAttrs} ref={ref}>
        {children}
      </SparAvatar>
    </AvatarOwnProvider>
  );
};

Avatar.displayName = 'Avatar';
