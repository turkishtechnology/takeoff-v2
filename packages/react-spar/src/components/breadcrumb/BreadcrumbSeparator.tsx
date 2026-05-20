import { type ElementType, type ReactNode } from 'react';
import { BreadcrumbSeparator as SparBreadcrumbSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbSeparatorBase } from './base';
import type { BreadcrumbSeparatorProps } from './types';

// Default chevron, sized to match `tk-breadcrumb-separator` recipe; kept inline
// until the icon package lands, matching the pattern used by Accordion.Indicator.
const DEFAULT_SEPARATOR_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BreadcrumbSeparator = <T extends ElementType = 'li'>(props: BreadcrumbSeparatorProps<T>) => {
  const theme = useComponentTheme('BreadcrumbSeparator');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbSeparatorBase, props as BreadcrumbSeparatorProps<'li'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbSeparator {...spar} ref={ref} {...rootAttrs}>
      {children ?? DEFAULT_SEPARATOR_ICON}
    </SparBreadcrumbSeparator>
  );
};

BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';
