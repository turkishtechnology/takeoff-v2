import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Badge, Button, Field, Input, Switch } from '@takeoff-ui/react-spar';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';
import { PlaceholderProgress, PlaceholderAvatarGroup } from '@site/src/components/PlaceholderCustomComponents';
import styles from './ComponentGrid.module.css';

/*
 * ComponentGrid — six live-preview cards for the landing. Button, Input,
 * Badge, and Switch render the real `@takeoff-ui/react-spar` components.
 * Progress and AvatarGroup are still placeholder mocks until those ship —
 * tracked in PlaceholderCustomComponents/index.tsx.
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

function BadgeDot(): JSX.Element {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
      <circle cx="3" cy="3" r="3" fill="currentColor" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Live demos rendering the real react-spar primitives
 * ────────────────────────────────────────────────────────────────────── */

function ButtonsCardDemo(): JSX.Element {
  return (
    <div className={`${styles.demo} ${styles.buttonsDemo}`}>
      <div className={styles.stack}>
        <Button variant="primary" appearance="filled" size="small">
          Primary
        </Button>
        <Button variant="neutral" appearance="outlined" size="small">
          Secondary
        </Button>
        <Button variant="neutral" appearance="text" size="small">
          Ghost
        </Button>
      </div>
      <div className={styles.stack}>
        <Button variant="primary" appearance="filled" size="small">
          Small
        </Button>
        <Button variant="primary" appearance="filled">
          Default
        </Button>
        <Button variant="primary" appearance="filled" size="large">
          Large
        </Button>
      </div>
      <div className={styles.stack}>
        <Button variant="primary" appearance="filled" size="small" startContent={<TakeoffIcon />}>
          Book flight
        </Button>
        <Button variant="neutral" appearance="outlined" size="small" startContent={<LuggageIcon />}>
          Baggage
        </Button>
      </div>
    </div>
  );
}

function InputCardDemo(): JSX.Element {
  return (
    <div className={styles.demo} style={{ padding: '18px 14px', alignItems: 'stretch' }}>
      <Field>
        <Field.Label>Departure airport</Field.Label>
        <Input>
          <Input.Container>
            <Input.Field defaultValue="Istanbul (IST)" />
          </Input.Container>
        </Input>
      </Field>
    </div>
  );
}

function BadgeCardDemo(): JSX.Element {
  return (
    <div className={styles.demo}>
      <div className={styles.badgeRow}>
        <Badge variant="info" appearance="filledLight" startContent={<BadgeDot />}>
          On time
        </Badge>
        <Badge variant="success" appearance="filledLight" startContent={<BadgeDot />}>
          Confirmed
        </Badge>
        <Badge variant="warning" appearance="filledLight" startContent={<BadgeDot />}>
          Delayed
        </Badge>
        <Badge variant="danger" appearance="filledLight" startContent={<BadgeDot />}>
          Cancelled
        </Badge>
      </div>
    </div>
  );
}

function SwitchRow({ defaultChecked, label }: { defaultChecked: boolean; label: string }): JSX.Element {
  return (
    <Switch defaultChecked={defaultChecked} classNames={{ root: styles.switchRow }}>
      <Switch.Label>{label}</Switch.Label>
      <Switch.Control>
        <Switch.Track>
          <Switch.Thumb />
        </Switch.Track>
      </Switch.Control>
    </Switch>
  );
}

function SwitchCardDemo(): JSX.Element {
  return (
    <div className={styles.demo} style={{ padding: '18px 16px' }}>
      <div className={styles.toggles}>
        <SwitchRow defaultChecked label="Flexible dates" />
        <SwitchRow defaultChecked={false} label="Direct flights only" />
        <SwitchRow defaultChecked label="Include nearby" />
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
            Core components,
            <br />
            <em>shipped with the full contract.</em>
          </h2>
          <p className={styles.lede}>
            Accordion, Button, Drawer, and Tooltip are shipped today. The previews alongside them show what is coming next, but nothing ships without docs, examples, and API
            coverage in place.
          </p>
        </div>

        <div className={styles.grid}>
          <Link to="/docs/components/button" className={`${styles.card} ${styles.buttonsCard}`}>
            <div className={styles.cardTitle}>
              <h4>Buttons</h4>
              <span className={styles.cardMono}>Button</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <ButtonsCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>

          <Link to="/docs/components/input" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Input</h4>
              <span className={styles.cardMono}>Input</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <InputCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>

          <Link to="/docs/components/badge" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Badge</h4>
              <span className={styles.cardMono}>Badge</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <BadgeCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>

          <Link to="/docs/components/switch" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Switch</h4>
              <span className={styles.cardMono}>Switch</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <SwitchCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>

          <Link to="/docs/" className={styles.card} aria-label="Progress — planned">
            <div className={styles.cardTitle}>
              <h4>Progress</h4>
              <span className={styles.cardMono}>Progress</span>
            </div>
            <ProgressCardDemo />
          </Link>

          <Link to="/docs/" className={styles.card} aria-label="Avatar group — planned">
            <div className={styles.cardTitle}>
              <h4>Avatar group</h4>
              <span className={styles.cardMono}>AvatarGroup</span>
            </div>
            <AvatarGroupCardDemo />
          </Link>
        </div>

        <div className={styles.exploreRow}>
          <Link to="/docs/" className={styles.exploreLink}>
            Browse the full component set
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
