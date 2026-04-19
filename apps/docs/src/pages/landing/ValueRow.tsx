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
    label: 'Foundations',
    title: 'Design tokens you can trust',
    body: 'Every color, spacing, radius, and shadow is a semantic token from @takeoff-design/tokens. Swap themes without touching components.',
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
    label: 'Spar-shaped',
    title: 'Structure, not sugar',
    body: 'Leaf components stay wrapper-first; compound parts surface only where they map to real structure. No flat content props, no invented APIs.',
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
    title: 'A11Y, not an afterthought',
    body: 'Focus traps, ARIA wiring, and keyboard maps live in Spar primitives. Wrapper components never duplicate them. Reduced-motion honored.',
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
    label: 'Typesafe',
    title: 'Fully typed',
    body: 'Strict TypeScript on every prop, every slot, every data-*. Autocomplete where you expect it, narrowing where you need it — no generics trick.',
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
    label: 'React 19',
    title: 'First-class, from day zero',
    body: 'Built around React 19 — Actions, use(), useOptimistic, Suspense. No legacy branches, no polyfill burden, no compatibility apologies.',
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
    title: 'Dark & light, any brand',
    body: 'CSS custom properties drive every visual. Drop in a new token file and the whole library rebrands — no fork, no Sass recompile, no upgrade drift.',
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
            <span className={styles.eyebrow}>Why this library</span>
            <h2 id="runway-values-title" className={styles.title}>
              Production-grade by <em>default.</em>
            </h2>
          </div>
          <p className={styles.headBody}>
            Six commitments that run through every component surface — from the tokens you theme against to the compound parts you compose. Nothing aspirational; this is the
            contract.
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
