import type { JSX, ReactNode } from 'react';
import Link from '@docusaurus/Link';
import styles from './OneSurface.module.css';

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

function VueIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 196.32 170.02" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M120.83 0L98.16 39.26 75.49 0H0l98.16 170.02L196.32 0h-75.49z" fill="#41B883" />
      <path d="M120.83 0L98.16 39.26 75.49 0H39.26l58.9 102.01L157.06 0h-36.23z" fill="#34495E" />
    </svg>
  );
}

function AngularIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#DD0031" d="M125 30l-99 35 15 131 84 47 84-47 15-131z" />
      <path fill="#C3002F" d="M125 30v220l84-47 15-131L125 30z" />
      <path fill="#FFF" d="M125 52l-64 143h24l13-32h55l13 32h24L125 52zm19 90h-38l19-46 19 46z" />
    </svg>
  );
}

function StencilIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4C47FF" d="M10 6c-3 0-5 2-5 5s2 5 5 5h12c1.5 0 3 1.5 3 3s-1.5 3-3 3H5v4h17c3 0 5-2 5-5s-2-5-5-5H10c-1.5 0-3-1.5-3-3s1.5-3 3-3h17V6H10z" />
    </svg>
  );
}

interface Framework {
  name: string;
  status: 'active' | 'sibling';
  icon: ReactNode;
}

const FRAMEWORKS: Framework[] = [
  { name: 'React', status: 'active', icon: <ReactIcon /> },
  { name: 'Vue', status: 'sibling', icon: <VueIcon /> },
  { name: 'Angular', status: 'sibling', icon: <AngularIcon /> },
  { name: 'Stencil', status: 'sibling', icon: <StencilIcon /> },
];

export default function OneSurface(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="runway-surface-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>React wrapper layer</span>
          <h2 id="runway-surface-title" className={styles.title}>
            React ergonomics.
            <br />
            System-level consistency.
          </h2>
          <p className={styles.lede}>
            This repository focuses on the React package, but it stays aligned with the wider Takeoff ecosystem on tokens, slots, and documented <code>data-*</code> hooks. That
            keeps styling and migration decisions predictable without flattening React into a lowest-common-denominator wrapper.
          </p>

          <div className={styles.pills} role="tablist" aria-label="Takeoff ecosystem wrappers">
            {FRAMEWORKS.map(f => (
              <span key={f.name} className={`${styles.pill} ${f.status === 'active' ? styles.pillActive : styles.pillDim}`} role="tab" aria-selected={f.status === 'active'}>
                <span className={styles.pillIcon}>{f.icon}</span>
                {f.name}
              </span>
            ))}
          </div>

          <Link to="/docs/philosophy/" className={styles.ctaLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 3h8v10H4z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 6h4M6 8h4M6 10h3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Read the philosophy
          </Link>
        </div>

        <div className={styles.editor} aria-hidden="true">
          <div className={styles.editorChrome}>
            <div className={styles.editorDots}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.editorFilename}>FlightSearch.tsx</span>
            <span className={styles.editorBadge}>TSX</span>
          </div>
          <div className={styles.editorBody}>
            <pre>
              <span className={styles.editorLine}>
                <span className="com">{'// Compose a booking surface with explicit structure.'}</span>
              </span>
              <span className={styles.editorLine}>
                <span className="kw">import</span>
                <span className="punct"> {'{ '}</span>
                <span className="fn">Button</span>
                <span className="punct">, </span>
                <span className="fn">Input</span>
                <span className="punct">{' }'} </span>
                <span className="kw">from</span> <span className="str">'@takeoff-ui/react-spar'</span>
                <span className="punct">;</span>
              </span>
              <span className={styles.editorLine}> </span>
              <span className={styles.editorLine}>
                <span className="kw">export function</span> <span className="fn">FlightSearch</span>
                <span className="punct">() {'{'}</span>
              </span>
              <span className={styles.editorLine}>
                {'  '}
                <span className="kw">return</span>
                <span className="punct"> (</span>
              </span>
              <span className={styles.editorLine}>
                {'    '}
                <span className="punct">&lt;</span>
                <span className="tag">Input</span> <span className="attr">defaultValue</span>
                <span className="punct">=</span>
                <span className="str">"IST"</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'      '}
                <span className="punct">&lt;</span>
                <span className="tag">Input.Label</span>
                <span className="punct">&gt;</span>From<span className="punct">&lt;/</span>
                <span className="tag">Input.Label</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'      '}
                <span className="punct">&lt;</span>
                <span className="tag">Input.Container</span>
                <span className="punct">&gt;&lt;</span>
                <span className="tag">Input.Field</span> <span className="punct">/&gt;&lt;/</span>
                <span className="tag">Input.Container</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'    '}
                <span className="punct">&lt;/</span>
                <span className="tag">Input</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'    '}
                <span className="punct">&lt;</span>
                <span className="tag">Input</span> <span className="attr">defaultValue</span>
                <span className="punct">=</span>
                <span className="str">"FRA"</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'      '}
                <span className="punct">&lt;</span>
                <span className="tag">Input.Label</span>
                <span className="punct">&gt;</span>To<span className="punct">&lt;/</span>
                <span className="tag">Input.Label</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'      '}
                <span className="punct">&lt;</span>
                <span className="tag">Input.Container</span>
                <span className="punct">&gt;&lt;</span>
                <span className="tag">Input.Field</span> <span className="punct">/&gt;&lt;/</span>
                <span className="tag">Input.Container</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'    '}
                <span className="punct">&lt;/</span>
                <span className="tag">Input</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'    '}
                <span className="punct">&lt;</span>
                <span className="tag">Button</span> <span className="attr">variant</span>
                <span className="punct">=</span>
                <span className="str">"primary"</span>
                <span className="punct">&gt;</span>Search flights<span className="punct">&lt;/</span>
                <span className="tag">Button</span>
                <span className="punct">&gt;</span>
              </span>
              <span className={styles.editorLine}>
                {'  '}
                <span className="punct">);</span>
              </span>
              <span className={styles.editorLine}>
                <span className="punct">{'}'}</span>
              </span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
