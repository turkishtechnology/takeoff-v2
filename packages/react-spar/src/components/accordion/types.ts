import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react';

import type { AccordionArrowRenderState, AccordionItemSlot, AccordionSlot } from './AccordionBase';
import type { ClassNamesOverride } from '../../customization/overrides';

export type AccordionType = 'grouped' | 'divided';

export type AccordionMode = 'default' | 'compact';

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
   * Has priority over `Accordion.Item.active`.
   */
  activeIndex?: string | number | (string | number)[];
  /**
   * Initial active panel indexes for uncontrolled usage.
   * Has priority over `Accordion.Item.active`.
   */
  defaultActiveIndex?: string | number | (string | number)[];
  /**
   * Allows multiple accordion items to be expanded simultaneously.
   * @defaultValue false
   */
  allowMultiple?: boolean;
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
  /**
   * Compound children — must be composed from `Accordion.Item`.
   */
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
   * Component size.
   * @defaultValue 'base'
   */
  size?: AccordionItemSize;
  /**
   * Initial or declarative active state for this item when the parent accordion
   * is not controlled by `activeIndex`.
   */
  active?: boolean;
  /**
   * Callback fired when user interaction requests a new active state for this item.
   */
  onActiveChange?: (active: boolean) => void;
  /**
   * Compound children — typically `Accordion.Header` and `Accordion.Content`.
   */
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

export interface AccordionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Typically composed from `Accordion.Icon`, `Accordion.Title`, and
   * `Accordion.Arrow` — but any layout is accepted.
   */
  children?: ReactNode;
}

export interface AccordionTitleProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface AccordionIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface AccordionArrowProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Custom expand icon rendered when the item is collapsed. When omitted the
   * built-in placeholder chevron is used.
   */
  expandIcon?: ReactNode;
  /**
   * Custom collapse icon rendered when the item is expanded. When omitted the
   * built-in placeholder chevron is used.
   */
  collapseIcon?: ReactNode;
  /**
   * Render-prop children for fully custom arrow content. Takes precedence over
   * the icon props and receives the resolved open state.
   */
  children?: ReactNode | ((state: AccordionArrowRenderState) => ReactNode);
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
