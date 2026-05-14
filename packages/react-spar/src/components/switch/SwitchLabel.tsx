import { SwitchLabel as SparSwitchLabel, useSwitchContext } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchLabelProps } from './types';

export const SwitchLabel = (props: SwitchLabelProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps } = useSwitchOwnContext('Switch.Label');
  const { required } = useSwitchContext();
  const { className, children, ref, ...spar } = props;

  const labelAttrs = buildSlotAttrs(SwitchBase.getSlotProps('label', { className }), 'label', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparSwitchLabel {...spar} {...labelAttrs} ref={ref}>
      {children}
      {required && (
        <span className="tk-toggle-asterisk" aria-hidden="true">
          *
        </span>
      )}
    </SparSwitchLabel>
  );
};

SwitchLabel.displayName = 'Switch.Label';
