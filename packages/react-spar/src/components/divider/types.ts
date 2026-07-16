import type { ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerAppearance = 'solid' | 'dashed' | 'dotted';

export type DividerAlign = 'start' | 'center' | 'end';

export type DividerSlot = 'root' | 'label';

// `role` and `aria-orientation` are component-owned invariants driven by the
// `decorative` and `orientation` props — they are omitted so the type does not
// accept values the wrapper would ignore.
export interface DividerProps extends Omit<TakeoffHTMLProps<'div'>, 'children' | 'role' | 'aria-orientation'> {
  /**
   * Axis of the divider line. Vertical dividers size from their container —
   * place them in a flex row (or give the parent an explicit height) so the
   * line has a height to fill.
   * @defaultValue 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * Line style.
   * @defaultValue 'solid'
   */
  appearance?: DividerAppearance;
  /**
   * Placement of the label along the divider line.
   * @defaultValue 'center'
   */
  align?: DividerAlign;
  /**
   * Marks the divider as purely visual. Decorative dividers are removed from
   * the accessibility tree (`role="none"`); non-decorative dividers render
   * `role="separator"` with the matching `aria-orientation`.
   * @defaultValue false
   */
  decorative?: boolean;
  /**
   * Label content rendered between the line segments. The ARIA `separator`
   * role does not take its accessible name from content — pass `aria-label`
   * when the separator needs a name.
   */
  children?: ReactNode;
  /** Ref forwarded to the root div element. */
  ref?: Ref<HTMLDivElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<DividerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<DividerSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Divider: import('../../core').ComponentThemeConfig<DividerProps, DividerSlot>;
  }
}
