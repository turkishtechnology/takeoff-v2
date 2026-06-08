import type { ElementType } from 'react';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxLabelProps } from './types';

export const CheckboxLabel = <T extends ElementType = 'span'>(props: CheckboxLabelProps<T>) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps } = useCheckboxOwnContext('Checkbox.Label');
  const { as, className, children, ref, ...rest } = props as CheckboxLabelProps<'span'>;

  const labelAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('label', { className }), 'label', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...rest} {...labelAttrs} ref={ref}>
      {children}
    </Component>
  );
};

CheckboxLabel.displayName = 'Checkbox.Label';
