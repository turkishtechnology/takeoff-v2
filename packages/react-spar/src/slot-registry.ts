import { AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase, AccordionTriggerTitleBase } from './components/accordion/base';
import { ButtonBase } from './components/button/base';
import { PopoverArrowBase, PopoverCloseBase, PopoverContentBase, PopoverTriggerBase } from './components/popover/base';
import { TooltipArrowBase, TooltipContentBase, TooltipDescriptionBase, TooltipHeaderBase, TooltipTriggerBase } from './components/tooltip/base';

/**
 * Inventory of every shipped component's slot-class map. The styling recipes
 * in `@takeoff-design/tokens/styles/recipes/_<component>.scss` consume the
 * `tk-*` classes by string — they don't import this object.
 *
 * Consumer: `scripts/generate-component.mjs` reads this registry while
 * scaffolding new components so the generator can detect existing slot
 * classes, avoid collisions, and append a new entry in the same shape.
 *
 * If you remove a consumer, also remove this file — it is intentionally not
 * re-exported from `src/index.ts`.
 */
export const slotClassRegistry = {
  accordion: { slots: AccordionBase.classes },
  accordionItem: { slots: AccordionItemBase.classes },
  accordionHeader: { slots: AccordionHeaderBase.classes },
  accordionTrigger: { slots: AccordionTriggerBase.classes },
  accordionTriggerTitle: { slots: AccordionTriggerTitleBase.classes },
  accordionContent: { slots: AccordionContentBase.classes },
  button: { slots: ButtonBase.classes },
  popoverTrigger: { slots: PopoverTriggerBase.classes },
  popoverContent: { slots: PopoverContentBase.classes },
  popoverArrow: { slots: PopoverArrowBase.classes },
  popoverClose: { slots: PopoverCloseBase.classes },
  tooltipTrigger: { slots: TooltipTriggerBase.classes },
  tooltipContent: { slots: TooltipContentBase.classes },
  tooltipHeader: { slots: TooltipHeaderBase.classes },
  tooltipDescription: { slots: TooltipDescriptionBase.classes },
  tooltipArrow: { slots: TooltipArrowBase.classes },
} as const;
