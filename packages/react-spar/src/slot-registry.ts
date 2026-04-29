import { AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase } from './components/accordion/base';

/**
 * Inventory of every shipped component's slot-class map. The styling recipes
 * in `@takeoff-design/tokens/styles/recipes/_<component>.scss` consume the
 * `tk-*` classes by string — they don't import this object. Tooling does.
 */
export const slotClassRegistry = {
  accordion: { slots: AccordionBase.classes },
  accordionItem: { slots: AccordionItemBase.classes },
  accordionHeader: { slots: AccordionHeaderBase.classes },
  accordionTrigger: { slots: AccordionTriggerBase.classes },
  accordionContent: { slots: AccordionContentBase.classes },
} as const;
