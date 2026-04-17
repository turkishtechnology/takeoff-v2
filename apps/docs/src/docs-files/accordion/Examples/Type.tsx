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

const code = `export function TypeDemo() {
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
        <p style={sectionLabelStyle}>Grouped</p>
        <Accordion type="grouped">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Divided</p>
        <Accordion type="divided">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

function TypeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Grouped</p>
        <Accordion type="grouped">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Divided</p>
        <Accordion type="divided">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default function Type() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <TypeDemo />
    </RenderedDemo>
  );
}
