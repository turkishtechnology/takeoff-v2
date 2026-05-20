import type { JSX } from 'react';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';
import FooterRunway from './landing/FooterRunway';
import { CHANGELOG_ENTRIES, type ChangelogEntry, type ChangelogItem, type ChangelogMedia, type ChangelogSection } from '@site/src/data/changelog';
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

// Render plain text with inline backtick spans (`code`) as <code>. Keeps the
// data shape simple — authors don't need to escape angle brackets, they just
// wrap identifiers/JSX in backticks.
function renderInlineCode(text: string): Array<JSX.Element | string> {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function normalizeItem(item: string | ChangelogItem): ChangelogItem {
  return typeof item === 'string' ? { text: item } : item;
}

function ItemCodeBlock({ code }: { code: NonNullable<ChangelogItem['code']> }): JSX.Element {
  return (
    <div className={styles.itemCode}>
      {code.before !== undefined ? (
        <div className={styles.itemCodeBlock} data-variant="before">
          <span className={styles.itemCodeLabel}>Before</span>
          <pre className={styles.itemCodePre}>
            <code>{code.before}</code>
          </pre>
        </div>
      ) : null}
      {code.after !== undefined ? (
        <div className={styles.itemCodeBlock} data-variant="after">
          <span className={styles.itemCodeLabel}>After</span>
          <pre className={styles.itemCodePre}>
            <code>{code.after}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function SectionItems({ items }: { items: Array<string | ChangelogItem> }): JSX.Element {
  return (
    <ul className={styles.sectionList}>
      {items.map((raw, i) => {
        const item = normalizeItem(raw);
        return (
          <li key={i} className={styles.sectionItem}>
            <span className={styles.sectionItemText}>{renderInlineCode(item.text)}</span>
            {item.code ? <ItemCodeBlock code={item.code} /> : null}
          </li>
        );
      })}
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
