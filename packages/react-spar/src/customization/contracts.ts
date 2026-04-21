import type { AccordionArrowProps, AccordionContentProps, AccordionHeaderProps, AccordionItemProps, AccordionProps, AccordionTriggerProps } from '../components/accordion/types';

/**
 * Theme-level configuration for a single component.
 *
 * Runtime precedence:
 *
 * - `defaultProps` — applied only when the instance does not set that prop
 *   (instance wins on conflict).
 * - `className`    — always concatenated onto the canonical `tk-*` class and
 *   the instance-level `className` prop. Never dropped.
 *
 * @typeParam TProps - Public component props. `defaultProps` is `Partial<TProps>`
 *   so unknown fields fail at compile time.
 */
export interface ComponentThemeConfig<TProps = unknown> {
  defaultProps?: Partial<TProps>;
  className?: string;
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
