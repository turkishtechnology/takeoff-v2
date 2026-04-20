import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, ReactSparDemoRoot } from './shared';

const inputStyle = {
  width: '100%',
  minHeight: 48,
  border: '1px solid var(--border-base)',
  borderRadius: 'var(--radius-m-base, 8px)',
  background: 'var(--background-lightest)',
  padding: '0 16px',
  color: 'var(--text-darkest)',
  fontSize: 16,
};

const metaStyle = {
  margin: 0,
  color: 'var(--text-base)',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center' as const,
};

const code = `import { useState } from 'react';

export function FormDemo() {
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = {
    width: '100%',
    minHeight: 48,
    border: '1px solid var(--border-base)',
    borderRadius: 'var(--radius-m-base, 8px)',
    background: 'var(--background-lightest)',
    padding: '0 16px',
    color: 'var(--text-darkest)',
    fontSize: 16,
  };
  const metaStyle = { margin: 0, color: 'var(--text-base)', fontSize: 14, lineHeight: '20px', textAlign: 'center' };

  return (
    <form
      style={{ display: 'grid', gap: 12, width: 'min(100%, 27.5rem)', marginInline: 'auto' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      onReset={() => setSubmitted(false)}
    >
      <input
        aria-label="Passenger name"
        name="passengerName"
        placeholder="Passenger name"
        style={inputStyle}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button mode="submit">
          <Button.Label>Save passenger</Button.Label>
        </Button>
        <Button mode="reset" type="text" variant="neutral">
          <Button.Label>Reset form</Button.Label>
        </Button>
      </div>

      <Button fullWidth type="outlined" variant="secondary">
        <Button.Label>Review full-width action</Button.Label>
      </Button>

      <p style={metaStyle}>
        {submitted
          ? 'Form submit intercepted successfully.'
          : 'Submit the form to verify native submit and reset semantics.'}
      </p>
    </form>
  );
}`;

function FormDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      style={{ display: 'grid', gap: 12, width: 'min(100%, 27.5rem)', marginInline: 'auto' }}
      onSubmit={event => {
        event.preventDefault();
        setSubmitted(true);
      }}
      onReset={() => setSubmitted(false)}
    >
      <input aria-label="Passenger name" name="passengerName" placeholder="Passenger name" style={inputStyle} />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button mode="submit">
          <Button.Label>Save passenger</Button.Label>
        </Button>
        <Button mode="reset" type="text" variant="neutral">
          <Button.Label>Reset form</Button.Label>
        </Button>
      </div>

      <Button fullWidth type="outlined" variant="secondary">
        <Button.Label>Review full-width action</Button.Label>
      </Button>

      <p style={metaStyle}>{submitted ? 'Form submit intercepted successfully.' : 'Submit the form to verify native submit and reset semantics.'}</p>
    </form>
  );
}

export default function Form() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <FormDemo />
    </RenderedDemo>
  );
}
