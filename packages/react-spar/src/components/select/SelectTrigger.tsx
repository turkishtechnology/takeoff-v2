import type { ElementType } from 'react';
import { SelectTrigger as SparSelectTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectTriggerBase } from './base';
import { useSelectOwnContext } from './context';
import type { SelectTriggerProps } from './types';

export const SelectTrigger = <T extends ElementType = 'button'>(props: SelectTriggerProps<T>) => {
  const theme = useComponentTheme('SelectTrigger');
  const { size, invalid } = useSelectOwnContext('Select.Trigger');

  // The trigger is what consumers visually see — mirror the root's size and
  // invalid state here so styling can hook off the interactive element
  // directly without crawling up to the (often headless) root.
  const { rootAttrs, rest } = composeRootAttrs(SelectTriggerBase, props as SelectTriggerProps<'button'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
      'data-invalid': invalid ? '' : undefined,
    }),
  });

  const { children, ref, ...spar } = rest;

  return (
    <SparSelectTrigger {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectTrigger>
  );
};

SelectTrigger.displayName = 'Select.Trigger';
