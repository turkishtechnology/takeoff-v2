import { type ElementType } from 'react';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { BreadcrumbSeparator as SparBreadcrumbSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbSeparatorBase } from './base';
import type { BreadcrumbSeparatorProps } from './types';

export const BreadcrumbSeparator = <T extends ElementType = 'li'>(props: BreadcrumbSeparatorProps<T>) => {
  const theme = useComponentTheme('BreadcrumbSeparator');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbSeparatorBase, props as BreadcrumbSeparatorProps<'li'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbSeparator {...spar} ref={ref} {...rootAttrs}>
      {children ?? <ChevronRightIconOutlinedRounded aria-hidden="true" focusable="false" />}
    </SparBreadcrumbSeparator>
  );
};

BreadcrumbSeparator.displayName = 'Breadcrumb.Separator';
