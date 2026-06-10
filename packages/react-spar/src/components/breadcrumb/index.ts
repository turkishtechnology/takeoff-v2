import { Breadcrumb as BreadcrumbRoot } from './Breadcrumb';
import { BreadcrumbList } from './BreadcrumbList';
import { BreadcrumbItem } from './BreadcrumbItem';
import { BreadcrumbLink } from './BreadcrumbLink';
import { BreadcrumbPage } from './BreadcrumbPage';
import { BreadcrumbSeparator } from './BreadcrumbSeparator';

const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
});

export { Breadcrumb };

export type {
  BreadcrumbItemProps,
  BreadcrumbItemRenderProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbNavigationHandler,
  BreadcrumbPageProps,
  BreadcrumbPosition,
  BreadcrumbPressEvent,
  BreadcrumbProps,
  BreadcrumbSeparatorProps,
  BreadcrumbSeparatorVariant,
  BreadcrumbSize,
  BreadcrumbType,
} from './types';
