import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Button, Input } from '@takeoff-ui/react-spar';
import { PlaceholderBadge, PlaceholderSwitchRow, PlaceholderProgress, PlaceholderAvatarGroup } from '@site/src/components/PlaceholderCustomComponents';
import styles from './ComponentGrid.module.css';

/*
 * ComponentGrid — six live-preview cards for the landing.
 * Real react-spar components (Button, Input) + mocks from
 * @site/src/components/PlaceholderCustomComponents. The TODO(react-spar)
 * tracker lives in PlaceholderCustomComponents/index.tsx — one source of
 * truth for every component we're temporarily mocking.
 */

function TakeoffIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 17l6-2 3-8 3 3-1 4 6-2 2 2-17 6v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LuggageIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="5" y="7" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Real components — dogfooding @takeoff-ui/react-spar
 * ────────────────────────────────────────────────────────────────────── */

function ButtonsCardDemo(): JSX.Element {
  return (
    <div className={`${styles.demo} ${styles.buttonsDemo}`}>
      <div className={styles.stack}>
        <Button variant="primary" type="filled" size="small">
          Primary
        </Button>
        <Button variant="neutral" type="outlined" size="small">
          Secondary
        </Button>
        <Button variant="neutral" type="text" size="small">
          Ghost
        </Button>
      </div>
      <div className={styles.stack}>
        <Button variant="primary" type="filled" size="small">
          Small
        </Button>
        <Button variant="primary" type="filled">
          Default
        </Button>
        <Button variant="primary" type="filled" size="large">
          Large
        </Button>
      </div>
      <div className={styles.stack}>
        <Button variant="primary" type="filled" size="small">
          <TakeoffIcon />
          Book flight
        </Button>
        <Button variant="neutral" type="outlined" size="small">
          <LuggageIcon />
          Baggage
        </Button>
      </div>
    </div>
  );
}

function InputCardDemo(): JSX.Element {
  return (
    <div className={styles.demo} style={{ padding: '18px 14px', alignItems: 'stretch' }}>
      <Input readOnly defaultValue="Istanbul (IST)" style={{ width: '100%' }}>
        <Input.Label>Departure airport</Input.Label>
        <Input.Container>
          <Input.Field />
        </Input.Container>
      </Input>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Mock demos — use shared placeholder primitives
 * ────────────────────────────────────────────────────────────────────── */

function BadgeCardDemo(): JSX.Element {
  return (
    <div className={styles.demo}>
      <div className={styles.badgeRow}>
        <PlaceholderBadge variant="info">On time</PlaceholderBadge>
        <PlaceholderBadge variant="ok">Confirmed</PlaceholderBadge>
        <PlaceholderBadge variant="warn">Delayed</PlaceholderBadge>
        <PlaceholderBadge variant="err">Cancelled</PlaceholderBadge>
      </div>
    </div>
  );
}

function SwitchCardDemo(): JSX.Element {
  return (
    <div className={styles.demo} style={{ padding: '18px 16px' }}>
      <div className={styles.toggles}>
        <PlaceholderSwitchRow checked={true} label="Flexible dates" />
        <PlaceholderSwitchRow checked={false} label="Direct flights only" />
        <PlaceholderSwitchRow checked={true} label="Include nearby" />
      </div>
    </div>
  );
}

function ProgressCardDemo(): JSX.Element {
  return (
    <div className={styles.demo} style={{ padding: '18px 16px' }}>
      <div className={styles.progress}>
        <PlaceholderProgress label="Boarding" value="~78%" pulse />
        <PlaceholderProgress label="Baggage loaded" value="100%" />
      </div>
    </div>
  );
}

function AvatarGroupCardDemo(): JSX.Element {
  return (
    <div className={styles.demo}>
      <PlaceholderAvatarGroup initials={['EY', 'MK', 'SA', '+12']} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Section
 * ────────────────────────────────────────────────────────────────────── */

export default function ComponentGrid(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="runway-components-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Documentation</p>
          <h2 id="runway-components-title" className={styles.title}>
            Foundational components,
            <br />
            <em>documented end to end.</em>
          </h2>
          <p className={styles.lede}>
            Buttons, Inputs, Checkbox, Dialog, and Accordion define the first public surface of the library. The adjacent previews show the vocabulary the next ports will follow,
            but this site only treats a component as shipped when its docs, examples, and API table are in place.
          </p>
        </div>

        <div className={styles.grid}>
          <Link to="/docs/components/button" className={`${styles.card} ${styles.buttonsCard}`}>
            <div className={styles.cardTitle}>
              <h4>Buttons</h4>
              <span className={styles.cardMono}>Button</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>{() => <ButtonsCardDemo />}</BrowserOnly>
          </Link>

          <Link to="/docs/components/input" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Input</h4>
              <span className={styles.cardMono}>Input</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>{() => <InputCardDemo />}</BrowserOnly>
          </Link>

          <Link to="/docs/roadmap" className={styles.card} aria-label="Badge — planned">
            <div className={styles.cardTitle}>
              <h4>Badge</h4>
              <span className={styles.cardMono}>Badge</span>
            </div>
            <BadgeCardDemo />
          </Link>

          <Link to="/docs/roadmap" className={styles.card} aria-label="Switch — planned">
            <div className={styles.cardTitle}>
              <h4>Switch</h4>
              <span className={styles.cardMono}>Switch</span>
            </div>
            <SwitchCardDemo />
          </Link>

          <Link to="/docs/roadmap" className={styles.card} aria-label="Progress — planned">
            <div className={styles.cardTitle}>
              <h4>Progress</h4>
              <span className={styles.cardMono}>Progress</span>
            </div>
            <ProgressCardDemo />
          </Link>

          <Link to="/docs/roadmap" className={styles.card} aria-label="Avatar group — planned">
            <div className={styles.cardTitle}>
              <h4>Avatar group</h4>
              <span className={styles.cardMono}>AvatarGroup</span>
            </div>
            <AvatarGroupCardDemo />
          </Link>
        </div>

        <div className={styles.exploreRow}>
          <Link to="/docs/components/overview" className={styles.exploreLink}>
            Browse the full component set
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
