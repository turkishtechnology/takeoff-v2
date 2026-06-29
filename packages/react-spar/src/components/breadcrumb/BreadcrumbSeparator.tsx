import { type ElementType, type ReactNode } from 'react';
import { BreadcrumbSeparator as SparBreadcrumbSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbSeparatorBase } from './base';
import { DEFAULT_SEPARATOR_VARIANT } from './defaults';
import type { BreadcrumbSeparatorProps } from './types';

// Default chevron, sized to match `tk-breadcrumb-separator` recipe; kept inline
// until the icon package lands, matching the pattern used by Accordion.Indicator.
const DEFAULT_SEPARATOR_ICON: ReactNode = (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BreadcrumbSeparator = <T extends ElementType = 'li'>(props: BreadcrumbSeparatorProps<T>) => {
  const theme = useComponentTheme('BreadcrumbSeparator');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbSeparatorBase, props as BreadcrumbSeparatorProps<'li'>, theme, {
    stateAttrs: ({ variant = DEFAULT_SEPARATOR_VARIANT }) => ({
      'data-variant': variant,
    }),
  });

  const { variant = DEFAULT_SEPARATOR_VARIANT, children, ref, ...spar } = rest;

  // Glyph presets paint through the recipe's `::before`; only the chevron
  // preset contributes a default child node.
  const fallback = variant === 'chevron' ? DEFAULT_SEPARATOR_ICON : null;

  return (
    <SparBreadcrumbSeparator {...spar} ref={ref} {...rootAttrs}>
      {children ?? fallback}
    </SparBreadcrumbSeparator>
  );
};

BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';
