import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Accordion, Badge, Button, Field, Input, Spinner, Switch } from '@takeoff-ui/react-spar';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';
import styles from './ComponentGrid.module.css';

/*
 * ComponentGrid — six live-preview cards for the landing. Button, Input,
 * Badge, Switch, Accordion, and Spinner render the real
 * `@takeoff-ui/react-spar` components.
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
          <Input.Field defaultValue="Istanbul (IST)" />
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
    <Field className={styles.switchRow}>
      <Field.Label>{label}</Field.Label>
      <Switch defaultChecked={defaultChecked}>
        <Switch.Indicator />
      </Switch>
    </Field>
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

function AccordionCardDemo(): JSX.Element {
  return (
    <div className={`${styles.demo} ${styles.accordionDemo}`}>
      <Accordion defaultValue="fare" mode="compact">
        <Accordion.Item value="fare">
          <Accordion.Header>
            <Accordion.Trigger>
              Fare conditions
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Changes are available before departure.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="baggage">
          <Accordion.Header>
            <Accordion.Trigger>
              Baggage allowance
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>One cabin bag is included.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

function SpinnerCardDemo(): JSX.Element {
  return (
    <div className={styles.demo}>
      <div className={styles.spinnerRow} aria-hidden="true">
        <Spinner appearance="rounded" variant="primary" size="large" />
        <Spinner appearance="dots" variant="info" size="large" />
        <Spinner appearance="pulse" variant="neutral" size="large" />
      </div>
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
            Explore shipped components through live previews. Every surface comes with usage guidance, examples, and API coverage so implementation starts from the same contract.
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

          <Link to="/docs/components/accordion" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Accordion</h4>
              <span className={styles.cardMono}>Accordion</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <AccordionCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>

          <Link to="/docs/components/spinner" className={styles.card}>
            <div className={styles.cardTitle}>
              <h4>Spinner</h4>
              <span className={styles.cardMono}>Spinner</span>
            </div>
            <BrowserOnly fallback={<div className={styles.demo} />}>
              {() => (
                <ReactSparDemoRoot>
                  <SpinnerCardDemo />
                </ReactSparDemoRoot>
              )}
            </BrowserOnly>
          </Link>
        </div>

        <div className={styles.exploreRow}>
          <Link to="/docs/components" className={styles.exploreLink}>
            Browse the full component set
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
