import { SwitchControl as SparSwitchControl } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchControlProps } from './types';

export const SwitchControl = (props: SwitchControlProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps } = useSwitchOwnContext('Switch.Control');
  const { className, children, ref, ...spar } = props;

  const controlAttrs = buildSlotAttrs(SwitchBase.getSlotProps('control', { className }), 'control', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparSwitchControl {...spar} {...controlAttrs} ref={ref}>
      {children}
    </SparSwitchControl>
  );
};

SwitchControl.displayName = 'Switch.Control';
