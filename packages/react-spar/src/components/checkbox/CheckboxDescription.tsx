import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxDescriptionProps } from './types';

export const CheckboxDescription = (props: CheckboxDescriptionProps) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps } = useCheckboxOwnContext('Checkbox.Description');
  const { className, children, ref, ...rest } = props;

  const descriptionAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('description', { className }), 'description', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <span {...rest} {...descriptionAttrs} ref={ref}>
      {children}
    </span>
  );
};

CheckboxDescription.displayName = 'Checkbox.Description';
