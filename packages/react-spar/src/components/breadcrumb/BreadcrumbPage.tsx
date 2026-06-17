import type { ElementType } from 'react';
import { BreadcrumbPage as SparBreadcrumbPage } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbPageBase } from './base';
import type { BreadcrumbPageProps } from './types';

export const BreadcrumbPage = <T extends ElementType = 'span'>(props: BreadcrumbPageProps<T>) => {
  const theme = useComponentTheme('BreadcrumbPage');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbPageBase, props as BreadcrumbPageProps<'span'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbPage {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbPage>
  );
};

BreadcrumbPage.displayName = 'Breadcrumb.Page';
