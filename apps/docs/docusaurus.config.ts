import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const fileContents = readFileSync(filePath, 'utf8');

  for (const rawLine of fileContents.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const normalizedValue = rawValue.replace(/^['"]|['"]$/gu, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = normalizedValue;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const config: Config = {
  title: 'Takeoff Spar',
  tagline: 'Product docs for the React-first Spar wrapper layer.',
  favicon: 'img/favicon.ico',
  url: 'https://takeoff-v2.app.turkishtechlab.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          sidebarCollapsed: false,
        },
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/takeoff-og.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Takeoff Spar',
      logo: {
        alt: 'Takeoff Spar',
        src: 'img/brand-mark.svg',
        srcDark: 'img/brand-mark-dark.svg',
        width: 22,
        height: 22,
      },
      hideOnScroll: false,
      items: [
        {
          type: 'html',
          position: 'left',
          value: '<span class="navbar__version-pill">v0.0.1</span>',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/changelog',
          label: 'Changelog',
          position: 'left',
          activeBaseRegex: '^/changelog',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          'href': 'https://github.com/turkishtechnology/takeoff-spar',
          'position': 'right',
          'label': 'GitHub',
          'className': 'navbar__github-link',
          'aria-label': 'GitHub repository',
        },
        // TODO(react-spar): swap this html item for a <Button variant="primary">
        // once Docusaurus navbar items support React nodes (requires swizzling
        // @theme/Navbar/Layout). Keeping as styled anchor for minimal-risk parity.
        {
          type: 'html',
          position: 'right',
          value: '<a class="navbar__cta-primary" href="/docs/">Get started</a>',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs',
            },
            {
              label: 'Installation',
              to: '/docs/installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Releases',
              href: 'https://github.com/turkishtechnology/takeoff-spar/releases',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/turkishtechnology/takeoff-spar',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Takeoff Spar`,
    },
    algolia: {
      appId: process.env.ALGOLIA_APP_ID || 'X1Z85QJPUV',
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || 'bf7211c161e8205da2f933a02534105a',
      indexName: process.env.ALGOLIA_INDEX_NAME || 'docusaurus-2',
      contextualSearch: true,
      searchPagePath: 'search',
      insights: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
