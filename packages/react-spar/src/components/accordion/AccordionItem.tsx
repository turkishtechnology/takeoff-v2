import { useMemo } from 'react';

import { AccordionItem as SparAccordionItem, type AccordionItemProps as SparAccordionItemProps, useAccordionContext } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionItemProps } from './types';

export const AccordionItem = (props: AccordionItemProps) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionVariant('Accordion.Item');
  const accordionContext = useAccordionContext();
  const merged = AccordionItemBase.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, children, itemKey, ...rest } = merged;

  // Mirror Spar's active-index match into a `data-open` flag so the takeoff
  // recipe — which keys all "open" rules off `[data-open]` — stays attached
  // alongside Spar's own `data-state`.
  const isOpen = useMemo(() => {
    if (!accordionContext.allowMultiple) {
      return accordionContext.activeIndex === itemKey;
    }
    const activeArray = Array.isArray(accordionContext.activeIndex) ? accordionContext.activeIndex : [];
    return activeArray.includes(itemKey);
  }, [accordionContext.allowMultiple, accordionContext.activeIndex, itemKey]);

  const rootAttrs = buildSlotAttrs(AccordionItemBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionItem
      {...(rest as SparAccordionItemProps)}
      itemKey={itemKey}
      {...rootAttrs}
      data-type={type}
      data-mode={mode}
      data-size={size}
      data-open={isOpen ? '' : undefined}
    >
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
