import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './ClosingCTA.module.css';

export default function ClosingCTA(): JSX.Element {
  return (
    <section className={styles.band} aria-labelledby="runway-closing-title">
      <div className={styles.panel}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>MIT licensed · React 19 · public docs</p>
          <h2 id="runway-closing-title" className={styles.headline}>
            A stable surface to <em>build on.</em>
          </h2>
          <p className={styles.subhead}>
            Installation guides, component references, philosophy notes, migration paths, and changelog all point at the same contract. That alignment is what makes the library
            usable in real product work.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/docs/installation" className={styles.ctaPrimary}>
              Get started
              <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8 H12 M8.5 4 L12 8 L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/docs/" className={styles.ctaGhost}>
              <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 3h8v10H4z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 6h4M6 8h4M6 10h3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Browse components
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
