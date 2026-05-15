import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from 'react';
import type { CheckboxProps as SparCheckboxProps, CheckboxRenderProps as UpstreamCheckboxRenderProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type CheckboxSize = 'small' | 'base';
export type CheckboxType = 'default' | 'card';
export type CheckboxSlot = 'root' | 'indicator' | 'icon';

/**
 * Render props passed to the root `Checkbox` render-prop child. Re-exports
 * Spar's shape verbatim — `checked` is the tri-state `CheckedState` here.
 * Compound consumers should reach for `Checkbox.Indicator` / `Checkbox.Icon`
 * instead so they receive the takeoff-spar `boolean` + `indeterminate` split.
 */
export type CheckboxRenderProps = UpstreamCheckboxRenderProps;

/**
 * Render props passed to `Checkbox.Icon` function-children. Exposes the
 * takeoff-spar split rather than Spar's tri-state, matching the example in
 * `packages/react-spar/docs/coding-standards.md`.
 */
export interface CheckboxIconRenderProps {
  checked: boolean;
  indeterminate: boolean;
}

interface CheckboxOwnProps {
  /**
   * Controlled checked state. Pair with `onChange`.
   * @remarks `indeterminate` overrides this when set to `true`.
   */
  checked?: boolean;
  /**
   * Uncontrolled initial checked state.
   * @defaultValue false
   * @remarks `indeterminate` overrides this when set to `true`.
   */
  defaultChecked?: boolean;
  /**
   * Indeterminate (mixed) visual + ARIA state. Overrides `checked` /
   * `defaultChecked` when `true`; emits `aria-checked="mixed"`.
   *
   * Dynamic toggling of `indeterminate` is only fully reactive in controlled
   * mode. In uncontrolled mode, set it at the initial render and clear it
   * from your own state in response to `onChange`.
   * @defaultValue false
   */
  indeterminate?: boolean;
  /**
   * Fired when the user toggles the checkbox. Indeterminate transitions to
   * `true` on the first toggle, so the callback's argument is always a
   * plain `boolean`.
   */
  onChange?: (checked: boolean) => void;
  /**
   * Marks the checkbox as visually invalid.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: CheckboxSize;
  /**
   * Visual appearance. `'card'` mirrors Takeoff Core's bordered card variant
   * for opt-in card-style selection rows.
   * @defaultValue 'default'
   */
  type?: CheckboxType;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<CheckboxSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<CheckboxSlot>;
  /**
   * Compound children for the checkbox anatomy, or a render function
   * exposing Spar's state. Compound children are the canonical composition
   * path; the render-prop is preserved for parity with Spar's leaf primitive.
   */
  children?: ReactNode | ((state: UpstreamCheckboxRenderProps) => ReactNode);
}

/**
 * Public props for `Checkbox`. Polymorphic via `as` — defaults to the Spar
 * primitive's `<span role="checkbox">` element.
 */
export type CheckboxProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  CheckboxOwnProps &
    // Behavior surface owned by Spar. `checked` / `defaultChecked` / `onChange`
    // are intentionally NOT picked here — takeoff-spar splits Spar's
    // `CheckedState` tri-state into a `boolean` + separate `indeterminate`
    // prop (matching Takeoff Core vocabulary), and the mapping happens
    // inline at the `<SparCheckbox>` call site. `children` is owned by
    // `CheckboxOwnProps` above so the render-prop union type wins over the
    // inherited HTML `children: ReactNode`.
    Pick<SparCheckboxProps, 'disabled' | 'readOnly' | 'required' | 'name' | 'value' | 'form' | 'autoFocus'>
>;

export interface CheckboxIndicatorProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

export interface CheckboxIconProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * Icon content. When a function, receives the current `checked` and
   * `indeterminate` state from the root.
   * @defaultValue a built-in placeholder check / dash glyph driven by `indeterminate`
   */
  children?: ReactNode | ((state: CheckboxIconRenderProps) => ReactNode);
  ref?: Ref<HTMLSpanElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Checkbox: import('../../core').ComponentThemeConfig<CheckboxProps, CheckboxSlot>;
  }
}
