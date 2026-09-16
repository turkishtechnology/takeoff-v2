import { type ElementType } from 'react';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { BreadcrumbSeparator as SparBreadcrumbSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbSeparatorBase } from './base';
import { useBreadcrumbOwnContext } from './context';
import type { BreadcrumbSeparatorProps } from './types';

export const BreadcrumbSeparator = <T extends ElementType = 'li'>(props: BreadcrumbSeparatorProps<T>) => {
  const theme = useComponentTheme('BreadcrumbSeparator');
  // Read for the boundary only: `size` / `type` are emitted as `data-size` /
  // `data-type` on the root <nav> and the recipe scopes every part from there,
  // so no part-level hook is needed. Rendering outside <Breadcrumb> throws.
  useBreadcrumbOwnContext('Breadcrumb.Separator');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbSeparatorBase, props as BreadcrumbSeparatorProps<'li'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbSeparator {...spar} ref={ref} {...rootAttrs}>
      {children ?? <ChevronRightIconOutlinedRounded aria-hidden="true" focusable="false" />}
    </SparBreadcrumbSeparator>
  );
};

BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';
