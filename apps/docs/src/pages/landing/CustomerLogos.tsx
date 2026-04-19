import type { JSX } from 'react';
import styles from './CustomerLogos.module.css';

const BRANDS = ['Turkish Airlines', 'TK Technology', 'Miles & Smiles', 'TK Cargo', 'THY Opet', 'Anadolujet', 'TK Academy'];

// Double the list so the infinite marquee has no visual break at the wrap.
const TRACK = [...BRANDS, ...BRANDS];

export default function CustomerLogos(): JSX.Element {
  return (
    <section className={styles.strip} aria-label="Takeoff ecosystem">
      <div className={styles.inner}>
        <p className={styles.label}>Built for teams across the Takeoff ecosystem</p>
        <div className={styles.viewport}>
          <div className={styles.track} aria-hidden="false">
            {TRACK.map((b, i) => (
              <span key={`${b}-${i}`} className={styles.item}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
