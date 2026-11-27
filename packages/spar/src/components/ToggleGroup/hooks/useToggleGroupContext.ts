import { createContext, useContext } from 'react';
import type { ToggleGroupContextValue } from '../types';

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

/**
 * Hook to access ToggleGroup context. Must be used within a ToggleGroup.
 *
 * @throws Error if used outside of a ToggleGroup
 */
export const useToggleGroupContext = (): ToggleGroupContextValue => {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup');
  }
  return context;
};
