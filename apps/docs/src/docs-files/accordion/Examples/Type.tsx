import RenderedDemo from '../../../components/RenderedDemo';
import styles from './accordion-examples.module.css';
import { Accordion, AccordionItem, ReactSparDemoRoot } from './shared';

const code = `export function TypeDemo() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Grouped</p>
        <Accordion type="grouped">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Divided</p>
        <Accordion type="divided">
          <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
          <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
          <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}`;

export default function Type() {
  return (
    <RenderedDemo code={code} previewWrapper={ReactSparDemoRoot}>
      <div className={styles.demoStack}>
        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Grouped</p>
          <Accordion type="grouped">
            <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
            <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
            <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
          </Accordion>
        </div>

        <div className={styles.divider} />

        <div className={styles.demoSection}>
          <p className={styles.sectionLabel}>Divided</p>
          <Accordion type="divided">
            <AccordionItem header="Panel 1 Title">Panel 1 Content</AccordionItem>
            <AccordionItem header="Panel 2 Title">Panel 2 Content</AccordionItem>
            <AccordionItem header="Panel 3 Title">Panel 3 Content</AccordionItem>
          </Accordion>
        </div>
      </div>
    </RenderedDemo>
  );
}
