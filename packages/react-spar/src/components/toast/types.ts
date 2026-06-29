import type { ElementType, ReactNode } from 'react';
import type {
  CreateToasterOptions,
  PolymorphicProps,
  ToastData as SparToastData,
  ToastOptions as SparToastOptions,
  ToastAnnouncement,
  ToastPlacement,
  ToastPromiseOptions,
  ToastStatus,
  ToastType,
  ToastUpdateOptions,
  ToasterController,
  ToasterProps as SparToasterProps,
} from '@turkish-technology/spar';

import type { AlertAppearance, AlertVariant } from '../alert';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type ToastVariant = AlertVariant;
export type ToastAppearance = AlertAppearance;

export type ToastSlot = 'root';
export type ToasterSlot = 'root';

export type ToastData = SparToastData;

export type ToastOptions = SparToastOptions;

export interface ToasterOwnProps {
  toaster: ToasterController;
  appearance?: ToastAppearance;
  closeLabel?: string;
  overlap?: boolean;
  classNames?: ClassNamesMap<ToasterSlot>;
  slotProps?: SlotPropsMap<ToasterSlot>;
  children?: (toast: ToastData) => ReactNode;
}

// Spar Toaster viewport surface. `toaster` (controller), `children` (render
// prop), `appearance`, `closeLabel`, and `overlap` are takeoff-v2's own — in
// ToasterOwnProps above. Only the screen-reader region `label` and the focus
// `hotkey` are re-exposed from Spar as-is.
export type ToasterProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ToasterOwnProps & Pick<SparToasterProps, 'label' | 'hotkey'>>;

export interface ToastOwnProps {
  toast: ToastData;
  toaster?: ToasterController;
  appearance?: ToastAppearance;
  closeLabel?: string;
  classNames?: ClassNamesMap<ToastSlot>;
  slotProps?: SlotPropsMap<ToastSlot>;
}

// Spar Toast.Root surface. Its only non-native fields are `toast` and
// `toaster`, both re-declared in ToastOwnProps above, so nothing is picked
// from Spar here — the polymorphic `as`/`ref` and native HTML attributes come
// from PolymorphicProps. `children` is the optional custom-render escape hatch.
export type ToastProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  ToastOwnProps & {
    children?: ReactNode;
  }
>;

export type { CreateToasterOptions, ToastAnnouncement, ToastPlacement, ToastPromiseOptions, ToastStatus, ToastType, ToastUpdateOptions, ToasterController };

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Toaster: import('../../core').ComponentThemeConfig<ToasterProps, ToasterSlot>;
    Toast: import('../../core').ComponentThemeConfig<ToastProps, ToastSlot>;
  }
}
