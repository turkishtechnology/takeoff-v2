import RenderedDemo from '../../../components/RenderedDemo';
// TODO(takeoff-icons): AddIcon / RemoveIcon / FlightIcon are temporary
// Lucide-sourced placeholders. Replace with the official Takeoff icon set
// before the first public release.
import { Accordion, AccordionItem, AddIcon, FlightIcon, ReactSparDemoRoot, RemoveIcon } from './shared';

const code = `// TODO(takeoff-icons): Swap the placeholder icons below for the official
// Takeoff icon components when they are available.
import { AddIcon, FlightIcon, RemoveIcon } from './placeholder-icons';

export function CustomIconsDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />}>
        <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>
          Panel 1 Content
        </AccordionItem>
        <AccordionItem header="Panel 2 Title" icon={<FlightIcon />}>
          Panel 2 Content
        </AccordionItem>
      </Accordion>
    </div>
  );
}`;

function CustomIconsDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion expandIcon={<AddIcon />} collapseIcon={<RemoveIcon />}>
        <AccordionItem header="Panel 1 Title" icon={<FlightIcon />}>
          Panel 1 Content
        </AccordionItem>
        <AccordionItem header="Panel 2 Title" icon={<FlightIcon />}>
          Panel 2 Content
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function CustomIcons() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <CustomIconsDemo />
    </RenderedDemo>
  );
}
