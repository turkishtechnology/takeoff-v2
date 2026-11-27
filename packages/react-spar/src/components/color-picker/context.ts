import { createSafeContext } from '../../hooks';

import type { Hsva } from './color';
import type { ColorPickerFormat, ColorPickerLabels, ColorPickerOrientation, ColorPickerSize } from './types';

export interface ColorPickerContextValue {
  /** Current color. Survives greys and black with its hue intact. */
  hsva: Hsva;
  /** Committed value string (`''` when empty). */
  value: string;
  format: ColorPickerFormat;
  alpha: boolean;
  swatches: readonly string[];
  orientation: ColorPickerOrientation;
  size: ColorPickerSize;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  placeholder?: string;
  labels: ColorPickerLabels;
  /** Moves the color. `end` also reports a settled change (keyboard, swatch, field). */
  update: (next: Hsva, end?: boolean) => void;
  /** `update` over the live color with only some channels changed. */
  patch: (partial: Partial<Hsva>, end?: boolean) => void;
  /** Settles a pointer gesture: reports `onValueChangeEnd` once if the gesture moved the value. */
  settle: () => void;
  /** Parses and commits typed text; returns whether it was a color. */
  commitText: (text: string) => boolean;
  setFormat: (format: ColorPickerFormat) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Escape inside the open panel: restores the value it opened with. */
  restoreOpenedValue: () => void;
  /** Set by `ColorPicker.Input` when a click on the text opens the panel, so focus stays in the field. */
  keepFieldFocusRef: { current: boolean };
  /** `ColorPicker.Input`'s root; clicks inside it are not outside the popover. */
  inputRootRef: { current: HTMLElement | null };
  /** Surrounding `Field.Label` id, naming the panel group. */
  labelId?: string;
}

export const [ColorPickerProvider, useColorPickerContext] = createSafeContext<ColorPickerContextValue>('ColorPicker');
