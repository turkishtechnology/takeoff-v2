import React from 'react';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import HtmlNavbarItem from '@theme/NavbarItem/HtmlNavbarItem';

type ProductId = 'react' | 'headless' | 'icons';

/** A navbar link of one product: an in-site route (`to`) or an external page (`href`). */
interface ProductLink {
  label: string;
  to?: string;
  href?: string;
  /** Marks the link active on matching routes; defaults to an exact `to` match. */
  activeBaseRegex?: string;
}

interface Product {
  id: ProductId;
  label: string;
  /** Route prefix that belongs to the product; `null` for the default product, which owns everything else. */
  prefix: string | null;
  home: string;
  /** The navbar links shown while this product is being read. */
  links: readonly ProductLink[];
  /** Where the product's source lives (the navbar GitHub link). */
  repo: string;
  /** Target of the navbar "Get started" button. */
  getStarted: string;
}

const PRODUCTS: readonly Product[] = [
  {
    id: 'react',
    label: 'Takeoff React',
    prefix: null,
    home: '/docs/',
    links: [
      { label: 'Docs', to: '/docs/', activeBaseRegex: '^/docs/(?!ai-assistants)' },
      { label: 'Changelog', to: '/changelog', activeBaseRegex: '^/changelog' },
      { label: 'AI assistants', to: '/docs/ai-assistants', activeBaseRegex: '^/docs/ai-assistants' },
    ],
    repo: 'https://github.com/turkishtechnology/takeoff-v2',
    getStarted: '/docs/',
  },
  {
    id: 'headless',
    label: 'Takeoff Headless',
    prefix: '/headless',
    home: '/headless',
    links: [
      { label: 'Docs', to: '/headless/docs/introduction', activeBaseRegex: '^/headless/docs/(?!changelog)' },
      { label: 'Accessibility', to: '/headless/accessibility', activeBaseRegex: '^/headless/accessibility' },
      { label: 'Changelog', to: '/headless/docs/changelog', activeBaseRegex: '^/headless/docs/changelog' },
    ],
    repo: 'https://github.com/turkishtechnology/takeoff-v2/tree/develop/packages/spar',
    getStarted: '/headless/docs/installation',
  },
  {
    id: 'icons',
    label: 'Takeoff Icons',
    prefix: '/icons',
    home: '/icons/',
    links: [
      { label: 'Docs', to: '/icons/', activeBaseRegex: '^/icons/(?!changelog)' },
      { label: 'Changelog', to: '/icons/changelog', activeBaseRegex: '^/icons/changelog' },
    ],
    repo: 'https://github.com/turkishtechnology/takeoff-icons',
    getStarted: '/icons/installation',
  },
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

/** The navbar links of the product being read: its docs plus product-specific pages. */
export function ProductNavNavbarItem({ mobile, position }: NavbarItemProps) {
  const current = useCurrentProduct();

  return (
    <>
      {current.links.map(link => (
        <DefaultNavbarItem key={link.label} mobile={mobile} position={position} label={link.label} to={link.to} href={link.href} activeBaseRegex={link.activeBaseRegex} />
      ))}
    </>
  );
}

/** The right-hand GitHub link and "Get started" button, pointing at the product being read. */
export function ProductActionsNavbarItem({ mobile }: NavbarItemProps) {
  const current = useCurrentProduct();
  const getStarted = useBaseUrl(current.getStarted);

  return (
    <>
      <DefaultNavbarItem mobile={mobile} position="right" label="GitHub" href={current.repo} className="navbar__github-link" aria-label="GitHub repository" />
      {/* Same markup the static html item rendered, so the existing .navbar__cta-primary styles apply. */}
      <HtmlNavbarItem mobile={mobile} value={`<a class="navbar__cta-primary" href="${getStarted}">Get started</a>`} />
    </>
  );
}
