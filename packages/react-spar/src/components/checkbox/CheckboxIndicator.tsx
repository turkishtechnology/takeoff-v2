import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxIndicatorProps } from './types';

export const CheckboxIndicator = (props: CheckboxIndicatorProps) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps } = useCheckboxOwnContext('Checkbox.Indicator');
  const { className, children, ref, ...rest } = props;

  const indicatorAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('indicator', { className }), 'indicator', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <span {...rest} {...indicatorAttrs} ref={ref}>
      {children}
    </span>
  );
};

CheckboxIndicator.displayName = 'Checkbox.Indicator';
