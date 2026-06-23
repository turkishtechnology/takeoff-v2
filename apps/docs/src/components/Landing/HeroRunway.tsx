import { useState, type JSX } from 'react';
import Link from '@docusaurus/Link';
import TakeoffLogo3D from '@site/src/components/TakeoffLogo3D';
import styles from './HeroRunway.module.css';

const INSTALL_CMD = 'pnpm add @takeoff-ui/react-spar';
const GITHUB_REPO_URL = 'https://github.com/turkishtechnology/takeoff-v2';

function CopyIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 15H5.5A2.5 2.5 0 0 1 3 12.5v-8A2.5 2.5 0 0 1 5.5 2h8A2.5 2.5 0 0 1 16 4.5V5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon(): JSX.Element {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 9 H14 M9.5 4.5 L14 9 L9.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubIcon(): JSX.Element {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.89-.39c.98 0 1.96.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.26 5.68.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function ExternalArrowIcon(): JSX.Element {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 12 L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5 H13 V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroRunway(): JSX.Element {
  const [copied, setCopied] = useState(false);

  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="runway-hero-headline">
      <div className={styles.inner}>
        {/* Copy ---------------------------------------------------- */}
        <div className={styles.copy}>
          <Link to="/changelog" className={styles.releasePill}>
            <span className={styles.releaseBadge}>CHANGELOG</span>
            <span>Release notes, shipped components, and notable updates →</span>
          </Link>

          <h1 id="runway-hero-headline" className={styles.headline}>
            <span className={styles.line}>The React surface</span>
            <span className={styles.line}>
              for the <span className={styles.accent}>Takeoff</span>
            </span>
            <span className={styles.line}>
              <span className={styles.highlight}>design system.</span>
            </span>
          </h1>

          <p className={styles.subhead}>
            <strong>@takeoff-ui/react-spar</strong> brings Spar primitives, Takeoff design tokens, and a stable compound API together in one React 19 library. It is built to theme
            cleanly, compose predictably, and stay understandable as the component set grows.
          </p>

          <div className={styles.ctaRow}>
            <Link to="/docs/installation" className={styles.ctaPrimary}>
              Get started
              <ArrowIcon />
            </Link>
            <a href={GITHUB_REPO_URL} className={styles.ctaGhost} target="_blank" rel="noreferrer">
              <GitHubIcon />
              Support on GitHub
              <ExternalArrowIcon />
            </a>
          </div>

          <div className={styles.install} role="group" aria-label="Install command">
            <span className={styles.installPrompt}>$</span>
            <code className={styles.installCmd}>{INSTALL_CMD}</code>
            <button type="button" className={styles.installCopy} onClick={onCopy} data-copied={copied ? 'true' : 'false'} aria-label={copied ? 'Copied' : 'Copy install command'}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt className={styles.statValue}>Compound</dt>
              <dd className={styles.statLabel}>API model</dd>
            </div>
            <div>
              <dt className={styles.statValue}>React 19</dt>
              <dd className={styles.statLabel}>Baseline</dd>
            </div>
            <div>
              <dt className={styles.statValue}>Tokens</dt>
              <dd className={styles.statLabel}>Theme layer</dd>
            </div>
            <div>
              <dt className={styles.statValue}>MIT</dt>
              <dd className={styles.statLabel}>License</dd>
            </div>
          </dl>
        </div>

        {/* 3D stage (right column) ---------------------------------- */}
        <div className={styles.stage}>
          <span className={`${styles.stageRing} ${styles.stageRing1}`} aria-hidden="true" />
          <span className={`${styles.stageRing} ${styles.stageRing2}`} aria-hidden="true" />
          <span className={`${styles.stageRing} ${styles.stageRing3}`} aria-hidden="true" />

          <div className={styles.stageLogoSlot}>
            <TakeoffLogo3D color="#ff1736" />
          </div>

          <span className={`${styles.stageCorner} ${styles.cornerTl}`} aria-hidden="true" />
          <span className={`${styles.stageCorner} ${styles.cornerTr}`} aria-hidden="true" />
          <span className={`${styles.stageCorner} ${styles.cornerBl}`} aria-hidden="true" />
          <span className={`${styles.stageCorner} ${styles.cornerBr}`} aria-hidden="true" />

          <div className={styles.stageReadout} aria-hidden="true">
            <span>
              <span className={styles.readoutDot} />
              Renderer · WebGL
            </span>
            <span>Takeoff / 35.04°N</span>
          </div>
        </div>
      </div>
    </section>
  );
}
