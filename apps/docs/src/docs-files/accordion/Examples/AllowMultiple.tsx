import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function AllowMultipleDemo() {
  return (
    <Accordion allowMultiple>
      <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
      <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
      <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
    </Accordion>
  );
}`;

export default function AllowMultiple() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <Accordion allowMultiple>
          <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
    </RenderedDemo>
  );
}
