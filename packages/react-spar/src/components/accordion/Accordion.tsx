import { Children, cloneElement, isValidElement, useMemo, type ElementType, type ReactElement, type ReactNode } from 'react';

import { Accordion as SparAccordion, type AccordionProps as SparAccordionProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';
import { useDeprecationWarning } from '../../utils';

import { AccordionBase } from './base';
import { AccordionVariantProvider } from './context';
import { DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import { useAccordionAdapter } from './useAccordionAdapter';
import type { AccordionItemKey, AccordionItemProps, AccordionMode, AccordionProps, AccordionType } from './types';

const LEGACY_COMPACT_TYPE_MESSAGE = '[react-spar] Accordion `type="compact"` is deprecated. Use `mode="compact"` instead. The legacy value will be removed in the next major release.';

/**
 * Map a legacy `type='compact'` to the canonical `(type='grouped', mode='compact')`
 * pair. When the explicit `mode` prop is also passed it wins, so consumers can
 * opt into the new vocabulary without losing the deprecation signal.
 */
const normalizeTypeAndMode = (type: AccordionType, mode: AccordionMode | undefined): { type: Exclude<AccordionType, 'compact'>; mode: AccordionMode } => {
  if (type === 'compact') {
    return { type: 'grouped', mode: mode ?? 'compact' };
  }
  return { type, mode: mode ?? DEFAULT_MODE };
};

const ACCORDION_ITEM_DISPLAY_NAME = 'Accordion.Item';

/**
 * Walk direct children once and resolve each `Accordion.Item`'s identity:
 *
 * - explicit `itemKey` is preserved as-is (string or number),
 * - missing `itemKey` falls back to declaration position (numeric).
 *
 * The function returns both the cloned children (with positional `itemKey`
 * injected when missing) and the ordered identity list the adapter needs to
 * round-trip the callback payload to the original {@link AccordionItemKey}
 * shape. Non-`Accordion.Item` children pass through unchanged so consumers
 * can interleave separators or instructional copy.
 */
const resolveItemKeys = (children: ReactNode): { children: ReactNode; itemKeys: AccordionItemKey[] } => {
  const itemKeys: AccordionItemKey[] = [];
  let positionIndex = 0;
  const next = Children.map(children, child => {
    if (!isValidElement(child)) return child;
    const childType = child.type as { displayName?: string };
    if (childType?.displayName !== ACCORDION_ITEM_DISPLAY_NAME) return child;

    const childProps = (child as ReactElement<AccordionItemProps>).props;
    const explicitKey = childProps.itemKey;
    const resolvedKey: AccordionItemKey = explicitKey ?? positionIndex;
    positionIndex += 1;
    itemKeys.push(resolvedKey);

    if (explicitKey !== undefined) return child;
    return cloneElement(child as ReactElement<AccordionItemProps>, { itemKey: resolvedKey });
  });
  return { children: next, itemKeys };
};

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');
  const merged = AccordionBase.resolveProps(props as AccordionProps, theme?.defaultProps) as AccordionProps<T>;
  const { type = DEFAULT_TYPE, mode, size = DEFAULT_SIZE, activeIndex, defaultActiveIndex, onActiveIndexChange, allowMultiple, classNames, slotProps, className, children, ...rest } = merged;

  useDeprecationWarning(type === 'compact', LEGACY_COMPACT_TYPE_MESSAGE);

  const { type: effectiveType, mode: effectiveMode } = normalizeTypeAndMode(type, mode);

  const { children: childrenWithKeys, itemKeys } = useMemo(() => resolveItemKeys(children), [children]);

  const { sparType, sparIsCollapsible, sparValue, sparDefaultValue, sparOnValueChange } = useAccordionAdapter({
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    allowMultiple,
    itemKeys,
  });

  const rootAttrs = buildSlotAttrs(AccordionBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <AccordionVariantProvider value={{ type: effectiveType, mode: effectiveMode, size }}>
      {/*
        Spar owns `data-type` on the root for its `single`/`multiple` state
        discriminator (see component-api-audit row 13 + ADR-0003). The wrapper's
        `type` styling hook lives on `Accordion.Item` instead. `data-mode` and
        `data-size` are wrapper-only and safe to emit on the root.
      */}
      <SparAccordion
        {...(rest as SparAccordionProps<T>)}
        type={sparType}
        isCollapsible={sparIsCollapsible}
        value={sparValue}
        defaultValue={sparDefaultValue}
        onValueChange={sparOnValueChange}
        {...rootAttrs}
        data-mode={effectiveMode}
        data-size={size}
      >
        {childrenWithKeys}
      </SparAccordion>
    </AccordionVariantProvider>
  );
};

Accordion.displayName = 'Accordion';
