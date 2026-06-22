import type { ElementType, ReactNode } from 'react';
import type {
  CreateToasterOptions,
  ToastData as SparToastData,
  ToastOptions as SparToastOptions,
  ToastAnnouncement,
  ToastPlacement,
  ToastPromiseOptions,
  ToastRootProps as SparToastRootProps,
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

export type ToasterProps<T extends ElementType = 'div'> = Omit<SparToasterProps<T>, 'toaster' | 'children'> & ToasterOwnProps;

export interface ToastOwnProps {
  toast: ToastData;
  toaster?: ToasterController;
  appearance?: ToastAppearance;
  closeLabel?: string;
  classNames?: ClassNamesMap<ToastSlot>;
  slotProps?: SlotPropsMap<ToastSlot>;
}

export type ToastProps<T extends ElementType = 'div'> = Omit<SparToastRootProps<T>, 'toast' | 'toaster' | 'children'> &
  ToastOwnProps & {
    children?: ReactNode;
  };

export type { CreateToasterOptions, ToastAnnouncement, ToastPlacement, ToastPromiseOptions, ToastStatus, ToastType, ToastUpdateOptions, ToasterController };

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Toaster: import('../../core').ComponentThemeConfig<ToasterProps, ToasterSlot>;
    Toast: import('../../core').ComponentThemeConfig<ToastProps, ToastSlot>;
  }
}
