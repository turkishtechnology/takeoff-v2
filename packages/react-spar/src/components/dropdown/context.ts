import { createContext, useContext } from 'react';

import { DEFAULT_CONTENT_WIDTH, DEFAULT_SIZE } from './defaults';
import type { DropdownContentWidth, DropdownSize } from './types';

interface DropdownOwnContextValue {
  size: DropdownSize;
  contentWidth: DropdownContentWidth;
}

const DropdownOwnContext = createContext<DropdownOwnContextValue>({
  size: DEFAULT_SIZE,
  contentWidth: DEFAULT_CONTENT_WIDTH,
});

export const DropdownProvider = DropdownOwnContext.Provider;

export const useDropdownOwnContext = (_componentName: string) => useContext(DropdownOwnContext);
