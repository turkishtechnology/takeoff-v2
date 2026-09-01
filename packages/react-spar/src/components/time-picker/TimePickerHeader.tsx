import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimePickerHeaderBase } from './base';
import { useTimePickerContext } from './context';
import type { TimePickerHeaderProps, TimePickerHeaderSlot } from './types';

export const TimePickerHeader = <T extends ElementType = 'div'>(props: TimePickerHeaderProps<T>) => {
  const theme = useComponentTheme('TimePickerHeader');
  // Read for the boundary error alone: a header outside its root would render
  // as a bare row with none of the panel's spacing or state.
  useTimePickerContext();

  const { rootAttrs, rest } = composeRootAttrs<TimePickerHeaderProps, TimePickerHeaderSlot>(TimePickerHeaderBase, props as TimePickerHeaderProps<'div'>, theme);

  const { as, children, ref, ...headerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...headerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

TimePickerHeader.displayName = 'TimePicker.Header';
