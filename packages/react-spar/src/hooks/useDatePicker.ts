import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import type { MaskDateOptions } from '@turkish-technology/spar';

/**
 * The text/`Date` bridge a date picker needs, without a DatePicker component.
 *
 * A date picker is `Popover` + `Calendar` composed by the consumer (see
 * `docs/datepicker-contract.md`). That decision stands: this hook owns no anatomy,
 * renders nothing, and every element stays the consumer's to place. What it
 * removes is the one part of the composition that was neither short nor
 * situational — keeping a typed string and a `Date` in step, in both
 * directions, plus the mask bounds that have to agree with the grid's.
 *
 * It qualifies under the no-adapter-hook rule on the same grounds as
 * `useControllableState`: real React state, and no Spar behaviour hidden behind
 * it. It maps nothing — `Input.Field` and `Calendar` keep their own contracts,
 * and the props below are ordinary values a caller may spread, override, or
 * ignore one at a time.
 *
 * The displayed month is deliberately absent: `Calendar` follows a value set
 * from outside the grid on its own, so a third piece of state would be a second
 * writer to a month the grid already moves.
 */

/** How a `Date` is rendered into the field. */
export type DateFormatter = (value: Date) => string;

export interface UseDatePickerOptions {
  /** Earliest selectable date, inclusive. Bounds the grid *and* the mask. */
  min?: Date;
  /** Latest selectable date, inclusive. Bounds the grid *and* the mask. */
  max?: Date;
  /** Initial value, uncontrolled. */
  defaultValue?: Date;
  /**
   * Separator between the day, month and year blocks. Also the one the mask
   * inserts as you type.
   * @defaultValue '/'
   */
  delimiter?: string;
  /**
   * Renders the picked date into the field. The default is
   * `dd<delimiter>mm<delimiter>yyyy`, which is what the mask accepts back.
   */
  format?: DateFormatter;
  /** Fires whenever the value changes, from either half. */
  onValueChange?: (value: Date | undefined) => void;
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** `YYYY-MM-DD` in local time — the shape `dateMin` / `dateMax` take. */
const toISODate = (value: Date): string => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

/** `meta.iso` back into a local `Date`, without a `Date` string parse. */
const fromISODate = (iso: string): Date | undefined => {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

export interface UseDatePickerResult {
  /** The picked date, or `undefined` while the field is empty or incomplete. */
  value: Date | undefined;
  /** The field's text, masked. */
  text: string;
  /** Whether the panel is open. Pair with {@link UseDatePickerResult.popoverProps}. */
  open: boolean;
  /** Set the value from anywhere — a preset button, a reset, a restored form. */
  setValue: (value: Date | undefined) => void;
  /** Open state, for `Popover`. */
  popoverProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
  /**
   * Mask, value and change handling for `Input.Field`. `onKeyDown` opens the
   * panel on `ArrowDown`, which is what makes the grid reachable from the
   * keyboard; drop it if the field is read-only.
   */
  inputProps: {
    mask: MaskDateOptions;
    value: string;
    onValueChange: (next: string, meta: { completed?: boolean; iso?: string }) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  };
  /**
   * Value and bounds for `Calendar`. Selecting a day writes the formatted date
   * back into the field and closes the panel — spread `onValueChange` yourself
   * if a mode needs to stay open (a range is not finished on the first click).
   */
  calendarProps: {
    value: Date | undefined;
    minDate: Date | undefined;
    maxDate: Date | undefined;
    onValueChange: (value: Date | undefined) => void;
  };
}

export function useDatePicker({ min, max, defaultValue, delimiter = '/', format, onValueChange }: UseDatePickerOptions = {}): UseDatePickerResult {
  const formatDate = useMemo<DateFormatter>(
    () => format ?? (value => `${pad(value.getDate())}${delimiter}${pad(value.getMonth() + 1)}${delimiter}${value.getFullYear()}`),
    [format, delimiter],
  );

  const [value, setValueState] = useState<Date | undefined>(defaultValue);
  const [text, setText] = useState(() => (defaultValue ? formatDate(defaultValue) : ''));
  const [open, setOpen] = useState(false);

  // One pair of dates feeds both halves. Given only to the grid, a date the
  // calendar rejects could still be typed.
  const mask = useMemo<MaskDateOptions>(
    () => ({
      date: true,
      delimiter,
      ...(min ? { dateMin: toISODate(min) } : {}),
      ...(max ? { dateMax: toISODate(max) } : {}),
    }),
    [delimiter, min, max],
  );

  const commit = useCallback(
    (next: Date | undefined) => {
      setValueState(next);
      setText(next ? formatDate(next) : '');
      onValueChange?.(next);
    },
    [formatDate, onValueChange],
  );

  const handleTyped = useCallback(
    (next: string, meta: { completed?: boolean; iso?: string }) => {
      setText(next);

      // An emptied field clears the value; a half-typed one holds it at
      // `undefined` without wiping what the user is still typing.
      if (next === '') {
        setValueState(undefined);
        onValueChange?.(undefined);
        return;
      }
      if (!meta.completed || !meta.iso) {
        setValueState(undefined);
        return;
      }

      const parsed = fromISODate(meta.iso);
      setValueState(parsed);
      onValueChange?.(parsed);
    },
    [onValueChange],
  );

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    setOpen(true);
  }, []);

  const handlePicked = useCallback(
    (next: Date | undefined) => {
      commit(next);
      setOpen(false);
    },
    [commit],
  );

  return {
    value,
    text,
    open,
    setValue: commit,
    popoverProps: { open, onOpenChange: setOpen },
    inputProps: { mask, value: text, onValueChange: handleTyped, onKeyDown: handleKeyDown },
    calendarProps: { value, minDate: min, maxDate: max, onValueChange: handlePicked },
  };
}
