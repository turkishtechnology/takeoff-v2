import type { ElementType } from 'react';
import type {
  DialogProps as SparDialogProps,
  DialogContentProps as SparDialogContentProps,
  DialogOverlayProps as SparDialogOverlayProps,
  DialogTriggerProps as SparDialogTriggerProps,
  DialogCloseProps as SparDialogCloseProps,
  DialogTitleProps as SparDialogTitleProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap, StateOnlyComponentThemeConfig } from '../../core';

export type DialogTriggerSlot = 'root';

export type DialogOverlaySlot = 'root';

export type DialogContentSlot = 'root';

export type DialogHeaderSlot = 'root';

export type DialogTitleSlot = 'root';

export type DialogDescriptionSlot = 'root';

export type DialogFooterSlot = 'root';

export type DialogCloseSlot = 'root';

export type DialogOverlayIntensity = 'lightest' | 'light' | 'base' | 'dark' | 'darkest';
export type DialogVariant = 'success' | 'info' | 'warning' | 'danger';

export type DialogHeaderType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

/**
 * Public props for the Dialog root. State-only — renders no DOM, so no
 * polymorphic `as` and no native HTML props.
 */
export interface DialogProps extends Pick<SparDialogProps, 'id' | 'open' | 'defaultOpen' | 'onOpenChange' | 'modal' | 'disabled' | 'forceMount' | 'children'> {
  /** Whether the dialog can be dismissed by clicking outside or pressing Escape. @defaultValue true */
  dismissable?: boolean;
  /** Visual semantic variant for dialog styling. @defaultValue 'info' */
  variant?: DialogVariant;
}

export interface DialogTriggerOwnProps {
  classNames?: ClassNamesMap<DialogTriggerSlot>;
  slotProps?: SlotPropsMap<DialogTriggerSlot>;
}

export type DialogTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  DialogTriggerOwnProps &
    // Trigger surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing
    // open/close/toggle state without a separate hook.
    Pick<SparDialogTriggerProps, 'children'>
>;

export interface DialogOverlayOwnProps {
  /** When true, the overlay is rendered but visually invisible. @defaultValue false */
  invisible?: boolean;
  /** Overlay backdrop intensity. @defaultValue 'base' */
  intensity?: DialogOverlayIntensity;
  /** Applies backdrop blur on the overlay. @defaultValue false */
  blur?: boolean;
  classNames?: ClassNamesMap<DialogOverlaySlot>;
  slotProps?: SlotPropsMap<DialogOverlaySlot>;
}

export type DialogOverlayProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DialogOverlayOwnProps &
    // Portal container; defaults to `document.body` in Spar.
    Pick<SparDialogOverlayProps, 'container'>
>;

export interface DialogContentOwnProps {
  classNames?: ClassNamesMap<DialogContentSlot>;
  slotProps?: SlotPropsMap<DialogContentSlot>;
}

export type DialogContentProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  DialogContentOwnProps &
    // Dialog role, portal container, focus management, and dismiss event hooks.
    Pick<
      SparDialogContentProps,
      | 'role'
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

export interface DialogTitleOwnProps {
  classNames?: ClassNamesMap<DialogTitleSlot>;
  slotProps?: SlotPropsMap<DialogTitleSlot>;
}

export interface DialogHeaderOwnProps {
  /** Type of the header. @defaultValue 'basic' */
  headerType?: DialogHeaderType;
  classNames?: ClassNamesMap<DialogHeaderSlot>;
  slotProps?: SlotPropsMap<DialogHeaderSlot>;
}

export type DialogHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, DialogHeaderOwnProps>;

export type DialogTitleProps<T extends ElementType = 'h2'> = PolymorphicProps<
  'h2',
  T,
  DialogTitleOwnProps &
    // Semantic heading level (1–6).
    Pick<SparDialogTitleProps, 'level'>
>;

export interface DialogDescriptionOwnProps {
  classNames?: ClassNamesMap<DialogDescriptionSlot>;
  slotProps?: SlotPropsMap<DialogDescriptionSlot>;
}

export type DialogDescriptionProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, DialogDescriptionOwnProps>;

export interface DialogFooterOwnProps {
  classNames?: ClassNamesMap<DialogFooterSlot>;
  slotProps?: SlotPropsMap<DialogFooterSlot>;
}

export type DialogFooterProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, DialogFooterOwnProps>;

export interface DialogCloseOwnProps {
  classNames?: ClassNamesMap<DialogCloseSlot>;
  slotProps?: SlotPropsMap<DialogCloseSlot>;
}

export type DialogCloseProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  DialogCloseOwnProps &
    // Close surface from Spar. `children` is picked so it accepts both
    // ReactNode and the render-prop function form for accessing close state.
    Pick<SparDialogCloseProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Dialog: StateOnlyComponentThemeConfig<DialogProps>;
    DialogTrigger: import('../../core').ComponentThemeConfig<DialogTriggerProps, DialogTriggerSlot>;
    DialogOverlay: import('../../core').ComponentThemeConfig<DialogOverlayProps, DialogOverlaySlot>;
    DialogContent: import('../../core').ComponentThemeConfig<DialogContentProps, DialogContentSlot>;
    DialogHeader: import('../../core').ComponentThemeConfig<DialogHeaderProps, DialogHeaderSlot>;
    DialogTitle: import('../../core').ComponentThemeConfig<DialogTitleProps, DialogTitleSlot>;
    DialogDescription: import('../../core').ComponentThemeConfig<DialogDescriptionProps, DialogDescriptionSlot>;
    DialogFooter: import('../../core').ComponentThemeConfig<DialogFooterProps, DialogFooterSlot>;
    DialogClose: import('../../core').ComponentThemeConfig<DialogCloseProps, DialogCloseSlot>;
  }
}
