import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type AccordionType = 'grouped' | 'divided';

export type AccordionMode = 'default' | 'compact';

export type AccordionArrowPosition = 'left' | 'right';

export type AccordionItemSize = 'base' | 'large';

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
   * Custom expand icon. String values render as Material Symbols.
   * @defaultValue 'keyboard_arrow_down'
   */
  expandIcon?: ReactNode;
  /**
   * Custom collapse icon. String values render as Material Symbols.
   * @defaultValue 'keyboard_arrow_up'
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
}
