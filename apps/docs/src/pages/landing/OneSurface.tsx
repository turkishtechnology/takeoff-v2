import { Highlight, type PrismTheme } from 'prism-react-renderer';
import { useState, type JSX } from 'react';
import styles from './OneSurface.module.css';

const SPAR_DOCS_URL = 'https://spar.app.turkishtechlab.com/';
const TAKEOFF_UI_CORE_URL = 'https://takeoffui.com';

/* ── Framework icons (inline SVG) ─────────────────────────────────── */

function ReactIcon(): JSX.Element {
  return (
    <svg viewBox="-11.5 -10.2 23 20.4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

function StencilIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 28 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.4167 16.8792C19.157 16.8792 20.067 18.9479 18.891 20.2306L16.0301 23.3515C15.6513 23.7647 15.1164 24 14.5558 24H7.94059C6.20508 24 5.29323 21.941 6.4596 20.6559L9.29206 17.535C9.67114 17.1173 10.209 16.8792 10.773 16.8792H17.4167ZM25.1214 8.43952C26.8613 8.43952 27.7714 10.5077 26.596 11.7906L23.7365 14.9116C23.3576 15.3251 22.8226 15.5605 22.2618 15.5605H2.87797C1.138 15.5605 0.227897 13.4923 1.40333 12.2094L4.2628 9.08843C4.64164 8.67496 5.17666 8.43952 5.73744 8.43952H25.1214ZM20.0421 0C21.7801 0 22.691 2.06422 21.5194 3.34809L18.6717 6.46894C18.2927 6.88422 17.7565 7.12084 17.1943 7.12084H10.5727C8.83397 7.12084 7.92339 5.05519 9.09634 3.77166L11.9483 0.650814C12.3272 0.236187 12.863 0 13.4247 0H20.0421Z"
      />
    </svg>
  );
}

function DocsIcon(): JSX.Element {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 3h8v10H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6h4M6 8h4M6 10h3" stroke="currentColor" strokeWidth="1.5" />
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

function TakeoffCoreIcon(): JSX.Element {
  return (
    <span className={styles.coreIcon} aria-hidden="true">
      <StencilIcon />
    </span>
  );
}

/* ── Syntax-highlight theme (matches existing runway palette) ─────── */

const CODE_THEME: PrismTheme = {
  plain: {
    color: 'var(--runway-ink-dim)',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--runway-ink-ghost)', fontStyle: 'italic' } },
    { types: ['keyword', 'operator'], style: { color: '#c792ea' } },
    { types: ['string', 'attr-value'], style: { color: '#a5d6a7' } },
    { types: ['function', 'class-name'], style: { color: '#ffcb6b' } },
    { types: ['tag'], style: { color: '#ff6b7a' } },
    { types: ['attr-name'], style: { color: 'var(--runway-accent-cyan)' } },
    { types: ['punctuation'], style: { color: 'var(--runway-ink-dim)' } },
  ],
};

/* ── Code samples (plain source) ──────────────────────────────────── */

const SPAR_SOURCE = `// Headless core — behavior + a11y, bring your own styles.
import { Button, Input } from '@turkish-technology/spar';

export function FlightSearch() {
  return (
    <>
      <Input defaultValue="IST">
        <Input.Label>From</Input.Label>
        <Input.Field />
      </Input>
      <Input defaultValue="FRA">
        <Input.Label>To</Input.Label>
        <Input.Field />
      </Input>
      <Button>Search flights</Button>
    </>
  );
}`;

const TAKEOFF_UI_SOURCE = `<!-- Framework-agnostic web components. -->
<!-- Drop into any React, Vue, or Angular app. -->

<tk-input value="IST">
  <tk-input-label>From</tk-input-label>
  <tk-input-field></tk-input-field>
</tk-input>
<tk-input value="FRA">
  <tk-input-label>To</tk-input-label>
  <tk-input-field></tk-input-field>
</tk-input>
<tk-button variant="primary">Search flights</tk-button>`;

const REACT_SPAR_SOURCE = `// React wrapper — typed props, variants, theming defaults.
import { Button, Input } from '@takeoff-ui/react-spar';

export function FlightSearch() {
  return (
    <>
      <Input defaultValue="IST">
        <Input.Label>From</Input.Label>
        <Input.Container><Input.Field /></Input.Container>
      </Input>
      <Input defaultValue="FRA">
        <Input.Label>To</Input.Label>
        <Input.Container><Input.Field /></Input.Container>
      </Input>
      <Button variant="primary">Search flights</Button>
    </>
  );
}`;

/* ── Sample metadata ──────────────────────────────────────────────── */

type SampleKey = 'spar' | 'takeoff-ui' | 'react-spar';

interface SampleMeta {
  label: string;
  filename: string;
  badge: string;
  language: string;
  source: string;
}

const SAMPLE_META: Record<SampleKey, SampleMeta> = {
  'spar': {
    label: 'Spar',
    filename: 'FlightSearch.tsx',
    badge: 'TSX',
    language: 'tsx',
    source: SPAR_SOURCE,
  },
  'takeoff-ui': {
    label: 'Takeoff UI (WC)',
    filename: 'flight-search.html',
    badge: 'HTML',
    language: 'markup',
    source: TAKEOFF_UI_SOURCE,
  },
  'react-spar': {
    label: 'React-Spar',
    filename: 'FlightSearch.tsx',
    badge: 'TSX',
    language: 'tsx',
    source: REACT_SPAR_SOURCE,
  },
};

const SAMPLE_ORDER: SampleKey[] = ['spar', 'takeoff-ui', 'react-spar'];

function CodeSample({ source, language }: { source: string; language: string }): JSX.Element {
  return (
    <Highlight theme={CODE_THEME} code={source} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, j) => (
                <span key={j} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

/* ── Section ──────────────────────────────────────────────────────── */

export default function OneSurface(): JSX.Element {
  const [active, setActive] = useState<SampleKey>('react-spar');
  const meta = SAMPLE_META[active];

  return (
    <section className={styles.section} aria-labelledby="runway-surface-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>One system, three entry points</span>
          <h2 id="runway-surface-title" className={styles.title}>
            React ergonomics.
            <br />
            System-level consistency.
          </h2>
          <p className={styles.lede}>
            Same design system, three surfaces. <code>@turkish-technology/spar</code> is the headless core, <strong>Takeoff UI Core</strong> ships framework-agnostic web
            components, and <code>@takeoff-ui/react-spar</code> is the typed React wrapper — pick the layer that fits your stack.
          </p>

          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillActive}`}>
              <span className={styles.pillIcon}>
                <ReactIcon />
              </span>
              React-Spar
            </span>

            <a href={SPAR_DOCS_URL} className={`${styles.pill} ${styles.pillLink}`} target="_blank" rel="noreferrer noopener">
              <span className={styles.pillIcon}>
                <DocsIcon />
              </span>
              Spar
              <ExternalArrowIcon />
            </a>

            <a href={TAKEOFF_UI_CORE_URL} className={`${styles.pill} ${styles.pillLink}`} target="_blank" rel="noreferrer noopener">
              <TakeoffCoreIcon />
              Takeoff UI Core
              <ExternalArrowIcon />
            </a>
          </div>
        </div>

        <div className={styles.editor}>
          <div className={styles.editorChrome}>
            <div className={styles.editorDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className={styles.editorFilename}>{meta.filename}</span>
            <div role="tablist" aria-label="Ecosystem layer" className={styles.editorTabs}>
              {SAMPLE_ORDER.map(key => {
                const entry = SAMPLE_META[key];
                const selected = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    id={`surface-tab-${key}`}
                    aria-selected={selected}
                    aria-controls="surface-panel"
                    className={`${styles.editorTab} ${selected ? styles.editorTabActive : ''}`}
                    onClick={() => setActive(key)}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
            <span className={styles.editorBadge}>{meta.badge}</span>
          </div>
          <div id="surface-panel" role="tabpanel" aria-labelledby={`surface-tab-${active}`} className={styles.editorBody}>
            <CodeSample source={meta.source} language={meta.language} />
          </div>
        </div>
      </div>
    </section>
  );
}
