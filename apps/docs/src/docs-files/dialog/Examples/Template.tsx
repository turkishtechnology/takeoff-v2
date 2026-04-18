import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): CloseIcon is a temporary Lucide-sourced placeholder.
// Replace with the official Takeoff icon set before the first public release.
import { Button, CloseIcon, Dialog, ReactSparDemoRoot } from './shared';

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
};

const introStyle = {
  display: 'grid',
  gap: 4,
};

const eyebrowStyle = {
  color: 'var(--text-base)',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const headingStyle = {
  color: 'var(--text-darkest)',
  fontSize: '1.125rem',
  lineHeight: 1.25,
};

const descriptionStyle = {
  color: 'var(--text-base)',
  fontSize: '0.9375rem',
  lineHeight: 1.5,
};

const bodyStyle = {
  display: 'grid',
  gap: 12,
};

const paneStyle = {
  display: 'grid',
  gap: 4,
  padding: 16,
  border: '1px solid var(--border-light)',
  borderRadius: 16,
  background: 'var(--background-lightest)',
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
};

const footerMetaStyle = {
  color: 'var(--text-base)',
  fontSize: '0.875rem',
};

const code = `// TODO(takeoff-icons): Swap the placeholder icon below for the official
// Takeoff icon component when it is available.
import { useState } from 'react';
import { CloseIcon } from './placeholder-icons';

export function DialogTemplateDemo() {
  const [visible, setVisible] = useState(false);

  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 };
  const introStyle = { display: 'grid', gap: 4 };
  const eyebrowStyle = {
    color: 'var(--text-base)',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
  const headingStyle = { color: 'var(--text-darkest)', fontSize: '1.125rem', lineHeight: 1.25 };
  const descriptionStyle = { color: 'var(--text-base)', fontSize: '0.9375rem', lineHeight: 1.5 };
  const bodyStyle = { display: 'grid', gap: 12 };
  const paneStyle = {
    display: 'grid',
    gap: 4,
    padding: 16,
    border: '1px solid var(--border-light)',
    borderRadius: 16,
    background: 'var(--background-lightest)',
  };
  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  };
  const footerMetaStyle = { color: 'var(--text-base)', fontSize: '0.875rem' };

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Open custom template</Button.Label>
      </Button>

      <Dialog
        aria-label="Exit row approval"
        visible={visible}
        onVisibleChange={setVisible}
        containerStyle={{ width: '520px' }}
      >
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Header>
            <div style={headerStyle}>
              <div style={introStyle}>
                <span style={eyebrowStyle}>Manual approval</span>
                <Dialog.Title style={headingStyle}>Move passenger to exit row</Dialog.Title>
                <Dialog.Description style={descriptionStyle}>
                  Seat 14C requires a final cabin eligibility check.
                </Dialog.Description>
              </div>
              <Dialog.CloseButton>
                <CloseIcon />
              </Dialog.CloseButton>
            </div>
          </Dialog.Header>
          <Dialog.Body>
            <div style={bodyStyle}>
              <div style={paneStyle}>
                <strong>Passenger</strong>
                <span>Ayse Kaya • 34 years old</span>
              </div>
              <div style={paneStyle}>
                <strong>Rules</strong>
                <span>Passenger confirms English comprehension and independent mobility.</span>
              </div>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <div style={footerStyle}>
              <span style={footerMetaStyle}>Decision is logged to the booking timeline.</span>
              <Dialog.FooterActions>
                <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                  <Button.Label>Reject</Button.Label>
                </Button>
                <Button onClick={() => setVisible(false)}>
                  <Button.Label>Approve seat</Button.Label>
                </Button>
              </Dialog.FooterActions>
            </div>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}`;

function DialogTemplateDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Button.Label>Open custom template</Button.Label>
      </Button>

      <Dialog aria-label="Exit row approval" visible={visible} onVisibleChange={setVisible} containerStyle={{ width: '520px' }}>
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Header>
            <div style={headerStyle}>
              <div style={introStyle}>
                <span style={eyebrowStyle}>Manual approval</span>
                <Dialog.Title style={headingStyle}>Move passenger to exit row</Dialog.Title>
                <Dialog.Description style={descriptionStyle}>Seat 14C requires a final cabin eligibility check.</Dialog.Description>
              </div>
              <Dialog.CloseButton>
                <CloseIcon />
              </Dialog.CloseButton>
            </div>
          </Dialog.Header>
          <Dialog.Body>
            <div style={bodyStyle}>
              <div style={paneStyle}>
                <strong>Passenger</strong>
                <span>Ayse Kaya • 34 years old</span>
              </div>
              <div style={paneStyle}>
                <strong>Rules</strong>
                <span>Passenger confirms English comprehension and independent mobility.</span>
              </div>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <div style={footerStyle}>
              <span style={footerMetaStyle}>Decision is logged to the booking timeline.</span>
              <Dialog.FooterActions>
                <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                  <Button.Label>Reject</Button.Label>
                </Button>
                <Button onClick={() => setVisible(false)}>
                  <Button.Label>Approve seat</Button.Label>
                </Button>
              </Dialog.FooterActions>
            </div>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewMinHeight={220} previewWrapper={ReactSparDemoRoot}>
      <DialogTemplateDemo />
    </RenderedDemo>
  );
}
