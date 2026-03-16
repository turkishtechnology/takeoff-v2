import RenderedDemo from '../../../components/RenderedDemo';
import styles from './button-examples.module.css';
import { Button, ReactSparDemoRoot } from './shared';

const code = `export function VariantDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
      <Button variant='primary'>Primary</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='success'>Success</Button>
      <Button variant='warning'>Warning</Button>
      <Button variant='danger'>Danger</Button>
      <Button variant='neutral'>Neutral</Button>
    </div>
  );
}`;

export default function Variant() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <div className={styles.demoRow}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="neutral">Neutral</Button>
          </div>
        </div>
      </div>
    </RenderedDemo>
  );
}
