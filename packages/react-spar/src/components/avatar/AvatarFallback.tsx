import type { ElementType } from 'react';
import { AvatarFallback as SparAvatarFallback, type AvatarFallbackProps as SparAvatarFallbackProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { AvatarFallbackBase } from './base';
import { AvatarIcon } from './AvatarIcon';
import { useAvatarOwnContext } from './context';
import type { AvatarFallbackProps } from './types';

export const AvatarFallback = <T extends ElementType = 'span'>(props: AvatarFallbackProps<T>) => {
  const theme = useComponentTheme('AvatarFallback');
  const { named } = useAvatarOwnContext('Avatar.Fallback');

  const { rootAttrs, rest } = composeRootAttrs(AvatarFallbackBase, props as AvatarFallbackProps<'span'>, theme, {
    stateAttrs: () => ({ 'data-icon': isRenderableNode(props.children) ? undefined : '' }),
  });
  const { children, ref, ...sparProps } = rest;

  const content = isRenderableNode(children) ? (
    children
  ) : (
    <AvatarIcon
      {...buildSlotAttrs(AvatarFallbackBase.getSlotProps('icon'), 'icon', {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        instanceSlotProps: props.slotProps,
        instanceClassNames: props.classNames,
      })}
    />
  );

  return (
    <SparAvatarFallback {...(named ? { 'aria-hidden': true } : undefined)} {...(sparProps as SparAvatarFallbackProps<'span'>)} {...rootAttrs} ref={ref}>
      {content}
    </SparAvatarFallback>
  );
};

AvatarFallback.displayName = 'Avatar.Fallback';
