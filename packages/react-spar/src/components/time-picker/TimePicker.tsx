import { useCallback, useEffect, useState, type ElementType, type ReactNode, type Ref } from 'react';
import { InputField as SparInputField, useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { isDevelopment } from '../../utils';

import { TimePickerBase } from './base';
import { TimePickerProvider } from './context';
import {
  DEFAULT_HOUR_STEP,
  DEFAULT_LABELS,
  DEFAULT_MERIDIEM,
  DEFAULT_MINUTE_STEP,
  DEFAULT_MODE,
  DEFAULT_SECOND_STEP,
  DEFAULT_SIZE,
  DEFAULT_TIME_FORMAT,
  DEFAULT_TYPE,
} from './defaults';
import { clampToBounds, resolveStep, startOfDay, toFormValue, toTimeBounds, toTimeParts, withTimeParts, withUnitValue, type TimeParts } from './helpers';
import type { TimePickerFormat, TimePickerMode, TimePickerOwnProps, TimePickerProps, TimePickerSlot, TimePickerUnit } from './types';

// Dev-only, deduped by a module-level flag so a panel that re-renders does not
// flood the console. Reset between test cases through the export below.
let warnedMissingMeridiem = false;

/** Test-only: the dedup flag is module-level, so one case would otherwise silence the next. */
export const resetTimePickerDevWarnings = (): void => {
  warnedMissingMeridiem = false;
};

type TimePickerResolvedProps = TimePickerOwnProps & {
  'as'?: ElementType;
  'ref'?: Ref<Element>;
  'children'?: ReactNode;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
};

/**
 * The units a body renders, coarsest-to-finest in reading order.
 *
 * Seconds are `columns`-only: the dial has two fields by design and no third
 * hand, so a seconds column there would have nothing to drive it.
 */
const resolveUnits = (mode: TimePickerMode, timeFormat: TimePickerFormat, showSeconds: boolean): TimePickerUnit[] => {
  const units: TimePickerUnit[] = ['hour', 'minute'];
  if (mode === 'columns' && showSeconds) units.push('second');
  if (timeFormat === '12') units.push('meridiem');
  return units;
};

export const TimePicker = <T extends ElementType = 'div'>(props: TimePickerProps<T>) => {
  const theme = useComponentTheme('TimePicker');
  // Composing inside a Field wires the accessible name and the shared control
  // state for free: direct props still win over the inherited values.
  const field = useOptionalFieldContext();

  const { rootAttrs, rest } = composeRootAttrs<TimePickerProps, TimePickerSlot>(TimePickerBase, props as TimePickerProps<'div'>, theme, {
    stateAttrs: merged => {
      const {
        mode = DEFAULT_MODE,
        type = DEFAULT_TYPE,
        size = DEFAULT_SIZE,
        timeFormat = DEFAULT_TIME_FORMAT,
        compact,
        disabled,
        readOnly,
        invalid,
        required,
      } = merged as TimePickerResolvedProps;
      return {
        'data-mode': mode,
        'data-type': type,
        'data-size': size,
        'data-compact': compact ? '' : undefined,
        'data-time-format': timeFormat,
        'data-disabled': (disabled ?? field?.disabled) ? '' : undefined,
        'data-readonly': (readOnly ?? field?.readOnly) ? '' : undefined,
        'data-invalid': (invalid ?? field?.invalid) ? '' : undefined,
        'data-required': (required ?? field?.required) ? '' : undefined,
      };
    },
  });

  const {
    mode = DEFAULT_MODE,
    // Consumed as the `data-type` / `data-size` root hooks above; pulled out so
    // they never land on the <div> as unknown attributes.
    type: _type,
    size: _size,
    value,
    defaultValue,
    onValueChange,
    referenceDate,
    timeFormat = DEFAULT_TIME_FORMAT,
    meridiem = DEFAULT_MERIDIEM,
    hourStep,
    minuteStep,
    secondStep,
    showSeconds = false,
    // Consumed as the `data-compact` root hook above, and mirrored onto the
    // body through context; pulled out so it never lands on the <div>.
    compact = false,
    minTime,
    maxTime,
    isTimeUnavailable,
    name,
    form,
    labels: ownLabels,
    disabled: ownDisabled,
    readOnly: ownReadOnly,
    invalid: ownInvalid,
    required: ownRequired,
    as,
    children,
    ref,
    ...nativeProps
  } = rest as TimePickerResolvedProps;

  const disabled = ownDisabled ?? field?.disabled ?? false;
  const readOnly = ownReadOnly ?? field?.readOnly ?? false;
  const invalid = ownInvalid ?? field?.invalid ?? false;
  const required = ownRequired ?? field?.required ?? false;

  // Controlled-ness is decided by whether `value` was **passed**, not by
  // whether it currently holds a time. A picker's controlled value is
  // `undefined` until something is picked, so reading the value would latch the
  // very common `value={time}` / `const [time, setTime] = useState<Date>()`
  // call site as uncontrolled and then silently ignore the parent — a preset
  // button, a reset, or a saved value arriving late would never reach the
  // panel. That is also why `useControllableState` is not used here: it latches
  // on the first render's value by design, which suits a non-nullable value and
  // not this one.
  //
  // Asked of `props`, not of `rest`: `resolveProps` merges the theme's
  // `defaultProps` into `rest`, and a provider-level default is a *fallback* —
  // a theme that sets `value` must not put every instance into controlled mode
  // with no handler to advance it. It still seeds the uncontrolled state, which
  // is what a fallback means here.
  const isControlled = 'value' in props;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | undefined>(isControlled ? undefined : (value ?? defaultValue));
  const selected = isControlled ? value : uncontrolledValue;

  // Resolved once per instance: "today" read every render would move the
  // emitted day under a panel left open across midnight, and re-run the clamp
  // below on a value that never changed.
  const [fallbackDay] = useState(() => startOfDay(new Date()));
  const day = referenceDate ?? fallbackDay;

  const steps = {
    hour: resolveStep(hourStep, DEFAULT_HOUR_STEP),
    minute: resolveStep(minuteStep, DEFAULT_MINUTE_STEP),
    second: resolveStep(secondStep, DEFAULT_SECOND_STEP),
  };
  const bounds = toTimeBounds(minTime, maxTime);
  const units = resolveUnits(mode, timeFormat, showSeconds);

  // While nothing is picked the body still has to show something, and showing a
  // time the bounds forbid would offer a value no column would let the user
  // reach. The reference day's midnight is pulled up to `minTime` instead.
  const parts = selected ? toTimeParts(selected) : clampToBounds(toTimeParts(day), bounds);

  // The body reasons in `TimeParts`; the consumer is handed the `Date` it would
  // commit, so the internal shape never becomes part of the public contract.
  const isUnavailable = isTimeUnavailable && ((candidate: TimeParts, unit: TimePickerUnit) => isTimeUnavailable(withTimeParts(selected ?? day, candidate), unit));

  const setUnitValue = (unit: TimePickerUnit, unitValue: number) => {
    if (disabled || readOnly) return;

    // Clamped after the write, not before: picking the hour 10 under a 10:15
    // ceiling is a legal move that pulls the minutes down with it. Without this
    // the coarse unit would offer a value that commits an out-of-bounds time.
    const next = clampToBounds(withUnitValue(parts, unit, timeFormat, unitValue), bounds);
    const committed = withTimeParts(selected ?? day, next);

    if (!isControlled) setUncontrolledValue(committed);
    onValueChange?.(committed);
  };

  const [activeUnit, setActiveUnit] = useState<'hour' | 'minute'>('hour');

  // `meridiem="toggle"` takes AM/PM out of the row of columns and hands it to a
  // composed `TimePicker.Meridiem`. Nothing renders differently based on this —
  // the prop already decided the layout — so the count exists only to say
  // something when the half-day ends up with no control at all.
  const [meridiemCount, setMeridiemCount] = useState(0);
  const registerMeridiem = useCallback((present: boolean) => setMeridiemCount(count => count + (present ? 1 : -1)), []);
  const meridiemMissing = timeFormat === '12' && meridiem === 'toggle' && meridiemCount === 0;

  useEffect(() => {
    if (!isDevelopment() || !meridiemMissing || warnedMissingMeridiem) return;
    warnedMissingMeridiem = true;
    // eslint-disable-next-line no-console
    console.warn('[TimePicker] `meridiem="toggle"` moves AM/PM out of the columns, but no `<TimePicker.Meridiem />` is composed — the half-day cannot be changed.');
  }, [meridiemMissing]);

  const Component = (as ?? 'div') as ElementType;
  const describedBy = invalid ? field?.errorId : field?.descriptionId;

  return (
    <TimePickerProvider
      value={{
        parts,
        hasValue: selected !== undefined,
        mode,
        compact,
        timeFormat,
        meridiem,
        registerMeridiem,
        steps,
        bounds,
        isUnavailable,
        labels: { ...DEFAULT_LABELS, ...ownLabels },
        units,
        disabled,
        readOnly,
        invalid,
        required,
        setUnitValue,
        activeUnit,
        setActiveUnit,
        describedBy,
      }}
    >
      <Component
        role="group"
        {...nativeProps}
        aria-labelledby={nativeProps['aria-labelledby'] ?? field?.labelId}
        aria-describedby={nativeProps['aria-describedby'] ?? describedBy}
        ref={ref}
        {...rootAttrs}
        data-empty={selected === undefined ? '' : undefined}
      >
        {children}
        {/* Submitted as `HH:mm` / `HH:mm:ss`, the shape a native
            `<input type="time">` posts. Routed through Spar's field rather than
            a bare <input> so every value this library submits goes through the
            same primitive. Empty until something is picked, so a `required`
            form field stays unsatisfied rather than silently posting midnight. */}
        {name ? <SparInputField type="hidden" name={name} form={form} value={selected ? toFormValue(parts, showSeconds) : ''} readOnly /> : null}
      </Component>
    </TimePickerProvider>
  );
};

TimePicker.displayName = 'TimePicker';
