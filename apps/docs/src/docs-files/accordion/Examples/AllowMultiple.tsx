import RenderedDemo from '../../../components/RenderedDemo';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function AllowMultipleDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion allowMultiple>
        <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
        <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
        <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
      </Accordion>
    </div>
  );
}`;

function AllowMultipleDemo() {
  return (
    <div style={{ width: 'min(100%, 40rem)' }}>
      <Accordion allowMultiple>
        <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
        <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
        <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
      </Accordion>
    </div>
  );
}

export default function AllowMultiple() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <AllowMultipleDemo />
    </RenderedDemo>
  );
}
