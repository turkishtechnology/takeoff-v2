import { useEffect, useMemo, useState, type CSSProperties, type ElementType, type RefObject } from 'react';
import { DropdownMenuContent as SparDropdownMenuContent, useDropdownMenuContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DropdownContentBase } from './base';
import { useDropdownOwnContext } from './context';
import type { DropdownContentProps, DropdownContentWidth } from './types';

const resolveStaticWidth = (mode: DropdownContentWidth): string | undefined => {
  if (mode === 'trigger' || mode === 'content') return undefined;
  return typeof mode === 'number' ? `${mode}px` : mode;
};

export const DropdownContent = <T extends ElementType = 'div'>(props: DropdownContentProps<T>) => {
  const theme = useComponentTheme('DropdownContent');
  const { size, contentWidth } = useDropdownOwnContext('Dropdown.Content');
  const { triggerRef } = useDropdownMenuContext() as { triggerRef: RefObject<HTMLElement | null> };

  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (contentWidth !== 'trigger') return;
    const node = triggerRef.current;
    if (!node) return;

    setTriggerWidth(node.offsetWidth);

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setTriggerWidth(Math.round(entry.contentRect.width + 2));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [contentWidth, triggerRef]);

  const { rootAttrs, rest } = composeRootAttrs(DropdownContentBase, props as DropdownContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });
  const { children, ref, style: userStyle, ...sparProps } = rest;

  const widthStyle = useMemo<CSSProperties | undefined>(() => {
    if (contentWidth === 'trigger') {
      return triggerWidth != null ? { width: triggerWidth } : undefined;
    }
    const staticWidth = resolveStaticWidth(contentWidth);
    return staticWidth != null ? { width: staticWidth } : undefined;
  }, [contentWidth, triggerWidth]);

  const mergedStyle: CSSProperties | undefined = widthStyle || userStyle ? { ...widthStyle, ...userStyle } : undefined;

  return (
    <SparDropdownMenuContent {...sparProps} {...rootAttrs} ref={ref} style={mergedStyle}>
      {children}
    </SparDropdownMenuContent>
  );
};

DropdownContent.displayName = 'Dropdown.Content';
