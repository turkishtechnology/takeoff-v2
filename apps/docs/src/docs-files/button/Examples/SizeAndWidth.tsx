import RenderedDemo from '../../../components/RenderedDemo';
import styles from './button-examples.module.css';
import { Button, ReactSparDemoRoot } from './shared';

const code = `export function SizeAndWidthDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 720px)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
        <Button size='small'>Small</Button>
        <Button size='base'>Base</Button>
        <Button size='large'>Large</Button>
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border-light)' }} />

      <div style={{ width: 'min(100%, 360px)' }}>
        <Button fullWidth type='outlined' variant='secondary'>
          Full-width secondary
        </Button>
      </div>
    </div>
  );
}`;

export default function SizeAndWidth() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Sizes</p>
          <div className={styles.demoRow}>
            <Button size="small">Small</Button>
            <Button size="base">Base</Button>
            <Button size="large">Large</Button>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Full width</p>
          <div className={styles.demoStack}>
            <div className={styles.fullWidthWrap}>
              <Button fullWidth>Continue to passenger details</Button>
            </div>
            <div className={styles.fullWidthWrap}>
              <Button fullWidth type="outlined" variant="secondary">
                Compare fare families
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RenderedDemo>
  );
}
