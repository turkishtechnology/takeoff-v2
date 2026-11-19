import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import { ProductActionsNavbarItem, ProductNavNavbarItem, ProductSwitcherNavbarItem } from '@site/src/components/ProductSwitcher';

// Navbar item types for the product switcher; `custom-` is the prefix Docusaurus reserves for site types.
export default {
  ...ComponentTypes,
  'custom-productSwitcher': ProductSwitcherNavbarItem,
  'custom-productNav': ProductNavNavbarItem,
  'custom-productActions': ProductActionsNavbarItem,
};
