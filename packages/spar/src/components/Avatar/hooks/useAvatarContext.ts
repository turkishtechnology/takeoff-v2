import { createContext, useContext } from 'react';
import type { AvatarContextValue } from '../types';

export const AvatarContext = createContext<AvatarContextValue | null>(null);

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('Avatar components must be used within an Avatar');
  }
  return context;
};
