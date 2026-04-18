import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, ReactSparDemoRoot } from './shared';

const metaStyle = {
  margin: 0,
  width: 'min(100%, 40rem)',
  color: 'var(--text-base)',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center' as const,
};

const code = `import { useState } from 'react';

export function StatesDemo() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const metaStyle = {
    margin: 0,
    width: 'min(100%, 40rem)',
    color: 'var(--text-base)',
    fontSize: 14,
    lineHeight: '20px',
    textAlign: 'center',
  };

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button aria-pressed={pressed} onClick={() => setPressed((value) => !value)}>
          <Button.Label>{pressed ? 'Seat locked' : 'Select seat'}</Button.Label>
        </Button>
        <Button onClick={() => setLoading((value) => !value)}>
          <Button.Label>{loading ? 'Stop loading preview' : 'Trigger loading preview'}</Button.Label>
        </Button>
        <Button loading={loading} type="outlined" variant="secondary">
          <Button.Spinner />
          <Button.Label>{loading ? 'Checking fare' : 'Checkout'}</Button.Label>
        </Button>
        <Button disabled>
          <Button.Label>Boarding closed</Button.Label>
        </Button>
      </div>
      <p style={metaStyle}>
        Pressed state: {String(pressed)}. Loading is handled through the product-level <code>loading</code> prop.
      </p>
    </div>
  );
}`;

function StatesDemo() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 45rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button aria-pressed={pressed} onClick={() => setPressed(value => !value)}>
          <Button.Label>{pressed ? 'Seat locked' : 'Select seat'}</Button.Label>
        </Button>
        <Button onClick={() => setLoading(value => !value)}>
          <Button.Label>{loading ? 'Stop loading preview' : 'Trigger loading preview'}</Button.Label>
        </Button>
        <Button loading={loading} type="outlined" variant="secondary">
          <Button.Spinner />
          <Button.Label>{loading ? 'Checking fare' : 'Checkout'}</Button.Label>
        </Button>
        <Button disabled>
          <Button.Label>Boarding closed</Button.Label>
        </Button>
      </div>
      <p style={metaStyle}>
        Pressed state: {String(pressed)}. Loading is handled through the product-level <code>loading</code> prop.
      </p>
    </div>
  );
}

export default function States() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <StatesDemo />
    </RenderedDemo>
  );
}
