import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimePickerFooterBase } from './base';
import { useTimePickerContext } from './context';
import type { TimePickerFooterProps, TimePickerFooterSlot } from './types';

export const TimePickerFooter = <T extends ElementType = 'div'>(props: TimePickerFooterProps<T>) => {
  const theme = useComponentTheme('TimePickerFooter');
  useTimePickerContext();

  const { rootAttrs, rest } = composeRootAttrs<TimePickerFooterProps, TimePickerFooterSlot>(TimePickerFooterBase, props as TimePickerFooterProps<'div'>, theme);

  const { as, children, ref, ...footerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...footerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

TimePickerFooter.displayName = 'TimePicker.Footer';
