import { AccordionBase, AccordionItemBase } from '../components/accordion/AccordionBase';
import { ButtonBase } from '../components/button/ButtonBase';
import { CheckboxBase } from '../components/checkbox/CheckboxBase';
import { DialogBase } from '../components/dialog/DialogBase';
import { InputBase } from '../components/input/InputBase';

/**
 * Internal inventory of every shipped component's slot-class map.
 *
 * This is a *slot-class registry*, not a recipe surface. Per ADR 0005, the
 * public styling contract is the stable `tk-*` slot classes plus the
 * canonical `data-*` hooks. The actual styling recipes (variant logic,
 * keyframes, color resolution) live in
 * `@takeoff-design/tokens/styles/recipes/_<component>.scss` and consume the
 * `tk-*` classes by string convention — they do not import this object.
 *
 * The registry exists as a single typed inventory that:
 * - the component generator script keeps in sync as new components ship
 * - future build-time validation can introspect to assert every shipped
 *   component declares its slots through `createComponentBase`
 *
 * It is intentionally internal. Consumers needing slot classes should
 * reference the documented `tk-*` strings directly or the per-component
 * `*Base.classes` map, both of which are part of the documented contract.
 */
export const slotClassRegistry = {
  accordion: {
    slots: AccordionBase.classes,
  },
  accordionItem: {
    slots: AccordionItemBase.classes,
  },
  button: {
    slots: ButtonBase.classes,
  },
  checkbox: {
    slots: CheckboxBase.classes,
  },
  dialog: {
    slots: DialogBase.classes,
  },
  input: {
    slots: InputBase.classes,
  },
} as const;
