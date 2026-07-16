import { type CSSProperties, type ElementType } from 'react';
import { SelectContent as SparSelectContent, useSelectContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useContentWidthStyle } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { SelectContentBase } from './base';
import { useSelectOwnContext } from './context';
import type { SelectContentProps } from './types';

export const SelectContent = <T extends ElementType = 'div'>(props: SelectContentProps<T>) => {
  const theme = useComponentTheme('SelectContent');
  const { size, contentWidth } = useSelectOwnContext('Select.Content');
  const { triggerRef } = useSelectContext();

  const widthStyle = useContentWidthStyle(contentWidth, triggerRef);

  // Content is portaled outside the root, so the cascading size data-attr has
  // to be re-emitted here for styles to find it via CSS variables / selectors.
  const { rootAttrs, rest } = composeRootAttrs(SelectContentBase, props as SelectContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  const { children, ref, style: userStyle, ...spar } = rest;

  // Layer computed width (lowest) under the theme/slotProps style, under the
  // direct `style` prop (highest). `style` is pulled off `rootAttrs` first so
  // spread order can neither drop a slotProps/theme style nor let an `undefined`
  // width wipe it — every style channel is merged explicitly instead.
  const { style: rootStyle, ...rootRest } = rootAttrs as typeof rootAttrs & { style?: CSSProperties };
  const mergedStyle: CSSProperties | undefined = widthStyle || rootStyle || userStyle ? { ...widthStyle, ...rootStyle, ...userStyle } : undefined;

  return (
    <SparSelectContent {...spar} {...rootRest} ref={ref} style={mergedStyle}>
      {children}
    </SparSelectContent>
  );
};

SelectContent.displayName = 'Select.Content';
