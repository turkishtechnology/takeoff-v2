import { Tooltip as SparTooltip } from '@turkish-technology/spar';

import type { TooltipProps } from './types';

export const Tooltip = ({ children, ...sparProps }: TooltipProps) => {
  return <SparTooltip {...sparProps}>{children}</SparTooltip>;
};

Tooltip.displayName = 'Tooltip';
