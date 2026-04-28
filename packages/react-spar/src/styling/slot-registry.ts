import { AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase } from '../components/accordion/base';

/**
 * Internal inventory of every shipped component's slot-class map.
 *
 * Per ADR 0005, the public styling contract is the stable `tk-*` slot classes
 * plus the canonical `data-*` hooks. The actual styling recipes (variant
 * logic, keyframes, color resolution) live in
 * `@takeoff-design/tokens/styles/recipes/_<component>.scss` and consume the
 * `tk-*` classes by string convention — they do not import this object.
 *
 * Imports are deliberately reaching into `accordion/base` rather than the
 * component's local barrel. The local barrel is the public surface and only
 * exposes the compound `Accordion` (per ADR-0002); `*Base` helpers are
 * implementation detail that this internal registry composes by hand.
 */
export const slotClassRegistry = {
  accordion: { slots: AccordionBase.classes },
  accordionItem: { slots: AccordionItemBase.classes },
  accordionHeader: { slots: AccordionHeaderBase.classes },
  accordionTrigger: { slots: AccordionTriggerBase.classes },
  accordionContent: { slots: AccordionContentBase.classes },
} as const;
