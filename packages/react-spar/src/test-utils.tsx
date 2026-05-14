import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TakeoffSparProvider } from './provider';

const AllProviders = ({ children }: { children: React.ReactNode }) => <TakeoffSparProvider>{children}</TakeoffSparProvider>;

export const renderWithProvider = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllProviders, ...options });

export { render } from '@testing-library/react';
export { screen, within } from '@testing-library/dom';
