import type { ElementType, ReactNode } from 'react';
import type {
  BreadcrumbProps as SparBreadcrumbProps,
  BreadcrumbLinkProps as SparBreadcrumbLinkProps,
  BreadcrumbItemRenderProps,
  BreadcrumbPosition,
  NavigationHandler,
  PressEvent,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Density scale. `'base'` matches the default body line-height; `'large'`
 * lifts the trail in hero or page-header contexts.
 */
export type BreadcrumbSize = 'base' | 'large';

/**
 * Visual style. `'basic'` is the bare text trail; `'outlined'` renders each
 * crumb as a bordered, backgrounded chip.
 */
export type BreadcrumbType = 'basic' | 'outlined';

export type { BreadcrumbPosition, BreadcrumbItemRenderProps };
export type BreadcrumbNavigationHandler = NavigationHandler;
export type BreadcrumbPressEvent = PressEvent;

export type BreadcrumbSlot = 'root';
export type BreadcrumbListSlot = 'root';
export type BreadcrumbItemSlot = 'root';
export type BreadcrumbLinkSlot = 'root';
export type BreadcrumbPageSlot = 'root';
export type BreadcrumbSeparatorSlot = 'root';

export interface BreadcrumbOwnProps {
  /**
   * Density scale cascaded to every part through context.
   * @defaultValue 'base'
   */
  size?: BreadcrumbSize;
  /**
   * Visual style cascaded to every part through context.
   * @defaultValue 'basic'
   */
  type?: BreadcrumbType;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbSlot>;
}

export type BreadcrumbProps<T extends ElementType = 'nav'> = PolymorphicProps<
  'nav',
  T,
  BreadcrumbOwnProps &
    // Spar Breadcrumb root state surface — landmark label, routing handler,
    // and the group-level disabled flag. Visual concerns (size) live in
    // BreadcrumbOwnProps above, not picked.
    Pick<SparBreadcrumbProps, 'aria-label' | 'onNavigate' | 'disabled'>
>;

export interface BreadcrumbListOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbListSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbListSlot>;
}

export type BreadcrumbListProps<T extends ElementType = 'ol'> = PolymorphicProps<'ol', T, BreadcrumbListOwnProps>;

export interface BreadcrumbItemOwnProps {
  /**
   * Item content — typically a `Breadcrumb.Link` or `Breadcrumb.Page`, or a
   * render function that receives `{ position, isCurrent, isDisabled }` so
   * consumers can swap content without reading the item context manually.
   */
  children?: ReactNode | ((state: BreadcrumbItemRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbItemSlot>;
}

// `position` / `isCurrent` are not author-set item props: the Spar primitive's
// list derives each crumb's order and surfaces it through the render-prop
// children (typed via `BreadcrumbItemRenderProps`) plus the `data-position` /
// `data-current` attributes — so the public item type neither declares nor
// requires them.
export type BreadcrumbItemProps<T extends ElementType = 'li'> = PolymorphicProps<'li', T, BreadcrumbItemOwnProps>;

export interface BreadcrumbLinkOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbLinkSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbLinkSlot>;
}

export type BreadcrumbLinkProps<T extends ElementType = 'a'> = PolymorphicProps<
  'a',
  T,
  BreadcrumbLinkOwnProps &
    // Spar Breadcrumb link surface: destination, per-link disable, external
    // affordances, and the press handler that overrides the routing path.
    // Native click/keydown stay on the anchor and are not redeclared.
    Pick<SparBreadcrumbLinkProps, 'href' | 'disabled' | 'isExternal' | 'target' | 'rel' | 'onPress'>
>;

export interface BreadcrumbPageOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbPageSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbPageSlot>;
}

export type BreadcrumbPageProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, BreadcrumbPageOwnProps>;

export interface BreadcrumbSeparatorOwnProps {
  /**
   * Override the default chevron separator. Plain content renders inside the
   * canonical `<li aria-hidden>` owner node.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<BreadcrumbSeparatorSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<BreadcrumbSeparatorSlot>;
}

export type BreadcrumbSeparatorProps<T extends ElementType = 'li'> = PolymorphicProps<'li', T, BreadcrumbSeparatorOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Breadcrumb: import('../../core').ComponentThemeConfig<BreadcrumbProps>;
    BreadcrumbList: import('../../core').ComponentThemeConfig<BreadcrumbListProps>;
    BreadcrumbItem: import('../../core').ComponentThemeConfig<BreadcrumbItemProps>;
    BreadcrumbLink: import('../../core').ComponentThemeConfig<BreadcrumbLinkProps>;
    BreadcrumbPage: import('../../core').ComponentThemeConfig<BreadcrumbPageProps>;
    BreadcrumbSeparator: import('../../core').ComponentThemeConfig<BreadcrumbSeparatorProps>;
  }
}
