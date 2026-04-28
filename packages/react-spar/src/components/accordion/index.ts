import { Accordion as AccordionRoot } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionHeader } from './AccordionHeader';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';
import { AccordionArrow } from './AccordionArrow';

/**
 * Compound surface. Subcomponents are reached **only** through the root
 * (`Accordion.Item`, `Accordion.Header`, …). Direct named subcomponent
 * exports are intentionally absent per ADR-0002.
 *
 * `*Base` helpers stay internal — they are wrapper-implementation detail and
 * not part of the public contract surface.
 */
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
  Arrow: AccordionArrow,
});

export { Accordion };

export type {
  AccordionActiveIndex,
  AccordionArrowProps,
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemKey,
  AccordionItemProps,
  AccordionMode,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionType,
} from './types';
