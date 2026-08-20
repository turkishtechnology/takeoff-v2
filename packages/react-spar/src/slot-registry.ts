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
import { DividerBase } from './components/divider/base';
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
import {
  DropdownArrowBase,
  DropdownContentBase,
  DropdownGroupBase,
  DropdownItemBase,
  DropdownLabelBase,
  DropdownSeparatorBase,
  DropdownTriggerBase,
  DropdownViewportBase,
} from './components/dropdown/base';
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
import { ProgressBase, ProgressIndicatorBase, ProgressTrackBase, ProgressValueBase } from './components/progress/base';
import {
  SelectArrowBase,
  SelectBase,
  SelectContentBase,
  SelectGroupBase,
  SelectIndicatorBase,
  SelectItemBase,
  SelectLabelBase,
  SelectSeparatorBase,
  SelectTriggerBase,
  SelectViewportBase,
} from './components/select/base';
import { SliderBase, SliderRangeBase, SliderThumbBase, SliderTicksBase, SliderTrackBase, SliderValueBase } from './components/slider/base';
import { SpinnerBase } from './components/spinner/base';
import { StepperBase, StepperDescriptionBase, StepperItemBase, StepperTitleBase } from './components/stepper/base';
import { SwitchBase } from './components/switch/base';
import { TableBase } from './components/table/base';
import { TabsBase, TabsContentBase, TabsListBase, TabsTriggerBase } from './components/tabs/base';
import { PopoverArrowBase, PopoverCloseBase, PopoverContentBase, PopoverTriggerBase } from './components/popover/base';
import { RadioBase, RadioIndicatorBase, RadioItemBase, RadioLabelBase } from './components/radio/base';
import { TooltipArrowBase, TooltipContentBase, TooltipDescriptionBase, TooltipHeaderBase, TooltipTriggerBase } from './components/tooltip/base';
import { SkeletonBase } from './components/skeleton/base';
import {
  UploadActionsBase,
  UploadBase,
  UploadDropzoneBase,
  UploadItemActionBase,
  UploadItemActionsBase,
  UploadItemBase,
  UploadItemContentBase,
  UploadItemPreviewBase,
  UploadListBase,
  UploadSubmitBase,
  UploadTriggerBase,
} from './components/upload/base';

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
  divider: { slots: DividerBase.classes },
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
  dropdownTrigger: { slots: DropdownTriggerBase.classes },
  dropdownContent: { slots: DropdownContentBase.classes },
  dropdownViewport: { slots: DropdownViewportBase.classes },
  dropdownItem: { slots: DropdownItemBase.classes },
  dropdownGroup: { slots: DropdownGroupBase.classes },
  dropdownLabel: { slots: DropdownLabelBase.classes },
  dropdownSeparator: { slots: DropdownSeparatorBase.classes },
  dropdownArrow: { slots: DropdownArrowBase.classes },
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
  progressTrack: { slots: ProgressTrackBase.classes },
  progressIndicator: { slots: ProgressIndicatorBase.classes },
  progressValue: { slots: ProgressValueBase.classes },
  select: { slots: SelectBase.classes },
  selectTrigger: { slots: SelectTriggerBase.classes },
  selectIndicator: { slots: SelectIndicatorBase.classes },
  selectContent: { slots: SelectContentBase.classes },
  selectViewport: { slots: SelectViewportBase.classes },
  selectItem: { slots: SelectItemBase.classes },
  selectGroup: { slots: SelectGroupBase.classes },
  selectLabel: { slots: SelectLabelBase.classes },
  selectSeparator: { slots: SelectSeparatorBase.classes },
  selectArrow: { slots: SelectArrowBase.classes },
  slider: { slots: SliderBase.classes },
  sliderTrack: { slots: SliderTrackBase.classes },
  sliderRange: { slots: SliderRangeBase.classes },
  sliderThumb: { slots: SliderThumbBase.classes },
  sliderTicks: { slots: SliderTicksBase.classes },
  sliderValue: { slots: SliderValueBase.classes },
  spinner: { slots: SpinnerBase.classes },
  stepper: { slots: StepperBase.classes },
  stepperItem: { slots: StepperItemBase.classes },
  stepperTitle: { slots: StepperTitleBase.classes },
  stepperDescription: { slots: StepperDescriptionBase.classes },
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
  skeleton: { slots: SkeletonBase.classes },
  upload: { slots: UploadBase.classes },
  uploadDropzone: { slots: UploadDropzoneBase.classes },
  uploadActions: { slots: UploadActionsBase.classes },
  uploadTrigger: { slots: UploadTriggerBase.classes },
  uploadSubmit: { slots: UploadSubmitBase.classes },
  uploadList: { slots: UploadListBase.classes },
  uploadItem: { slots: UploadItemBase.classes },
  uploadItemContent: { slots: UploadItemContentBase.classes },
  uploadItemPreview: { slots: UploadItemPreviewBase.classes },
  uploadItemActions: { slots: UploadItemActionsBase.classes },
  uploadItemAction: { slots: UploadItemActionBase.classes },
} as const;
