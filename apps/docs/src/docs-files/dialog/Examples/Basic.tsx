import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function BasicDialogDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Open dialog</Button.Label>
      </Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        containerStyle={{ width: '460px' }}
      >
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.SignIcon />
            <Dialog.TitleGroup>
              <Dialog.Description>Review the fare difference before confirming.</Dialog.Description>
              <Dialog.Title>Upgrade cabin</Dialog.Title>
            </Dialog.TitleGroup>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>
            You can compose Dialog parts while Spar owns focus trapping and
            dialog semantics. Press Esc or click the mask to dismiss.
          </Dialog.Body>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}`;

function BasicDialogDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Open dialog</Button.Label>
      </Button>

      <Dialog visible={visible} onVisibleChange={setVisible} containerStyle={{ width: '460px' }}>
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.SignIcon />
            <Dialog.TitleGroup>
              <Dialog.Description>Review the fare difference before confirming.</Dialog.Description>
              <Dialog.Title>Upgrade cabin</Dialog.Title>
            </Dialog.TitleGroup>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>You can compose Dialog parts while Spar owns focus trapping and dialog semantics. Press Esc or click the mask to dismiss.</Dialog.Body>
        </Dialog.Panel>
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
