import type { ElementType } from 'react';
import type { LabelProps as SparLabelProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type LabelSlot = 'root';

export interface LabelOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<LabelSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<LabelSlot>;
}

export type LabelProps<T extends ElementType = 'label'> = PolymorphicProps<
  'label',
  T,
  LabelOwnProps &
    // Inherit Spar Label's accessible association and state styling hooks.
    Pick<SparLabelProps, 'children' | 'required' | 'isOptional' | 'disabled' | 'readOnly' | 'invalid'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Label: import('../../core').ComponentThemeConfig<LabelProps, LabelSlot>;
  }
}
