import { Accordion as SparAccordion } from '@turkish-technology/spar';
import { type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
import { AccordionItemBase, encodeAccordionItemValue, useAccordionContext } from './AccordionBase';
import type { AccordionItemProps } from './types';

type InternalAccordionItemProps = AccordionItemProps & {
  _autoIndex?: number;
  __tkAccordionValue?: string;
};

function AccordionItem({ ref, ...rawProps }: AccordionItemProps & { ref?: Ref<HTMLDivElement> }) {
  const themeConfig = useComponentTheme('AccordionItem');
  // applyThemeDefaults is typed against public AccordionItemProps; the Accordion
  // parent passes two internal scaffolding props (`_autoIndex`,
  // `__tkAccordionValue`) that only this wrapper reads. Cast once at the
  // boundary so the destructure below sees the internal shape.
  const propsWithDefaults = applyThemeDefaults(themeConfig?.defaultProps, rawProps) as InternalAccordionItemProps;
  const {
    _autoIndex,
    __tkAccordionValue,
    itemKey,
    header,
    size,
    icon,
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    ...restProps
  } = AccordionItemBase.resolveProps(propsWithDefaults);
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);

  const accordionContext = useAccordionContext('AccordionItem');

  const resolvedValue = __tkAccordionValue ?? encodeAccordionItemValue(itemKey ?? _autoIndex ?? 0);
  const isOpen = accordionContext.openItemValues.has(resolvedValue);
  const arrowNode = accordionContext.hideArrows ? null : (
    <span {...buildSlotAttrs(AccordionItemBase.getSlotProps('arrow', { 'aria-hidden': 'true' }), resolvedSlotProps, 'arrow', resolvedClassNames?.arrow)}>
      {renderIconSymbol(isOpen ? accordionContext.collapseIcon : accordionContext.expandIcon, 'tk-accordion-item-arrow-symbol')}
    </span>
  );

  const iconNode = icon ? (
    <span {...buildSlotAttrs(AccordionItemBase.getSlotProps('icon', { 'aria-hidden': 'true' }), resolvedSlotProps, 'icon', resolvedClassNames?.icon)}>
      {renderIconSymbol(icon, 'tk-accordion-item-icon-symbol')}
    </span>
  ) : null;

  return (
    <SparAccordion.Item
      ref={ref}
      value={resolvedValue}
      {...buildSlotAttrs(
        AccordionItemBase.getSlotProps('root', {
          className,
          'data-open': isOpen ? '' : undefined,
          'data-type': accordionContext.type,
          'data-size': size,
          'data-mode': accordionContext.mode,
        }),
        resolvedSlotProps,
        'root',
        resolvedClassNames?.root,
      )}
      {...restProps}
    >
      <SparAccordion.Header as="div">
        <SparAccordion.Trigger as="div" {...buildSlotAttrs(AccordionItemBase.getSlotProps('header'), resolvedSlotProps, 'header', resolvedClassNames?.header)}>
          {accordionContext.arrowPosition === 'left' && arrowNode}
          {iconNode}
          <span {...buildSlotAttrs(AccordionItemBase.getSlotProps('title'), resolvedSlotProps, 'title', resolvedClassNames?.title)}>{header ?? ''}</span>
          {accordionContext.arrowPosition === 'right' && arrowNode}
        </SparAccordion.Trigger>
      </SparAccordion.Header>
      <SparAccordion.Content
        forceMount
        {...buildSlotAttrs(AccordionItemBase.getSlotProps('content', { 'data-open': isOpen ? '' : undefined }), resolvedSlotProps, 'content', resolvedClassNames?.content)}
      >
        {children}
      </SparAccordion.Content>
    </SparAccordion.Item>
  );
}

AccordionItem.displayName = 'AccordionItem';

export { AccordionItem };
