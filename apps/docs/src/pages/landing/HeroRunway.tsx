import { useState, type JSX } from 'react';
import Link from '@docusaurus/Link';
import TakeoffLogo3D from '@site/src/components/TakeoffLogo3D';
import styles from './HeroRunway.module.css';

const INSTALL_CMD = 'pnpm add @takeoff-ui/react-spar @takeoff-design/tokens @turkish-technology/spar';

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

function PlayIcon(): JSX.Element {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 6 L12 9 L7.5 12 Z" fill="currentColor" stroke="none" />
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
            <span className={styles.releaseBadge}>DOCS</span>
            <span>Installation, components, philosophy, and migration →</span>
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
            <Link to="/docs/components/overview" className={styles.ctaGhost}>
              <PlayIcon />
              Browse components
            </Link>
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
