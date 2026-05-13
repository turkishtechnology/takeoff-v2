import { Tooltip as SparTooltip } from '@turkish-technology/spar';

import type { TooltipProps } from './types';

// Root is a pure state-management context provider and renders no DOM element,
// so composeRootAttrs / useComponentTheme are intentionally skipped here.
export const Tooltip = ({ children, open, defaultOpen, onOpenChange, delay, hideDelay, disabled }: TooltipProps) => {
  return (
    <SparTooltip open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delay={delay} hideDelay={hideDelay} disabled={disabled}>
      {children}
    </SparTooltip>
  );
};

Tooltip.displayName = 'Tooltip';
