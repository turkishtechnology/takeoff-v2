import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import styles from './button-examples.module.css';
import { Button, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function FormDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      style={{ display: 'grid', gap: 12, width: 'min(100%, 440px)', marginInline: 'auto' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      onReset={() => setSubmitted(false)}
    >
      <input aria-label='Passenger name' placeholder='Passenger name' />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button mode='submit'>Save passenger</Button>
        <Button mode='reset' type='text' variant='neutral'>Reset form</Button>
      </div>
      <Button fullWidth type='outlined' variant='secondary'>Review full-width action</Button>
    </form>
  );
}`;

export default function Form() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <form
            className={styles.form}
            onSubmit={event => {
              event.preventDefault();
              setSubmitted(true);
            }}
            onReset={() => setSubmitted(false)}
          >
            <input className={styles.input} aria-label="Passenger name" placeholder="Passenger name" />

            <div className={styles.demoRow}>
              <Button mode="submit">Save passenger</Button>
              <Button mode="reset" type="text" variant="neutral">
                Reset form
              </Button>
            </div>

            <Button fullWidth type="outlined" variant="secondary">
              Review full-width action
            </Button>

            <p className={styles.meta}>{submitted ? 'Form submit intercepted successfully.' : 'Submit the form to verify native submit and reset semantics.'}</p>
          </form>
        </div>
      </div>
    </RenderedDemo>
  );
}
