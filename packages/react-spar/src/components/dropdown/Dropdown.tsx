import { DropdownMenu as SparDropdownMenu } from '@turkish-technology/spar';

import { useComponentTheme } from '../../provider';

import { DropdownProvider } from './context';
import { DEFAULT_CONTENT_WIDTH, DEFAULT_SIZE } from './defaults';
import type { DropdownProps } from './types';

export const Dropdown = (props: DropdownProps) => {
  const theme = useComponentTheme('Dropdown');
  const merged = { ...theme?.defaultProps, ...props };

  const { size = DEFAULT_SIZE, contentWidth = DEFAULT_CONTENT_WIDTH, children, ...sparProps } = merged;

  return (
    <DropdownProvider value={{ size, contentWidth }}>
      <SparDropdownMenu {...sparProps}>{children}</SparDropdownMenu>
    </DropdownProvider>
  );
};

Dropdown.displayName = 'Dropdown';
