import { type CSSProperties, type ElementType, type RefObject } from 'react';
import { DropdownMenuContent as SparDropdownMenuContent, useDropdownMenuContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useContentWidthStyle } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { DropdownContentBase } from './base';
import { useDropdownOwnContext } from './context';
import type { DropdownContentProps } from './types';

export const DropdownContent = <T extends ElementType = 'div'>(props: DropdownContentProps<T>) => {
  const theme = useComponentTheme('DropdownContent');
  const { size, contentWidth } = useDropdownOwnContext('Dropdown.Content');
  const { triggerRef } = useDropdownMenuContext() as { triggerRef: RefObject<HTMLElement | null> };

  const widthStyle = useContentWidthStyle(contentWidth, triggerRef);

  // Content is portaled outside the root, so the cascading size data-attr has
  // to be re-emitted here for styles to find it via CSS variables / selectors.
  const { rootAttrs, rest } = composeRootAttrs(DropdownContentBase, props as DropdownContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });
  const { children, ref, style: userStyle, ...sparProps } = rest;

  // Layer computed width (lowest) under the theme/slotProps style, under the
  // direct `style` prop (highest). `style` is pulled off `rootAttrs` first so
  // spread order can neither drop a slotProps/theme style nor let an `undefined`
  // width wipe it — every style channel is merged explicitly instead.
  const { style: rootStyle, ...rootRest } = rootAttrs as typeof rootAttrs & { style?: CSSProperties };
  const mergedStyle: CSSProperties | undefined = widthStyle || rootStyle || userStyle ? { ...widthStyle, ...rootStyle, ...userStyle } : undefined;

  return (
    <SparDropdownMenuContent {...sparProps} {...rootRest} ref={ref} style={mergedStyle}>
      {children}
    </SparDropdownMenuContent>
  );
};

DropdownContent.displayName = 'Dropdown.Content';
