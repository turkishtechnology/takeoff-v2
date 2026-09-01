import { useEffect, type ElementType } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimePickerMeridiemBase } from './base';
import { useTimePickerContext } from './context';
import { isUnitValueEnabled, unitValue, unitValues } from './helpers';
import type { TimePickerMeridiemProps, TimePickerMeridiemSlot } from './types';

/** Any arrow means "the other one" when there are exactly two options. */
const ARROW_KEYS = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

export const TimePickerMeridiem = <T extends ElementType = 'div'>(props: TimePickerMeridiemProps<T>) => {
  const theme = useComponentTheme('TimePickerMeridiem');
  const { parts, timeFormat, meridiem, steps, bounds, units, labels, disabled, readOnly, isUnavailable, setUnitValue, registerMeridiem } = useTimePickerContext();

  // Reported so the root can say something when `meridiem="toggle"` leaves the
  // half-day with no control at all. The registration drives nothing that
  // renders — the prop already decided that — so it costs no layout pass.
  useEffect(() => {
    registerMeridiem(true);
    return () => registerMeridiem(false);
  }, [registerMeridiem]);

  const { rootAttrs, rest } = composeRootAttrs<TimePickerMeridiemProps, TimePickerMeridiemSlot>(TimePickerMeridiemBase, props as TimePickerMeridiemProps<'div'>, theme);

  const { as, children, ref, ...meridiemProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  // A 24-hour clock has no half-day, and `meridiem="column"` already gave it
  // one in the row of units — either way there is nothing for this part to draw.
  if (timeFormat !== '12' || meridiem !== 'toggle') return null;

  const current = unitValue(parts, 'meridiem', timeFormat);
  const values = unitValues('meridiem', timeFormat, steps, current);
  const isEnabled = (value: number) => isUnitValueEnabled('meridiem', value, parts, timeFormat, steps, bounds, units, isUnavailable);

  const optionAttrs = buildSlotAttrs(TimePickerMeridiemBase.getSlotProps('option'), 'option', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const select = (value: number) => {
    if (disabled || readOnly || !isEnabled(value)) return;
    setUnitValue('meridiem', value);
  };

  return (
    <Component
      {...meridiemProps}
      ref={ref}
      {...rootAttrs}
      // A radiogroup, not a pair of spinbuttons: two mutually exclusive choices
      // are what `role="radio"` describes, and it keeps the control to one tab
      // stop with the arrows moving inside it — the APG radio pattern, which is
      // what the shape already looks like.
      role="radiogroup"
      aria-label={labels.meridiem}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
    >
      {values.map(value => {
        const checked = value === current;

        return (
          <button
            key={value}
            type="button"
            {...optionAttrs}
            role="radio"
            aria-checked={checked}
            // Roving: the group is one tab stop, and it lands on the chosen half.
            tabIndex={disabled || !checked ? -1 : 0}
            // `readOnly` is not `disabled`: the group still announces its value
            // and still takes the tab stop, it just refuses to change — the same
            // call the columns body makes for its spinbuttons. Disabling both
            // radios here would leave the group with no focusable element at all,
            // since the roving tab stop lives on one of them.
            disabled={disabled || !isEnabled(value)}
            data-selected={checked ? '' : undefined}
            onClick={() => select(value)}
            onKeyDown={event => {
              if (!ARROW_KEYS.includes(event.key)) return;
              event.preventDefault();
              if (readOnly) return;

              const next = values.find(candidate => candidate !== current);
              if (next === undefined) return;
              // Selecting on arrow is the radio pattern's own behaviour.
              select(next);

              // The tab stop roves to whichever radio is checked, so focus has
              // to rove with it — otherwise the group's one tab stop sits on an
              // element nobody is on.
              const radios = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]');
              radios?.[values.indexOf(next)]?.focus();
            }}
          >
            {value === 1 ? labels.pm : labels.am}
          </button>
        );
      })}
      {children}
    </Component>
  );
};

TimePickerMeridiem.displayName = 'TimePicker.Meridiem';
