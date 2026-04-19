import { useState, type JSX } from 'react';
import Link from '@docusaurus/Link';
import TakeoffLogo3D from '@site/src/components/TakeoffLogo3D';
import styles from './HeroRunway.module.css';

const INSTALL_CMD = 'pnpm add @takeoff-ui/react-spar';

function CopyIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3 3v7.5a1.5 1.5 0 0 0 1.5 1.5" stroke="currentColor" strokeWidth="1.25" />
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
            <span className={styles.releaseBadge}>NEW</span>
            <span>Phase B — Button, Input, Checkbox shipping →</span>
          </Link>

          <h1 id="runway-hero-headline" className={styles.headline}>
            <span className={styles.line}>React components</span>
            <span className={styles.line}>
              for <span className={styles.accent}>flight.</span>
            </span>
            <span className={styles.line}>
              <span className={styles.highlight}>Ready for takeoff.</span>
            </span>
          </h1>

          <p className={styles.subhead}>
            <strong>@takeoff-ui/react-spar</strong> is the React 19 face of Turkish Technology's Spar primitives and Takeoff design tokens. Load-bearing by default, additively
            customizable, engineered to stay stable across every upgrade.
          </p>

          <div className={styles.ctaRow}>
            <Link to="/docs/" className={styles.ctaPrimary}>
              Start building
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
              <dt className={styles.statValue}>
                <em>5</em>
              </dt>
              <dd className={styles.statLabel}>Components</dd>
            </div>
            <div>
              <dt className={styles.statValue}>React 19</dt>
              <dd className={styles.statLabel}>First-class</dd>
            </div>
            <div>
              <dt className={styles.statValue}>A11Y</dt>
              <dd className={styles.statLabel}>WCAG 2.1</dd>
            </div>
            <div>
              <dt className={styles.statValue}>MIT</dt>
              <dd className={styles.statLabel}>Open source</dd>
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
