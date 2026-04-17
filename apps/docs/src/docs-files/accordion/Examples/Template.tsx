import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): FlightIcon / LuggageIcon are temporary Lucide-sourced
// placeholders. Replace with the official Takeoff icon set before the first
// public release.
import { Accordion, AccordionItem, FlightIcon, LuggageIcon, ReactSparDemoRoot } from './shared';

const headerTitleStyle = {
  color: 'var(--text-darkest)',
  fontWeight: 600,
};

const headerMetaStyle = {
  color: 'var(--text-base)',
  fontSize: '0.75rem',
};

const panelBlockStyle = {
  display: 'grid',
  gap: 4,
};

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { FlightIcon, LuggageIcon } from './placeholder-icons';

export function AccordionTemplateDemo() {
  const headerTitleStyle = { color: 'var(--text-darkest)', fontWeight: 600 };
  const headerMetaStyle = { color: 'var(--text-base)', fontSize: '0.75rem' };
  const panelBlockStyle = { display: 'grid', gap: 4 };

  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion defaultActiveIndex={[0]} type="divided" mode="default">
        <AccordionItem
          icon={<FlightIcon />}
          header={
            <span style={{ display: 'grid', gap: 2 }}>
              <span style={headerTitleStyle}>Outbound flight</span>
              <span style={headerMetaStyle}>IST to AMS • TK1951</span>
            </span>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={panelBlockStyle}>
              <strong>Departure</strong>
              <span>10:40 • Istanbul Airport</span>
            </div>
            <div style={panelBlockStyle}>
              <strong>Arrival</strong>
              <span>13:15 • Amsterdam Schiphol</span>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          icon={<LuggageIcon />}
          header={
            <span style={{ display: 'grid', gap: 2 }}>
              <span style={headerTitleStyle}>Baggage rules</span>
              <span style={headerMetaStyle}>1 cabin bag • 1 checked bag</span>
            </span>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={panelBlockStyle}>
              <strong>Cabin bag</strong>
              <span>8 kg included in the fare.</span>
            </div>
            <div style={panelBlockStyle}>
              <strong>Checked bag</strong>
              <span>23 kg included. Sports equipment can be added later.</span>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}`;

function AccordionTemplateDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion defaultActiveIndex={[0]} type="divided" mode="default">
        <AccordionItem
          icon={<FlightIcon />}
          header={
            <span style={{ display: 'grid', gap: 2 }}>
              <span style={headerTitleStyle}>Outbound flight</span>
              <span style={headerMetaStyle}>IST to AMS • TK1951</span>
            </span>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={panelBlockStyle}>
              <strong>Departure</strong>
              <span>10:40 • Istanbul Airport</span>
            </div>
            <div style={panelBlockStyle}>
              <strong>Arrival</strong>
              <span>13:15 • Amsterdam Schiphol</span>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          icon={<LuggageIcon />}
          header={
            <span style={{ display: 'grid', gap: 2 }}>
              <span style={headerTitleStyle}>Baggage rules</span>
              <span style={headerMetaStyle}>1 cabin bag • 1 checked bag</span>
            </span>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={panelBlockStyle}>
              <strong>Cabin bag</strong>
              <span>8 kg included in the fare.</span>
            </div>
            <div style={panelBlockStyle}>
              <strong>Checked bag</strong>
              <span>23 kg included. Sports equipment can be added later.</span>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function Template() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <AccordionTemplateDemo />
    </RenderedDemo>
  );
}
