import { useCallback, useEffect, useMemo, useRef, useState, type ElementType } from 'react';
import { InputField as SparInputField, useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { resolveLabels } from '../../utils';
import { Popover } from '../popover';

import { BLACK, formatColor, keepHue, parseColor, type Hsva } from './color';
import { ColorPickerBase } from './base';
import { ColorPickerContent } from './ColorPickerContent';
import { ColorPickerInput } from './ColorPickerInput';
import { ColorPickerProvider, type ColorPickerContextValue } from './context';
import { DEFAULT_FORMAT, DEFAULT_LABELS, DEFAULT_ORIENTATION, DEFAULT_SIZE, DEFAULT_SWATCHES } from './defaults';
import type { ColorPickerFormat, ColorPickerOwnProps, ColorPickerProps } from './types';

type ColorPickerResolvedProps = Omit<ColorPickerOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: React.Ref<Element>;
};

const withAlpha = (hsva: Hsva, alpha: boolean): Hsva => (alpha ? hsva : { ...hsva, a: 1 });

export const ColorPicker = <T extends ElementType = 'div'>(props: ColorPickerProps<T>) => {
  const theme = useComponentTheme('ColorPicker');
  // Read once here: the trigger field adopts the Field's label and ids, while
  // the panel's own controls sit behind `FieldReset` and get only the state.
  const field = useOptionalFieldContext();

  const { rootAttrs, rest } = composeRootAttrs(ColorPickerBase, props as ColorPickerProps<'div'>, theme, {
    stateAttrs: merged => {
      const { orientation = DEFAULT_ORIENTATION, disabled, readOnly, invalid } = merged as ColorPickerResolvedProps;
      return {
        'data-layout': orientation,
        'data-disabled': (disabled ?? field?.disabled) ? '' : undefined,
        'data-readonly': (readOnly ?? field?.readOnly) ? '' : undefined,
        'data-invalid': (invalid ?? field?.invalid) ? '' : undefined,
      };
    },
  });

  const {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onValueChangeEnd,
    format: formatProp,
    defaultFormat = DEFAULT_FORMAT,
    onFormatChange,
    alpha = true,
    swatches = DEFAULT_SWATCHES,
    orientation = DEFAULT_ORIENTATION,
    size = DEFAULT_SIZE,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled: ownDisabled,
    readOnly: ownReadOnly,
    invalid: ownInvalid,
    required: ownRequired,
    name,
    form,
    placeholder,
    labels: labelOverrides,
    as,
    children,
    ref,
    ...nativeProps
  } = rest as ColorPickerResolvedProps;

  const disabled = ownDisabled ?? field?.disabled ?? false;
  const readOnly = ownReadOnly ?? field?.readOnly ?? false;
  const invalid = ownInvalid ?? field?.invalid ?? false;
  const required = ownRequired ?? field?.required ?? false;

  const labels = useMemo(() => resolveLabels(DEFAULT_LABELS, theme?.defaultProps?.labels, labelOverrides), [theme?.defaultProps?.labels, labelOverrides]);

  const [value = '', setValue] = useControllableState<string>(valueProp, defaultValue, onValueChange);
  const [format = DEFAULT_FORMAT, setFormatState] = useControllableState<ColorPickerFormat>(formatProp, defaultFormat, onFormatChange);

  // The HSVA model behind the string. It is re-derived only when the value
  // changes from outside (a controlled parent, a declined commit), and then it
  // keeps the previous hue where the new color has none.
  const [hsvaState, setHsvaState] = useState<Hsva>(() => withAlpha(parseColor(value) ?? BLACK, alpha));
  const [syncedValue, setSyncedValue] = useState(value);
  let hsva = hsvaState;
  if (value !== syncedValue) {
    const parsed = parseColor(value);
    hsva = parsed ? withAlpha(keepHue(parsed, hsvaState), alpha) : hsvaState;
    setSyncedValue(value);
    setHsvaState(hsva);
  } else if (!alpha && hsva.a !== 1) {
    hsva = { ...hsva, a: 1 };
  }

  // Handlers read the live state through refs so a drag's listeners and the
  // field callbacks never act on the render they were created in.
  const live = useRef({ hsva, value, format, alpha });
  live.current = { hsva, value, format, alpha };

  // The value when the current gesture started; `settle` compares against it.
  const gestureStartRef = useRef<string | null>(null);

  const emitEnd = useCallback((next: string) => onValueChangeEnd?.(next), [onValueChangeEnd]);

  const commitValue = useCallback(
    (next: Hsva, nextFormat: ColorPickerFormat) => {
      const normalized = withAlpha(next, live.current.alpha);
      const serialized = formatColor(normalized, nextFormat);
      setHsvaState(normalized);
      setSyncedValue(serialized);
      live.current = { ...live.current, hsva: normalized };
      if (serialized !== live.current.value) {
        live.current.value = serialized;
        setValue(serialized);
      }
      return serialized;
    },
    [setValue],
  );

  const update = useCallback(
    (next: Hsva, end = false) => {
      if (disabled || readOnly) return;
      const before = live.current.value;
      const serialized = commitValue(next, live.current.format);
      if (end) {
        if (serialized !== before) emitEnd(serialized);
      } else if (gestureStartRef.current === null) {
        gestureStartRef.current = before;
      }
    },
    [disabled, readOnly, commitValue, emitEnd],
  );

  const patch = useCallback((partial: Partial<Hsva>, end = false) => update({ ...live.current.hsva, ...partial }, end), [update]);

  const settle = useCallback(() => {
    const start = gestureStartRef.current;
    gestureStartRef.current = null;
    if (start !== null && start !== live.current.value) emitEnd(live.current.value);
  }, [emitEnd]);

  const commitText = useCallback(
    (text: string) => {
      const parsed = parseColor(text);
      if (!parsed) return false;
      update(keepHue(parsed, live.current.hsva), true);
      return true;
    },
    [update],
  );

  // The select only requests a format; a controlled parent may decline it.
  const setFormat = useCallback(
    (next: ColorPickerFormat) => {
      if (next !== live.current.format) setFormatState(next);
    },
    [setFormatState],
  );

  // Re-serialize once the format has actually changed (uncontrolled, or a
  // controlled parent that accepted it). An empty value stays empty: switching
  // notation must not invent a color.
  const formattedRef = useRef(format);
  useEffect(() => {
    if (formattedRef.current === format) return;
    formattedRef.current = format;
    if (live.current.value === '') return;
    const before = live.current.value;
    const serialized = commitValue(live.current.hsva, format);
    if (serialized !== before) emitEnd(serialized);
  }, [format, commitValue, emitEnd]);

  const [openState = false, setOpenState] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
  // A disabled or read-only picker never shows its panel, whatever `open` says.
  const open = openState && !disabled && !readOnly;
  // The value the panel opened with; Escape restores it (Core's cancel).
  const openedWithRef = useRef<string | null>(null);
  const keepFieldFocusRef = useRef(false);
  const inputRootRef = useRef<HTMLElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && (disabled || readOnly)) return;
      if (next) openedWithRef.current = live.current.value;
      setOpenState(next);
    },
    [disabled, readOnly, setOpenState],
  );

  const restoreOpenedValue = useCallback(() => {
    const opened = openedWithRef.current;
    openedWithRef.current = null;
    if (opened === null || opened === live.current.value) return;
    const parsed = parseColor(opened);
    setHsvaState(current => (parsed ? withAlpha(keepHue(parsed, current), live.current.alpha) : current));
    setSyncedValue(opened);
    live.current.value = opened;
    setValue(opened);
    emitEnd(opened);
  }, [setValue, emitEnd]);

  const contextValue = useMemo<ColorPickerContextValue>(
    () => ({
      hsva,
      value,
      format,
      alpha,
      swatches,
      orientation,
      size,
      disabled,
      readOnly,
      invalid,
      required,
      placeholder,
      labels,
      update,
      patch,
      settle,
      commitText,
      setFormat,
      open,
      setOpen,
      restoreOpenedValue,
      keepFieldFocusRef,
      inputRootRef,
      labelId: field?.labelId,
    }),
    [
      hsva,
      value,
      format,
      alpha,
      swatches,
      orientation,
      size,
      disabled,
      readOnly,
      invalid,
      required,
      placeholder,
      labels,
      update,
      patch,
      settle,
      commitText,
      setFormat,
      open,
      setOpen,
      restoreOpenedValue,
      field?.labelId,
    ],
  );

  const Component = (as ?? 'div') as ElementType;

  return (
    <ColorPickerProvider value={contextValue}>
      {/* `data-format` is resolved state rather than a prop, so it is set here
          instead of through `stateAttrs`, which only sees the merged props. */}
      <Component {...nativeProps} {...rootAttrs} data-format={format} ref={ref}>
        <Popover open={open} onOpenChange={setOpen} disabled={disabled || readOnly}>
          {children ?? (
            <>
              <ColorPickerInput />
              <ColorPickerContent />
            </>
          )}
        </Popover>
        {/* One hidden input carries the committed value; typed text that was
              never committed is not submitted. A disabled picker submits
              nothing, like a disabled native control. */}
        {name && !disabled && <SparInputField type="hidden" name={name} value={value} form={form} />}
      </Component>
    </ColorPickerProvider>
  );
};

ColorPicker.displayName = 'ColorPicker';
