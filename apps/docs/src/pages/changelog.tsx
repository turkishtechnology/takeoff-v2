import type { JSX } from 'react';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';
import FooterRunway from './landing/FooterRunway';
import { CHANGELOG_ENTRIES, type ChangelogEntry, type ChangelogMedia, type ChangelogSection } from '@site/src/data/changelog';
import styles from './changelog.module.css';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(Date.UTC(y, m - 1, d)));
}

function Chevron(): JSX.Element {
  return (
    <svg className={styles.collapsibleChevron} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionItems({ items }: { items: string[] }): JSX.Element {
  return (
    <ul className={styles.sectionList}>
      {items.map((item, i) => (
        <li key={i} className={styles.sectionItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function RegularSection({ section }: { section: ChangelogSection }): JSX.Element {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{section.title}</h3>
      <SectionItems items={section.items} />
    </div>
  );
}

// TODO: Replace this native <details> disclosure with <Accordion> from
// @takeoff-ui/react-spar once the component is ported into the docs app.
// The data shape (ChangelogSection.collapsible) stays the same.
function CollapsibleSection({ section }: { section: ChangelogSection }): JSX.Element {
  return (
    <details className={styles.collapsible}>
      <summary className={styles.collapsibleSummary}>
        <span>{section.title}</span>
        <Chevron />
      </summary>
      <div className={styles.collapsibleContent}>
        <SectionItems items={section.items} />
      </div>
    </details>
  );
}

function EntryMedia({ media }: { media: ChangelogMedia }): JSX.Element {
  return (
    <figure className={styles.media}>
      <img src={media.src} alt={media.alt} loading="lazy" />
    </figure>
  );
}

function Entry({ entry }: { entry: ChangelogEntry }): JSX.Element {
  const regularSections = entry.sections.filter(s => !s.collapsible);
  const collapsibleSections = entry.sections.filter(s => s.collapsible);
  return (
    <article className={styles.entry}>
      <aside className={styles.meta} aria-label="Release meta">
        {entry.version ? <span className={styles.version}>{entry.version}</span> : null}
        <time className={styles.date} dateTime={entry.date}>
          {formatDate(entry.date)}
        </time>
      </aside>
      <div className={styles.body}>
        <h2 className={styles.entryTitle}>{entry.title}</h2>
        <p className={styles.entrySummary}>{entry.summary}</p>
        {entry.media ? <EntryMedia media={entry.media} /> : null}
        {regularSections.length > 0 ? (
          <div className={styles.sections}>
            {regularSections.map(section => (
              <RegularSection key={section.title} section={section} />
            ))}
          </div>
        ) : null}
        {collapsibleSections.length > 0 ? (
          <div className={styles.collapsibleGroup}>
            {collapsibleSections.map(section => (
              <CollapsibleSection key={section.title} section={section} />
            ))}
          </div>
        ) : null}
        {entry.links && entry.links.length > 0 ? (
          <div className={styles.links}>
            {entry.links.map(link => (
              <a key={link.href} href={link.href} className={styles.linkItem}>
                {link.label} ↗
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Changelog(): JSX.Element {
  useRunwaySurface();
  return (
    <Layout title="Changelog" description="Release notes for @takeoff-ui/react-spar." noFooter>
      <main data-runway-landing="true" className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Changelog</p>
            <h1 className={styles.title}>Release notes</h1>
            <p className={styles.lead}>A quiet log of what shipped in react-spar. Newest first. Each entry is a release beat — what landed, why it matters, and where to look.</p>
          </header>
          <div className={styles.feed}>
            {CHANGELOG_ENTRIES.map(entry => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
        <FooterRunway />
      </main>
    </Layout>
  );
}
