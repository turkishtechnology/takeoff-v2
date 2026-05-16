import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from 'react';
import type { PolymorphicProps, SwitchProps as SparSwitchProps, SwitchRenderProps as UpstreamSwitchRenderProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type SwitchSize = 'xlarge' | 'large' | 'base' | 'small' | 'xsmall';
export type SwitchVariant = 'info' | 'success';
export type SwitchSlot = 'root' | 'indicator' | 'thumb';

/**
 * Render props passed to the root `Switch` render-prop child. Re-exports
 * Spar's shape verbatim — consumers reading the state inside compound
 * children should use `Switch.Indicator` render-prop instead, which receives
 * the takeoff-spar split via context.
 */
export type SwitchRenderProps = UpstreamSwitchRenderProps;

/**
 * Render props passed to `Switch.Indicator` function-children. Mirrors the
 * shape used by `Checkbox.Indicator`.
 */
export interface SwitchIndicatorRenderProps {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
}

interface SwitchOwnProps {
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: SwitchSize;
  /**
   * Color variant used while checked.
   * @defaultValue 'info'
   */
  variant?: SwitchVariant;
  /**
   * Marks the switch as visually invalid. When inside a `<Field>`, Spar
   * inherits the Field's invalid state automatically — pass this prop only
   * to override.
   * @defaultValue false
   */
  invalid?: boolean;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<SwitchSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<SwitchSlot>;
  /**
   * Compound children for the switch anatomy, or a render function exposing
   * Spar's state. Compound children are the canonical composition path; the
   * render-prop is preserved for parity with Spar's leaf primitive.
   */
  children?: ReactNode | ((state: UpstreamSwitchRenderProps) => ReactNode);
}

/**
 * Public props for `Switch`. Polymorphic via `as` — defaults to Spar's
 * `<button role="switch">` element.
 */
export type SwitchProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  SwitchOwnProps &
    // Behavior surface owned by Spar. `invalid` is intentionally NOT picked
    // here — takeoff-spar exposes a plain `invalid` boolean (same name as
    // Spar) declared in SwitchOwnProps and forwards it explicitly at the
    // call site so the JSDoc stays under takeoff-spar's authorial control.
    Pick<SparSwitchProps, 'checked' | 'defaultChecked' | 'onChange' | 'disabled' | 'readOnly' | 'required' | 'name' | 'value' | 'form' | 'autoFocus'>
>;

export interface SwitchIndicatorProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * Indicator content. When omitted, the built-in track + thumb anatomy is
   * rendered automatically (a `thumb` slot is mounted inside the indicator
   * span). When a function, receives the current `checked` / `disabled` /
   * `readOnly` state from the root and its return value replaces the inner
   * slot. Passing a `ReactNode` likewise replaces the inner slot entirely —
   * the consumer becomes responsible for any `data-slot="thumb"` wrapper
   * they need for theming.
   */
  children?: ReactNode | ((state: SwitchIndicatorRenderProps) => ReactNode);
  ref?: Ref<HTMLSpanElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Switch: import('../../core').ComponentThemeConfig<SwitchProps, SwitchSlot>;
  }
}
