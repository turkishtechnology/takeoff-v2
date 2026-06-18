import type { ElementType } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type AlertVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export type AlertAppearance = 'filled' | 'filledLight' | 'outlined' | 'gradient';

export type AlertSlot = 'root';
export type AlertContentSlot = 'root';
export type AlertTitleSlot = 'root';
export type AlertDescriptionSlot = 'root';
export type AlertActionsSlot = 'root';
export type AlertCloseSlot = 'root';

export interface AlertOwnProps {
  /**
   * Defines the visual variant of the alert.
   * @defaultValue 'neutral'
   */
  variant?: AlertVariant;
  /**
   * Visual appearance of the alert.
   * @defaultValue 'filled'
   */
  appearance?: AlertAppearance;
  /** Called when `Alert.Close` is clicked. */
  onClose?: () => void;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertSlot>;
}

export type AlertProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, AlertOwnProps>;

export interface AlertContentOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertContentSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertContentSlot>;
}

export type AlertContentProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, AlertContentOwnProps>;

export interface AlertTitleOwnProps {
  /**
   * Semantic heading level used when `as` is not provided.
   * @defaultValue 5
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertTitleSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertTitleSlot>;
}

export type AlertTitleProps<T extends ElementType = 'h5'> = PolymorphicProps<'h5', T, AlertTitleOwnProps>;

export interface AlertDescriptionOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertDescriptionSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertDescriptionSlot>;
}

export type AlertDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, AlertDescriptionOwnProps>;

export interface AlertActionsOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertActionsSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertActionsSlot>;
}

export type AlertActionsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, AlertActionsOwnProps>;

export interface AlertCloseOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AlertCloseSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AlertCloseSlot>;
}

export type AlertCloseProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, AlertCloseOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Alert: import('../../core').ComponentThemeConfig<AlertProps, AlertSlot>;
    AlertContent: import('../../core').ComponentThemeConfig<AlertContentProps, AlertContentSlot>;
    AlertTitle: import('../../core').ComponentThemeConfig<AlertTitleProps, AlertTitleSlot>;
    AlertDescription: import('../../core').ComponentThemeConfig<AlertDescriptionProps, AlertDescriptionSlot>;
    AlertActions: import('../../core').ComponentThemeConfig<AlertActionsProps, AlertActionsSlot>;
    AlertClose: import('../../core').ComponentThemeConfig<AlertCloseProps, AlertCloseSlot>;
  }
}
