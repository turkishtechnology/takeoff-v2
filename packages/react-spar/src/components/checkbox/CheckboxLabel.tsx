import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxLabelProps } from './types';

export const CheckboxLabel = (props: CheckboxLabelProps) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps, required } = useCheckboxOwnContext('Checkbox.Label');
  const { className, children, ref, ...rest } = props;

  const labelAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('label', { className }), 'label', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <span {...rest} {...labelAttrs} ref={ref}>
      {children}
      {required && (
        <span className="tk-checkbox-asterisk" aria-hidden="true">
          *
        </span>
      )}
    </span>
  );
};

CheckboxLabel.displayName = 'Checkbox.Label';
