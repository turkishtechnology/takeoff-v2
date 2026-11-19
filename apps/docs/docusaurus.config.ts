import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
import reactSparPackage from '../../packages/react-spar/package.json';
import sparPackage from '../../packages/spar/package.json';
import tailwindPlugin from './plugins/tailwind';
import headlessScopePlugin from './plugins/headless-scope';
import packageChangelogsPlugin from './plugins/package-changelogs';

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

// The Algolia search key is supplied at build time and never committed. Builds
// without it (local dev, CI) ship without the search box.
const algoliaSearchApiKey = process.env.ALGOLIA_SEARCH_API_KEY;

if (!algoliaSearchApiKey) {
  console.warn('[docs] ALGOLIA_SEARCH_API_KEY is not set; building without Algolia search.');
}

// Takeoff Icons is consumed from npm; its version is the one installed for the docs.
const iconsVersion = (JSON.parse(readFileSync(resolve(process.cwd(), 'node_modules/@takeoff-icons/core/package.json'), 'utf8')) as { version: string }).version;

const config: Config = {
  title: 'Takeoff Spar',
  tagline: 'Product docs for the React-first Spar wrapper layer.',
  favicon: 'img/favicon.ico',
  url: 'https://takeoff-v2.app.turkishtechlab.com',
  baseUrl: '/',
  stylesheets: ['https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'],
  onBrokenLinks: 'throw',
  customFields: {
    // Shown next to the product name in the navbar switcher.
    productVersions: {
      react: reactSparPackage.version,
      headless: sparPackage.version,
      icons: iconsVersion,
    },
  },
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
        blog: false,
        docs: {
          sidebarPath: './sidebars.ts',
          sidebarCollapsed: false,
        },
        theme: {
          // headless/index.scss is scoped to /headless routes by plugins/headless-scope.ts.
          customCss: ['./src/css/custom.css', './src/css/headless/index.scss'],
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    tailwindPlugin,
    // After tailwind: it replaces the PostCSS plugin list, this one appends to it.
    headlessScopePlugin,
    'docusaurus-plugin-sass',
    packageChangelogsPlugin,
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'icons',
        path: 'icons',
        routeBasePath: 'icons',
        sidebarPath: './sidebars.icons.ts',
        sidebarCollapsed: false,
      },
    ],
    [
      // Takeoff Headless: the @turkish-technology/spar primitives, moved from the
      // standalone Spar site (spar.app.turkishtechlab.com). Its landing and
      // accessibility pages live in src/pages/headless.
      '@docusaurus/plugin-content-docs',
      {
        id: 'headless',
        path: 'headless',
        routeBasePath: 'headless/docs',
        sidebarPath: './sidebars.headless.ts',
      },
    ],
  ],
  themeConfig: {
    image: 'img/takeoff-og.jpg',
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: false,
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
        // Takeoff React · Takeoff Headless · Takeoff Icons, with the current product's version.
        {
          type: 'custom-productSwitcher',
          position: 'left',
        },
        // Docs of the product being read.
        {
          type: 'custom-productDocs',
          position: 'left',
        },
        {
          to: '/changelog',
          label: 'Changelog',
          position: 'left',
          activeBaseRegex: '^/changelog',
        },
        {
          to: '/docs/ai-assistants',
          label: 'AI assistants',
          position: 'left',
          activeBaseRegex: '^/docs/ai-assistants',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          'href': 'https://github.com/turkishtechnology/takeoff-v2',
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
    ...(algoliaSearchApiKey
      ? {
          algolia: {
            appId: process.env.ALGOLIA_APP_ID || 'UG7TKIU7YU',
            apiKey: algoliaSearchApiKey,
            indexName: process.env.ALGOLIA_INDEX_NAME || 'takeoff_v2_docs',
            contextualSearch: true,
            searchPagePath: 'search',
            insights: false,
          },
        }
      : {}),
  } satisfies Preset.ThemeConfig,
};

export default config;
