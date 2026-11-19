import React from 'react';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

type ProductId = 'react' | 'headless' | 'icons';

interface Product {
  id: ProductId;
  label: string;
  /** Route prefix that belongs to the product; `null` for the default product, which owns everything else. */
  prefix: string | null;
  home: string;
  docs: string;
}

const PRODUCTS: readonly Product[] = [
  { id: 'react', label: 'Takeoff Spar', prefix: null, home: '/docs/', docs: '/docs/' },
  { id: 'headless', label: 'Takeoff Headless', prefix: '/headless', home: '/headless', docs: '/headless/docs/introduction' },
  { id: 'icons', label: 'Takeoff Icons', prefix: '/icons', home: '/icons/', docs: '/icons/' },
];

function useCurrentProduct(): Product {
  const { pathname } = useLocation();
  const baseUrl = useBaseUrl('/');
  const path = `/${pathname.slice(baseUrl.length)}`;
  const owned = PRODUCTS.find(product => product.prefix !== null && (path === product.prefix || path.startsWith(`${product.prefix}/`)));
  return owned ?? PRODUCTS[0];
}

function useProductVersion(id: ProductId): string | undefined {
  const { siteConfig } = useDocusaurusContext();
  const versions = siteConfig.customFields?.productVersions as Partial<Record<ProductId, string>> | undefined;
  return versions?.[id];
}

interface NavbarItemProps {
  mobile?: boolean;
  position?: 'left' | 'right';
}

/** Navbar dropdown that names the product being read and switches to the others. */
export function ProductSwitcherNavbarItem({ mobile, position }: NavbarItemProps) {
  const current = useCurrentProduct();
  const version = useProductVersion(current.id);

  const label = (
    <>
      {current.label}
      {version ? <span className="navbar__version-pill">v{version}</span> : null}
    </>
  );

  return (
    <DropdownNavbarItem
      mobile={mobile}
      position={position}
      label={label}
      className="navbar__product-switcher"
      items={PRODUCTS.map(product => ({
        label: product.label,
        to: product.home,
        className: product.id === current.id ? 'dropdown__link--active' : undefined,
      }))}
    />
  );
}

/** "Docs" link that opens the docs of the product being read. */
export function ProductDocsNavbarItem({ mobile, position }: NavbarItemProps) {
  const current = useCurrentProduct();
  const docsBase = current.docs.replace(/[^/]*$/, '');

  return <DefaultNavbarItem mobile={mobile} position={position} label="Docs" to={current.docs} activeBaseRegex={`^${docsBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`} />;
}
