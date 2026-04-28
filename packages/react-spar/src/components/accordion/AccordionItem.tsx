import { AccordionItem as SparAccordionItem, type AccordionItemProps as SparAccordionItemProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = (props: AccordionItemProps) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionVariant('Accordion.Item');
  const merged = AccordionItemBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, itemKey, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(AccordionItemBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionItem {...(rest as SparAccordionItemProps)} itemKey={itemKey} {...rootAttrs} data-type={type} data-mode={mode} data-size={size}>
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
