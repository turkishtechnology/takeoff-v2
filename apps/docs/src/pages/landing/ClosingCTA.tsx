import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './ClosingCTA.module.css';

export default function ClosingCTA(): JSX.Element {
  return (
    <section className={styles.band} aria-labelledby="runway-closing-title">
      <div className={styles.panel}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Open source · MIT · v0.0.x</p>
          <h2 id="runway-closing-title" className={styles.headline}>
            Clear for <em>takeoff.</em>
          </h2>
          <p className={styles.subhead}>Install the library, wire up the provider, ship your first Spar-shaped component tonight. We'd love to see what you build.</p>
          <div className={styles.ctaRow}>
            <Link to="/docs/" className={styles.ctaPrimary}>
              Start building
              <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8 H12 M8.5 4 L12 8 L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="https://github.com/turkishtechnology/takeoff-spar" className={styles.ctaGhost}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2 L15 9 L22 9.3 L16.5 14 L18.2 21 L12 17.3 L5.8 21 L7.5 14 L2 9.3 L9 9 Z" />
              </svg>
              Star on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
