import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const variants = ['info', 'success', 'warning', 'danger'] as const;

const code = `import { useState } from 'react';

export function DialogVariantsDemo() {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState('info');
  const variants = ['info', 'success', 'warning', 'danger'];

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {variants.map((value) => (
          <Button
            key={value}
            size="small"
            type={variant === value ? 'filled' : 'outlined'}
            variant={variant === value ? 'primary' : 'secondary'}
            onClick={() => setVariant(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Preview variant</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Service message"
        subheader={\`Current variant: \${variant}\`}
        variant={variant}
        containerStyle={{ width: '460px' }}
      >
        Variant changes the sign icon treatment and tonal emphasis while the
        layout contract stays stable.
      </Dialog>
    </div>
  );
}`;

function DialogVariantsDemo() {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<(typeof variants)[number]>('info');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {variants.map(value => (
          <Button key={value} size="small" type={variant === value ? 'filled' : 'outlined'} variant={variant === value ? 'primary' : 'secondary'} onClick={() => setVariant(value)}>
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Preview variant</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Service message"
        subheader={`Current variant: ${variant}`}
        variant={variant}
        containerStyle={{ width: '460px' }}
      >
        Variant changes the sign icon treatment and tonal emphasis while the layout contract stays stable.
      </Dialog>
    </div>
  );
}

export default function Variants() {
  return (
    <RenderedDemo code={code} previewMinHeight={240} previewWrapper={ReactSparDemoRoot}>
      <DialogVariantsDemo />
    </RenderedDemo>
  );
}
