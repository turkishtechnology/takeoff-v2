import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): FlightIcon / HotelIcon are temporary Lucide-sourced
// placeholders. Replace with the official Takeoff icon set before the first
// public release.
import { Accordion, AccordionItem, FlightIcon, HotelIcon, ReactSparDemoRoot } from './shared';

const sectionLabelStyle = {
  margin: 0,
  color: 'var(--primary-base)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { FlightIcon, HotelIcon } from './placeholder-icons';

export function ArrowPositionDemo() {
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
        <p style={sectionLabelStyle}>Right (default)</p>
        <Accordion arrowPosition="right">
          <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title" icon={<HotelIcon />}>Panel 2 Content</AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Left</p>
        <Accordion arrowPosition="left">
          <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title" icon={<HotelIcon />}>Panel 2 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

function ArrowPositionDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, width: 'min(100%, 40rem)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Right (default)</p>
        <Accordion arrowPosition="right">
          <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>
            Panel 1 Content
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" icon={<HotelIcon />}>
            Panel 2 Content
          </AccordionItem>
        </Accordion>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <p style={sectionLabelStyle}>Left</p>
        <Accordion arrowPosition="left">
          <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>
            Panel 1 Content
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" icon={<HotelIcon />}>
            Panel 2 Content
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default function ArrowPosition() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <ArrowPositionDemo />
    </RenderedDemo>
  );
}
