import { buildSlotAttrs } from '../../core';
import { PlaceholderCheck, PlaceholderRemove } from '../../icons';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxIconProps } from './types';

export const CheckboxIcon = (props: CheckboxIconProps) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps, checked, indeterminate } = useCheckboxOwnContext('Checkbox.Icon');
  const { className, children, ref, ...rest } = props;

  const iconAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('icon', { className }), 'icon', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const resolvedChildren = typeof children === 'function' ? children({ checked, indeterminate }) : (children ?? (indeterminate ? <PlaceholderRemove /> : <PlaceholderCheck />));

  return (
    <span {...rest} {...iconAttrs} aria-hidden ref={ref}>
      {resolvedChildren}
    </span>
  );
};

CheckboxIcon.displayName = 'Checkbox.Icon';
