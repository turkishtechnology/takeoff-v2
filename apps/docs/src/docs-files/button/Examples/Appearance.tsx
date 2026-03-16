import RenderedDemo from '../../../components/RenderedDemo';
import styles from './button-examples.module.css';
import { Button, ReactSparDemoRoot } from './shared';

const code = `export function TypeDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 720px)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button type='filled'>Filled</Button>
        <Button type='outlined'>Outlined</Button>
        <Button type='text'>Text</Button>
        <Button type='elevated'>Elevated</Button>
      </div>
      <div style={{ width: '100%', height: 1, background: 'var(--border-light)' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button type='filled' variant='secondary'>Filled secondary</Button>
        <Button type='outlined' variant='secondary'>Outlined secondary</Button>
        <Button type='text' variant='neutral'>Text neutral</Button>
        <Button type='elevated' variant='warning'>Elevated warning</Button>
      </div>
    </div>
  );
}`;

export default function TypeExample() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Type</p>
          <div className={styles.demoRow}>
            <Button type="filled">Filled</Button>
            <Button type="outlined">Outlined</Button>
            <Button type="text">Text</Button>
            <Button type="elevated">Elevated</Button>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>With variant</p>
          <div className={styles.demoRow}>
            <Button type="filled" variant="secondary">
              Filled secondary
            </Button>
            <Button type="outlined" variant="secondary">
              Outlined secondary
            </Button>
            <Button type="text" variant="neutral">
              Text neutral
            </Button>
            <Button type="elevated" variant="warning">
              Elevated warning
            </Button>
          </div>
        </div>
      </div>
    </RenderedDemo>
  );
}
