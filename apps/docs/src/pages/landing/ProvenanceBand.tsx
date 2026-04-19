import type { JSX } from 'react';
import styles from './ProvenanceBand.module.css';

export default function ProvenanceBand(): JSX.Element {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.sub}>Built by Turkish Technology</p>
        <h2 className={styles.headline}>
          Open-sourced so your product can stand on the same <em>wing</em>.
        </h2>
        <div className={styles.logos}>
          <a href="https://turkishtechnology.com" target="_blank" rel="noreferrer noopener" className={styles.wordmark}>
            Turkish Technology
          </a>
          <a href="https://github.com/turkishtechnology/spar" target="_blank" rel="noreferrer noopener" className={styles.wordmark}>
            Spar Primitives
          </a>
          <a href="https://design.takeoff.turkishtechnology.com" target="_blank" rel="noreferrer noopener" className={styles.wordmark}>
            Takeoff Design
          </a>
        </div>
      </div>
    </section>
  );
}
