import { useMemo, type ElementType } from 'react';

import { AccordionItem as SparAccordionItem, type AccordionItemProps as SparAccordionItemProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';

import { AccordionItemBase } from './base';
import { useAccordionVariant } from './context';
import type { AccordionItemProps } from './types';

declare const process: { env: { NODE_ENV?: string } } | undefined;

const MISSING_ITEM_KEY_MESSAGE = '[react-spar] Accordion.Item is missing an itemKey. Wrap the item in <Accordion> to receive an auto-assigned positional key, or pass an explicit `itemKey` prop.';

/**
 * Stringify the Takeoff `itemKey` for the Spar primitive. Falls back to a
 * stable empty string + console warning when a consumer renders
 * `Accordion.Item` outside of `Accordion`'s child-walk — that path skips the
 * positional auto-assignment and would otherwise crash Spar's required
 * `value` prop.
 */
const useResolvedSparValue = (itemKey: AccordionItemProps['itemKey']): string =>
  useMemo(() => {
    if (itemKey !== undefined) return String(itemKey);
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(MISSING_ITEM_KEY_MESSAGE);
    }
    return '';
  }, [itemKey]);

export const AccordionItem = <T extends ElementType = 'div'>(props: AccordionItemProps<T>) => {
  const theme = useComponentTheme('AccordionItem');
  const { type, mode, size } = useAccordionVariant('Accordion.Item');
  const merged = AccordionItemBase.resolveProps(props as AccordionItemProps, theme?.defaultProps) as AccordionItemProps<T>;
  const { className, classNames, slotProps, children, itemKey, ...rest } = merged;

  const sparValue = useResolvedSparValue(itemKey);

  const rootAttrs = buildSlotAttrs(AccordionItemBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparAccordionItem {...(rest as SparAccordionItemProps<T>)} value={sparValue} {...rootAttrs} data-type={type} data-mode={mode} data-size={size}>
      {children}
    </SparAccordionItem>
  );
};

AccordionItem.displayName = 'Accordion.Item';
