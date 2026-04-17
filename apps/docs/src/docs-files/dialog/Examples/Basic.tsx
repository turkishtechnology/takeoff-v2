import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function BasicDialogDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Upgrade cabin"
        subheader="Review the fare difference before confirming."
        containerStyle={{ width: '460px' }}
      >
        You can keep the Takeoff product props while Spar owns focus trapping
        and dialog semantics. Press Esc or click the mask to dismiss.
      </Dialog>
    </>
  );
}`;

function BasicDialogDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Open dialog</Button>

      <Dialog visible={visible} onVisibleChange={setVisible} header="Upgrade cabin" subheader="Review the fare difference before confirming." containerStyle={{ width: '460px' }}>
        You can keep the Takeoff product props while Spar owns focus trapping and dialog semantics. Press Esc or click the mask to dismiss.
      </Dialog>
    </>
  );
}

export default function Basic() {
  return (
    <RenderedDemo code={code} previewMinHeight={200} previewWrapper={ReactSparDemoRoot}>
      <BasicDialogDemo />
    </RenderedDemo>
  );
}
