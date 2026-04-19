import type { JSX } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { useRunwaySurface } from '@site/src/hooks/useRunwaySurface';
import FooterRunway from './landing/FooterRunway';

interface Entry {
  version: string;
  date: string;
  items: { kind: 'feat' | 'fix' | 'chore'; text: string }[];
}

const ENTRIES: Entry[] = [
  {
    version: 'Phase B · 2026-04',
    date: '2026-04-18',
    items: [
      { kind: 'feat', text: 'Button — wrapper-first refactor, eight example variations, full Playground.' },
      { kind: 'feat', text: 'Checkbox — shipped with Indicator / Content / Label / Description parts.' },
      { kind: 'feat', text: 'Input — shipped compound with Label, Field, LeadingIcon, TrailingIcon, ErrorMessage.' },
    ],
  },
  {
    version: 'Phase A · 2026-03',
    date: '2026-03-28',
    items: [
      { kind: 'feat', text: 'Accordion — compound with Item, Header, Title, Arrow, Content.' },
      { kind: 'feat', text: 'Dialog — compound with Mask, Panel, Header, Body, Footer.' },
      { kind: 'chore', text: 'Monorepo professionalization M0–M7 landed; readiness gate enforced in CI.' },
    ],
  },
];

const KIND_COLOR: Record<Entry['items'][number]['kind'], string> = {
  feat: 'var(--runway-cardinal-bright, #ff1736)',
  fix: '#7dd3fc',
  chore: 'var(--runway-ink-faint, #7a7a86)',
};

export default function Changelog(): JSX.Element {
  useRunwaySurface();
  return (
    <Layout title="Changelog" description="Release notes for @takeoff-ui/react-spar." noFooter>
      <main data-runway-landing="true">
        <section
          style={{
            padding: '80px 40px 120px',
            maxWidth: 1000,
            margin: '0 auto',
            color: 'var(--runway-ink, #f6f6f8)',
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--runway-ink-faint, #7a7a86)',
              margin: '0 0 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 18, height: 1, background: 'var(--runway-cardinal-bright, #ff1736)' }} />
            Changelog
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 4.5vw, 54px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-1.2px',
              margin: '0 0 12px',
            }}
          >
            Release notes
          </h1>
          <p
            style={{
              color: 'var(--runway-ink-dim, #b8b8c2)',
              fontSize: 17,
              lineHeight: 1.55,
              margin: '0 0 64px',
              maxWidth: 620,
            }}
          >
            Every shipped component lands with a changeset. This page summarizes major beats; full entries live in{' '}
            <Link to="https://github.com/turkishtechnology/takeoff-spar/blob/main/CHANGELOG.md" style={{ color: 'var(--runway-cardinal-bright, #ff1736)' }}>
              CHANGELOG.md
            </Link>
            .
          </p>

          {ENTRIES.map(entry => (
            <section
              key={entry.version}
              style={{
                marginBottom: 48,
                paddingBottom: 32,
                borderBottom: '1px dashed var(--runway-surface-dark-border, #24242e)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 20,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.3px' }}>{entry.version}</h2>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: 'var(--runway-ink-faint, #7a7a86)',
                  }}
                >
                  {entry.date}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {entry.items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 12,
                      alignItems: 'baseline',
                      color: 'var(--runway-ink-dim, #b8b8c2)',
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: KIND_COLOR[item.kind],
                        padding: '3px 7px',
                        borderRadius: 4,
                        border: `1px solid ${KIND_COLOR[item.kind]}`,
                        flexShrink: 0,
                      }}
                    >
                      {item.kind}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
        <FooterRunway />
      </main>
    </Layout>
  );
}
