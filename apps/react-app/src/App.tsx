import { useState, type CSSProperties } from 'react';
import { Accordion, AccordionItem, Button, SparReactProvider, accordionClassNames, accordionItemClassNames, buttonClassNames } from '@takeoff-ui/react-spar';

const cssVar = (name: `--${string}`) => `var(${name})`;

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: cssVar('--tk-space-8'),
  background: `linear-gradient(180deg, ${cssVar('--tk-color-surface')} 0%, ${cssVar('--tk-color-surface-subtle')} 100%)`,
};

const cardStyle: CSSProperties = {
  width: 'min(100%, 56rem)',
  padding: cssVar('--tk-space-8'),
  border: `1px solid ${cssVar('--tk-color-border')}`,
  borderRadius: cssVar('--tk-radius-lg'),
  background: cssVar('--tk-color-surface'),
  color: cssVar('--tk-color-text'),
  boxShadow: cssVar('--tk-shadow-elevated'),
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
  background: cssVar('--tk-color-brand'),
  color: cssVar('--tk-color-brand-contrast'),
  overflowX: 'auto',
};

function App() {
  const [activeIndex, setActiveIndex] = useState<string | number | undefined>(0);

  return (
    <SparReactProvider>
      <main style={shellStyle}>
        <section style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: cssVar('--tk-color-text-muted'),
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.75rem',
            }}
          >
            Consumer smoke app
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.1,
              color: cssVar('--tk-color-text'),
            }}
          >
            React Spar Button and Accordion product surface
          </h1>
          <p style={{ margin: '1rem 0 0', maxWidth: '44rem', color: cssVar('--tk-color-text-muted') }}>
            This app mounts SparReactProvider, imports the shared Takeoff theme, and exercises the Button and Accordion wrappers while keeping behavior on top of Spar primitives.
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

          <div style={sectionStyle}>
            <strong>Accordion parity surface</strong>
            <div style={{ marginTop: '0.75rem' }}>
              <Accordion activeIndex={activeIndex} onActiveIndexChange={index => setActiveIndex(Array.isArray(index) ? index[index.length - 1] : index)}>
                <AccordionItem header="Flight details" icon="flight">
                  Review your departure and arrival windows, cabin, and seat assignment before check-in closes.
                </AccordionItem>
                <AccordionItem header="Baggage allowance" icon="luggage">
                  Confirm your carry-on and checked baggage limits, then add extra allowance if your fare needs it.
                </AccordionItem>
                <AccordionItem header="Check-in options" icon="task_alt">
                  Online check-in opens 24 hours before departure and stays available until the airport cut-off time.
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <pre style={contractStyle}>
            {JSON.stringify(
              {
                button: buttonClassNames,
                accordion: accordionClassNames,
                accordionItem: accordionItemClassNames,
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
