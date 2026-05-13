import { createSafeContext } from '../../hooks';

import type { DrawerPlacement } from './types';

export interface DrawerOwnContextValue {
  placement: DrawerPlacement;
  dismissable: boolean;
}

export const [DrawerProvider, useDrawerOwnContext] = createSafeContext<DrawerOwnContextValue>('DrawerProvider');
