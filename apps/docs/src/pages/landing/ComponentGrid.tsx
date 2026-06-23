import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Badge, Button, Field, Input, Switch } from '@takeoff-ui/react-spar';
import { ReactSparDemoRoot } from '@site/src/components/ReactSparDocs';
import { PlaceholderProgress, PlaceholderAvatarGroup } from '@site/src/components/PlaceholderCustomComponents';
import { ArrowRightIconOutlinedRounded } from '@takeoff-icons/react/arrow-right';
import { ShoppingBagIconOutlinedRounded } from '@takeoff-icons/react/shopping-bag';
import { TakeoffRocketIconOutlinedRounded } from '@takeoff-icons/react/takeoff-rocket';
import styles from './ComponentGrid.module.css';

/*
 * ComponentGrid — six live-preview cards for the landing. Button, Input,
 * Badge, and Switch render the real `@takeoff-ui/react-spar` components.
 * Progress and AvatarGroup are still placeholder mocks until those ship —
 * tracked in PlaceholderCustomComponents/index.tsx.
 */

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
        <Button variant="primary" appearance="filled" size="small" startContent={<TakeoffRocketIconOutlinedRounded width={14} height={14} />}>
          Book flight
        </Button>
        <Button variant="neutral" appearance="outlined" size="small" startContent={<ShoppingBagIconOutlinedRounded width={14} height={14} />}>
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
        <Badge variant="info" appearance="filledLight">
          On time
        </Badge>
        <Badge variant="success" appearance="filledLight">
          Confirmed
        </Badge>
        <Badge variant="warning" appearance="filledLight">
          Delayed
        </Badge>
        <Badge variant="danger" appearance="filledLight">
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
            <ArrowRightIconOutlinedRounded width={20} height={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
