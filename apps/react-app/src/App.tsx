import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Accordion,
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

const buttonRootMarkers = (values: Record<`data-${string}`, string>): ButtonSlotProps['root'] => values as unknown as ButtonSlotProps['root'];
const checkboxRootMarkers = (values: Record<`data-${string}`, string>): CheckboxSlotProps['root'] => values as unknown as CheckboxSlotProps['root'];

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
// Contract verifier — compound anatomy + customization paths.
// ─────────────────────────────────────────────────────────────────────────────

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

  check('provider:data-theme', 'SparReactProvider writes data-theme="light" on its wrapper', () => {
    const node = scope.querySelector<HTMLElement>('[data-theme]');
    const value = node?.getAttribute('data-theme');
    return { ok: value === 'light', detail: value ?? '(missing)' };
  });

  check('tokens:css-loaded', '--text-base resolves (token CSS imported)', () => {
    const sample = getComputedStyle(document.documentElement).getPropertyValue('--text-base').trim();
    return { ok: sample.length > 0, detail: sample || '(empty — token CSS missing)' };
  });

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

  check('anatomy:Checkbox-state-attrs', 'Checkbox.data-indeterminate carries tri-state to the root', () => {
    const node = scope.querySelector(`[data-slot="root"].${checkboxClassNames.root}[data-verify="checkbox-indeterminate"][data-indeterminate]`);
    return { ok: node !== null, detail: node ? 'data-indeterminate present' : 'expected data-indeterminate' };
  });

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

  check('customization:compound-spinner-slot', 'Button.Spinner child lands inside the canonical spinner owner', () => {
    const marker = scope.querySelector('[data-verify="compound-spinner"] [data-slot="spinner"] [data-verify-compound-spinner="ok"]');
    return { ok: marker !== null, detail: marker ? 'marker present' : 'compound spinner marker missing' };
  });

  check('customization:compound-spinner-owner-preserved', 'Button.Spinner preserves the canonical spinner slot owner', () => {
    const owner = scope.querySelector(`[data-verify="compound-spinner"] [data-slot="spinner"].${buttonClassNames.spinner}`);
    return { ok: owner !== null, detail: owner ? 'owner preserved' : 'spinner owner missing' };
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
      <SparReactProvider components={providerThemeForButton}>
        <Button slotProps={{ root: buttonRootMarkers({ 'data-verify': 'provider' }) }}>
          <Button.Label>Provider-level customization</Button.Label>
        </Button>
      </SparReactProvider>

      <Button classNames={{ root: 'verify-instance-classnames' }} slotProps={{ root: buttonRootMarkers({ 'data-verify': 'instance-classnames' }) }}>
        <Button.Label>Instance classNames</Button.Label>
      </Button>

      <Button
        slotProps={{
          root: buttonRootMarkers({
            'data-verify': 'instance-slotprops',
            'data-verify-instance-slotprops': 'ok',
          }),
        }}
      >
        <Button.Label>Instance slotProps</Button.Label>
      </Button>

      <Button loading slotProps={{ root: buttonRootMarkers({ 'data-verify': 'compound-spinner' }) }}>
        <Button.Spinner>
          <span data-verify-compound-spinner="ok" />
        </Button.Spinner>
        <Button.Label>Compound spinner</Button.Label>
      </Button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [activeIndex, setActiveIndex] = useState<string | number | undefined>('flight-details');
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
              <Button>
                <Button.Label>Primary filled</Button.Label>
              </Button>
              <Button type="outlined" variant="secondary">
                <Button.Label>Secondary outlined</Button.Label>
              </Button>
              <Button type="text" variant="neutral">
                <Button.Label>Neutral text</Button.Label>
              </Button>
              <Button type="elevated">
                <Button.Label>Elevated action</Button.Label>
              </Button>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Links and states</strong>
            <div style={actionsStyle}>
              <Button type="outlined" variant="secondary">
                <Button.Label>Manage booking</Button.Label>
              </Button>
              <Button mode="link" href="https://www.turkishairlines.com" target="_blank" underline>
                <Button.Label>View fare rules</Button.Label>
              </Button>
              <Button loading variant="secondary">
                <Button.Spinner />
                <Button.Label>Checking fare</Button.Label>
              </Button>
            </div>
          </div>

          <CustomizationScenarios />

          <div style={sectionStyle}>
            <strong>Accordion parity surface</strong>
            <div style={{ marginTop: '0.75rem' }}>
              <Accordion activeIndex={activeIndex} onActiveIndexChange={index => setActiveIndex(Array.isArray(index) ? index[index.length - 1] : index)}>
                <Accordion.Item itemKey="flight-details">
                  <Accordion.Header>
                    <Accordion.Trigger>
                      <FlightIcon />
                      Flight details
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Review your departure and arrival windows, cabin, and seat assignment before check-in closes.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item itemKey="baggage-allowance">
                  <Accordion.Header>
                    <Accordion.Trigger>
                      <LuggageIcon />
                      Baggage allowance
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Confirm your carry-on and checked baggage limits, then add extra allowance if your fare needs it.</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item itemKey="check-in-options">
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
            <strong>Input form-field surface</strong>
            <div style={{ ...actionsStyle, flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
              <Input required value={fullName} onChange={event => setFullName(event.target.value)} clearable>
                <Input.Label>
                  Full name <Input.Asterisk />
                </Input.Label>
                <Input.Container>
                  <Input.Field placeholder="Ada Lovelace" />
                  <Input.ClearButton />
                </Input.Container>
                <Input.Description>Written exactly as on your passport.</Input.Description>
              </Input>

              <Input type="email" invalid={email.length > 0 && !email.includes('@')} value={email} onChange={event => setEmail(event.target.value)}>
                <Input.Label>Email</Input.Label>
                <Input.Container>
                  <Input.LeadingIcon>
                    <MailIcon />
                  </Input.LeadingIcon>
                  <Input.Field />
                </Input.Container>
                <Input.Description>We use this to send your itinerary.</Input.Description>
                <Input.ErrorMessage>Enter a valid email address.</Input.ErrorMessage>
              </Input>

              <Input size="small" loading>
                <Input.Container>
                  <Input.LeadingIcon>
                    <SearchIcon />
                  </Input.LeadingIcon>
                  <Input.Field aria-label="Search flights" placeholder="Search flights" />
                  <Input.Spinner />
                </Input.Container>
              </Input>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Checkbox parity surface</strong>
            <div style={{ ...actionsStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Checkbox required value={termsAccepted} onChange={setTermsAccepted}>
                <Checkbox.Indicator>
                  <Checkbox.Icon />
                </Checkbox.Indicator>
                <Checkbox.Content>
                  <Checkbox.Label>Accept fare rules</Checkbox.Label>
                  <Checkbox.Description>Required before you continue to payment.</Checkbox.Description>
                </Checkbox.Content>
              </Checkbox>

              <Checkbox type="card" defaultValue={false}>
                <Checkbox.Indicator>
                  <Checkbox.Icon />
                </Checkbox.Indicator>
                <Checkbox.Content>
                  <Checkbox.Label>Add checked baggage</Checkbox.Label>
                  <Checkbox.Description>Uncontrolled · card variant</Checkbox.Description>
                </Checkbox.Content>
              </Checkbox>

              <Checkbox indeterminate slotProps={{ root: checkboxRootMarkers({ 'data-verify': 'checkbox-indeterminate' }) }}>
                <Checkbox.Indicator>
                  <Checkbox.Icon />
                </Checkbox.Indicator>
                <Checkbox.Content>
                  <Checkbox.Label>Select all extras</Checkbox.Label>
                </Checkbox.Content>
              </Checkbox>
            </div>
          </div>

          <div style={sectionStyle}>
            <strong>Dialog parity surface</strong>
            <div style={actionsStyle}>
              <Button onClick={() => setDialogVisible(true)}>
                <Button.Label>Open dialog</Button.Label>
              </Button>
            </div>

            <Dialog visible={dialogVisible} onVisibleChange={setDialogVisible}>
              <Dialog.Mask />
              <Dialog.Panel style={{ width: '460px' }}>
                <Dialog.Header>
                  <Dialog.SignIcon />
                  <Dialog.TitleGroup>
                    <Dialog.Description>Review the fare difference before confirming.</Dialog.Description>
                    <Dialog.Title>Upgrade cabin</Dialog.Title>
                  </Dialog.TitleGroup>
                  <Dialog.CloseButton />
                </Dialog.Header>
                <Dialog.Body>Review the fare, cabin benefits, and baggage rules before you complete the upgrade.</Dialog.Body>
                <Dialog.Footer>
                  <Dialog.FooterActions>
                    <Button type="text" variant="neutral" onClick={() => setDialogVisible(false)}>
                      <Button.Label>Cancel</Button.Label>
                    </Button>
                    <Button>
                      <Button.Label>Continue</Button.Label>
                    </Button>
                  </Dialog.FooterActions>
                </Dialog.Footer>
              </Dialog.Panel>
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
