import RenderedDemo from '../../../components/RenderedDemo';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const code = `export function SizeDemo() {
  const sectionLabelStyle = {
    margin: 0,
    color: 'var(--primary-base)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Base</p>
        <Accordion>
          <AccordionItem header="Panel 1 Title" size="base">
            Panel content at base size.
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" size="base">
            Panel content at base size.
          </AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Large</p>
        <Accordion>
          <AccordionItem header="Panel 1 Title" size="large">
            Panel content at large size.
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" size="large">
            Panel content at large size.
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

function SizeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Base</p>
        <Accordion>
          <AccordionItem header="Panel 1 Title" size="base">
            Panel content at base size.
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" size="base">
            Panel content at base size.
          </AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Large</p>
        <Accordion>
          <AccordionItem header="Panel 1 Title" size="large">
            Panel content at large size.
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" size="large">
            Panel content at large size.
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default function Size() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <SizeDemo />
    </RenderedDemo>
  );
}
