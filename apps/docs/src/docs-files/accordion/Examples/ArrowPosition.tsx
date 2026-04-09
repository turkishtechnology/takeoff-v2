import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function ArrowPositionDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Right (default)</p>
        <Accordion arrowPosition="right">
          <AccordionItem header="Panel 1 Title" icon="flight">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title" icon="hotel">Panel 2 Content</AccordionItem>
        </Accordion>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Left</p>
        <Accordion arrowPosition="left">
          <AccordionItem header="Panel 1 Title" icon="flight">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title" icon="hotel">Panel 2 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

export default function ArrowPosition() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Right (default)</p>
          <Accordion arrowPosition="right">
            <AccordionItem header="Panel 1 Title" icon="flight">
              Panel 1 Content
            </AccordionItem>
            <AccordionItem header="Panel 2 Title" icon="hotel">
              Panel 2 Content
            </AccordionItem>
          </Accordion>
        </div>

        <div className={styles.divider} />

        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Left</p>
          <Accordion arrowPosition="left">
            <AccordionItem header="Panel 1 Title" icon="flight">
              Panel 1 Content
            </AccordionItem>
            <AccordionItem header="Panel 2 Title" icon="hotel">
              Panel 2 Content
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </RenderedDemo>
  );
}
