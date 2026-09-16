import type { ElementType } from 'react';
import { BreadcrumbLink as SparBreadcrumbLink } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbLinkBase } from './base';
import { useBreadcrumbOwnContext } from './context';
import type { BreadcrumbLinkProps } from './types';

export const BreadcrumbLink = <T extends ElementType = 'a'>(props: BreadcrumbLinkProps<T>) => {
  const theme = useComponentTheme('BreadcrumbLink');
  // Read for the boundary only: `size` / `type` are emitted as `data-size` /
  // `data-type` on the root <nav> and the recipe scopes every part from there,
  // so no part-level hook is needed. Rendering outside <Breadcrumb> throws.
  useBreadcrumbOwnContext('Breadcrumb.Link');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbLinkBase, props as BreadcrumbLinkProps<'a'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbLink {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbLink>
  );
};

BreadcrumbLink.displayName = 'Breadcrumb.Link';
