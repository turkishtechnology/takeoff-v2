import type { JSX, ReactNode } from 'react';
import styles from './ValueRow.module.css';

interface ValueCard {
  index: string;
  label: string;
  title: string;
  body: string;
  icon: ReactNode;
}

const CARDS: ValueCard[] = [
  {
    index: '01',
    label: 'Token contract',
    title: 'Design tokens stay in charge',
    body: 'Color, spacing, radius, and elevation all resolve from @takeoff-design/tokens. Rebrand and theme at the token layer instead of patching components one by one.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3 L21 8 L12 13 L3 8 Z" />
        <path d="M3 12 L12 17 L21 12" />
        <path d="M3 16 L12 21 L21 16" />
      </svg>
    ),
  },
  {
    index: '02',
    label: 'API shape',
    title: 'Structure where structure is real',
    body: 'Roots own state, named parts own content and layout. That keeps the surface close to the rendered anatomy and avoids convenience props that drift over time.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
        <path d="M7 6 L17 6" />
        <path d="M5 8 L12 16" />
        <path d="M19 8 L12 16" />
      </svg>
    ),
  },
  {
    index: '03',
    label: 'Accessibility',
    title: 'A11Y is preserved in the wrapper',
    body: 'ARIA wiring, keyboard behavior, focus management, and reduced-motion expectations come from Spar primitives and remain intact in the React layer.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="8" r="1.25" fill="currentColor" stroke="none" />
        <path d="M12 11 L12 18" />
        <path d="M8 14 L16 14" />
      </svg>
    ),
  },
  {
    index: '04',
    label: 'TypeScript',
    title: 'Types match the docs',
    body: 'Props, slot names, and documented data-* hooks are typed from the same public surface these docs describe, so autocomplete reflects the contract instead of tribal knowledge.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 10 L12 10" />
        <path d="M9.5 10 L9.5 15" />
        <path d="M14 10 C 14 10.5 14.5 11 15 11 L 16 11 C 16.5 11 17 11.5 17 12 L 17 13 C 17 13.5 16.5 14 16 14 L 14 14" />
      </svg>
    ),
  },
  {
    index: '05',
    label: 'React baseline',
    title: 'One modern support target',
    body: 'The library targets React 19 on purpose. Peer dependencies, examples, and documentation all align around the same baseline instead of splitting across legacy branches.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    index: '06',
    label: 'Theming',
    title: 'Customization stays additive',
    body: 'Components read CSS custom properties and expose classNames and slotProps where customization is expected. You extend the surface without replacing the owner nodes it depends on.',
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3 A 9 9 0 0 0 12 21 A 6 6 0 0 1 12 9 A 6 6 0 0 1 12 3 Z" />
      </svg>
    ),
  },
];

export default function ValueRow(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="runway-values-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <span className={styles.eyebrow}>Why teams choose it</span>
            <h2 id="runway-values-title" className={styles.title}>
              A small surface with a <em>strong contract.</em>
            </h2>
          </div>
          <p className={styles.headBody}>
            The promise is not “everything for everyone.” It is a narrower, more durable guarantee: React 19 only, compound composition, token-driven styling, and customization
            that stays additive over time.
          </p>
        </div>

        <div className={styles.grid}>
          {CARDS.map(card => (
            <article key={card.index} className={styles.card}>
              <div className={styles.indexRow}>
                {card.index} <span className={styles.slash}>/</span> {card.label}
              </div>
              <span className={styles.iconChip} aria-hidden="true">
                {card.icon}
              </span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardBody}>{card.body}</p>
              <span className={styles.arrow} aria-hidden="true">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10 H14 M10 5 L14 10 L10 15" />
                </svg>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
