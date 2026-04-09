import { Accordion as SparAccordion } from '@turkish-technology/spar';
import { type Ref, useContext } from 'react';

import { renderIconSymbol } from '../../utils';
import { AccordionAdapterContext, AccordionItemBase, encodeAccordionItemValue } from './AccordionBase';
import type { AccordionItemProps } from './types';

type InternalAccordionItemProps = AccordionItemProps & {
  _autoIndex?: number;
  __tkAccordionValue?: string;
};

function AccordionItem({ ref, ...rawProps }: AccordionItemProps & { ref?: Ref<HTMLDivElement> }) {
  const { _autoIndex, __tkAccordionValue, itemKey, header, size, icon, children, className, ...restProps } = AccordionItemBase.resolveProps(rawProps as InternalAccordionItemProps);

  const accordionContext = useContext(AccordionAdapterContext);

  if (!accordionContext) {
    throw new Error('AccordionItem components must be used within Accordion');
  }

  const resolvedValue = __tkAccordionValue ?? encodeAccordionItemValue(itemKey ?? _autoIndex ?? 0);
  const isOpen = accordionContext.openItemValues.has(resolvedValue);
  const arrowNode = accordionContext.hideArrows ? null : (
    <span {...AccordionItemBase.getSlotProps('arrow', { 'aria-hidden': 'true' })}>
      {renderIconSymbol(isOpen ? accordionContext.collapseIcon : accordionContext.expandIcon, 'tk-accordion-item-arrow-symbol')}
    </span>
  );

  const iconNode = icon ? <span {...AccordionItemBase.getSlotProps('icon', { 'aria-hidden': 'true' })}>{renderIconSymbol(icon, 'tk-accordion-item-icon-symbol')}</span> : null;

  return (
    <SparAccordion.Item
      ref={ref}
      value={resolvedValue}
      {...AccordionItemBase.getSlotProps('root', {
        className,
        'data-open': isOpen ? '' : undefined,
        'data-type': accordionContext.type,
        'data-size': size,
        'data-mode': accordionContext.mode,
      })}
      {...restProps}
    >
      <SparAccordion.Header as="div">
        <SparAccordion.Trigger as="div" {...AccordionItemBase.getSlotProps('header')}>
          {accordionContext.arrowPosition === 'left' && arrowNode}
          {iconNode}
          <span {...AccordionItemBase.getSlotProps('title')}>{header ?? ''}</span>
          {accordionContext.arrowPosition === 'right' && arrowNode}
        </SparAccordion.Trigger>
      </SparAccordion.Header>
      <SparAccordion.Content
        forceMount
        {...AccordionItemBase.getSlotProps('content', {
          'data-open': isOpen ? '' : undefined,
        })}
      >
        {children}
      </SparAccordion.Content>
    </SparAccordion.Item>
  );
}

AccordionItem.displayName = 'AccordionItem';

export { AccordionItem };
