import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function FooterActionsDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Review changes</Button.Label>
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
              <Dialog.Description>Confirm the passenger and seat changes.</Dialog.Description>
              <Dialog.Title>Save booking updates</Dialog.Title>
            </Dialog.TitleGroup>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>
            Dialog.FooterActions owns spacing and alignment on the shared token
            recipe, so any compound children stay on the footer layout.
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.FooterActions>
              <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button onClick={() => setVisible(false)}>
                <Button.Label>Save changes</Button.Label>
              </Button>
            </Dialog.FooterActions>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}`;

function FooterActionsDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Review changes</Button.Label>
      </Button>

      <Dialog visible={visible} onVisibleChange={setVisible} containerStyle={{ width: '460px' }}>
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.SignIcon />
            <Dialog.TitleGroup>
              <Dialog.Description>Confirm the passenger and seat changes.</Dialog.Description>
              <Dialog.Title>Save booking updates</Dialog.Title>
            </Dialog.TitleGroup>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>Dialog.FooterActions owns spacing and alignment on the shared token recipe, so any compound children stay on the footer layout.</Dialog.Body>
          <Dialog.Footer>
            <Dialog.FooterActions>
              <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button onClick={() => setVisible(false)}>
                <Button.Label>Save changes</Button.Label>
              </Button>
            </Dialog.FooterActions>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default function FooterActions() {
  return (
    <RenderedDemo code={code} previewMinHeight={200} previewWrapper={ReactSparDemoRoot}>
      <FooterActionsDemo />
    </RenderedDemo>
  );
}
