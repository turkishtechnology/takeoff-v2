import type { ElementType } from 'react';
import type { Orientation, PolymorphicProps } from '../../types';
import type { ButtonProps } from '../Button/types';

/**
 * Pressed item value(s). A string in single mode (`''` when nothing is
 * pressed), an array when `multiple` is set.
 */
export type ToggleGroupValue = string | string[];

/**
 * Own props for the ToggleGroup root.
 */
export interface ToggleGroupOwnProps {
  /**
   * When `true`, any number of items can be pressed at once.
   * @defaultValue false
   */
  multiple?: boolean;

  /**
   * Controlled pressed value(s). Match the `value` of the pressed items.
   */
  value?: ToggleGroupValue;

  /**
   * Uncontrolled initial pressed value(s). Used only on mount.
   */
  defaultValue?: ToggleGroupValue;

  /**
   * Fired when the pressed value changes. The payload keeps the canonical
   * shape: a string in single mode (`''` once the pressed item is released),
   * an array in multiple mode.
   */
  onValueChange?: (value: ToggleGroupValue) => void;

  /**
   * In single mode, whether pressing the pressed item releases it. When
   * `false`, once an item is pressed one item always stays pressed. Ignored
   * when `multiple` is set.
   * @defaultValue true
   */
  deselectable?: boolean;

  /**
   * Disables every item in the group.
   * @defaultValue false
   */
  disabled?: boolean;

  /**
   * Axis of the arrow-key navigation: Left/Right when horizontal, Up/Down
   * when vertical.
   * @defaultValue 'horizontal'
   */
  orientation?: Orientation;
}

/**
 * Props for the ToggleGroup root (renders `role="group"`). Name it with
 * `aria-label` or `aria-labelledby`.
 */
export type ToggleGroupProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ToggleGroupOwnProps>;

/**
 * Own props for a ToggleGroup item.
 */
export interface ToggleGroupItemOwnProps {
  /**
   * The value this item contributes to the group's value when pressed.
   */
  value: string;

  /**
   * Disables this item. Keyboard navigation skips it.
   * @defaultValue false
   */
  disabled?: boolean;
}

/**
 * Props for a ToggleGroup item. Renders a Spar `Button` toggle
 * (`aria-pressed`); its pressed state is owned by the group, so the Button's
 * own `isPressed` / `defaultPressed` / `onPressedChange` are not accepted.
 */
export type ToggleGroupItemProps<T extends ElementType = 'button'> = Omit<ButtonProps<T>, keyof ToggleGroupItemOwnProps | 'isPressed' | 'defaultPressed' | 'onPressedChange'> &
  ToggleGroupItemOwnProps;

/**
 * Context shared between the ToggleGroup root and its items.
 */
export interface ToggleGroupContextValue {
  /** Pressed values, always as an array. */
  pressedValues: string[];
  /** Press or release an item. */
  toggle: (value: string) => void;
  /** Whether the whole group is disabled. */
  disabled: boolean;
  /** Navigation axis. */
  orientation: Orientation;
  /** The one item that is in the tab order. */
  tabStopValue: string | null;
  /** Record which item holds focus. */
  setFocusedValue: (value: string | null) => void;
  /** Register an enabled item (disabled items unregister). */
  registerItem: (value: string, element: HTMLElement, disabled: boolean) => void;
  /** Remove an item. */
  unregisterItem: (value: string) => void;
}
