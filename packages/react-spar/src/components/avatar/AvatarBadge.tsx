import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';
import { Badge } from '../badge';

import { AvatarBadgeBase } from './base';
import { useAvatarOwnContext } from './context';
import { DEFAULT_BADGE_VARIANT } from './defaults';
import type { AvatarBadgeProps } from './types';

export const AvatarBadge = (props: AvatarBadgeProps) => {
  const theme = useComponentTheme('AvatarBadge');
  useAvatarOwnContext('Avatar.Badge');

  const { rootAttrs, rest } = composeRootAttrs(AvatarBadgeBase, props, theme);
  const { variant = DEFAULT_BADGE_VARIANT, children, ref, ...nativeProps } = rest;
  const { 'data-slot': _slot, ...badgeAttrs } = rootAttrs;
  const labelled = Boolean(nativeProps['aria-label'] || nativeProps['aria-labelledby']);
  const hasContent = isRenderableNode(children);

  return (
    <Badge
      {...(labelled ? { role: 'img' } : { 'aria-hidden': true })}
      {...nativeProps}
      {...badgeAttrs}
      data-avatar-badge=""
      variant={variant}
      dot={!hasContent}
      size="small"
      rounded
      ref={ref}
    >
      {children}
    </Badge>
  );
};

AvatarBadge.displayName = 'Avatar.Badge';
