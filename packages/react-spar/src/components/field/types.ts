import type { ElementType } from 'react';
import type {
  FieldProps as SparFieldProps,
  FieldLabelProps as SparFieldLabelProps,
  FieldDescriptionProps as SparFieldDescriptionProps,
  FieldErrorMessageProps as SparFieldErrorMessageProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type FieldSlot = 'root';
export type FieldLabelSlot = 'root' | 'asterisk';
export type FieldDescriptionSlot = 'root' | 'icon';
export type FieldErrorMessageSlot = 'root' | 'icon';

export interface FieldOwnProps {
  classNames?: ClassNamesMap<FieldSlot>;
  slotProps?: SlotPropsMap<FieldSlot>;
}

/**
 * Public props for the Field root. Provides shared ARIA context for nested
 * form controls (Input, Switch, Checkbox, etc.) plus styled label, helper
 * text, and error message slots.
 */
export type FieldProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  FieldOwnProps &
    // Spar Field root: identity + form/a11y state (invalid, disabled, required,
    // optional, readOnly) and children render-function support.
    Pick<SparFieldProps, 'id' | 'invalid' | 'disabled' | 'required' | 'optional' | 'readOnly' | 'children'>
>;

export interface FieldLabelOwnProps {
  classNames?: ClassNamesMap<FieldLabelSlot>;
  slotProps?: SlotPropsMap<FieldLabelSlot>;
}

export type FieldLabelProps<T extends ElementType = 'label'> = PolymorphicProps<
  'label',
  T,
  FieldLabelOwnProps &
    // Inherit label surface; htmlFor is wired by Spar Field context.
    Pick<SparFieldLabelProps, 'children'>
>;

export interface FieldDescriptionOwnProps {
  classNames?: ClassNamesMap<FieldDescriptionSlot>;
  slotProps?: SlotPropsMap<FieldDescriptionSlot>;
}

export type FieldDescriptionProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  FieldDescriptionOwnProps &
    // Inherit description surface; aria-describedby is wired by Spar Field.
    Pick<SparFieldDescriptionProps, 'children'>
>;

export interface FieldErrorMessageOwnProps {
  classNames?: ClassNamesMap<FieldErrorMessageSlot>;
  slotProps?: SlotPropsMap<FieldErrorMessageSlot>;
}

export type FieldErrorMessageProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  FieldErrorMessageOwnProps &
    // Inherit error-message surface; role="alert" is wired by Spar Field.
    Pick<SparFieldErrorMessageProps, 'children'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Field: import('../../core').ComponentThemeConfig<FieldProps, FieldSlot>;
    FieldLabel: import('../../core').ComponentThemeConfig<FieldLabelProps, FieldLabelSlot>;
    FieldDescription: import('../../core').ComponentThemeConfig<FieldDescriptionProps, FieldDescriptionSlot>;
    FieldErrorMessage: import('../../core').ComponentThemeConfig<FieldErrorMessageProps, FieldErrorMessageSlot>;
  }
}
