import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import changelog from '@site/src/data/icons-changelog.json';
import { iconEntries, type IconVariantSvg } from '@site/src/data/icons.generated';
import styles from './styles.module.css';

interface IconRelease {
  version: string;
  date: string | null;
  total: number;
  initial?: boolean;
  added: string[];
  removed: string[];
  newVariants: Array<{ name: string; variants: string[] }>;
  redrawn: string[];
}

const releases = changelog.releases as IconRelease[];

function galleryLink(name: string): string {
  return `/icons/gallery?q=${encodeURIComponent(name)}`;
}

function formatDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function IconTile({ name, svg }: { name: string; svg: IconVariantSvg | null | undefined }) {
  return (
    <Link className={styles.tile} data-plain-link to={galleryLink(name)} title={`Open ${name} in the gallery`}>
      {svg ? (
        <svg className={styles.glyph} viewBox={svg.viewBox} width={24} height={24} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg.svg }} />
      ) : (
        <span className={styles.glyph} aria-hidden="true" />
      )}
      <span className={styles.tileName}>{name}</span>
    </Link>
  );
}

function NameList({ names }: { names: string[] }) {
  return (
    <ul className={styles.names}>
      {names.map(name => (
        <li key={name}>
          <Link to={galleryLink(name)}>
            <code>{name}</code>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Release({ release, svgs }: { release: IconRelease; svgs: Map<string, IconVariantSvg | null> }) {
  const date = formatDate(release.date);
  const stats = release.initial
    ? [plural(release.total, 'icon')]
    : [
        `${release.added.length} new`,
        release.newVariants.length ? `${release.newVariants.length} with new variants` : null,
        release.redrawn.length ? `${release.redrawn.length} redrawn` : null,
        release.removed.length ? `${release.removed.length} removed` : null,
        `${release.total} in total`,
      ].filter(Boolean);

  return (
    <section className={styles.release}>
      <header className={styles.releaseHeader}>
        <Heading as="h2" id={`v${release.version.replaceAll('.', '-')}`} className={styles.version}>
          {release.version}
        </Heading>
        {date ? <span className={styles.date}>{date}</span> : null}
      </header>
      <p className={styles.stats}>{stats.join(' · ')}</p>

      {release.initial ? (
        <p>
          The first release, with {plural(release.total, 'icon')}. Browse them in the <Link to="/icons/gallery">gallery</Link>.
        </p>
      ) : null}

      {release.added.length ? (
        <div className={styles.grid}>
          {release.added.map(name => (
            <IconTile key={name} name={name} svg={svgs.get(name)} />
          ))}
        </div>
      ) : null}

      {release.newVariants.length ? (
        <details className={styles.disclosure}>
          <summary>New variants on existing icons ({release.newVariants.length})</summary>
          <ul className={styles.variants}>
            {release.newVariants.map(({ name, variants }) => (
              <li key={name}>
                <Link to={galleryLink(name)}>
                  <code>{name}</code>
                </Link>{' '}
                {variants.join(', ')}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {release.redrawn.length ? (
        <details className={styles.disclosure}>
          <summary>Redrawn icons ({release.redrawn.length})</summary>
          <NameList names={release.redrawn} />
        </details>
      ) : null}

      {release.removed.length ? (
        <details className={styles.disclosure} open>
          <summary>Removed icons ({release.removed.length})</summary>
          <NameList names={release.removed} />
        </details>
      ) : null}
    </section>
  );
}

/**
 * Release history of Takeoff Icons, newest first: the icons each version added,
 * plus the existing icons it redrew or gave new variants. Data comes from
 * `src/data/icons-changelog.json` (see scripts/generate-icons-changelog.mjs).
 */
export default function IconChangelog() {
  const svgs = useMemo(() => new Map(iconEntries.map(entry => [entry.name, entry.defaultSvg])), []);

  return (
    <div className={styles.changelog}>
      {releases.map(release => (
        <Release key={release.version} release={release} svgs={svgs} />
      ))}
    </div>
  );
}
