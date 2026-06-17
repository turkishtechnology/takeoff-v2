import { createComponentBase } from '../../core';

import type { BreadcrumbItemProps, BreadcrumbLinkProps, BreadcrumbListProps, BreadcrumbPageProps, BreadcrumbProps, BreadcrumbSeparatorProps } from './types';

// @archetype inherited — wraps SparBreadcrumb; takeoff layer owns the
// `tk-breadcrumb` class and the `size` cascade.
export const BreadcrumbBase = createComponentBase<BreadcrumbProps, 'root'>({
  name: 'Breadcrumb',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb' },
});

// @archetype inherited — wraps SparBreadcrumbList.
export const BreadcrumbListBase = createComponentBase<BreadcrumbListProps, 'root'>({
  name: 'BreadcrumbList',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb-list' },
});

// @archetype inherited — wraps SparBreadcrumbItem. How the Spar list derives
// each item's position/isCurrent is version-dependent (the pinned release
// type-matches its own item element; newer Spar self-registers via context),
// so the takeoff layer assumes neither.
export const BreadcrumbItemBase = createComponentBase<BreadcrumbItemProps, 'root'>({
  name: 'BreadcrumbItem',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb-item' },
});

// @archetype inherited — wraps SparBreadcrumbLink.
export const BreadcrumbLinkBase = createComponentBase<BreadcrumbLinkProps, 'root'>({
  name: 'BreadcrumbLink',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb-link' },
});

// @archetype inherited — wraps SparBreadcrumbPage.
export const BreadcrumbPageBase = createComponentBase<BreadcrumbPageProps, 'root'>({
  name: 'BreadcrumbPage',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb-page' },
});

// @archetype inherited — wraps SparBreadcrumbSeparator. Default chevron is
// rendered inline when consumers do not pass their own children.
export const BreadcrumbSeparatorBase = createComponentBase<BreadcrumbSeparatorProps, 'root'>({
  name: 'BreadcrumbSeparator',
  slots: ['root'] as const,
  classes: { root: 'tk-breadcrumb-separator' },
});
