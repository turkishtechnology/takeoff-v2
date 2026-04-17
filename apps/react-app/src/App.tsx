import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Dialog,
  Input,
  SparReactProvider,
  accordionClassNames,
  accordionItemClassNames,
  buttonClassNames,
  checkboxClassNames,
  dialogClassNames,
  inputClassNames,
  type ButtonSlotProps,
  type CheckboxSlotProps,
  type CheckboxValue,
  type ComponentsThemeMap,
} from '@takeoff-ui/react-spar';

// TODO(takeoff-icons): These placeholder icons should be swapped for the
// official Takeoff icon set before the first public release.
import { FlightIcon, LuggageIcon, MailIcon, SearchIcon, TaskAltIcon } from './placeholder-icons';

/**
 * React's HTMLAttributes types do not include an index signature for `data-*`,
 * so the verifier scenarios need a typed bridge to embed `data-verify-*`
 * markers on a button slot's canonical root without per-line casts.
 */
const buttonRootMarkers = (values: Record<`data-${string}`, string>): ButtonSlotProps['root'] => values as unknown as ButtonSlotProps['root'];

const checkboxRootMarkers = (values: Record<`data-${string}`, string>): CheckboxSlotProps['root'] => values as unknown as CheckboxSlotProps['root'];

const cssVar = (name: `--${string}`) => `var(${name})`;

// @takeoff-design/tokens ships only shadow *colors*, not composite box-shadow
// primitives. The offsets/blurs are hardcoded; the colors remain themable.
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

const actionsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginTop: '0.75rem',
};

const contractStyle: CSSProperties = {
  marginTop: '1.5rem',
  padding: '1rem',
  borderRadius: '1rem',
  background: cssVar('--primary-base'),
  color: cssVar('--static-white'),
  overflowX: 'auto',
};

// ─────────────────────────────────────────────────────────────────────────────
// Contract verifier
// ─────────────────────────────────────────────────────────────────────────────
//
// The smoke app is the contract verifier described in Milestone 6 of
// docs/proposals/monorepo-professionalization-execution-plan.md. It must
// not regress without an explicit exemption.
//
// Verification scope:
//   1. Provider contract: SparReactProvider writes data-theme on its
//      display:contents wrapper.
//   2. Token CSS import path: a known --tk-* variable resolves to a
//      non-empty value (proves the @takeoff-design/tokens stylesheet
//      actually loaded).
//   3. Public exports: every named import at the top of this file must
//      stay resolvable — type-check + build covers this for free.
//   4. Slot or anatomy hooks: each visible-by-default shipped component
//      renders its canonical root with the documented `tk-*` class +
//      `data-slot="root"` anchor (per ADR 0005).
//   5. Representative customization paths: provider-level defaultProps,
//      provider-level classNames, provider-level slotProps, instance
//      classNames, instance slotProps, and a render override that does
//      not delete the canonical owner node.

type CheckResult = { id: string; label: string; ok: boolean; detail?: string };

const runContractChecks = (scope: HTMLElement): CheckResult[] => {
  const results: CheckResult[] = [];

  const check = (id: string, label: string, test: () => { ok: boolean; detail?: string }): void => {
    try {
      const { ok, detail } = test();
      results.push({ id, label, ok, detail });
    } catch (error) {
      results.push({ id, label, ok: false, detail: error instanceof Error ? error.message : String(error) });
    }
  };

  // 1. Provider contract.
  check('provider:data-theme', 'SparReactProvider writes data-theme="light" on its wrapper', () => {
    const node = scope.querySelector<HTMLElement>('[data-theme]');
    const value = node?.getAttribute('data-theme');
    return { ok: value === 'light', detail: value ?? '(missing)' };
  });

  // 2. Token CSS import path. Sample one variable known to ship from
  //    @takeoff-design/tokens default theme. `--text-base` is one of the
  //    foundational typography color tokens; if it resolves, the
  //    `@takeoff-design/tokens/css/default/theme.css` import is wired.
  check('tokens:css-loaded', '--text-base resolves (token CSS imported)', () => {
    const sample = getComputedStyle(document.documentElement).getPropertyValue('--text-base').trim();
    return { ok: sample.length > 0, detail: sample || '(empty — token CSS missing)' };
  });

  // 2b. Token category sweep. One token per category the smoke app's inline
  //     styles rely on — spacing, background, border, radius, text, shadow
  //     color, brand, static, and status (success + danger). A failure here
  //     means the @takeoff-design/tokens contract drifted for that category,
  //     not that react-spar broke. Keep the list aligned with the `cssVar`
  //     references in this file.
  const tokenContract: ReadonlyArray<{ category: string; name: `--${string}` }> = [
    { category: 'spacing', name: '--spacing-8xl' },
    { category: 'background', name: '--background-lightest' },
    { category: 'border', name: '--border-light' },
    { category: 'radius', name: '--radius-l' },
    { category: 'text', name: '--text-darkest' },
    { category: 'shadow-color', name: '--shadow-black-alpha-base' },
    { category: 'brand', name: '--primary-base' },
    { category: 'static', name: '--static-white' },
    { category: 'status-success', name: '--states-success-base' },
    { category: 'status-danger', name: '--states-danger-base' },
  ];
  check('tokens:contract-sweep', 'every category the smoke app depends on resolves to a non-empty value', () => {
    const computed = getComputedStyle(document.documentElement);
    const missing: string[] = [];
    for (const entry of tokenContract) {
      if (computed.getPropertyValue(entry.name).trim().length === 0) {
        missing.push(`${entry.category}:${entry.name}`);
      }
    }
    if (missing.length === 0) {
      return { ok: true, detail: `${tokenContract.length} categories present` };
    }
    return {
      ok: false,
      detail: `takeoff-design token contract drifted — missing ${missing.join(', ')}`,
    };
  });

  // 4. Slot anatomy for visible-by-default components. Dialog is
  //    interactive-only and is covered by its own test suite.
  for (const [name, classMap] of [
    ['Button', buttonClassNames],
    ['Accordion', accordionClassNames],
    ['AccordionItem', accordionItemClassNames],
    ['Checkbox', checkboxClassNames],
    ['Input', inputClassNames],
  ] as const) {
    check(`anatomy:${name}`, `${name} renders canonical root .${classMap.root}[data-slot="root"]`, () => {
      const node = scope.querySelector(`[data-slot="root"].${classMap.root}`);
      return { ok: node !== null, detail: node ? 'found' : `expected .${classMap.root}[data-slot="root"]` };
    });
  }

  // 4b. Checkbox state hooks — verify the canonical data-* state attributes
  //     emitted by the spar primitive flow through to the root so the token
  //     recipe can drive visuals without touching JS.
  check('anatomy:Checkbox-state-attrs', 'Checkbox.data-indeterminate carries tri-state to the root', () => {
    const node = scope.querySelector(`[data-slot="root"].${checkboxClassNames.root}[data-verify="checkbox-indeterminate"][data-indeterminate]`);
    return { ok: node !== null, detail: node ? 'data-indeterminate present' : 'expected data-indeterminate' };
  });

  // 5. Customization paths.
  check('customization:provider-defaultProps', 'provider components.Button.defaultProps lands (data-type)', () => {
    const node = scope.querySelector<HTMLElement>('[data-verify="provider"]');
    const value = node?.getAttribute('data-type');
    return { ok: value === 'outlined', detail: value ?? '(missing)' };
  });

  check('customization:provider-classNames', 'provider components.Button.classNames concatenates with canonical', () => {
    const node = scope.querySelector('[data-verify="provider"]');
    if (!node) return { ok: false, detail: 'no provider scenario node' };
    const className = node.className;
    const hasBase = className.includes(buttonClassNames.root);
    const hasOverride = className.includes('verify-provider-classnames');
    return { ok: hasBase && hasOverride, detail: className };
  });

  check('customization:provider-slotProps', 'provider components.Button.slotProps lands on canonical owner', () => {
    const node = scope.querySelector('[data-verify="provider"][data-verify-provider-slotprops="ok"]');
    return { ok: node !== null, detail: node ? 'attribute present' : 'data-verify-provider-slotprops missing' };
  });

  check('customization:instance-classNames', 'instance classNames concatenates with canonical', () => {
    const node = scope.querySelector('[data-verify="instance-classnames"]');
    if (!node) return { ok: false, detail: 'no instance-classnames node' };
    const className = node.className;
    const hasBase = className.includes(buttonClassNames.root);
    const hasOverride = className.includes('verify-instance-classnames');
    return { ok: hasBase && hasOverride, detail: className };
  });

  check('customization:instance-slotProps', 'instance slotProps merges onto canonical owner', () => {
    const node = scope.querySelector('[data-verify="instance-slotprops"][data-verify-instance-slotprops="ok"]');
    return { ok: node !== null, detail: node ? 'attribute present' : 'data-verify-instance-slotprops missing' };
  });

  check('customization:render-override-content', 'renderSpinner override content lands inside canonical owner', () => {
    const marker = scope.querySelector('[data-verify="render-override"] [data-verify-render-override="ok"]');
    return { ok: marker !== null, detail: marker ? 'marker present' : 'override marker missing' };
  });

  check('customization:render-override-owner-preserved', 'renderSpinner override preserves canonical spinner slot owner', () => {
    const owner = scope.querySelector(`[data-verify="render-override"] [data-slot="spinner"].${buttonClassNames.spinner}`);
    return { ok: owner !== null, detail: owner ? 'owner preserved' : 'canonical spinner owner deleted by override' };
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

// ─────────────────────────────────────────────────────────────────────────────
// Customization scenarios
// ─────────────────────────────────────────────────────────────────────────────

const providerThemeForButton: ComponentsThemeMap = {
  Button: {
    defaultProps: { type: 'outlined', variant: 'secondary' },
    classNames: { root: 'verify-provider-classnames' },
    slotProps: { root: buttonRootMarkers({ 'data-verify-provider-slotprops': 'ok' }) },
  },
};

const CustomizationScenarios = (): ReactNode => (
  <div style={sectionStyle}>
    <strong>Customization contract scenarios</strong>
    <p style={{ margin: '0.25rem 0 0', color: cssVar('--text-sub-base'), fontSize: '0.85rem' }}>
      Each row exercises one path through the customization contract. The verifier panel above asserts the resulting DOM matches the documented behavior.
    </p>

    <div style={{ ...actionsStyle, alignItems: 'center' }}>
      {/* Provider-level customization: defaultProps + classNames + slotProps */}
      <SparReactProvider components={providerThemeForButton}>
        <Button slotProps={{ root: buttonRootMarkers({ 'data-verify': 'provider' }) }}>Provider-level customization</Button>
      </SparReactProvider>

      {/* Instance-level classNames concatenates with canonical */}
      <Button classNames={{ root: 'verify-instance-classnames' }} slotProps={{ root: buttonRootMarkers({ 'data-verify': 'instance-classnames' }) }}>
        Instance classNames
      </Button>

      {/* Instance-level slotProps merges attributes onto the canonical root */}
      <Button
        slotProps={{
          root: buttonRootMarkers({
            'data-verify': 'instance-slotprops',
            'data-verify-instance-slotprops': 'ok',
          }),
        }}
      >
        Instance slotProps
      </Button>

      {/* renderSpinner override: replaces content but must not delete the canonical owner */}
      <Button
        loading
        renderSpinner={defaultSpinner => <span data-verify-render-override="ok">{defaultSpinner}</span>}
        slotProps={{ root: buttonRootMarkers({ 'data-verify': 'render-override' }) }}
      >
        renderSpinner override
      </Button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [activeIndex, setActiveIndex] = useState<string | number | undefined>(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState<CheckboxValue>(false);
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
            Consumer smoke app · contract verifier
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.1,
              color: cssVar('--text-darkest'),
            }}
          >
            React Spar Button, Accordion, Input, and Dialog product surface
          </h1>
          <p style={{ margin: '1rem 0 0', maxWidth: '44rem', color: cssVar('--text-sub-base') }}>
            This app mounts SparReactProvider, imports the shared Takeoff theme, exercises the shipped wrappers, and runs an in-browser contract verifier on mount. See the panel
            above for pass/fail status and the README for the verifier's scope.
          </p>

          <div style={sectionStyle}>
            <strong>Visual variants</strong>
            <div style={actionsStyle}>
              <Button>Primary filled</Button>
              <Button type="outlined" variant="secondary">
                Secondary outlined
              </Button>
              <Button type="text" variant="neutral">
                Neutral text
              </Button>
              <Button type="elevated">Elevated action</Button>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Links and states</strong>
            <div style={actionsStyle}>
              <Button type="outlined" variant="secondary">
                Manage booking
              </Button>
              <Button mode="link" href="https://www.turkishairlines.com" target="_blank" underline>
                View fare rules
              </Button>
              <Button loading variant="secondary">
                Checking fare
              </Button>
            </div>
          </div>

          <CustomizationScenarios />

          <div style={sectionStyle}>
            <strong>Accordion parity surface</strong>
            <div style={{ marginTop: '0.75rem' }}>
              <Accordion activeIndex={activeIndex} onActiveIndexChange={index => setActiveIndex(Array.isArray(index) ? index[index.length - 1] : index)}>
                <AccordionItem header="Flight details" icon={<FlightIcon />}>
                  Review your departure and arrival windows, cabin, and seat assignment before check-in closes.
                </AccordionItem>
                <AccordionItem header="Baggage allowance" icon={<LuggageIcon />}>
                  Confirm your carry-on and checked baggage limits, then add extra allowance if your fare needs it.
                </AccordionItem>
                <AccordionItem header="Check-in options" icon={<TaskAltIcon />}>
                  Online check-in opens 24 hours before departure and stays available until the airport cut-off time.
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Input form-field surface</strong>
            <div style={{ ...actionsStyle, flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
              <Input
                label="Full name"
                required
                placeholder="Ada Lovelace"
                description="Written exactly as on your passport."
                value={fullName}
                onChange={event => setFullName(event.target.value)}
                clearable
              />
              <Input
                label="Email"
                type="email"
                icon={<MailIcon />}
                invalid={email.length > 0 && !email.includes('@')}
                error="Enter a valid email address."
                description="We use this to send your itinerary."
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
              <Input aria-label="Search flights" icon={<SearchIcon />} placeholder="Search flights" size="small" loading />
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Checkbox parity surface</strong>
            <div style={{ ...actionsStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Checkbox label="Accept fare rules" description="Required before you continue to payment." required value={termsAccepted} onChange={setTermsAccepted} />
              <Checkbox label="Add checked baggage" description="Uncontrolled · card variant" type="card" defaultValue={false} />
              <Checkbox label="Select all extras" indeterminate slotProps={{ root: checkboxRootMarkers({ 'data-verify': 'checkbox-indeterminate' }) }} />
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Dialog parity surface</strong>
            <div style={actionsStyle}>
              <Button onClick={() => setDialogVisible(true)}>Open dialog</Button>
            </div>

            <Dialog
              visible={dialogVisible}
              onVisibleChange={setDialogVisible}
              header="Upgrade cabin"
              subheader="Review the fare difference before confirming."
              containerStyle={{ width: '460px' }}
              footerActions={
                <>
                  <Button type="text" variant="neutral" onClick={() => setDialogVisible(false)}>
                    Cancel
                  </Button>
                  <Button>Continue</Button>
                </>
              }
            >
              Review the fare, cabin benefits, and baggage rules before you complete the upgrade.
            </Dialog>
          </div>

          <pre style={contractStyle}>
            {JSON.stringify(
              {
                button: buttonClassNames,
                accordion: accordionClassNames,
                accordionItem: accordionItemClassNames,
                checkbox: checkboxClassNames,
                dialog: dialogClassNames,
                input: inputClassNames,
              },
              null,
              2,
            )}
          </pre>
        </section>
      </main>
    </SparReactProvider>
  );
}

export default App;
