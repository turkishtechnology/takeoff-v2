import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const headerTypes = ['basic', 'divided', 'light', 'dark', 'primary'] as const;

const code = `import { useState } from 'react';

export function HeaderTypesDemo() {
  const [visible, setVisible] = useState(false);
  const [headerType, setHeaderType] = useState('basic');
  const headerTypes = ['basic', 'divided', 'light', 'dark', 'primary'];

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {headerTypes.map((value) => (
          <Button
            key={value}
            size="small"
            type={headerType === value ? 'filled' : 'outlined'}
            variant={headerType === value ? 'primary' : 'secondary'}
            onClick={() => setHeaderType(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Header treatment"
        subheader={\`Current headerType: \${headerType}\`}
        headerType={headerType}
        containerStyle={{ width: '460px' }}
      >
        Header types keep the same body and footer layout while changing the
        top treatment only.
      </Dialog>
    </div>
  );
}`;

function HeaderTypesDemo() {
  const [visible, setVisible] = useState(false);
  const [headerType, setHeaderType] = useState<(typeof headerTypes)[number]>('basic');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {headerTypes.map(value => (
          <Button
            key={value}
            size="small"
            type={headerType === value ? 'filled' : 'outlined'}
            variant={headerType === value ? 'primary' : 'secondary'}
            onClick={() => setHeaderType(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Header treatment"
        subheader={`Current headerType: ${headerType}`}
        headerType={headerType}
        containerStyle={{ width: '460px' }}
      >
        Header types keep the same body and footer layout while changing the top treatment only.
      </Dialog>
    </div>
  );
}

export default function HeaderTypes() {
  return (
    <RenderedDemo code={code} previewMinHeight={240} previewWrapper={ReactSparDemoRoot}>
      <HeaderTypesDemo />
    </RenderedDemo>
  );
}
