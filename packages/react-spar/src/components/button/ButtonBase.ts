import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

import type { ButtonProps } from './types';

export const buttonSlots = ['root', 'label', 'leadingIcon', 'trailingIcon', 'spinner'] as const;

export type ButtonSlot = (typeof buttonSlots)[number];

export const buttonClassNames = {
  root: 'tk-button',
  label: 'tk-button-label',
  leadingIcon: 'tk-button-leading-icon',
  trailingIcon: 'tk-button-trailing-icon',
  spinner: 'tk-button-spinner',
} as const satisfies SlotClassNames<ButtonSlot>;

/**
 * Class fragment applied alongside the directional icon class so that shared
 * icon styling rules (padding, size, alignment) remain a single selector
 * target. Not surfaced as a slot key because no slot node owns it alone.
 */
export const buttonIconSharedClassName = 'tk-button-icon';

/**
 * Composition archetype classification (see
 * `packages/react-spar/docs/CODING_STANDARDS.md § Composition Archetypes`).
 *
 * `SparButton` is a leaf upstream with no compound parts, so every exported
 * sub-component here is a React enhancement.
 *
 * - `Button` root (button-mode) — inherited. Delegates to `SparButton as="button"`.
 * - `Button` root (link-mode)   — bypass. Renders a bare `<a>` instead of
 *   `SparButton as="a"`. Rationale: `SparButton`'s keyboard handler calls
 *   `event.preventDefault()` on Enter/Space for non-native elements
 *   (see `spar/.../Button/Button.tsx` keydown branch), which would block a
 *   native anchor's Enter→navigate behavior. The wrapper keeps that native
 *   semantic intact by rendering a plain `<a>` and handling disabled-state
 *   guards itself.
 * - `Button.Label`        — react-enhancement. No upstream counterpart.
 * - `Button.LeadingIcon`  — react-enhancement.
 * - `Button.TrailingIcon` — react-enhancement.
 * - `Button.Spinner`      — react-enhancement; conditionally renders on `loading`.
 */
export const ButtonBase = createComponentBase<ButtonProps, ButtonSlot>({
  name: 'Button',
  slots: buttonSlots,
  classNames: buttonClassNames,
  defaultProps: {
    type: 'filled',
    variant: 'primary',
    size: 'base',
    mode: 'button',
    fullWidth: false,
    rounded: false,
    underline: false,
    loading: false,
    iconOnly: false,
    as: 'button',
    disabled: false,
  },
});

export interface ButtonContextValue {
  loading: boolean;
  disabled: boolean;
  size: NonNullable<ButtonProps['size']>;
  variant: NonNullable<ButtonProps['variant']>;
  type: NonNullable<ButtonProps['type']>;
  mode: NonNullable<ButtonProps['mode']>;
  classNames: ButtonProps['classNames'];
  slotProps: ButtonProps['slotProps'];
}

export const [ButtonProvider, useButtonContext] = createSafeContext<ButtonContextValue>('Button');
