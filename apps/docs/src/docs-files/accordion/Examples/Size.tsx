import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function SizeDemo() {
  return (
    <Accordion>
      <AccordionItem header="Base Size Panel" size="base">
        Panel content at base size.
      </AccordionItem>
      <AccordionItem header="Large Size Panel" size="large">
        Panel content at large size.
      </AccordionItem>
    </Accordion>
  );
}`;

export default function Size() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <Accordion>
          <AccordionItem header="Base Size Panel" size="base">
            Panel content at base size.
          </AccordionItem>
          <AccordionItem header="Large Size Panel" size="large">
            Panel content at large size.
          </AccordionItem>
        </Accordion>
      </div>
    </RenderedDemo>
  );
}
