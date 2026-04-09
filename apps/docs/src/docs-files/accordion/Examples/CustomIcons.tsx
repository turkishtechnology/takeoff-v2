import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function CustomIconsDemo() {
  return (
    <Accordion expandIcon="add" collapseIcon="remove">
      <AccordionItem header="Panel 1 Title" icon="flight">
        Panel 1 Content
      </AccordionItem>
      <AccordionItem header="Panel 2 Title" icon="flight">
        Panel 2 Content
      </AccordionItem>
    </Accordion>
  );
}`;

export default function CustomIcons() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <Accordion expandIcon="add" collapseIcon="remove">
          <AccordionItem header="Panel 1 Title" icon="flight">
            Panel 1 Content
          </AccordionItem>
          <AccordionItem header="Panel 2 Title" icon="flight">
            Panel 2 Content
          </AccordionItem>
        </Accordion>
      </div>
    </RenderedDemo>
  );
}
