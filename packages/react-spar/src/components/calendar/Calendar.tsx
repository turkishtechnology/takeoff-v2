import { useMemo, useRef, useState, type ComponentType, type HTMLAttributes, type Ref, type RefObject } from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';
import {
  Animation as DayPickerAnimation,
  CaptionLabel as DayPickerCaptionLabel,
  DayFlag as DayPickerDayFlag,
  DayPicker,
  Day as DayPickerDay,
  DayButton as DayPickerDayButton,
  Dropdown as DayPickerDropdown,
  DropdownNav as DayPickerDropdownNav,
  Footer as DayPickerFooter,
  Month as DayPickerMonth,
  MonthCaption as DayPickerMonthCaption,
  MonthGrid as DayPickerMonthGrid,
  Months as DayPickerMonths,
  Nav as DayPickerNav,
  NextMonthButton as DayPickerNextMonthButton,
  PreviousMonthButton as DayPickerPreviousMonthButton,
  SelectionState as DayPickerSelectionState,
  UI as DayPickerUI,
  Week as DayPickerWeek,
  Weekday as DayPickerWeekday,
  Weekdays as DayPickerWeekdays,
  WeekNumber as DayPickerWeekNumber,
  WeekNumberHeader as DayPickerWeekNumberHeader,
  Weeks as DayPickerWeeks,
  type ChevronProps as DayPickerChevronProps,
  type ClassNames as DayPickerClassNames,
  type CustomComponents as DayPickerCustomComponents,
  type DayPickerProps,
  type RootProps as DayPickerRootProps,
} from 'react-day-picker';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CalendarBase, calendarRangeClassNames } from './base';
import { DEFAULT_MODE, DEFAULT_SIZE } from './defaults';
import { assignRef, buildDisabledMatchers } from './helpers';
import type { CalendarMode, CalendarProps, CalendarSize, CalendarSlot, CalendarValue } from './types';

/**
 * The wrapper's flattened view of the discriminated {@link CalendarProps} union.
 * Composition (`composeRootAttrs`, the slot loop) and the engine handoff both
 * work on one shape; the union exists to type the *call site*, where `mode`
 * narrows `value` / `onValueChange`.
 */
type CalendarFlatProps = Omit<CalendarProps, 'mode' | 'value' | 'defaultValue' | 'onValueChange'> & {
  mode?: CalendarMode;
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onValueChange?: (value: CalendarValue) => void;
  min?: number;
  max?: number;
  excludeDisabled?: boolean;
};

type SlotAttrs = Record<string, unknown>;
type SlotAttrsMap = Record<CalendarSlot, SlotAttrs>;

/** Slot key → the engine's `classNames` / `components` key. */
const SLOT_TO_UI = {
  root: DayPickerUI.Root,
  months: DayPickerUI.Months,
  month: DayPickerUI.Month,
  nav: DayPickerUI.Nav,
  previousMonthButton: DayPickerUI.PreviousMonthButton,
  nextMonthButton: DayPickerUI.NextMonthButton,
  chevron: DayPickerUI.Chevron,
  monthCaption: DayPickerUI.MonthCaption,
  captionLabel: DayPickerUI.CaptionLabel,
  dropdowns: DayPickerUI.Dropdowns,
  dropdownRoot: DayPickerUI.DropdownRoot,
  dropdown: DayPickerUI.Dropdown,
  monthGrid: DayPickerUI.MonthGrid,
  weekdays: DayPickerUI.Weekdays,
  weekday: DayPickerUI.Weekday,
  weeks: DayPickerUI.Weeks,
  week: DayPickerUI.Week,
  weekNumber: DayPickerUI.WeekNumber,
  weekNumberHeader: DayPickerUI.WeekNumberHeader,
  day: DayPickerUI.Day,
  dayButton: DayPickerUI.DayButton,
  footer: DayPickerUI.Footer,
} as const satisfies Record<CalendarSlot, string>;

/**
 * Every engine class-name key blanked. The engine merges its defaults per key
 * (`{ ...getDefaultClassNames(), ...props.classNames }`), so starting from a
 * full reset is what guarantees **no `rdp-*` class reaches the DOM** — including
 * keys a future engine release adds. The wrapper's own `tk-*` classes are
 * layered on top of this.
 */
const ENGINE_CLASSNAME_RESET = Object.fromEntries(
  [...Object.values(DayPickerUI), ...Object.values(DayPickerDayFlag), ...Object.values(DayPickerSelectionState), ...Object.values(DayPickerAnimation)].map(key => [key, '']),
) as DayPickerClassNames;

/**
 * Consumer `slotProps` sit **underneath** the engine's own wiring, so a stray
 * `onClick` in `slotProps.dayButton` can never replace the handler that makes
 * selection work — the same precedence `buildSlotAttrs` applies for canonical
 * attrs. Engine entries that are `undefined` are skipped rather than assigned,
 * so an unset engine prop does not blank a value the consumer did set.
 */
const mergeSlotAttrs = (slotAttrs: SlotAttrs, engineProps: Record<string, unknown>): Record<string, unknown> => {
  const merged: Record<string, unknown> = { ...slotAttrs };
  for (const key in engineProps) {
    const value = engineProps[key];
    if (value !== undefined) merged[key] = value;
  }
  return merged;
};

/**
 * Builds the engine's `components` override map.
 *
 * This map is the **only** way to reach the engine's internal nodes, and it is
 * what lets Calendar honour the package's anatomy contract: each override adds
 * the node's `data-slot` anchor and its `slotProps`, then defers to the engine's
 * own part so no behavior (focus effects, nav wiring, `aria-hidden` chrome) is
 * re-implemented here.
 *
 * The identities must be **stable**: the engine passes `components.Day` &co. as
 * element types, so a fresh function per render would make React unmount and
 * remount the whole grid on every keystroke. That is why the live attrs and the
 * consumer ref are read through refs instead of being closed over.
 */
const createEngineComponents = (attrsRef: RefObject<SlotAttrsMap>, refRef: RefObject<Ref<HTMLDivElement> | undefined>): Partial<DayPickerCustomComponents> => {
  const withSlot = <P extends object>(Component: ComponentType<P>, slot: CalendarSlot) => {
    const Slotted = (props: P) => <Component {...(mergeSlotAttrs(attrsRef.current[slot], props as Record<string, unknown>) as P)} />;
    Slotted.displayName = `Calendar.${slot}`;
    return Slotted;
  };

  // The root is hand-written rather than wrapped: the engine's `Root` forwards a
  // fixed prop allow-list and no ref of its own, so this is where the public
  // `ref` gets a DOM node. `rootRef` (the engine's animation ref) is served from
  // the same node.
  const Root = ({ rootRef, ...engineProps }: DayPickerRootProps) => (
    <div
      {...(mergeSlotAttrs(attrsRef.current.root, engineProps as Record<string, unknown>) as HTMLAttributes<HTMLDivElement>)}
      ref={node => {
        assignRef(refRef.current, node);
        assignRef(rootRef, node);
      }}
    />
  );
  Root.displayName = 'Calendar.root';

  // Bypass (exemption): the engine's Chevron draws its own inline polygons, which
  // is icon rendering — a takeoff-spar responsibility. Every other part defers
  // upstream; this one is replaced so the glyph comes from `@takeoff-icons`.
  const Chevron = ({ orientation = 'left', size, ...engineProps }: DayPickerChevronProps) => {
    const Icon =
      orientation === 'left'
        ? ChevronLeftIconOutlinedRounded
        : orientation === 'right'
          ? ChevronRightIconOutlinedRounded
          : orientation === 'up'
            ? ChevronTopIconOutlinedRounded
            : ChevronBottomIconOutlinedRounded;

    const { disabled: _disabled, ...svgProps } = engineProps;

    return <Icon aria-hidden="true" {...mergeSlotAttrs(attrsRef.current.chevron, { ...svgProps, width: size, height: size })} />;
  };
  Chevron.displayName = 'Calendar.chevron';

  return {
    Root,
    Chevron,
    Months: withSlot(DayPickerMonths, 'months'),
    Month: withSlot(DayPickerMonth, 'month'),
    Nav: withSlot(DayPickerNav, 'nav'),
    PreviousMonthButton: withSlot(DayPickerPreviousMonthButton, 'previousMonthButton'),
    NextMonthButton: withSlot(DayPickerNextMonthButton, 'nextMonthButton'),
    MonthCaption: withSlot(DayPickerMonthCaption, 'monthCaption'),
    CaptionLabel: withSlot(DayPickerCaptionLabel, 'captionLabel'),
    DropdownNav: withSlot(DayPickerDropdownNav, 'dropdowns'),
    // The engine hands these props to its own `<select>`, so `dropdown` is the
    // select's anchor. Its wrapping span (`dropdownRoot`) is class-only — see
    // `base.ts`.
    Dropdown: withSlot(DayPickerDropdown, 'dropdown'),
    MonthGrid: withSlot(DayPickerMonthGrid, 'monthGrid'),
    Weekdays: withSlot(DayPickerWeekdays, 'weekdays'),
    Weekday: withSlot(DayPickerWeekday, 'weekday'),
    Weeks: withSlot(DayPickerWeeks, 'weeks'),
    Week: withSlot(DayPickerWeek, 'week'),
    WeekNumber: withSlot(DayPickerWeekNumber, 'weekNumber'),
    WeekNumberHeader: withSlot(DayPickerWeekNumberHeader, 'weekNumberHeader'),
    Day: withSlot(DayPickerDay, 'day'),
    DayButton: withSlot(DayPickerDayButton, 'dayButton'),
    Footer: withSlot(DayPickerFooter, 'footer'),
  };
};

/**
 * Calendar — a month grid built on `react-day-picker`.
 *
 * Spar ships no date primitive, so the engine here is third-party (the Table /
 * TanStack precedent). Every class name in the rendered tree is wrapper-owned
 * and no engine stylesheet is imported; the engine keeps date arithmetic,
 * selection, keyboard navigation and ARIA.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date>();
 * <Calendar value={date} onValueChange={setDate} minDate={new Date()} />
 * ```
 */
export const Calendar = (props: CalendarProps) => {
  const theme = useComponentTheme('Calendar');

  const { rootAttrs, rest } = composeRootAttrs<CalendarProps, CalendarSlot>(CalendarBase, props, theme, {
    // `data-size` is takeoff-v2's own visual vocabulary. The engine's root
    // already emits `data-mode`, `data-multiple-months`, `data-week-numbers`
    // and `data-nav-layout`, so those are not mirrored here (rule 7).
    stateAttrs: ({ size = DEFAULT_SIZE }) => ({ 'data-size': size as CalendarSize }),
  });

  const {
    mode = DEFAULT_MODE,
    value,
    defaultValue,
    onValueChange,
    minDate,
    maxDate,
    disabledDates,
    allowedDates,
    disabledWeekDays,
    firstDayOfWeekIndex,
    size: _size,
    ref,
    min,
    max,
    excludeDisabled,
    ...engine
  } = rest as CalendarFlatProps;

  // Controlled-ness is decided by whether `value` was **passed**, not by whether
  // it currently holds a date. A date picker's controlled value is `undefined`
  // until the user picks something, so reading the value would latch the very
  // common `value={date}` / `const [date, setDate] = useState<Date>()` call site
  // as uncontrolled and then silently ignore the parent — a preset button, a
  // reset, or a saved value arriving late would never reach the grid. This is
  // also why `useControllableState` is not used here: it latches on the first
  // render's value by design, which suits a non-nullable value and not this one.
  const isControlled = 'value' in rest;
  const [uncontrolledValue, setUncontrolledValue] = useState<CalendarValue>(defaultValue);
  const selected = isControlled ? value : uncontrolledValue;

  const setSelected = (next: CalendarValue) => {
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  // Per-slot attrs: the root comes from `composeRootAttrs` (so theme
  // `defaultProps` reach `data-size`), every other slot is composed at what is
  // effectively its render site — the `components` override that renders it.
  // `className` is split out of each because the engine owns the `className`
  // prop of every node it renders; it is handed over through `classNames`
  // instead.
  const slotAttrs = {} as SlotAttrsMap;
  const classNames: DayPickerClassNames = { ...ENGINE_CLASSNAME_RESET, ...calendarRangeClassNames };

  for (const slot of CalendarBase.slots) {
    const composed =
      slot === 'root'
        ? rootAttrs
        : buildSlotAttrs(CalendarBase.getSlotProps(slot), slot, {
            themeSlotProps: theme?.slotProps,
            themeClassNames: theme?.classNames,
            instanceSlotProps: props.slotProps,
            instanceClassNames: props.classNames,
          });

    const { className, ...attrs } = composed;
    slotAttrs[slot] = attrs;
    classNames[SLOT_TO_UI[slot]] = className ?? '';
  }

  const attrsRef = useRef(slotAttrs);
  attrsRef.current = slotAttrs;
  const refRef = useRef(ref);
  refRef.current = ref;

  const components = useMemo(() => createEngineComponents(attrsRef, refRef), []);

  const disabled = buildDisabledMatchers({ minDate, maxDate, disabledDates, allowedDates, disabledWeekDays });

  // One handoff to the engine. `mode` decides which member of the engine's own
  // discriminated union this is, which no single object literal can express —
  // hence the cast, immediately after the props that vary by mode are assembled.
  const engineProps = {
    ...engine,
    mode,
    selected,
    onSelect: setSelected,
    disabled,
    startMonth: minDate,
    endMonth: maxDate,
    weekStartsOn: firstDayOfWeekIndex,
    min,
    max,
    excludeDisabled,
    classNames,
    components,
  } as unknown as DayPickerProps;

  return <DayPicker {...engineProps} />;
};

Calendar.displayName = 'Calendar';
