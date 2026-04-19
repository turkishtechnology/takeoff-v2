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
    label: 'Pillar 01',
    verb: 'Shape it.',
    aphorism: 'Components mirror the structure they represent — not the props a generator could invent.',
    href: '/docs/philosophy/spar-shaped',
  },
  {
    label: 'Pillar 02',
    verb: 'Align it.',
    aphorism: 'We ship parity with Takeoff UI Core on the surfaces that matter: prop names, states, slots, data-* hooks.',
    href: '/docs/philosophy/parity-first',
  },
  {
    label: 'Pillar 03',
    verb: 'Extend it.',
    aphorism: 'Every customization surface is additive. No render-overrides, no escape hatches, no upgrade tax.',
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
          <span className={styles.eyebrow}>Design philosophy</span>
          <h2 id="runway-philosophy-title" className={styles.title}>
            Three pillars. No escape hatches.
          </h2>
          <p className={styles.lede}>
            The library earns its name from engineering, not marketing. Every API decision runs through the same three commitments — so the surface you learn today keeps working
            the day we ship the next component.
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
