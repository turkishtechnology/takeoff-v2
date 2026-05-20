import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LoadContext, Plugin } from '@docusaurus/types';
import type { PackageChangelog, PackageChangelogVersion, PackageChangelogsData } from '../src/data/package-changelogs-types';

// Maps the short key (used in changelog.ts entries) to the on-disk package
// directory. `tailwind` is included as a best-effort lookup — it currently has
// no CHANGELOG.md (private + ignored by Changesets) and is silently skipped.
const PACKAGE_DIRS: Array<{ key: string; dir: string }> = [
  { key: 'react-spar', dir: 'react-spar' },
  { key: 'tokens', dir: 'tokens' },
  { key: 'tailwind', dir: 'tailwind' },
];

const VERSION_HEADING = /^##\s+(.+?)\s*$/u;

function parseChangelog(markdown: string): { name: string; versions: PackageChangelogVersion[] } {
  const lines = markdown.split(/\r?\n/u);
  let name = '';
  const versions: PackageChangelogVersion[] = [];

  // The first `#` heading is the package name (Changesets writes it).
  const headingIndex = lines.findIndex(l => /^#\s+/u.test(l));
  if (headingIndex !== -1) {
    name = lines[headingIndex].replace(/^#\s+/u, '').trim();
  }

  let current: PackageChangelogVersion | null = null;
  const bodyLines: string[] = [];

  const flush = (): void => {
    if (current) {
      current.body = bodyLines.join('\n').trim();
      versions.push(current);
    }
  };

  for (let i = headingIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const match = VERSION_HEADING.exec(line);
    if (match) {
      flush();
      current = { version: match[1].trim(), body: '' };
      bodyLines.length = 0;
      continue;
    }
    if (current) {
      bodyLines.push(line);
    }
  }
  flush();

  return { name, versions };
}

export default function packageChangelogsPlugin(context: LoadContext): Plugin {
  const packagesRoot = resolve(context.siteDir, '..', '..', 'packages');

  return {
    name: 'package-changelogs',
    async loadContent(): Promise<PackageChangelogsData> {
      const packages: PackageChangelog[] = [];
      for (const { key, dir } of PACKAGE_DIRS) {
        const file = resolve(packagesRoot, dir, 'CHANGELOG.md');
        if (!existsSync(file)) continue;
        const raw = readFileSync(file, 'utf8');
        const parsed = parseChangelog(raw);
        if (parsed.versions.length === 0) continue;
        packages.push({ key, name: parsed.name, versions: parsed.versions });
      }
      return { packages };
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content as PackageChangelogsData);
    },
    getPathsToWatch() {
      return PACKAGE_DIRS.map(({ dir }) => resolve(packagesRoot, dir, 'CHANGELOG.md'));
    },
  };
}
