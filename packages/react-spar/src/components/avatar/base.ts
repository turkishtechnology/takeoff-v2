import { createComponentBase } from '../../core';

import type {
  AvatarBadgeProps,
  AvatarBadgeSlot,
  AvatarFallbackProps,
  AvatarFallbackSlot,
  AvatarGroupProps,
  AvatarGroupSlot,
  AvatarImageProps,
  AvatarImageSlot,
  AvatarProps,
  AvatarSlot,
} from './types';

// @archetype inherited — wraps SparAvatar (owns the image loading status)
export const AvatarBase = createComponentBase<AvatarProps, AvatarSlot>({
  name: 'Avatar',
  slots: ['root'] as const,
  classes: { root: 'tk-avatar' },
});

// @archetype inherited — wraps SparAvatarImage
export const AvatarImageBase = createComponentBase<AvatarImageProps, AvatarImageSlot>({
  name: 'AvatarImage',
  slots: ['root'] as const,
  classes: { root: 'tk-avatar-image' },
});

// @archetype inherited — wraps SparAvatarFallback; `icon` is the internal default glyph
export const AvatarFallbackBase = createComponentBase<AvatarFallbackProps, AvatarFallbackSlot>({
  name: 'AvatarFallback',
  slots: ['root', 'icon'] as const,
  classes: { root: 'tk-avatar-fallback', icon: 'tk-avatar-icon' },
});

// @archetype react-enhancement — no Spar part; renders a Takeoff Badge
export const AvatarBadgeBase = createComponentBase<AvatarBadgeProps, AvatarBadgeSlot>({
  name: 'AvatarBadge',
  slots: ['root'] as const,
  classes: { root: 'tk-avatar-badge' },
});

// @archetype react-enhancement — no Spar primitive for grouping; `overflow` is the internal +N avatar
export const AvatarGroupBase = createComponentBase<AvatarGroupProps, AvatarGroupSlot>({
  name: 'AvatarGroup',
  slots: ['root', 'overflow'] as const,
  classes: { root: 'tk-avatar-group', overflow: 'tk-avatar-group-overflow' },
});
