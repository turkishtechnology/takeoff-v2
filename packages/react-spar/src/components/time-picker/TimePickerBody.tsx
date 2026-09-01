import { useRef, useState, type CSSProperties, type ElementType, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimePickerBodyBase } from './base';
import { useTimePickerContext, type TimePickerContextValue } from './context';
import { COLUMN_NEIGHBOURS, DIAL_POSITIONS, PAGE_STEP_MULTIPLIER } from './defaults';
import {
  dialAngle,
  dialHourMarks,
  dialHourRing,
  dialMinuteMarks,
  edgeUnitValue,
  isUnitValueEnabled,
  padTime,
  stepUnitValue,
  unitValue,
  unitValues,
  HOURS_PER_HALF_DAY,
  MINUTES_PER_HOUR,
} from './helpers';
import type { TimePickerBodyProps, TimePickerBodySlot, TimePickerUnit } from './types';

/** Everything a rendered unit needs, derived once and read by both bodies. */
interface UnitState {
  unit: TimePickerUnit;
  /** The displayed value — 1–12 for a 12-hour clock, `0` / `1` for the meridiem. */
  current: number;
  /** Every value the unit offers, ascending; the rendered order, top to bottom. */
  values: number[];
  isEnabled: (value: number) => boolean;
  /** Accessible name for the spinbutton, and the `clock` field's printed caption. */
  label: string;
  /** What a value reads as: two digits, or the meridiem's own words. */
  format: (value: number) => string;
}

/**
 * How long a typed digit waits for a second one. Past it the next keystroke
 * starts a new number rather than extending the last — the pause is the only
 * thing that separates "4, then 5" from "45".
 */
const TYPING_RESET_MS = 1000;

const unitState = (context: TimePickerContextValue, unit: TimePickerUnit): UnitState => {
  const { parts, timeFormat, steps, bounds, units, labels, isUnavailable } = context;
  const current = unitValue(parts, unit, timeFormat);

  return {
    unit,
    current,
    values: unitValues(unit, timeFormat, steps, current),
    isEnabled: value => isUnitValueEnabled(unit, value, parts, timeFormat, steps, bounds, units, isUnavailable),
    label: labels[unit],
    format: value => (unit === 'meridiem' ? (value === 1 ? labels.pm : labels.am) : padTime(value)),
  };
};

/**
 * A column reads top-to-bottom as ascending — 09, **10**, 11 — so the cell
 * above the selection is the previous value and the arrows follow the layout
 * rather than the APG spinbutton wording: ArrowUp selects what is drawn above,
 * which is the smaller value. The `dial` fields inherit it so the two bodies
 * key alike.
 */
const OFFSET_BY_KEY: Record<string, number> = {
  ArrowUp: -1,
  ArrowDown: 1,
  PageUp: -PAGE_STEP_MULTIPLIER,
  PageDown: PAGE_STEP_MULTIPLIER,
};

export const TimePickerBody = <T extends ElementType = 'div'>(props: TimePickerBodyProps<T>) => {
  const theme = useComponentTheme('TimePickerBody');
  const context = useTimePickerContext();
  const { mode, compact, timeFormat, meridiem, parts, units, disabled, readOnly, invalid, required, setUnitValue, activeUnit, setActiveUnit } = context;

  // A meridiem handed to `TimePicker.Meridiem` keeps its place in `units` — the
  // bounds still need it — but drops out of the row of controls it no longer
  // sits in.
  const rowUnits = meridiem === 'toggle' ? units.filter(unit => unit !== 'meridiem') : units;

  const { rootAttrs, rest } = composeRootAttrs<TimePickerBodyProps, TimePickerBodySlot>(TimePickerBodyBase, props as TimePickerBodyProps<'div'>, theme, {
    // Mirrored from the root so the two layouts can be styled from the body
    // itself — a `Popover.Content` may sit between them in the DOM.
    stateAttrs: () => ({ 'data-mode': mode, 'data-compact': compact ? '' : undefined }),
  });

  const { as, children, ref, ...bodyProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  const slot = (name: TimePickerBodySlot) =>
    buildSlotAttrs(TimePickerBodyBase.getSlotProps(name), name, {
      themeSlotProps: theme?.slotProps,
      themeClassNames: theme?.classNames,
      instanceSlotProps: props.slotProps,
      instanceClassNames: props.classNames,
    });

  // What has been typed into the unit that currently holds focus. A ref rather
  // than state: it changes on every keystroke but nothing renders from it — the
  // committed time is what the fields show.
  const typed = useRef<{ unit: TimePickerUnit; text: string; at: number } | null>(null);

  // What is showing in a masked field while it is being typed into. Unlike the
  // buffer above this one renders, so it is state: a half-typed `1` has to stay
  // on screen for the `2` that makes it noon.
  const [draft, setDraft] = useState<{ unit: TimePickerUnit; text: string } | null>(null);

  const commit = (unit: TimePickerUnit, value: number | undefined) => {
    if (value !== undefined) setUnitValue(unit, value);
  };

  const handleKeyDown = (state: UnitState, typing: boolean) => (event: KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) return;

    if (event.key === 'Home' || event.key === 'End') {
      typed.current = null;
      setDraft(null);
      commit(state.unit, edgeUnitValue(state.values, event.key === 'Home' ? 'first' : 'last', state.isEnabled));
      event.preventDefault();
      return;
    }

    // The meridiem has no digits to type, so it answers to its initials.
    if (state.unit === 'meridiem') {
      const half = { a: 0, p: 1 }[event.key.toLowerCase()];
      if (half !== undefined) {
        if (state.isEnabled(half)) commit(state.unit, half);
        event.preventDefault();
        return;
      }
    }

    // A masked field types into the input itself; only the bare spinbuttons —
    // the columns and the half-day stack — need a buffer of their own.
    if (typing && event.key >= '0' && event.key <= '9') {
      const previous = typed.current;
      const carry = previous && previous.unit === state.unit && Date.now() - previous.at < TYPING_RESET_MS ? previous.text : '';
      // Two digits at most, and a pair that overshoots the unit falls back to
      // the new digit alone: typing 9 then 9 into the minutes means 9, not 99.
      const pair = `${carry}${event.key}`.slice(-2);
      const text = Number(pair) > (state.values[state.values.length - 1] ?? 0) ? event.key : pair;
      typed.current = { unit: state.unit, text, at: Date.now() };

      // A half-typed number that names no value — `0` on a twelve-hour clock,
      // or an off-grid minute under a step — is held, not committed. The next
      // digit usually completes it.
      const value = Number(text);
      if (state.values.includes(value) && state.isEnabled(value)) commit(state.unit, value);
      event.preventDefault();
      return;
    }

    const offset = OFFSET_BY_KEY[event.key];
    if (offset === undefined) return;

    // Arrows step from the committed value, so whatever was half-typed is spent.
    typed.current = null;
    setDraft(null);

    commit(state.unit, stepUnitValue(state.values, state.current, offset, state.isEnabled));
    event.preventDefault();
  };

  /**
   * The spinbutton surface, shared by a `columns` column and a `dial` field.
   *
   * The unit is the focus stop and the whole ARIA surface; the cells, arrows and
   * dial numbers below it are pointer affordances that add no reachable state,
   * which is why they are hidden from assistive tech rather than each becoming
   * a tab stop of its own.
   */
  const spinButtonProps = (state: UnitState, typing = true) => ({
    'role': 'spinbutton',
    'tabIndex': disabled ? -1 : 0,
    'aria-label': state.label,
    'aria-valuenow': state.current,
    'aria-valuemin': state.values[0],
    'aria-valuemax': state.values[state.values.length - 1],
    'aria-valuetext': state.format(state.current),
    'aria-disabled': disabled || undefined,
    'aria-readonly': readOnly || undefined,
    'aria-invalid': invalid || undefined,
    'aria-required': required || undefined,
    'data-unit': state.unit,
    'onKeyDown': handleKeyDown(state, typing),
  });

  // Keeps the press from moving focus off the unit that owns the keyboard: the
  // affordance commits its value and the spinbutton stays where it was.
  const holdFocus = (event: MouseEvent) => event.preventDefault();

  const stepTrigger = (state: UnitState, direction: -1 | 1) => {
    const target = stepUnitValue(state.values, state.current, direction, state.isEnabled);
    const name = direction === -1 ? 'previousTrigger' : 'nextTrigger';
    const Chevron = direction === -1 ? ChevronTopIconOutlinedRounded : ChevronBottomIconOutlinedRounded;

    return (
      <button
        type="button"
        {...slot(name)}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || readOnly || target === undefined}
        onMouseDown={holdFocus}
        onClick={() => commit(state.unit, target)}
      >
        <span {...slot('chevron')}>
          <Chevron />
        </span>
      </button>
    );
  };

  const valueCell = (state: UnitState, offset: number) => {
    const index = state.values.indexOf(state.current) + offset;
    const value = index >= 0 && index < state.values.length ? state.values[index] : undefined;
    const selected = offset === 0;

    // An out-of-range neighbour still renders, blank: the cell holds the
    // column's height, so dropping it would make the selection band slide off
    // centre at either end of the list. `data-blank` rather than `data-empty` —
    // the root's `data-empty` means "nothing picked yet", a different question.
    if (value === undefined) return <div key={offset} {...slot('value')} data-blank="" />;

    const enabled = state.isEnabled(value);

    return (
      <div
        key={offset}
        {...slot('value')}
        data-selected={selected ? '' : undefined}
        data-disabled={enabled ? undefined : ''}
        onMouseDown={holdFocus}
        onClick={selected || !enabled ? undefined : () => commit(state.unit, value)}
      >
        {state.format(value)}
      </div>
    );
  };

  const column = (state: UnitState) => (
    <div key={state.unit} {...slot('column')} {...spinButtonProps(state)}>
      {stepTrigger(state, -1)}
      <div {...slot('valueGroup')} aria-hidden="true">
        {Array.from({ length: COLUMN_NEIGHBOURS * 2 + 1 }, (_, cell) => valueCell(state, cell - COLUMN_NEIGHBOURS))}
      </div>
      {stepTrigger(state, 1)}
    </div>
  );

  const separator = (unit: TimePickerUnit) => (
    <span key={`${unit}-separator`} {...slot('separator')} aria-hidden="true">
      {unit === 'meridiem' ? '-' : ':'}
    </span>
  );

  const columnsBody: ReactNode = (
    <div {...slot('columns')}>
      {/* Drawn behind the middle row of every column at once, so the band reads
            as one selection across the units rather than one box per column. */}
      <div {...slot('highlight')} aria-hidden="true" />
      {rowUnits.flatMap((unit, index) => {
        const state = unitState(context, unit);
        return index === 0 ? [column(state)] : [separator(unit), column(state)];
      })}
    </div>
  );

  /**
   * A number field: a real text input under a two-digit numeric mask, so it can
   * be typed into, selected and pasted over the way any other field on the form
   * can. The dial follows whichever one is focused; the meridiem never gets here
   * — it has no digits, and renders as the stack below.
   */
  const field = (state: UnitState) => {
    const unit = state.unit as 'hour' | 'minute';
    // The committed value, unless the field is mid-edit: a `1` on its way to
    // `12` names no hour yet, and reverting it under the caret would make the
    // second digit impossible to reach.
    const shown = draft?.unit === unit ? draft.text : state.format(state.current);

    return (
      <div key={unit} {...slot('input')} data-unit={unit} data-active={activeUnit === unit ? '' : undefined}>
        <input
          {...slot('inputValue')}
          {...spinButtonProps(state, false)}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={shown}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={event => {
            setActiveUnit(unit);
            // Typing replaces rather than appends — a two-digit field has no
            // room to append into.
            event.currentTarget.select();
          }}
          onChange={event => {
            // The mask: digits only, two of them.
            const text = event.target.value.replace(/\D/g, '').slice(0, 2);
            setDraft({ unit, text });

            const value = Number(text);
            if (text !== '' && state.values.includes(value) && state.isEnabled(value)) commit(unit, value);
          }}
          // Whatever was typed either named a value and was committed, or names
          // none and is abandoned — the field shows the time, not the attempt.
          onBlur={() => setDraft(null)}
        />
        <span {...slot('inputLabel')} aria-hidden="true">
          {state.label}
        </span>
      </div>
    );
  };

  /**
   * The meridiem inside a field group: two stacked cells rather than a third
   * number box. It has two values, not sixty — a box the size of the hour would
   * be mostly empty, and the design gives it a segmented shape instead.
   *
   * Same ARIA as any other unit: the stack is the spinbutton and one tab stop,
   * the two cells are the pointer affordance.
   */
  const meridiemStack = (state: UnitState) => (
    <div key={state.unit} {...slot('inputStack')} {...spinButtonProps(state)}>
      {state.values.map(value => (
        <button
          key={value}
          type="button"
          {...slot('inputOption')}
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || readOnly || !state.isEnabled(value)}
          data-selected={value === state.current ? '' : undefined}
          onMouseDown={holdFocus}
          onClick={() => commit(state.unit, value)}
        >
          {state.format(value)}
        </button>
      ))}
    </div>
  );

  const fieldGroup: ReactNode = (
    <div {...slot('inputGroup')}>
      {rowUnits.flatMap((unit, index) => {
        const state = unitState(context, unit);
        if (unit === 'meridiem') return [meridiemStack(state)];
        // A colon joins two numbers; the meridiem is not a third number, and the
        // design butts its stack straight against the minute.
        return index === 0 ? [field(state)] : [separator(unit), field(state)];
      })}
    </div>
  );

  /**
   * The dial edits whichever field is active, and picking an hour hands the
   * turn to the minutes — the move a user is going to make anyway, and the one
   * that keeps a single dial serving two fields without a mode switch.
   */
  const dialMarks = activeUnit === 'hour' ? dialHourMarks(timeFormat) : dialMinuteMarks();
  const activeState = unitState(context, activeUnit);

  // A full turn is twelve hours on the hour hand and sixty minutes on the
  // minute one; both point at the committed value exactly, not at the fraction
  // a running clock would show.
  const handAngle = (unit: 'hour' | 'minute') => (unit === 'hour' ? ((parts.hour % HOURS_PER_HALF_DAY) * 360) / DIAL_POSITIONS : (parts.minute * 360) / MINUTES_PER_HOUR);

  const dialBody: ReactNode = (
    <>
      {fieldGroup}
      {/* Hidden from assistive tech on purpose: every value it offers is already
          reachable from the two spinbuttons above, so exposing twelve more
          buttons would add tab stops and no capability. */}
      <div {...slot('dial')} aria-hidden="true">
        <div {...slot('dialFace')} />
        {(['hour', 'minute'] as const).map(unit => (
          <div
            key={unit}
            {...slot('dialHand')}
            data-unit={unit}
            // The hour hand stops at the ring its hour is on, so a 24-hour
            // afternoon does not point past the mark it means.
            data-ring={unit === 'hour' ? dialHourRing(parts, timeFormat) : undefined}
            style={{ '--tk-timepicker-dial-angle': `${handAngle(unit)}deg` } as CSSProperties}
          />
        ))}
        <div {...slot('dialCap')} />
        {dialMarks.map(({ value, position, ring }) => {
          const enabled = activeState.isEnabled(value);

          return (
            <button
              key={value}
              type="button"
              {...slot('dialNumber')}
              tabIndex={-1}
              disabled={disabled || readOnly || !enabled}
              data-ring={ring}
              data-selected={value === activeState.current ? '' : undefined}
              style={{ '--tk-timepicker-dial-angle': `${dialAngle(position)}deg` } as CSSProperties}
              onMouseDown={holdFocus}
              onClick={() => {
                commit(activeUnit, value);
                if (activeUnit === 'hour') setActiveUnit('minute');
              }}
            >
              {padTime(value)}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <Component {...bodyProps} ref={ref} {...rootAttrs}>
      {/* `compact` drops the spinning columns for the same number fields the
          dial pairs with — the design's compact column body. */}
      {mode === 'dial' ? dialBody : compact ? fieldGroup : columnsBody}
      {children}
    </Component>
  );
};

TimePickerBody.displayName = 'TimePicker.Body';
