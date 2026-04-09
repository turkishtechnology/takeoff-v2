import { AccordionBase, AccordionItemBase } from '../components/accordion/AccordionBase';
import { ButtonBase } from '../components/button/ButtonBase';

export const recipes = {
  accordion: {
    slots: AccordionBase.classes,
  },
  accordionItem: {
    slots: AccordionItemBase.classes,
  },
  button: {
    slots: ButtonBase.classes,
  },
} as const;
