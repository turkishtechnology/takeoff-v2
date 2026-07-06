import { AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase } from './components/accordion/base';
import { AlertActionsBase, AlertBase, AlertCloseBase, AlertContentBase, AlertDescriptionBase, AlertTitleBase } from './components/alert/base';
import { BadgeBase } from './components/badge/base';
import { BreadcrumbBase, BreadcrumbItemBase, BreadcrumbLinkBase, BreadcrumbListBase, BreadcrumbPageBase, BreadcrumbSeparatorBase } from './components/breadcrumb/base';
import { ButtonBase } from './components/button/base';
import { CardBase, CardBodyBase, CardDescriptionBase, CardFooterBase, CardHeaderBase, CardTitleBase } from './components/card/base';
import { CheckboxBase } from './components/checkbox/base';
import { ChipBase } from './components/chip/base';
import {
  DialogBodyBase,
  DialogCloseBase,
  DialogPanelBase,
  DialogDescriptionBase,
  DialogFooterBase,
  DialogHeaderBase,
  DialogOverlayBase,
  DialogTitleBase,
  DialogTriggerBase,
} from './components/dialog/base';
import {
  DrawerBase,
  DrawerBodyBase,
  DrawerCloseBase,
  DrawerDescriptionBase,
  DrawerFooterBase,
  DrawerHeaderBase,
  DrawerOverlayBase,
  DrawerPanelBase,
  DrawerTitleBase,
  DrawerTriggerBase,
} from './components/drawer/base';
import { FieldBase, FieldDescriptionBase, FieldErrorMessageBase, FieldLabelBase } from './components/field/base';
import {
  InputBase,
  InputChipsBase,
  InputClearButtonBase,
  InputDecrementBase,
  InputFieldBase,
  InputIncrementBase,
  InputLeadingIconBase,
  InputPrefixBase,
  InputRevealButtonBase,
  InputSpinnerBase,
  InputStepperBase,
  InputStrengthBase,
  InputSuffixBase,
  InputTrailingIconBase,
} from './components/input/base';
import { ProgressBase, ProgressIndicatorBase } from './components/progress/base';
import { SelectBase, SelectContentBase, SelectGroupBase, SelectIndicatorBase, SelectItemBase, SelectLabelBase, SelectSeparatorBase, SelectTriggerBase } from './components/select/base';
import { SpinnerBase } from './components/spinner/base';
import { SwitchBase } from './components/switch/base';
import { TableBase } from './components/table/base';
import { TabsBase, TabsContentBase, TabsListBase, TabsTriggerBase } from './components/tabs/base';
import { PopoverArrowBase, PopoverCloseBase, PopoverContentBase, PopoverTriggerBase } from './components/popover/base';
import { RadioBase, RadioIndicatorBase, RadioItemBase, RadioLabelBase } from './components/radio/base';
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
  accordionContent: { slots: AccordionContentBase.classes },
  alert: { slots: AlertBase.classes },
  alertContent: { slots: AlertContentBase.classes },
  alertTitle: { slots: AlertTitleBase.classes },
  alertDescription: { slots: AlertDescriptionBase.classes },
  alertActions: { slots: AlertActionsBase.classes },
  alertClose: { slots: AlertCloseBase.classes },
  badge: { slots: BadgeBase.classes },
  breadcrumb: { slots: BreadcrumbBase.classes },
  breadcrumbList: { slots: BreadcrumbListBase.classes },
  breadcrumbItem: { slots: BreadcrumbItemBase.classes },
  breadcrumbLink: { slots: BreadcrumbLinkBase.classes },
  breadcrumbPage: { slots: BreadcrumbPageBase.classes },
  breadcrumbSeparator: { slots: BreadcrumbSeparatorBase.classes },
  button: { slots: ButtonBase.classes },
  card: { slots: CardBase.classes },
  cardHeader: { slots: CardHeaderBase.classes },
  cardTitle: { slots: CardTitleBase.classes },
  cardDescription: { slots: CardDescriptionBase.classes },
  cardBody: { slots: CardBodyBase.classes },
  cardFooter: { slots: CardFooterBase.classes },
  checkbox: { slots: CheckboxBase.classes },
  chip: { slots: ChipBase.classes },
  dialogTrigger: { slots: DialogTriggerBase.classes },
  dialogOverlay: { slots: DialogOverlayBase.classes },
  dialogPanel: { slots: DialogPanelBase.classes },
  dialogHeader: { slots: DialogHeaderBase.classes },
  dialogTitle: { slots: DialogTitleBase.classes },
  dialogDescription: { slots: DialogDescriptionBase.classes },
  dialogBody: { slots: DialogBodyBase.classes },
  dialogFooter: { slots: DialogFooterBase.classes },
  dialogClose: { slots: DialogCloseBase.classes },
  drawer: { slots: DrawerBase.classes },
  drawerOverlay: { slots: DrawerOverlayBase.classes },
  drawerPanel: { slots: DrawerPanelBase.classes },
  drawerHeader: { slots: DrawerHeaderBase.classes },
  drawerTitle: { slots: DrawerTitleBase.classes },
  drawerDescription: { slots: DrawerDescriptionBase.classes },
  drawerBody: { slots: DrawerBodyBase.classes },
  drawerFooter: { slots: DrawerFooterBase.classes },
  drawerClose: { slots: DrawerCloseBase.classes },
  drawerTrigger: { slots: DrawerTriggerBase.classes },
  field: { slots: FieldBase.classes },
  fieldLabel: { slots: FieldLabelBase.classes },
  fieldDescription: { slots: FieldDescriptionBase.classes },
  fieldErrorMessage: { slots: FieldErrorMessageBase.classes },
  input: { slots: InputBase.classes },
  inputField: { slots: InputFieldBase.classes },
  inputPrefix: { slots: InputPrefixBase.classes },
  inputSuffix: { slots: InputSuffixBase.classes },
  inputLeadingIcon: { slots: InputLeadingIconBase.classes },
  inputTrailingIcon: { slots: InputTrailingIconBase.classes },
  inputClearButton: { slots: InputClearButtonBase.classes },
  inputSpinner: { slots: InputSpinnerBase.classes },
  inputRevealButton: { slots: InputRevealButtonBase.classes },
  inputStrength: { slots: InputStrengthBase.classes },
  inputStepper: { slots: InputStepperBase.classes },
  inputDecrement: { slots: InputDecrementBase.classes },
  inputIncrement: { slots: InputIncrementBase.classes },
  inputChips: { slots: InputChipsBase.classes },
  progress: { slots: ProgressBase.classes },
  progressIndicator: { slots: ProgressIndicatorBase.classes },
  select: { slots: SelectBase.classes },
  selectTrigger: { slots: SelectTriggerBase.classes },
  selectIndicator: { slots: SelectIndicatorBase.classes },
  selectContent: { slots: SelectContentBase.classes },
  selectItem: { slots: SelectItemBase.classes },
  selectGroup: { slots: SelectGroupBase.classes },
  selectLabel: { slots: SelectLabelBase.classes },
  selectSeparator: { slots: SelectSeparatorBase.classes },
  spinner: { slots: SpinnerBase.classes },
  switch: { slots: SwitchBase.classes },
  table: { slots: TableBase.classes },
  tabs: { slots: TabsBase.classes },
  tabsList: { slots: TabsListBase.classes },
  tabsTrigger: { slots: TabsTriggerBase.classes },
  tabsContent: { slots: TabsContentBase.classes },
  popoverTrigger: { slots: PopoverTriggerBase.classes },
  popoverContent: { slots: PopoverContentBase.classes },
  popoverArrow: { slots: PopoverArrowBase.classes },
  popoverClose: { slots: PopoverCloseBase.classes },
  radio: { slots: RadioBase.classes },
  radioItem: { slots: RadioItemBase.classes },
  radioIndicator: { slots: RadioIndicatorBase.classes },
  radioLabel: { slots: RadioLabelBase.classes },
  tooltipTrigger: { slots: TooltipTriggerBase.classes },
  tooltipContent: { slots: TooltipContentBase.classes },
  tooltipHeader: { slots: TooltipHeaderBase.classes },
  tooltipDescription: { slots: TooltipDescriptionBase.classes },
  tooltipArrow: { slots: TooltipArrowBase.classes },
} as const;
