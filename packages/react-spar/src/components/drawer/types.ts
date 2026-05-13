import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Side from which the drawer slides in.
 * @defaultValue 'right'
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom' | 'full-screen';

export type DrawerOverlaySlot = 'root';
export type DrawerPanelSlot = 'root';
export type DrawerHeaderSlot = 'root';
export type DrawerTitleSlot = 'root';
export type DrawerDescriptionSlot = 'root';
export type DrawerBodySlot = 'root';
export type DrawerFooterSlot = 'root';
export type DrawerCloseButtonSlot = 'root';

/**
 * Public props for the Drawer root. Wraps Spar's Dialog in modal mode to
 * create a slide-in side panel.
 */
export interface DrawerProps {
  /** Side the drawer slides in from. */
  placement?: DrawerPlacement;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Whether the drawer can be dismissed by clicking outside or pressing Escape. @defaultValue true */
  dismissable?: boolean;
  children?: ReactNode;
  /** Root element className shorthand. */
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<'root'>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<'root'>;
}

export interface DrawerTriggerProps extends Omit<ComponentPropsWithoutRef<'button'>, 'classNames'> {
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
  ref?: Ref<HTMLButtonElement>;
}

export type DrawerOverlayIntensity = 'lightest' | 'light' | 'base' | 'dark' | 'darkest';

export interface DrawerOverlayProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** When true, the overlay is rendered but visually invisible. @defaultValue false */
  invisible?: boolean;
  /** Overlay backdrop intensity. @defaultValue 'base' */
  intensity?: DrawerOverlayIntensity;
  classNames?: ClassNamesMap<DrawerOverlaySlot>;
  slotProps?: SlotPropsMap<DrawerOverlaySlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface DrawerPanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** DOM container for the portal. Defaults to `document.body`. */
  container?: HTMLElement | null;
  classNames?: ClassNamesMap<DrawerPanelSlot>;
  slotProps?: SlotPropsMap<DrawerPanelSlot>;
  ref?: Ref<HTMLDivElement>;
}

export type DrawerHeaderType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export interface DrawerHeaderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** Type of the header. @defaultValue 'basic' */
  headerType?: DrawerHeaderType;
  classNames?: ClassNamesMap<DrawerHeaderSlot>;
  slotProps?: SlotPropsMap<DrawerHeaderSlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface DrawerTitleProps extends Omit<ComponentPropsWithoutRef<'h2'>, 'classNames'> {
  /** HTML heading level (1–6). Controls both the rendered tag and font size. @defaultValue 5 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  classNames?: ClassNamesMap<DrawerTitleSlot>;
  slotProps?: SlotPropsMap<DrawerTitleSlot>;
  ref?: Ref<HTMLHeadingElement>;
}

export interface DrawerDescriptionProps extends Omit<ComponentPropsWithoutRef<'p'>, 'classNames'> {
  classNames?: ClassNamesMap<DrawerDescriptionSlot>;
  slotProps?: SlotPropsMap<DrawerDescriptionSlot>;
  ref?: Ref<HTMLParagraphElement>;
}

export interface DrawerBodyProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  classNames?: ClassNamesMap<DrawerBodySlot>;
  slotProps?: SlotPropsMap<DrawerBodySlot>;
  ref?: Ref<HTMLDivElement>;
}

export type DrawerFooterType = 'basic' | 'divided' | 'light';

export interface DrawerFooterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'classNames'> {
  /** Type of the footer. @defaultValue 'basic' */
  footerType?: DrawerFooterType;
  classNames?: ClassNamesMap<DrawerFooterSlot>;
  slotProps?: SlotPropsMap<DrawerFooterSlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface DrawerCloseButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'classNames'> {
  classNames?: ClassNamesMap<DrawerCloseButtonSlot>;
  slotProps?: SlotPropsMap<DrawerCloseButtonSlot>;
  ref?: Ref<HTMLButtonElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Drawer: ComponentThemeConfig<DrawerProps>;
    DrawerOverlay: ComponentThemeConfig<DrawerOverlayProps>;
    DrawerPanel: ComponentThemeConfig<DrawerPanelProps>;
    DrawerHeader: ComponentThemeConfig<DrawerHeaderProps>;
    DrawerTitle: ComponentThemeConfig<DrawerTitleProps>;
    DrawerDescription: ComponentThemeConfig<DrawerDescriptionProps>;
    DrawerBody: ComponentThemeConfig<DrawerBodyProps>;
    DrawerFooter: ComponentThemeConfig<DrawerFooterProps>;
    DrawerCloseButton: ComponentThemeConfig<DrawerCloseButtonProps>;
  }
}
