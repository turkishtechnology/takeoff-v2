import { Accordion as SparAccordion } from '@turkish-technology/spar';
import { type ReactNode, type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Default arrow icons are Lucide-sourced placeholders.
// Replace with the official Takeoff icon components before first release.
import { PlaceholderChevronDown, PlaceholderChevronUp } from '../../utils/placeholderIcons';
import {
  AccordionBase,
  AccordionItemBase,
  AccordionItemProvider,
  AccordionProvider,
  encodeAccordionItemValue,
  useAccordionContext,
  useAccordionItemContext,
} from './AccordionBase';
import type { AccordionArrowProps, AccordionContentProps, AccordionHeaderProps, AccordionIconProps, AccordionItemProps, AccordionProps, AccordionTitleProps } from './types';
import { useAccordionAdapter } from './useAccordionAdapter';

type InternalAccordionItemProps = AccordionItemProps & {
  _autoIndex?: number;
  __tkAccordionValue?: string;
};

function Accordion({ ref, ...rawProps }: AccordionProps & { ref?: Ref<HTMLDivElement> }) {
  const themeConfig = useComponentTheme('Accordion');
  const {
    activeIndex: controlledActiveIndex,
    defaultActiveIndex,
    allowMultiple: rawAllowMultiple,
    type: rawType,
    mode: rawMode,
    onActiveIndexChange,
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    ...restProps
  } = AccordionBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);
  const allowMultiple = rawAllowMultiple ?? false;
  const type = rawType ?? 'grouped';
  const mode = rawMode ?? 'default';

  const { processedChildren, openItemValueSet, sparValue, handleValueChange } = useAccordionAdapter({
    children,
    controlledActiveIndex,
    defaultActiveIndex,
    allowMultiple,
    onActiveIndexChange,
  });

  const contextValue = {
    openItemValues: openItemValueSet,
    type,
    mode,
    classNames: resolvedClassNames,
    slotProps: resolvedSlotProps,
  };

  return (
    <AccordionProvider value={contextValue}>
      <SparAccordion
        {...restProps}
        {...buildSlotAttrs(AccordionBase.getSlotProps('root', { className }), resolvedSlotProps, 'root', resolvedClassNames?.root)}
        ref={ref}
        type={allowMultiple ? 'multiple' : 'single'}
        isCollapsible
        value={sparValue}
        onValueChange={handleValueChange}
      >
        {processedChildren}
      </SparAccordion>
    </AccordionProvider>
  );
}

Accordion.displayName = 'Accordion';

function AccordionItem({ ref, ...rawProps }: AccordionItemProps & { ref?: Ref<HTMLDivElement> }) {
  const themeConfig = useComponentTheme('AccordionItem');
  // The parent `Accordion` passes two internal scaffolding props
  // (`_autoIndex`, `__tkAccordionValue`) that only this wrapper reads. Cast
  // once at the boundary so the destructure below sees the internal shape.
  const propsWithDefaults = applyThemeDefaults(themeConfig?.defaultProps, rawProps) as InternalAccordionItemProps;
  const {
    _autoIndex,
    __tkAccordionValue,
    itemKey,
    size,
    children,
    className,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
    ...restProps
  } = AccordionItemBase.resolveProps(propsWithDefaults);
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);

  const accordionContext = useAccordionContext('Accordion.Item');

  const resolvedValue = __tkAccordionValue ?? encodeAccordionItemValue(itemKey ?? _autoIndex ?? 0);
  const isOpen = accordionContext.openItemValues.has(resolvedValue);
  const resolvedSize = size ?? 'base';

  const itemContextValue = {
    encodedValue: resolvedValue,
    isOpen,
    size: resolvedSize,
    classNames: resolvedClassNames,
    slotProps: resolvedSlotProps,
  };

  return (
    <AccordionItemProvider value={itemContextValue}>
      <SparAccordion.Item
        ref={ref}
        value={resolvedValue}
        {...buildSlotAttrs(
          AccordionItemBase.getSlotProps('root', {
            className,
            'data-open': isOpen ? '' : undefined,
            'data-type': accordionContext.type,
            'data-size': resolvedSize,
            'data-mode': accordionContext.mode,
          }),
          resolvedSlotProps,
          'root',
          resolvedClassNames?.root,
        )}
        {...restProps}
      >
        {children}
      </SparAccordion.Item>
    </AccordionItemProvider>
  );
}

AccordionItem.displayName = 'Accordion.Item';

function AccordionHeader({ children, className, ...rest }: AccordionHeaderProps) {
  const itemContext = useAccordionItemContext('Accordion.Header');
  const attrs = buildSlotAttrs(AccordionItemBase.getSlotProps('header', { className }), itemContext.slotProps, 'header', itemContext.classNames?.header);
  // SparAccordion.Trigger renders the underlying `as` element but its prop
  // typing is modeled after a button. We're rendering as "div" here to keep
  // the compound shape while exposing a clickable surface, so cast the
  // combined attrs/rest payload to the widest attribute shape Spar accepts.
  const triggerProps = { ...attrs, ...rest } as Record<string, unknown>;

  return (
    <SparAccordion.Header as="div">
      <SparAccordion.Trigger as="div" {...triggerProps}>
        {children}
      </SparAccordion.Trigger>
    </SparAccordion.Header>
  );
}
AccordionHeader.displayName = 'Accordion.Header';

function AccordionTitle({ children, className, ...rest }: AccordionTitleProps) {
  const itemContext = useAccordionItemContext('Accordion.Title');
  const attrs = buildSlotAttrs(AccordionItemBase.getSlotProps('title', { className }), itemContext.slotProps, 'title', itemContext.classNames?.title);

  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
AccordionTitle.displayName = 'Accordion.Title';

function AccordionIcon({ children, className, ...rest }: AccordionIconProps) {
  const itemContext = useAccordionItemContext('Accordion.Icon');
  const attrs = buildSlotAttrs(AccordionItemBase.getSlotProps('icon', { 'aria-hidden': 'true', className }), itemContext.slotProps, 'icon', itemContext.classNames?.icon);

  return (
    <span {...attrs} {...rest}>
      {renderIconSymbol(children, 'tk-accordion-item-icon-symbol')}
    </span>
  );
}
AccordionIcon.displayName = 'Accordion.Icon';

function AccordionArrow({ children, expandIcon, collapseIcon, className, ...rest }: AccordionArrowProps) {
  const itemContext = useAccordionItemContext('Accordion.Arrow');
  const attrs = buildSlotAttrs(AccordionItemBase.getSlotProps('arrow', { 'aria-hidden': 'true', className }), itemContext.slotProps, 'arrow', itemContext.classNames?.arrow);

  let content: ReactNode;
  if (typeof children === 'function') {
    content = children({ isOpen: itemContext.isOpen });
  } else if (children !== undefined && children !== null) {
    content = children;
  } else {
    const fallback = itemContext.isOpen ? (collapseIcon ?? <PlaceholderChevronUp />) : (expandIcon ?? <PlaceholderChevronDown />);
    content = renderIconSymbol(fallback, 'tk-accordion-item-arrow-symbol');
  }

  return (
    <span {...attrs} {...rest}>
      {content}
    </span>
  );
}
AccordionArrow.displayName = 'Accordion.Arrow';

function AccordionContent({ children, className, ...rest }: AccordionContentProps) {
  const itemContext = useAccordionItemContext('Accordion.Content');
  const attrs = buildSlotAttrs(
    AccordionItemBase.getSlotProps('content', { 'data-open': itemContext.isOpen ? '' : undefined, className }),
    itemContext.slotProps,
    'content',
    itemContext.classNames?.content,
  );

  return (
    <SparAccordion.Content forceMount {...attrs} {...rest}>
      {children}
    </SparAccordion.Content>
  );
}
AccordionContent.displayName = 'Accordion.Content';

const AccordionCompound = Object.assign(Accordion, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Title: AccordionTitle,
  Icon: AccordionIcon,
  Arrow: AccordionArrow,
  Content: AccordionContent,
});

export { AccordionCompound as Accordion };
