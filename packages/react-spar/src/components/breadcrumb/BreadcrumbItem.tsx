import type { ElementType } from 'react';
import { BreadcrumbItem as SparBreadcrumbItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbItemBase } from './base';
import { useBreadcrumbOwnContext } from './context';
import type { BreadcrumbItemProps } from './types';

export const BreadcrumbItem = <T extends ElementType = 'li'>(props: BreadcrumbItemProps<T>) => {
  const theme = useComponentTheme('BreadcrumbItem');
  // Read for the boundary only: `size` / `type` are emitted as `data-size` /
  // `data-type` on the root <nav> and the recipe scopes every part from there,
  // so no part-level hook is needed. Rendering outside <Breadcrumb> throws.
  useBreadcrumbOwnContext('Breadcrumb.Item');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbItemBase, props as BreadcrumbItemProps<'li'>, theme);

  // `position` / `isCurrent` are not author-set props: the Spar primitive's list
  // derives them (items register with the list through context, so the wrapper
  // element is transparent to it) and surfaces them via the render-prop children
  // and the `data-position` / `data-current` attributes — so this wrapper
  // forwards children, props, and ref only. Size is scoped off the root
  // `data-size`, so no item-level state attribute is needed.
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbItem {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbItem>
  );
};

BreadcrumbItem.displayName = 'Breadcrumb.Item';
