import type { ElementType, ReactNode } from 'react';
import type {
  PolymorphicProps,
  TabsActivationMode as SparTabsActivationMode,
  TabsContentProps as SparTabsContentProps,
  TabsListProps as SparTabsListProps,
  TabsProps as SparTabsProps,
  TabsTriggerProps as SparTabsTriggerProps,
  TabsTriggerRenderProps as SparTabsTriggerRenderProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type TabsSize = 'small' | 'base' | 'large';
export type TabsActivationMode = SparTabsActivationMode;
export type TabsVariant = 'primary' | 'info' | 'neutral';
export type TabsAppearance = 'basic' | 'compact' | 'divided' | 'expanded';
// Render-prop state surface exposed by `Tabs.Trigger` children.
export type TabsTriggerRenderProps = Pick<SparTabsTriggerRenderProps, 'isSelected' | 'select' | 'disabled' | 'isFocused' | 'orientation'>;

export type TabsSlot = 'root';
export type TabsListSlot = 'root';
export type TabsTriggerSlot = 'root';
export type TabsContentSlot = 'root';

export interface TabsOwnProps {
  /**
   * Size scale. Cascades to `Tabs.Trigger` via context.
   * @defaultValue 'base'
   */
  size?: TabsSize;
  /**
   * Color variant used by the active tab treatment.
   * @defaultValue 'primary'
   */
  variant?: TabsVariant;
  /**
   * Visual tab style.
   * @defaultValue 'basic'
   */
  appearance?: TabsAppearance;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TabsSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TabsSlot>;
}

export type TabsProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  TabsOwnProps &
    // Spar tab state: controlled/uncontrolled value, orientation, activation
    // mode, and the base id used to wire trigger/panel ARIA relationships.
    Pick<SparTabsProps, 'id' | 'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'activationMode'>
>;

export interface TabsListOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TabsListSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TabsListSlot>;
}

export type TabsListProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  TabsListOwnProps &
    // `children` and native attrs flow through PolymorphicProps; picking the
    // Spar type keeps this wrapper tied to the accessible list surface.
    Pick<SparTabsListProps, 'children'>
>;

export interface TabsTriggerOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TabsTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TabsTriggerSlot>;
  /** Compound children, or a render function exposing Spar's per-trigger state. */
  children?: ReactNode | ((state: TabsTriggerRenderProps) => ReactNode);
}

export type TabsTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  TabsTriggerOwnProps &
    // Trigger identity and per-trigger behavior. The trigger's render-prop
    // child form is declared above so the public state type stays local.
    Pick<SparTabsTriggerProps, 'value' | 'disabled' | 'autoFocus'>
>;

export interface TabsContentOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TabsContentSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TabsContentSlot>;
}

export type TabsContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  TabsContentOwnProps &
    // Panel identity and lazy-mount control.
    Pick<SparTabsContentProps, 'value' | 'forceMount'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Tabs: import('../../core').ComponentThemeConfig<TabsProps, TabsSlot>;
    TabsList: import('../../core').ComponentThemeConfig<TabsListProps, TabsListSlot>;
    TabsTrigger: import('../../core').ComponentThemeConfig<TabsTriggerProps, TabsTriggerSlot>;
    TabsContent: import('../../core').ComponentThemeConfig<TabsContentProps, TabsContentSlot>;
  }
}
