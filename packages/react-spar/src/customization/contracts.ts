import type { AccordionArrowProps, AccordionContentProps, AccordionHeaderProps, AccordionItemProps, AccordionProps, AccordionTriggerProps } from '../components/accordion/types';
import type { ClassNamesMap, SlotPropsMap } from '../types';

/**
 * Theme-level configuration for a single component.
 *
 * Runtime precedence:
 *
 * - `defaultProps` — applied only when the instance does not set that prop
 *   (instance wins on conflict).
 * - `className`    — shortcut equivalent to `classNames.root`. Always
 *   concatenated onto the canonical `tk-*` class. Both forms apply when both
 *   are set; ordering goes canonical → instance → theme.
 * - `classNames`   — per-slot extra class names. Always concatenated; the
 *   canonical `tk-*` class never drops.
 * - `slotProps`    — per-slot HTML attribute overrides. Shallow-merged with
 *   instance attrs; canonical `data-*` hooks always win on conflict.
 *
 * @typeParam TProps      - Public component props. `defaultProps` is `Partial<TProps>`
 *   so unknown fields fail at compile time.
 * @typeParam TSlot       - Slot key union. Defaults to `'root'` for components
 *   that register one entry per slot (the current Accordion/AccordionItem/...
 *   layout). Multi-slot components (`Button` with `root`/`label`/`spinner`)
 *   pass their full union.
 * @typeParam TSlotProps  - Per-slot HTML-attribute map. Defaults to a generic
 *   `HTMLAttributes<HTMLElement>` map; components with element-specific slots
 *   may narrow this.
 */
export interface ComponentThemeConfig<TProps = unknown, TSlot extends string = 'root', TSlotProps extends SlotPropsMap<TSlot, object> = SlotPropsMap<TSlot>> {
  defaultProps?: Partial<TProps>;
  className?: string;
  classNames?: ClassNamesMap<TSlot>;
  slotProps?: TSlotProps;
}

/**
 * Registry mapping each publicly customizable component name to its theme
 * config. Exposed as an `interface` so downstream code could augment it via
 * TypeScript module-declaration merging.
 */
export interface ComponentCustomizationRegistry {
  Accordion: ComponentThemeConfig<AccordionProps>;
  AccordionItem: ComponentThemeConfig<AccordionItemProps>;
  AccordionHeader: ComponentThemeConfig<AccordionHeaderProps>;
  AccordionTrigger: ComponentThemeConfig<AccordionTriggerProps>;
  AccordionContent: ComponentThemeConfig<AccordionContentProps>;
  AccordionArrow: ComponentThemeConfig<AccordionArrowProps>;
}

/**
 * Union of valid customizable component names.
 */
export type ComponentName = keyof ComponentCustomizationRegistry;

/**
 * Typed provider-facing customization map.
 */
export type ComponentsThemeMap = {
  [K in ComponentName]?: ComponentCustomizationRegistry[K];
};
