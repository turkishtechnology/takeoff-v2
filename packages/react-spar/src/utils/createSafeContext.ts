import { createContext, createElement, useContext, type ReactNode } from 'react';

export interface SafeContextProviderProps<T> {
  value: T;
  children: ReactNode;
}

export type SafeContextProvider<T> = (props: SafeContextProviderProps<T>) => ReactNode;
export type SafeContextHook<T> = (consumerName?: string) => T;

/**
 * Creates a React context paired with a consumer hook that throws a descriptive
 * error when used outside the matching Provider. Value type must be non-null;
 * null is reserved as the "no provider" sentinel.
 */
export function createSafeContext<T>(displayName: string): readonly [SafeContextProvider<T>, SafeContextHook<T>] {
  const Context = createContext<T | null>(null);
  Context.displayName = displayName;

  const Provider: SafeContextProvider<T> = ({ value, children }) => createElement(Context.Provider, { value }, children);
  (Provider as { displayName?: string }).displayName = `${displayName}.Provider`;

  const useSafeContext: SafeContextHook<T> = consumerName => {
    const context = useContext(Context);
    if (context === null) {
      throw new Error(`${consumerName ?? 'Hook'} must be used within ${displayName}`);
    }
    return context;
  };

  return [Provider, useSafeContext] as const;
}
