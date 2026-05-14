import { SwitchThumb as SparSwitchThumb } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchThumbProps } from './types';

export const SwitchThumb = (props: SwitchThumbProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps } = useSwitchOwnContext('Switch.Thumb');
  const { className, children, ref, ...spar } = props;

  const thumbAttrs = buildSlotAttrs(SwitchBase.getSlotProps('thumb', { className }), 'thumb', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparSwitchThumb {...spar} {...thumbAttrs} ref={ref}>
      {children}
    </SparSwitchThumb>
  );
};

SwitchThumb.displayName = 'Switch.Thumb';
