import type { ElementType } from 'react';

import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { createComponentBase } from '../../base/createComponentBase';
import { resolveSlotClass } from '../../customization';
import { useComponentTheme } from '../../provider';

import type { AccordionHeaderProps } from './types';

export const AccordionHeaderBase = createComponentBase<'root'>({ root: '' });

export const AccordionHeader = <T extends ElementType = 'h3'>(props: AccordionHeaderProps<T>) => {
  const theme = useComponentTheme('AccordionHeader');
  const { className, children, ...rest } = { ...theme?.defaultProps, ...props } as AccordionHeaderProps<T>;
  const resolved = resolveSlotClass(AccordionHeaderBase.classes.root, className, theme?.className);

  return (
    <SparAccordionHeader {...(rest as AccordionHeaderProps<T>)} className={resolved || undefined} data-slot="root">
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'AccordionHeader';
