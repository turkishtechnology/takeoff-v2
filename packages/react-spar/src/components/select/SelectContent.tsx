import { useEffect, useMemo, useState, type CSSProperties, type ElementType } from 'react';
import { SelectContent as SparSelectContent, useSelectContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectContentBase } from './base';
import { useSelectOwnContext } from './context';
import type { SelectContentProps, SelectContentWidth } from './types';

// Resolve a contentWidth value into a CSS width string. Returns `undefined` for
// `'trigger'` and `'content'` modes — those are handled outside (trigger needs
// a measured value, content keeps the natural width).
const resolveStaticWidth = (mode: SelectContentWidth): string | undefined => {
  if (mode === 'trigger' || mode === 'content') return undefined;
  return typeof mode === 'number' ? `${mode}px` : mode;
};

export const SelectContent = <T extends ElementType = 'div'>(props: SelectContentProps<T>) => {
  const theme = useComponentTheme('SelectContent');
  const { size, contentWidth } = useSelectOwnContext('Select.Content');
  const { triggerRef } = useSelectContext();

  // Trigger-mode width: measured at open time + kept in sync via ResizeObserver
  // so the panel tracks responsive trigger resizes (font load, container reflow).
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (contentWidth !== 'trigger') return;
    const node = triggerRef.current;
    if (!node) return;

    setTriggerWidth(node.offsetWidth);

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setTriggerWidth(Math.round(entry.contentRect.width + 2)); // +2 to include 1px borders
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [contentWidth, triggerRef]);

  // Content is portaled outside the root, so the cascading size data-attr has
  // to be re-emitted here for styles to find it via CSS variables / selectors.
  const { rootAttrs, rest } = composeRootAttrs(SelectContentBase, props as SelectContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  const { children, ref, style: userStyle, ...spar } = rest;

  const widthStyle = useMemo<CSSProperties | undefined>(() => {
    if (contentWidth === 'trigger') {
      return triggerWidth != null ? { width: triggerWidth } : undefined;
    }
    const staticWidth = resolveStaticWidth(contentWidth);
    return staticWidth != null ? { width: staticWidth } : undefined;
  }, [contentWidth, triggerWidth]);

  // User-provided `style` wins over our computed width so consumers can still
  // override on a one-off basis.
  const mergedStyle: CSSProperties | undefined = widthStyle || userStyle ? { ...widthStyle, ...userStyle } : undefined;

  return (
    <SparSelectContent {...spar} ref={ref} style={mergedStyle} {...rootAttrs}>
      {children}
    </SparSelectContent>
  );
};

SelectContent.displayName = 'Select.Content';
