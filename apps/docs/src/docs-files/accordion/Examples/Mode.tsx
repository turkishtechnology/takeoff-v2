import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function ModeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Default</p>
        <Accordion mode="default">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
        </Accordion>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Compact</p>
        <Accordion mode="compact">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

export default function Mode() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Default</p>
          <Accordion mode="default">
            <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
            <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          </Accordion>
        </div>

        <div className={styles.divider} />

        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Compact</p>
          <Accordion mode="compact">
            <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
            <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          </Accordion>
        </div>
      </div>
    </RenderedDemo>
  );
}
