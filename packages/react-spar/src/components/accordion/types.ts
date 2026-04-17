import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';

import type { AccordionSlot, AccordionItemSlot } from './AccordionBase';
import type { ClassNamesOverride } from '../../customization/overrides';

export type AccordionType = 'grouped' | 'divided';

export type AccordionMode = 'default' | 'compact';

export type AccordionArrowPosition = 'left' | 'right';

export type AccordionItemSize = 'base' | 'large';

export interface AccordionSlotProps {
  root?: HTMLAttributes<HTMLDivElement>;
}

export interface AccordionItemSlotProps {
  root?: HTMLAttributes<HTMLDivElement>;
  header?: HTMLAttributes<HTMLDivElement>;
  title?: HTMLAttributes<HTMLSpanElement>;
  content?: HTMLAttributes<HTMLDivElement>;
  icon?: HTMLAttributes<HTMLSpanElement>;
  arrow?: HTMLAttributes<HTMLSpanElement>;
}

type AccordionNativeProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue' | 'value'>;

export interface AccordionProps extends AccordionNativeProps {
  /**
   * Currently active panel indexes. Can be a single value or an array.
   * When `allowMultiple` is false, only the last value in the array is used.
   * Has priority over `AccordionItem.active`.
   */
  activeIndex?: string | number | (string | number)[];
  /**
   * Initial active panel indexes for uncontrolled usage.
   * Has priority over `AccordionItem.active`.
   */
  defaultActiveIndex?: string | number | (string | number)[];
  /**
   * Allows multiple accordion items to be expanded simultaneously.
   * @defaultValue false
   */
  allowMultiple?: boolean;
  /**
   * Position of the expand/collapse chevron.
   * @defaultValue 'right'
   */
  arrowPosition?: AccordionArrowPosition;
  /**
   * Custom expand icon. String values still render as Material Symbols ligatures
   * when the consumer has loaded the font. The built-in default is a placeholder
   * chevron SVG.
   *
   * TODO(takeoff-icons): Swap the chevron placeholder for the official Takeoff
   * icon before the first public release.
   */
  expandIcon?: ReactNode;
  /**
   * Custom collapse icon. String values still render as Material Symbols ligatures
   * when the consumer has loaded the font. The built-in default is a placeholder
   * chevron SVG.
   *
   * TODO(takeoff-icons): Swap the chevron placeholder for the official Takeoff
   * icon before the first public release.
   */
  collapseIcon?: ReactNode;
  /**
   * Whether to hide the expand/collapse arrows.
   * @defaultValue false
   */
  hideArrows?: boolean;
  /**
   * Accordion visual style.
   * @defaultValue 'grouped'
   */
  type?: AccordionType;
  /**
   * Display mode of the accordion.
   * @defaultValue 'default'
   */
  mode?: AccordionMode;
  /**
   * Callback fired when the active index changes.
   */
  onActiveIndexChange?: (activeIndex: string | number | (string | number)[] | undefined) => void;
  children?: ReactNode;
  /**
   * Per-slot class name overrides for the accordion root.
   */
  classNames?: ClassNamesOverride<AccordionSlot>;
  /**
   * Per-slot HTML attribute overrides for the accordion root.
   */
  slotProps?: AccordionSlotProps;
}

type AccordionItemNativeProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'value'>;

export interface AccordionItemProps extends AccordionItemNativeProps {
  /**
   * Optional key to identify this item. Falls back to the child position index.
   */
  itemKey?: string | number;
  /**
   * Header text or custom header content.
   */
  header?: ReactNode;
  /**
   * Component size.
   * @defaultValue 'base'
   */
  size?: AccordionItemSize;
  /**
   * Icon displayed in the header. String values render as Material Symbols.
   */
  icon?: ReactNode;
  /**
   * Initial or declarative active state for this item when the parent accordion
   * is not controlled by `activeIndex`.
   */
  active?: boolean;
  /**
   * Callback fired when user interaction requests a new active state for this item.
   */
  onActiveChange?: (active: boolean) => void;
  children?: ReactNode;
  /**
   * Per-slot class name overrides for this accordion item.
   */
  classNames?: ClassNamesOverride<AccordionItemSlot>;
  /**
   * Per-slot HTML attribute overrides for this accordion item.
   */
  slotProps?: AccordionItemSlotProps;
}
