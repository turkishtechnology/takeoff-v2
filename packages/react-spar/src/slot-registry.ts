import { AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase, AccordionTriggerTitleBase } from './components/accordion/base';
import { BadgeBase } from './components/badge/base';
import { ButtonBase } from './components/button/base';
import { CheckboxBase } from './components/checkbox/base';
import {
  DrawerBase,
  DrawerBodyBase,
  DrawerCloseButtonBase,
  DrawerDescriptionBase,
  DrawerFooterBase,
  DrawerHeaderBase,
  DrawerOverlayBase,
  DrawerPanelBase,
  DrawerTitleBase,
  DrawerTriggerBase,
} from './components/drawer/base';
import {
  InputBase,
  InputContainerBase,
  InputDescriptionBase,
  InputErrorMessageBase,
  InputFieldBase,
  InputLabelBase,
  InputPrefixBase,
  InputSuffixBase,
} from './components/input/base';
import {
  SelectBase,
  SelectContentBase,
  SelectGroupBase,
  SelectItemBase,
  SelectItemTextBase,
  SelectLabelBase,
  SelectSeparatorBase,
  SelectTriggerBase,
  SelectValueBase,
} from './components/select/base';
import { SwitchBase } from './components/switch/base';
import { PopoverArrowBase, PopoverCloseBase, PopoverContentBase, PopoverTriggerBase } from './components/popover/base';
import {
  RadioBase,
  RadioDescriptionBase,
  RadioIndicatorBase,
  RadioItemBase,
  RadioLabelBase,
  RadioTextBase,
} from './components/radio/base';
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
  badge: { slots: BadgeBase.classes },
  button: { slots: ButtonBase.classes },
  checkbox: { slots: CheckboxBase.classes },
  drawer: { slots: DrawerBase.classes },
  drawerOverlay: { slots: DrawerOverlayBase.classes },
  drawerPanel: { slots: DrawerPanelBase.classes },
  drawerHeader: { slots: DrawerHeaderBase.classes },
  drawerTitle: { slots: DrawerTitleBase.classes },
  drawerDescription: { slots: DrawerDescriptionBase.classes },
  drawerBody: { slots: DrawerBodyBase.classes },
  drawerFooter: { slots: DrawerFooterBase.classes },
  drawerCloseButton: { slots: DrawerCloseButtonBase.classes },
  drawerTrigger: { slots: DrawerTriggerBase.classes },
  input: { slots: InputBase.classes },
  inputContainer: { slots: InputContainerBase.classes },
  inputField: { slots: InputFieldBase.classes },
  inputLabel: { slots: InputLabelBase.classes },
  inputDescription: { slots: InputDescriptionBase.classes },
  inputErrorMessage: { slots: InputErrorMessageBase.classes },
  inputPrefix: { slots: InputPrefixBase.classes },
  inputSuffix: { slots: InputSuffixBase.classes },
  select: { slots: SelectBase.classes },
  selectTrigger: { slots: SelectTriggerBase.classes },
  selectValue: { slots: SelectValueBase.classes },
  selectContent: { slots: SelectContentBase.classes },
  selectItem: { slots: SelectItemBase.classes },
  selectGroup: { slots: SelectGroupBase.classes },
  selectLabel: { slots: SelectLabelBase.classes },
  selectItemText: { slots: SelectItemTextBase.classes },
  selectSeparator: { slots: SelectSeparatorBase.classes },
  switch: { slots: SwitchBase.classes },
  popoverTrigger: { slots: PopoverTriggerBase.classes },
  popoverContent: { slots: PopoverContentBase.classes },
  popoverArrow: { slots: PopoverArrowBase.classes },
  popoverClose: { slots: PopoverCloseBase.classes },
  radio: { slots: RadioBase.classes },
  radioItem: { slots: RadioItemBase.classes },
  radioIndicator: { slots: RadioIndicatorBase.classes },
  radioText: { slots: RadioTextBase.classes },
  radioLabel: { slots: RadioLabelBase.classes },
  radioDescription: { slots: RadioDescriptionBase.classes },
  tooltipTrigger: { slots: TooltipTriggerBase.classes },
  tooltipContent: { slots: TooltipContentBase.classes },
  tooltipHeader: { slots: TooltipHeaderBase.classes },
  tooltipDescription: { slots: TooltipDescriptionBase.classes },
  tooltipArrow: { slots: TooltipArrowBase.classes },
} as const;
