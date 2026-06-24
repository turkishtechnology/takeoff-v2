import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import { ArrowRightIconOutlinedRounded } from '@takeoff-icons/react/arrow-right';
import { DocumentSearchIconOutlinedRounded } from '@takeoff-icons/react/document-search';
import styles from './ClosingCTA.module.css';

export default function ClosingCTA(): JSX.Element {
  return (
    <section className={styles.band} aria-labelledby="runway-closing-title">
      <div className={styles.panel}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Apache-2.0 licensed · React 19 · public docs</p>
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
              <ArrowRightIconOutlinedRounded className={styles.icon} aria-hidden="true" />
            </Link>
            <Link to="/docs/" className={styles.ctaGhost}>
              <DocumentSearchIconOutlinedRounded className={styles.icon} aria-hidden="true" />
              Browse components
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
