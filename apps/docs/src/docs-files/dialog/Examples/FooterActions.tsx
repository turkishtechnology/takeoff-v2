import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import { Button, Dialog, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function FooterActionsDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Review changes</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Save booking updates"
        subheader="Confirm the passenger and seat changes."
        containerStyle={{ width: '460px' }}
        footerActions={
          <>
            <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
              Cancel
            </Button>
            <Button onClick={() => setVisible(false)}>Save changes</Button>
          </>
        }
      >
        The footerActions prop replaces the old footer-actions slot with a
        ReactNode surface. The default footer wrapper keeps spacing and
        alignment on the shared token recipe.
      </Dialog>
    </>
  );
}`;

function FooterActionsDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Review changes</Button>

      <Dialog
        visible={visible}
        onVisibleChange={setVisible}
        header="Save booking updates"
        subheader="Confirm the passenger and seat changes."
        containerStyle={{ width: '460px' }}
        footerActions={
          <>
            <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
              Cancel
            </Button>
            <Button onClick={() => setVisible(false)}>Save changes</Button>
          </>
        }
      >
        The footerActions prop replaces the old footer-actions slot with a ReactNode surface. The default footer wrapper keeps spacing and alignment on the shared token recipe.
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
