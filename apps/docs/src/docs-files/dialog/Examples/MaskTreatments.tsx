import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const maskVariants = ['lightest', 'light', 'base', 'dark', 'darkest'] as const;

const code = `import { useState } from 'react';

export function MaskTreatmentsDemo() {
  const [visible, setVisible] = useState(false);
  const [hideBackdrop, setHideBackdrop] = useState(false);
  const [blurMask, setBlurMask] = useState(true);
  const [maskVariant, setMaskVariant] = useState('darkest');
  const maskVariants = ['lightest', 'light', 'base', 'dark', 'darkest'];

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button
          size="small"
          type={hideBackdrop ? 'filled' : 'outlined'}
          onClick={() => setHideBackdrop((value) => !value)}
        >
          {hideBackdrop ? 'Backdrop hidden' : 'Backdrop visible'}
        </Button>
        <Button
          size="small"
          type={blurMask ? 'filled' : 'outlined'}
          onClick={() => setBlurMask((value) => !value)}
        >
          {blurMask ? 'Blur on' : 'Blur off'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {maskVariants.map((value) => (
          <Button
            key={value}
            size="small"
            type={maskVariant === value ? 'filled' : 'outlined'}
            variant={maskVariant === value ? 'primary' : 'secondary'}
            onClick={() => setMaskVariant(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Mask treatment"
        subheader={\`\${maskVariant} • \${blurMask ? 'blurred' : 'no blur'} • \${hideBackdrop ? 'no backdrop' : 'backdrop visible'}\`}
        hideBackdrop={hideBackdrop}
        isMaskBlur={blurMask}
        maskVariant={maskVariant}
        containerStyle={{ width: '460px' }}
      >
        The same dialog body runs with a hidden backdrop, a blurred mask, or any
        of the five mask variants depending on product context.
      </Dialog>
    </div>
  );
}`;

function MaskTreatmentsDemo() {
  const [visible, setVisible] = useState(false);
  const [hideBackdrop, setHideBackdrop] = useState(false);
  const [blurMask, setBlurMask] = useState(true);
  const [maskVariant, setMaskVariant] = useState<(typeof maskVariants)[number]>('darkest');

  return (
    <div style={{ display: 'grid', gap: 16, width: 'min(100%, 40rem)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Button size="small" type={hideBackdrop ? 'filled' : 'outlined'} onClick={() => setHideBackdrop(value => !value)}>
          {hideBackdrop ? 'Backdrop hidden' : 'Backdrop visible'}
        </Button>
        <Button size="small" type={blurMask ? 'filled' : 'outlined'} onClick={() => setBlurMask(value => !value)}>
          {blurMask ? 'Blur on' : 'Blur off'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {maskVariants.map(value => (
          <Button
            key={value}
            size="small"
            type={maskVariant === value ? 'filled' : 'outlined'}
            variant={maskVariant === value ? 'primary' : 'secondary'}
            onClick={() => setMaskVariant(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Mask treatment"
        subheader={`${maskVariant} • ${blurMask ? 'blurred' : 'no blur'} • ${hideBackdrop ? 'no backdrop' : 'backdrop visible'}`}
        hideBackdrop={hideBackdrop}
        isMaskBlur={blurMask}
        maskVariant={maskVariant}
        containerStyle={{ width: '460px' }}
      >
        The same dialog body runs with a hidden backdrop, a blurred mask, or any of the five mask variants depending on product context.
      </Dialog>
    </div>
  );
}

export default function MaskTreatments() {
  return (
    <RenderedDemo code={code} previewMinHeight={240} previewWrapper={ReactSparDemoRoot}>
      <MaskTreatmentsDemo />
    </RenderedDemo>
  );
}
