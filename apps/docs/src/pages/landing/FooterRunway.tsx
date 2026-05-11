import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import styles from './FooterRunway.module.css';

const TAKEOFF_PATH =
  'M64.24 0H35.04C25.36 0 16.6 3.92 10.26 10.26C3.92 16.6 0 25.36 0 35.04C0 54.39 15.69 70.08 35.04 70.08C54.39 70.08 70.08 54.39 70.08 35.04V5.84C70.08 2.62 67.46 0 64.24 0ZM51.56 51.56C47.33 55.79 41.49 58.4 35.04 58.4C22.13 58.4 11.68 47.95 11.68 35.04C11.68 28.59 14.29 22.75 18.52 18.52C22.75 14.29 28.59 11.68 35.04 11.68C41.49 11.68 47.33 14.29 51.56 18.52C55.79 22.75 58.4 28.59 58.4 35.04C58.4 41.49 55.79 47.33 51.56 51.56Z';

interface ColumnLink {
  label: string;
  href: string;
  external?: boolean;
}

interface Column {
  title: string;
  links: ColumnLink[];
}

const COLUMNS: Column[] = [
  {
    title: 'Product',
    links: [
      { label: 'Components', href: '/docs/roadmap' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/docs/roadmap' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Docs', href: '/docs/' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Migration', href: '/docs/migration/from-takeoff-ui-react' },
      { label: 'GitHub', href: 'https://github.com/turkishtechnology/takeoff-spar', external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discussions', href: 'https://github.com/turkishtechnology/takeoff-spar/discussions', external: true },
      { label: 'Contribute', href: '/docs/contributing' },
      { label: 'NPM', href: 'https://www.npmjs.com/package/@takeoff-ui/react-spar', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Turkish Technology', href: 'https://turkishtechnology.com', external: true },
      { label: 'Takeoff Design', href: 'https://design.takeoff.turkishtechnology.com', external: true },
      { label: 'Spar', href: 'https://github.com/turkishtechnology/spar', external: true },
    ],
  },
];

export default function FooterRunway(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand} aria-label="Takeoff Spar">
              <span className={styles.brandLogo} aria-hidden="true">
                <svg viewBox="0 0 71 71" xmlns="http://www.w3.org/2000/svg">
                  <path d={TAKEOFF_PATH} />
                </svg>
              </span>
              Takeoff Spar
            </Link>
            <p className={styles.tagline}>React component docs for the Takeoff design system on Spar primitives. Token-driven, compound-first, MIT-licensed.</p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title} className={styles.column}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer noopener">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link to={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} TURKISH TECHNOLOGY · MIT LICENSE</span>
          <span>BUILT IN ISTANBUL · 41.01°N 28.97°E</span>
        </div>
      </div>
    </footer>
  );
}
