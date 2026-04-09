import { useState } from 'react';
import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `import { useState } from 'react';

export function ActiveIndexDemo() {
  const [active, setActive] = useState<(string | number)[]>([0, 1]);

  return (
    <Accordion
      allowMultiple
      activeIndex={active}
      onActiveIndexChange={(index) => setActive(Array.isArray(index) ? index : index !== undefined ? [index] : [])}
    >
      <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
      <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
      <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
    </Accordion>
  );
}`;

export default function ActiveIndex() {
  const [active, setActive] = useState<(string | number)[]>([0, 1]);

  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <Accordion allowMultiple activeIndex={active} onActiveIndexChange={index => setActive(Array.isArray(index) ? index : index !== undefined ? [index] : [])}>
          <AccordionItem header="Panel 1">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
    </RenderedDemo>
  );
}
