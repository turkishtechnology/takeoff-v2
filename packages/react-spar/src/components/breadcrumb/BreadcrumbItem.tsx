import type { ElementType } from 'react';
import { BreadcrumbItem as SparBreadcrumbItem, BREADCRUMB_ITEM_MARKER } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbItemBase } from './base';
import { useBreadcrumbOwnContext } from './context';
import type { BreadcrumbItemProps } from './types';

export const BreadcrumbItem = <T extends ElementType = 'li'>(props: BreadcrumbItemProps<T>) => {
  const theme = useComponentTheme('BreadcrumbItem');
  const { size } = useBreadcrumbOwnContext('Breadcrumb.Item');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbItemBase, props as BreadcrumbItemProps<'li'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
    }),
  });

  // `position` / `isCurrent` are injected at runtime by SparBreadcrumbList via
  // cloneElement and pass straight through `...spar`. They are not part of the
  // public type because Spar marks them `@internal`.
  const { children, ref, ...spar } = rest;

  return (
    <SparBreadcrumbItem {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparBreadcrumbItem>
  );
};

BreadcrumbItem.displayName = 'Breadcrumb.Item';
// Carry the spar marker so SparBreadcrumbList's `Children.map` recognizes this
// wrapper as an item and still injects `position` / `isCurrent` via cloneElement.
(BreadcrumbItem as { [BREADCRUMB_ITEM_MARKER]?: true })[BREADCRUMB_ITEM_MARKER] = true;
