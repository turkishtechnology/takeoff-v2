import { TooltipProvider as SparTooltipProvider } from '@turkish-technology/spar';

import type { TooltipProviderProps } from './types';

// State-only: renders no DOM, only provides delay/skipDelay context via Spar.
// composeRootAttrs / useComponentTheme are intentionally skipped — there is no
// rendered element to receive className / data-* / slotProps.
export const TooltipProvider = ({ children, delayDuration, skipDelayDuration, disableHoverableContent }: TooltipProviderProps) => {
  return (
    <SparTooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} disableHoverableContent={disableHoverableContent}>
      {children}
    </SparTooltipProvider>
  );
};

TooltipProvider.displayName = 'Tooltip.Provider';
