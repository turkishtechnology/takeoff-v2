import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import styles from './button-examples.module.css';
import { Button, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function StatesDemo() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 720px)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button aria-pressed={pressed} onClick={() => setPressed((value) => !value)}>
          {pressed ? 'Seat locked' : 'Select seat'}
        </Button>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? 'Stop loading preview' : 'Trigger loading preview'}
        </Button>
        <Button loading={loading} type='outlined' variant='secondary'>
          {loading ? 'Checking fare' : 'Checkout'}
        </Button>
        <Button disabled>Boarding closed</Button>
      </div>
    </div>
  );
}`;

export default function States() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <div className={styles.demoRow}>
            <Button aria-pressed={pressed} onClick={() => setPressed(value => !value)}>
              {pressed ? 'Seat locked' : 'Select seat'}
            </Button>
            <Button onClick={() => setLoading(value => !value)}>{loading ? 'Stop loading preview' : 'Trigger loading preview'}</Button>
            <Button loading={loading} type="outlined" variant="secondary">
              {loading ? 'Checking fare' : 'Checkout'}
            </Button>
            <Button disabled>Boarding closed</Button>
          </div>
          <p className={styles.meta}>
            Pressed state: {String(pressed)}. Loading is handled through the product-level <code>loading</code> prop.
          </p>
        </div>
      </div>
    </RenderedDemo>
  );
}
