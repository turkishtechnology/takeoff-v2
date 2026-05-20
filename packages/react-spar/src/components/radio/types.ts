import type { ElementType, ReactNode } from 'react';
import type {
  PolymorphicProps,
  RadioProps as SparRadioProps,
  RadioItemProps as SparRadioItemProps,
  RadioItemRenderProps as SparRadioItemRenderProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type RadioSize = 'small' | 'base' | 'large';
export type RadioType = 'default' | 'card';
export type RadioPosition = 'left' | 'right';

export type RadioSlot = 'root';
export type RadioItemSlot = 'root';
export type RadioIndicatorSlot = 'root' | 'icon';
export type RadioLabelSlot = 'root';

/**
 * Render-prop state surface exposed by `Radio.Item` children.
 *
 * This is a callback-parameter shape, not a wrapper prop surface — but the
 * spar-pick guard matches any `Spar*Props` identifier outside a `Pick<>` so
 * we list the keys explicitly. Keep them in sync with Spar's
 * `RadioItemRenderProps`.
 */
export type RadioRenderProps = Pick<SparRadioItemRenderProps, 'isChecked' | 'select' | 'disabled' | 'isFocused'>;

export interface RadioOwnProps {
  /**
   * Size scale. Cascades to descendant `Radio.Item`s via context.
   * @defaultValue 'base'
   */
  size?: RadioSize;
  /**
   * Visual variant. Cascades to descendant `Radio.Item`s via context.
   * @defaultValue 'default'
   */
  type?: RadioType;
  /**
   * Marks the group as visually invalid. Cascades to descendant `Radio.Item`s.
   * When nested inside a `<Field>` with `invalid`, this is inherited
   * automatically; a direct prop on `<Radio>` always wins. Maps to Spar's
   * `invalid` for ARIA wiring (`aria-invalid`).
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Stretches each item to share the group axis equally. Layout intent only —
   * styling is recipe-side via `[data-spread] > [data-slot="root"]`.
   * @defaultValue false
   */
  spread?: boolean;
  /**
   * Default placement of an item's indicator relative to its label. Cascades
   * to descendant `Radio.Item`s; per-item `position` overrides the group value.
   * @defaultValue 'left'
   */
  position?: RadioPosition;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<RadioSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<RadioSlot>;
}

export type RadioProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  RadioOwnProps &
    // Spar radiogroup state: controlled/uncontrolled value pair, form name/id,
    // disabled/required cascade, ARIA orientation (also drives keyboard nav),
    // and the two focus knobs (`selectOnFocus`, `autoFocus`). Other Spar props
    // (`children`, `as`, native HTML attrs) flow through PolymorphicProps.
    Pick<SparRadioProps, 'id' | 'value' | 'defaultValue' | 'onChange' | 'name' | 'disabled' | 'readOnly' | 'required' | 'orientation' | 'selectOnFocus' | 'autoFocus'>
>;

export interface RadioItemOwnProps {
  /**
   * Override the group-level `position` for this item only.
   * @defaultValue inherited from group
   */
  position?: RadioPosition;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<RadioItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<RadioItemSlot>;
  /** Compound children, or a render function exposing Spar's per-item state. */
  children?: ReactNode | ((state: RadioRenderProps) => ReactNode);
}

export type RadioItemProps<T extends ElementType = 'label'> = PolymorphicProps<
  'label',
  T,
  RadioItemOwnProps &
    // Spar item identity + per-item disable. `children` is declared on
    // RadioItemOwnProps above to expose the render-prop function form; native
    // HTML attrs and `as` flow through PolymorphicProps.
    Pick<SparRadioItemProps, 'value' | 'disabled'>
>;

export interface RadioIndicatorOwnProps {
  /** Per-slot class name overrides — supports `root` and the internal `icon` slot. */
  classNames?: ClassNamesMap<RadioIndicatorSlot>;
  /** Per-slot HTML attribute overrides — supports `root` and the internal `icon` slot. */
  slotProps?: SlotPropsMap<RadioIndicatorSlot>;
  /**
   * Optional custom content for the indicator. When omitted, the wrapper
   * auto-renders the internal `icon` slot (the default dot). When provided,
   * the children replace the default slot entirely — useful for swapping in
   * a check icon or animated marker. The consumer owns checked/unchecked
   * visibility (typically via the `[data-state="checked"]` ancestor selector
   * emitted by Spar on `Radio.Item`).
   */
  children?: ReactNode;
}

export type RadioIndicatorProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, RadioIndicatorOwnProps>;

export interface RadioLabelOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<RadioLabelSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<RadioLabelSlot>;
  children?: ReactNode;
}

export type RadioLabelProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, RadioLabelOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Radio: import('../../core').ComponentThemeConfig<RadioProps, RadioSlot>;
    RadioItem: import('../../core').ComponentThemeConfig<RadioItemProps, RadioItemSlot>;
    RadioIndicator: import('../../core').ComponentThemeConfig<RadioIndicatorProps, RadioIndicatorSlot>;
    RadioLabel: import('../../core').ComponentThemeConfig<RadioLabelProps, RadioLabelSlot>;
  }
}
