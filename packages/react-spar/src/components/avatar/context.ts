import { createContext, useContext } from 'react';

import { createSafeContext } from '../../hooks';

import type { AvatarSize } from './types';

export interface AvatarOwnContextValue {
  /** The root has a `name`, so inner parts are hidden from assistive technology. */
  named: boolean;
}

export const [AvatarOwnProvider, useAvatarOwnContext] = createSafeContext<AvatarOwnContextValue>('Avatar');

export interface AvatarGroupContextValue {
  size: AvatarSize;
  rounded: boolean;
  compact: boolean;
}

/** Optional: an Avatar works on its own and only reads group defaults when inside one. */
export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);
AvatarGroupContext.displayName = 'AvatarGroup';

export const useAvatarGroupContext = () => useContext(AvatarGroupContext);
