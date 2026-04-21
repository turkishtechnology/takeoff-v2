import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './PhilosophyBand.module.css';

interface Pillar {
  label: string;
  verb: string;
  aphorism: string;
  href: string;
}

const PILLARS: Pillar[] = [
  {
    label: 'Principle 01',
    verb: 'Shape it.',
    aphorism: 'Components expose structure where structure is real, not where a convenience prop would be easier to add.',
    href: '/docs/philosophy/spar-shaped',
  },
  {
    label: 'Principle 02',
    verb: 'Align it.',
    aphorism: 'React surfaces stay aligned with Takeoff Core on the contracts consumers actually depend on: state, slots, and styling hooks.',
    href: '/docs/philosophy/parity-first',
  },
  {
    label: 'Principle 03',
    verb: 'Extend it.',
    aphorism: 'React-only enhancements stay additive, so customization never breaks the owner nodes and selectors the system relies on.',
    href: '/docs/philosophy/additive-customization',
  },
];

export default function PhilosophyBand(): JSX.Element {
  return (
    <section className={styles.band} aria-labelledby="runway-philosophy-title">
      <div className={styles.bandRings} aria-hidden="true">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="196" />
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="100" />
          <circle cx="200" cy="200" r="60" />
        </svg>
      </div>
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Product philosophy</span>
          <h2 id="runway-philosophy-title" className={styles.title}>
            Three principles keep the API predictable.
          </h2>
          <p className={styles.lede}>
            These are the rules behind every shipped surface in the library. They explain why the API reads consistently, why styling hooks stay stable, and why customization does
            not turn into migration debt later.
          </p>
        </div>
        <div className={styles.pillars}>
          {PILLARS.map(pillar => (
            <Link key={pillar.label} to={pillar.href} className={styles.pillar}>
              <span className={styles.pillarLabel}>{pillar.label}</span>
              <h3 className={styles.pillarVerb}>{pillar.verb}</h3>
              <p className={styles.pillarAphorism}>{pillar.aphorism}</p>
              <span className={styles.pillarLink}>Read more</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
