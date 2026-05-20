import type { ElementType } from 'react';
import { BreadcrumbList as SparBreadcrumbList } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbListBase } from './base';
import { useBreadcrumbOwnContext } from './context';
import type { BreadcrumbListProps } from './types';

export const BreadcrumbList = <T extends ElementType = 'ol'>(props: BreadcrumbListProps<T>) => {
  const theme = useComponentTheme('BreadcrumbList');
  const { size } = useBreadcrumbOwnContext('Breadcrumb.List');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbListBase, props as BreadcrumbListProps<'ol'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbList {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbList>
  );
};

BreadcrumbList.displayName = 'Breadcrumb.List';
