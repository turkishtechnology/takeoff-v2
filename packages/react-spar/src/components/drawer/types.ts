import type { ElementType, ReactNode } from 'react';
import type {
  DialogProps as SparDialogProps,
  DialogTitleProps as SparDialogTitleProps,
  DialogContentProps as SparDialogContentProps,
  DialogOverlayProps as SparDialogOverlayProps,
  DialogTriggerProps as SparDialogTriggerProps,
  DialogCloseProps as SparDialogCloseProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap, StateOnlyComponentThemeConfig } from '../../core';

/**
 * Side from which the drawer slides in.
 * @defaultValue 'right'
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export type DrawerOverlaySlot = 'root';
export type DrawerPanelSlot = 'root';
export type DrawerHeaderSlot = 'root';
export type DrawerTitleSlot = 'root';
export type DrawerDescriptionSlot = 'root';
export type DrawerBodySlot = 'root';
export type DrawerFooterSlot = 'root';
export type DrawerCloseSlot = 'root';

/**
 * Public props for the Drawer root. Wraps Spar's Dialog in modal mode to
 * create a slide-in side panel. State-only — renders no DOM, so no
 * polymorphic `as`, no native HTML props, no `className` / `classNames` /
 * `slotProps` (state-driven styling lives on the Panel/Overlay/Header
 * children, which read shared values from context).
 */
export interface DrawerProps
  // Dialog root identity, controlled state, and trigger disable. Other Spar
  // Dialog root props (e.g. `modal`) are intentionally not exposed — the
  // Drawer's modality is part of its visual contract, not a consumer knob.
  extends Pick<SparDialogProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled'> {
  /** Side the drawer slides in from. */
  placement?: DrawerPlacement;
  /** Whether the drawer can be dismissed by clicking outside or pressing Escape. @defaultValue true */
  dismissible?: boolean;
  children?: ReactNode;
}

export interface DrawerTriggerOwnProps {
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
}

export type DrawerTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  DrawerTriggerOwnProps &
    // Trigger surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing open/close
    // state without a separate hook.
    Pick<SparDialogTriggerProps, 'children'>
>;

export type DrawerOverlayIntensity = 'lightest' | 'light' | 'base' | 'dark' | 'darkest';

export interface DrawerOverlayOwnProps {
  /** When true, the overlay is rendered but visually invisible. @defaultValue false */
  invisible?: boolean;
  /** Overlay backdrop intensity. @defaultValue 'base' */
  intensity?: DrawerOverlayIntensity;
  /** Applies backdrop blur on the overlay. @defaultValue false */
  blur?: boolean;
  classNames?: ClassNamesMap<DrawerOverlaySlot>;
  slotProps?: SlotPropsMap<DrawerOverlaySlot>;
}

export type DrawerOverlayProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DrawerOverlayOwnProps &
    // Portal container; defaults to `document.body` in Spar.
    Pick<SparDialogOverlayProps, 'container'>
>;

export interface DrawerPanelOwnProps {
  classNames?: ClassNamesMap<DrawerPanelSlot>;
  slotProps?: SlotPropsMap<DrawerPanelSlot>;
}

export type DrawerPanelProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DrawerPanelOwnProps &
    // Focus management (trap/restore/initial/final + auto-focus hooks) and
    // dismiss event hooks. Consumers need these to integrate with their own
    // focus orchestration and to veto dismissal. Spar's visual content props
    // (e.g. forceMount) are not exposed — takeoff-v2 sets them internally.
    Pick<
      SparDialogContentProps,
      | 'container'
      | 'trapFocus'
      | 'restoreFocus'
      | 'initialFocus'
      | 'finalFocus'
      | 'onOpenAutoFocus'
      | 'onCloseAutoFocus'
      | 'onEscapeKeyDown'
      | 'onPointerDownOutside'
      | 'onInteractOutside'
    >
>;

export type DrawerHeaderType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export interface DrawerHeaderOwnProps {
  /** Type of the header. @defaultValue 'basic' */
  headerType?: DrawerHeaderType;
  classNames?: ClassNamesMap<DrawerHeaderSlot>;
  slotProps?: SlotPropsMap<DrawerHeaderSlot>;
}

export type DrawerHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, DrawerHeaderOwnProps>;

export interface DrawerTitleOwnProps {
  classNames?: ClassNamesMap<DrawerTitleSlot>;
  slotProps?: SlotPropsMap<DrawerTitleSlot>;
}

export type DrawerTitleProps<T extends ElementType = 'h5'> = PolymorphicProps<
  'h5',
  T,
  DrawerTitleOwnProps &
    // Semantic heading level (1–6).
    Pick<SparDialogTitleProps, 'level'>
>;

export interface DrawerDescriptionOwnProps {
  classNames?: ClassNamesMap<DrawerDescriptionSlot>;
  slotProps?: SlotPropsMap<DrawerDescriptionSlot>;
}

export type DrawerDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, DrawerDescriptionOwnProps>;

export interface DrawerBodyOwnProps {
  classNames?: ClassNamesMap<DrawerBodySlot>;
  slotProps?: SlotPropsMap<DrawerBodySlot>;
}

export type DrawerBodyProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, DrawerBodyOwnProps>;

export type DrawerFooterType = 'basic' | 'divided' | 'light';

export interface DrawerFooterOwnProps {
  /** Type of the footer. @defaultValue 'basic' */
  footerType?: DrawerFooterType;
  classNames?: ClassNamesMap<DrawerFooterSlot>;
  slotProps?: SlotPropsMap<DrawerFooterSlot>;
}

export type DrawerFooterProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, DrawerFooterOwnProps>;

export interface DrawerCloseOwnProps {
  classNames?: ClassNamesMap<DrawerCloseSlot>;
  slotProps?: SlotPropsMap<DrawerCloseSlot>;
}

export type DrawerCloseProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  DrawerCloseOwnProps &
    // Close surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing close state.
    Pick<SparDialogCloseProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Drawer: StateOnlyComponentThemeConfig<DrawerProps>;
    DrawerTrigger: import('../../core').ComponentThemeConfig<DrawerTriggerProps>;
    DrawerOverlay: import('../../core').ComponentThemeConfig<DrawerOverlayProps>;
    DrawerPanel: import('../../core').ComponentThemeConfig<DrawerPanelProps>;
    DrawerHeader: import('../../core').ComponentThemeConfig<DrawerHeaderProps>;
    DrawerTitle: import('../../core').ComponentThemeConfig<DrawerTitleProps>;
    DrawerDescription: import('../../core').ComponentThemeConfig<DrawerDescriptionProps>;
    DrawerBody: import('../../core').ComponentThemeConfig<DrawerBodyProps>;
    DrawerFooter: import('../../core').ComponentThemeConfig<DrawerFooterProps>;
    DrawerClose: import('../../core').ComponentThemeConfig<DrawerCloseProps>;
  }
}
