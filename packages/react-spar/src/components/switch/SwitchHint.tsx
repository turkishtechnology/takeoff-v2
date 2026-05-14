import type { ReactNode } from 'react';

import { SwitchHint as SparSwitchHint } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { PlaceholderInfo } from '../../icons';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchHintProps } from './types';

// Keep the default icon inline so Switch does not depend on an external icon font.
// TODO(takeoff-icons): Replace with the official Takeoff icon.
const DEFAULT_HINT_ICON: ReactNode = <PlaceholderInfo />;

export const SwitchHint = (props: SwitchHintProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps } = useSwitchOwnContext('Switch.Hint');
  const { className, icon = DEFAULT_HINT_ICON, children, ref, ...spar } = props;

  const hintAttrs = buildSlotAttrs(SwitchBase.getSlotProps('hint', { className }), 'hint', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparSwitchHint {...spar} {...hintAttrs} ref={ref}>
      {icon != null && (
        <span className="tk-toggle-hint-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </SparSwitchHint>
  );
};

SwitchHint.displayName = 'Switch.Hint';
