import type { ElementType } from 'react';
import { BreadcrumbItem as SparBreadcrumbItem } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbItemBase } from './base';
import type { BreadcrumbItemProps } from './types';

export const BreadcrumbItem = <T extends ElementType = 'li'>(props: BreadcrumbItemProps<T>) => {
  const theme = useComponentTheme('BreadcrumbItem');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbItemBase, props as BreadcrumbItemProps<'li'>, theme);

  // `position` / `isCurrent` are not author-set props: the Spar primitive's list
  // derives them and surfaces them via the render-prop children and the
  // `data-position` / `data-current` attributes — so this wrapper forwards
  // children, props, and ref only. Size is scoped off the root `data-size`, so no
  // item-level state attribute is needed. (Whether position derivation survives a
  // compound wrapper depends on the Spar version's list-registration mechanism.)
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbItem {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbItem>
  );
};

BreadcrumbItem.displayName = 'Breadcrumb.Item';
