import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Accordion, SparReactProvider, type AccordionCurrentValue, type ComponentsThemeMap } from '@takeoff-ui/react-spar';

// TODO(takeoff-icons): These placeholder icons should be swapped for the
// official Takeoff icon set before the first public release.
import { FlightIcon, LuggageIcon, TaskAltIcon } from './placeholder-icons';

const cssVar = (name: `--${string}`) => `var(${name})`;

const elevatedShadow = '0 10px 25px -10px var(--shadow-black-alpha-base), 0 4px 10px -4px var(--shadow-black-alpha-light)';

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'start center',
  padding: cssVar('--spacing-8xl'),
  background: `linear-gradient(180deg, ${cssVar('--background-lightest')} 0%, ${cssVar('--background-light')} 100%)`,
};

const cardStyle: CSSProperties = {
  width: 'min(100%, 56rem)',
  padding: cssVar('--spacing-8xl'),
  border: `1px solid ${cssVar('--border-light')}`,
  borderRadius: cssVar('--radius-l'),
  background: cssVar('--background-lightest'),
  color: cssVar('--text-darkest'),
  boxShadow: elevatedShadow,
};

const sectionStyle: CSSProperties = {
  marginTop: '1.5rem',
};

const accordionRootClassName = 'tk-accordion';
const accordionItemRootClassName = 'tk-accordion-item';

type CheckResult = { id: string; label: string; ok: boolean; detail?: string };

const runContractChecks = (scope: HTMLElement): CheckResult[] => {
  const results: CheckResult[] = [];

  const check = (id: string, label: string, test: () => { ok: boolean; detail?: string }): void => {
    const { ok, detail } = test();
    results.push({ id, label, ok, detail });
  };

  check('provider:data-theme', 'SparReactProvider writes data-theme="light" on its wrapper', () => {
    const node = scope.querySelector<HTMLElement>('[data-theme]');
    const value = node?.getAttribute('data-theme');
    return { ok: value === 'light', detail: value ?? '(missing)' };
  });

  check('tokens:css-loaded', '--text-base resolves (token CSS imported)', () => {
    const sample = getComputedStyle(document.documentElement).getPropertyValue('--text-base').trim();
    return { ok: sample.length > 0, detail: sample || '(empty — token CSS missing)' };
  });

  check('anatomy:Accordion', `Accordion renders canonical root .${accordionRootClassName}[data-slot="root"]`, () => {
    const node = scope.querySelector(`[data-slot="root"].${accordionRootClassName}`);
    return { ok: node !== null, detail: node ? 'found' : `expected .${accordionRootClassName}[data-slot="root"]` };
  });

  check('anatomy:AccordionItem', `AccordionItem renders canonical root .${accordionItemRootClassName}[data-slot="root"]`, () => {
    const node = scope.querySelector(`[data-slot="root"].${accordionItemRootClassName}`);
    return { ok: node !== null, detail: node ? 'found' : `expected .${accordionItemRootClassName}[data-slot="root"]` };
  });

  check('customization:provider-classNames', 'provider components.Accordion.classNames concatenates with canonical', () => {
    const node = scope.querySelector('[data-verify="provider"]');
    if (!node) return { ok: false, detail: 'no provider scenario node' };
    const className = node.className;
    const hasBase = className.includes(accordionRootClassName);
    const hasOverride = className.includes('verify-provider-classnames');
    return { ok: hasBase && hasOverride, detail: className };
  });

  check('customization:instance-classNames', 'instance classNames concatenates with canonical', () => {
    const node = scope.querySelector('[data-verify="instance-classnames"]');
    if (!node) return { ok: false, detail: 'no instance-classnames node' };
    const className = node.className;
    const hasBase = className.includes(accordionRootClassName);
    const hasOverride = className.includes('verify-instance-classnames');
    return { ok: hasBase && hasOverride, detail: className };
  });

  return results;
};

const verifierShellStyle: CSSProperties = {
  position: 'sticky',
  top: '0',
  zIndex: 10,
  width: 'min(100%, 56rem)',
  marginBottom: '1.5rem',
  padding: '1rem 1.25rem',
  borderRadius: cssVar('--radius-l'),
  border: '1px solid',
  background: cssVar('--background-lightest'),
  color: cssVar('--text-darkest'),
  boxShadow: elevatedShadow,
  fontFamily: 'inherit',
};

type VerifierPanelProps = { results: CheckResult[] | null };

const VerifierPanel = ({ results }: VerifierPanelProps): ReactNode => {
  if (results === null) {
    return null;
  }
  const failures = results.filter(r => !r.ok);
  const ok = failures.length === 0;
  return (
    <section
      data-verifier-panel
      data-verifier-status={ok ? 'pass' : 'fail'}
      style={{
        ...verifierShellStyle,
        borderColor: ok ? cssVar('--states-success-base') : cssVar('--states-danger-base'),
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>Contract verifier · {ok ? '✓ all checks passed' : `✗ ${failures.length} of ${results.length} failed`}</strong>
        <span style={{ fontSize: '0.8rem', color: cssVar('--text-sub-base') }}>{results.length} checks</span>
      </header>
      {failures.length > 0 && (
        <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
          {failures.map(failure => (
            <li key={failure.id} style={{ color: cssVar('--states-danger-base') }}>
              <code>{failure.id}</code> — {failure.label}
              {failure.detail ? (
                <>
                  {' '}
                  <span style={{ color: cssVar('--text-sub-base') }}>({failure.detail})</span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <details style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
        <summary style={{ cursor: 'pointer', color: cssVar('--text-sub-base') }}>All checks</summary>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          {results.map(result => (
            <li key={result.id} style={{ color: result.ok ? cssVar('--states-success-base') : cssVar('--states-danger-base') }}>
              {result.ok ? '✓' : '✗'} <code>{result.id}</code> — {result.label}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
};

const providerThemeForAccordion: ComponentsThemeMap = {
  Accordion: {
    classNames: { root: 'verify-provider-classnames' },
  },
};

function App() {
  const [accordionValue, setAccordionValue] = useState<AccordionCurrentValue>('flight-details');
  const [verifierResults, setVerifierResults] = useState<CheckResult[] | null>(null);

  const verifyScopeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scope = verifyScopeRef.current;
    if (!scope) return;
    const results = runContractChecks(scope);
    setVerifierResults(results);
    const failures = results.filter(r => !r.ok);
    if (failures.length > 0) {
      // eslint-disable-next-line no-console
      console.error('[smoke-app] contract verifier failed:', failures);
    }
  }, []);

  return (
    <SparReactProvider>
      <main ref={verifyScopeRef} style={shellStyle}>
        <VerifierPanel results={verifierResults} />

        <section style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: cssVar('--text-sub-base'),
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.75rem',
            }}
          >
            Consumer smoke app · Accordion contract verifier
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.1,
              color: cssVar('--text-darkest'),
            }}
          >
            React Spar Accordion product surface
          </h1>
          <p style={{ margin: '1rem 0 0', maxWidth: '44rem', color: cssVar('--text-sub-base') }}>
            This app mounts SparReactProvider, imports the shared Takeoff theme, exercises the shipped Accordion wrapper, and runs an in-browser contract verifier on mount. See the
            panel above for pass/fail status and the README for the verifier's scope.
          </p>

          <div style={sectionStyle}>
            <strong>Accordion parity surface</strong>
            <div style={{ marginTop: '0.75rem' }}>
              <Accordion value={accordionValue} onValueChange={setAccordionValue}>
                <Accordion.Item value="flight-details">
                  <Accordion.Header>
                    <Accordion.Trigger>
                      <FlightIcon />
                      Flight details
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Review your departure and arrival windows, cabin, and seat assignment before check-in closes.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="baggage-allowance">
                  <Accordion.Header>
                    <Accordion.Trigger>
                      <LuggageIcon />
                      Baggage allowance
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Confirm your carry-on and checked baggage limits, then add extra allowance if your fare needs it.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="check-in-options">
                  <Accordion.Header>
                    <Accordion.Trigger>
                      <TaskAltIcon />
                      Check-in options
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Online check-in opens 24 hours before departure and stays available until the airport cut-off time.</Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Customization contract scenarios</strong>
            <p style={{ margin: '0.25rem 0 0', color: cssVar('--text-sub-base'), fontSize: '0.85rem' }}>
              Each scenario exercises one path through the customization contract. The verifier panel above asserts the resulting DOM matches the documented behavior.
            </p>

            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SparReactProvider components={providerThemeForAccordion}>
                <Accordion data-verify="provider">
                  <Accordion.Item value="provider">
                    <Accordion.Header>
                      <Accordion.Trigger>Provider-level customization</Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content>provider components.Accordion.classNames lands on the canonical root.</Accordion.Content>
                  </Accordion.Item>
                </Accordion>
              </SparReactProvider>

              <Accordion classNames={{ root: 'verify-instance-classnames' }} data-verify="instance-classnames">
                <Accordion.Item value="instance">
                  <Accordion.Header>
                    <Accordion.Trigger>Instance classNames</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>instance classNames concatenates with the canonical root class.</Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </section>
      </main>
    </SparReactProvider>
  );
}

export default App;
