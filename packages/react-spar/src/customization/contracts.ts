import type { AccordionItemProps, AccordionItemSlotProps, AccordionProps, AccordionSlotProps } from '../components/accordion/types';
import type { AccordionItemSlot, AccordionSlot } from '../components/accordion/AccordionBase';
import type { ButtonProps, ButtonSlotProps } from '../components/button/types';
import type { ButtonSlot } from '../components/button/ButtonBase';
import type { CheckboxProps, CheckboxSlotProps } from '../components/checkbox/types';
import type { CheckboxSlot } from '../components/checkbox/CheckboxBase';
import type { DialogProps, DialogSlotProps } from '../components/dialog/types';
import type { DialogSlot } from '../components/dialog/DialogBase';
import type { InputProps, InputSlotProps } from '../components/input/types';
import type { InputSlot } from '../components/input/InputBase';

import type { ClassNamesOverride, SlotPropsOverride } from './overrides';

/**
 * Theme-level configuration for a single component. Every field is optional.
 *
 * Runtime precedence (instance-wins):
 *
 * - `defaultProps` — applied only when the instance does not set that prop.
 * - `classNames`  — concatenated with canonical `tk-*` classes AND with any
 *   instance-level `classNames` of the same slot.
 * - `slotProps`   — shallow-merged per slot with instance-level `slotProps`;
 *   instance attrs override conflicting theme attrs. `className` values from
 *   theme and instance slotProps both concatenate onto the canonical class.
 *
 * @typeParam TProps - Public component props. `defaultProps` is `Partial<TProps>`
 *   so unknown fields fail at compile time.
 * @typeParam TSlot - Union of canonical slot names for the component. Used to
 *   type `classNames`.
 * @typeParam TSlotProps - Shape of the component's per-slot HTML attribute
 *   map. Defaults to the generic `SlotPropsOverride<TSlot>`; components supply
 *   their own `XxxSlotProps` interface to preserve polymorphic element typing.
 */
export interface ComponentThemeConfig<TProps = unknown, TSlot extends string = string, TSlotProps = SlotPropsOverride<TSlot>> {
  /**
   * Props to apply when the instance does not set them. Instance props always win.
   */
  defaultProps?: Partial<TProps>;

  /**
   * Extra class names per slot. Concatenated with canonical `tk-*` classes
   * and with instance-level `classNames` of the same slot.
   */
  classNames?: ClassNamesOverride<TSlot>;

  /**
   * HTML attribute overrides per slot. `className` values concatenate; other
   * attributes use instance-wins shallow merge.
   */
  slotProps?: TSlotProps;
}

/**
 * Registry mapping each publicly customizable component name to its theme
 * config. Exposed as an `interface` so downstream code could augment it via
 * TypeScript module-declaration merging if it ever ships additional
 * customizable components; the canonical set is populated here.
 *
 * @see ComponentName - the union of keys accepted by `SparReactProvider`.
 * @see ComponentsThemeMap - the `components` map on the provider.
 */
export interface ComponentCustomizationRegistry {
  Button: ComponentThemeConfig<ButtonProps, ButtonSlot, ButtonSlotProps>;
  Accordion: ComponentThemeConfig<AccordionProps, AccordionSlot, AccordionSlotProps>;
  AccordionItem: ComponentThemeConfig<AccordionItemProps, AccordionItemSlot, AccordionItemSlotProps>;
  Checkbox: ComponentThemeConfig<CheckboxProps, CheckboxSlot, CheckboxSlotProps>;
  Dialog: ComponentThemeConfig<DialogProps, DialogSlot, DialogSlotProps>;
  Input: ComponentThemeConfig<InputProps, InputSlot, InputSlotProps>;
}

/**
 * Union of valid customizable component names.
 */
export type ComponentName = keyof ComponentCustomizationRegistry;

/**
 * Typed provider-facing customization map. Each key must be a known component
 * name; each value is that component's typed theme config. Unknown component
 * names, unknown slot keys, and unknown `defaultProps` fields all fail at
 * compile time.
 */
export type ComponentsThemeMap = {
  [K in ComponentName]?: ComponentCustomizationRegistry[K];
};
