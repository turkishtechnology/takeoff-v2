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
  padding: '0 32px 32px',
};

const footerMetaStyle = {
  color: 'var(--text-base)',
  fontSize: '0.875rem',
};

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 12,
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
    padding: '0 32px 32px',
  };
  const footerMetaStyle = { color: 'var(--text-base)', fontSize: '0.875rem' };
  const actionsStyle = { display: 'flex', flexWrap: 'wrap', gap: 12 };

  return (
    <>
      <Button onClick={() => setVisible(true)}>Open custom template</Button>

      <Dialog
        aria-label="Exit row approval"
        visible={visible}
        onVisibleChange={setVisible}
        containerStyle={{ width: '520px' }}
        headerSlot={
          <div style={headerStyle}>
            <div style={introStyle}>
              <span style={eyebrowStyle}>Manual approval</span>
              <strong style={headingStyle}>Move passenger to exit row</strong>
              <span style={descriptionStyle}>Seat 14C requires a final cabin eligibility check.</span>
            </div>
            <Button
              type="text"
              variant="neutral"
              icon={<CloseIcon />}
              rounded
              onClick={() => setVisible(false)}
              aria-label="Close dialog"
            />
          </div>
        }
        contentSlot={
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
        }
        footerSlot={
          <div style={footerStyle}>
            <span style={footerMetaStyle}>Decision is logged to the booking timeline.</span>
            <div style={actionsStyle}>
              <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                Reject
              </Button>
              <Button onClick={() => setVisible(false)}>Approve seat</Button>
            </div>
          </div>
        }
      />
    </>
  );
}`;

function DialogTemplateDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Open custom template</Button>

      <Dialog
        aria-label="Exit row approval"
        visible={visible}
        onVisibleChange={setVisible}
        containerStyle={{ width: '520px' }}
        headerSlot={
          <div style={headerStyle}>
            <div style={introStyle}>
              <span style={eyebrowStyle}>Manual approval</span>
              <strong style={headingStyle}>Move passenger to exit row</strong>
              <span style={descriptionStyle}>Seat 14C requires a final cabin eligibility check.</span>
            </div>
            <Button type="text" variant="neutral" icon={<CloseIcon />} rounded onClick={() => setVisible(false)} aria-label="Close dialog" />
          </div>
        }
        contentSlot={
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
        }
        footerSlot={
          <div style={footerStyle}>
            <span style={footerMetaStyle}>Decision is logged to the booking timeline.</span>
            <div style={actionsStyle}>
              <Button type="text" variant="neutral" onClick={() => setVisible(false)}>
                Reject
              </Button>
              <Button onClick={() => setVisible(false)}>Approve seat</Button>
            </div>
          </div>
        }
      />
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
