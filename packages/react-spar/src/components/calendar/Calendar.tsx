import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';
import { DoubleChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-left';
import { DoubleChevronRightIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-right';
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
  useDayPicker,
  type ChevronProps as DayPickerChevronProps,
  type ClassNames as DayPickerClassNames,
  type CustomComponents as DayPickerCustomComponents,
  type DayPickerProps,
  type RootProps as DayPickerRootProps,
} from 'react-day-picker';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CalendarBase, calendarRangeClassNames } from './base';
import { DEFAULT_HEADER_TYPE, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_VIEW } from './defaults';
import { assignRef, buildDisabledMatchers, isMonthInBounds, isYearInBounds, yearPageStart, YEARS_PER_PAGE } from './helpers';
import type { CalendarHeaderType, CalendarMode, CalendarProps, CalendarSize, CalendarSlot, CalendarValue, CalendarView } from './types';

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

/**
 * Slot key → the engine's `classNames` / `components` key.
 *
 * Partial on purpose: `captionTrigger`, `monthYearGrid` and `monthYearCell`
 * belong to the month/year panel, which the engine does not render, so they
 * have no upstream key and keep their `className` on the slot attrs instead.
 */
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
} as const satisfies Partial<Record<CalendarSlot, string>>;

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
 * The month/year panel's live state, read by the engine component overrides.
 *
 * It travels by ref for the same reason the slot attrs do: the overrides must
 * keep a stable identity across renders, so they cannot close over state.
 */
interface CalendarViewState {
  /**
   * Whether the caption's month and year are rendered as panel triggers. False
   * under a `dropdown*` caption, where the engine reuses the caption-label node
   * inside its own `<select>` — the panel itself still works there, driven by
   * the `view` prop.
   */
  triggersEnabled: boolean;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  minDate?: Date;
  maxDate?: Date;
  panelId: string;
  panelRef: RefObject<HTMLDivElement | null>;
  /** The trigger to hand focus back to once a panel closes. */
  restoreRef: RefObject<HTMLElement | null>;
  /** Set when a board should take focus as it opens. */
  pendingFocusRef: RefObject<boolean>;
}

/** The panel is a four-column board, so vertical arrows move by four. */
const PANEL_COLUMNS = 4;

// The design system ships no sr-only utility and the recipe must stay a purely
// visual dependency, so the status node hides itself inline.
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Rows exist for assistive technology only; the cells stay direct children of
// the grid so one CSS grid lays the whole board out.
const displayContents: CSSProperties = { display: 'contents' };

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
const createEngineComponents = (
  attrsRef: RefObject<SlotAttrsMap>,
  refRef: RefObject<Ref<HTMLDivElement> | undefined>,
  viewRef: RefObject<CalendarViewState>,
): Partial<DayPickerCustomComponents> => {
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

  // exemption (@bypass Chevron): the engine's Chevron draws its own inline
  // polygons, which is icon rendering — a takeoff-spar responsibility. Every
  // other part defers upstream; this one is replaced so the glyph comes from
  // `@takeoff-icons`.
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

  // ── Month/year panel ──────────────────────────────────────────────────────
  // Exemption, and the largest one: `react-day-picker` has no month or year
  // view, so `view` is implemented here rather than mapped onto an engine prop.
  // It stays a *swap* rather than a fork — DayPicker keeps owning the displayed
  // month (`goToMonth`, which fires `onMonthChange`), the locale and the
  // navigation; only the caption label and the grid body are replaced.
  //
  // The panel mirrors the day grid's a11y contract rather than inventing one:
  // a `grid` of rows and cells, one tab stop with arrow-key roving focus, and
  // the same polite announcement of the caption the engine makes.

  /** The month the engine is currently showing — the panel's anchor. */
  const useDisplayedMonth = () => {
    const { months } = useDayPicker();
    return months[0]?.date ?? new Date();
  };

  const useLocaleCode = () => useDayPicker().dayPickerProps.locale?.code;

  const CaptionLabel = ({ children, ...engineProps }: HTMLAttributes<HTMLSpanElement>) => {
    const { triggersEnabled, view, setView, panelId, pendingFocusRef, restoreRef } = viewRef.current;
    const { labels } = useDayPicker();
    const displayed = useDisplayedMonth();
    const localeCode = useLocaleCode();
    const slotProps = mergeSlotAttrs(attrsRef.current.captionLabel, engineProps as Record<string, unknown>);

    // A `dropdown*` caption renders this label *inside* the engine's own
    // `<select>` wrapper, where turning it into buttons would break the select.
    if (!triggersEnabled) return <DayPickerCaptionLabel {...(slotProps as HTMLAttributes<HTMLSpanElement>)}>{children}</DayPickerCaptionLabel>;

    const trigger = (target: Exclude<CalendarView, 'day'>, label: string, describe: string) => (
      <button
        type="button"
        {...(mergeSlotAttrs(attrsRef.current.captionTrigger, {
          'data-view': target,
          // The engine's own label, so `labels` translates the panel too; a
          // per-instance override still wins through `slotProps`.
          'aria-label': attrsRef.current.captionTrigger['aria-label'] ?? `${label}, ${describe}`,
          'aria-expanded': view === target,
          'aria-controls': view === target ? panelId : undefined,
          'onClick': (event: MouseEvent<HTMLButtonElement>) => {
            const next = view === target ? 'day' : target;
            restoreRef.current = next === 'day' ? null : event.currentTarget;
            pendingFocusRef.current = next !== 'day';
            setView(next);
          },
        }) as ComponentProps<'button'>)}
      >
        {label}
      </button>
    );

    const monthLabel = new Intl.DateTimeFormat(localeCode, { month: 'long' }).format(displayed);
    const yearLabel = new Intl.DateTimeFormat(localeCode, { year: 'numeric' }).format(displayed);

    return (
      <DayPickerCaptionLabel
        {...(slotProps as HTMLAttributes<HTMLSpanElement>)}
        // The engine marks this a polite live region, which is right for a
        // static label and wrong for a pair of buttons — the announcement moves
        // to the hidden status node below so it is not lost.
        role={undefined}
        aria-live={undefined}
      >
        {trigger('month', monthLabel, labels.labelMonthDropdown())}
        {trigger('year', yearLabel, labels.labelYearDropdown())}
        <span role="status" aria-live="polite" style={visuallyHidden}>
          {view === 'day' ? `${monthLabel} ${yearLabel}` : view === 'month' ? labels.labelMonthDropdown() : labels.labelYearDropdown()}
        </span>
      </DayPickerCaptionLabel>
    );
  };
  CaptionLabel.displayName = 'Calendar.captionLabel';

  // exemption: a board belongs to the calendar, not to a month, so the extra
  // months unmount while one is open — rendering it per month would duplicate
  // its `id` and anchor every copy to the first month anyway.
  const Month = ({ calendarMonth, displayIndex, ...engineProps }: ComponentProps<typeof DayPickerMonth>) => {
    // An empty fragment rather than `null`: the engine types this slot as
    // always returning an element.
    if (viewRef.current.view !== 'day' && displayIndex !== 0) return <></>;

    return (
      <DayPickerMonth
        calendarMonth={calendarMonth}
        displayIndex={displayIndex}
        {...(mergeSlotAttrs(attrsRef.current.month, engineProps as Record<string, unknown>) as HTMLAttributes<HTMLDivElement>)}
      />
    );
  };
  Month.displayName = 'Calendar.month';

  const MonthGrid = ({ children, ...engineProps }: HTMLAttributes<HTMLTableElement>) => {
    const { view, setView, minDate, maxDate, panelId, panelRef, pendingFocusRef, restoreRef } = viewRef.current;
    const { goToMonth, labels } = useDayPicker();
    const displayed = useDisplayedMonth();
    const localeCode = useLocaleCode();

    // A board that was opened from the caption takes focus once it is mounted —
    // in an effect rather than in the click handler, so a keypress arriving
    // right after cannot be undone by a late focus hop.
    useEffect(() => {
      if (view === 'day' || !pendingFocusRef.current) return;
      pendingFocusRef.current = false;
      panelRef.current?.querySelector<HTMLButtonElement>('[role="gridcell"][tabindex="0"]')?.focus();
    }, [view, panelRef, pendingFocusRef]);

    if (view === 'day') {
      return <DayPickerMonthGrid {...(mergeSlotAttrs(attrsRef.current.monthGrid, { ...engineProps, children }) as HTMLAttributes<HTMLTableElement>)} />;
    }

    const year = displayed.getFullYear();
    const pageStart = yearPageStart(year);

    const items =
      view === 'month'
        ? Array.from({ length: 12 }, (_, month) => ({
            key: String(month),
            label: new Intl.DateTimeFormat(localeCode, { month: 'short' }).format(new Date(year, month, 1)),
            name: new Intl.DateTimeFormat(localeCode, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1)),
            current: displayed.getMonth() === month,
            enabled: isMonthInBounds(year, month, minDate, maxDate),
            select: () => {
              goToMonth(new Date(year, month, 1));
              setView('day');
              restoreRef.current?.focus();
            },
          }))
        : Array.from({ length: YEARS_PER_PAGE }, (_, offset) => {
            const candidate = pageStart + offset;
            const label = new Intl.NumberFormat(localeCode, { useGrouping: false }).format(candidate);
            return {
              key: label,
              label,
              name: label,
              current: candidate === year,
              enabled: isYearInBounds(candidate, minDate, maxDate),
              select: () => {
                goToMonth(new Date(candidate, displayed.getMonth(), 1));
                // Core drills down rather than closing: a picked year lands on
                // the month list for that year.
                pendingFocusRef.current = true;
                setView('month');
              },
            };
          });

    // One tab stop: the cell the panel is "on" — the current one, or the first
    // that can be reached. Every other cell is skipped and reached by arrow.
    const activeIndex = Math.max(
      items.findIndex(item => item.current && item.enabled),
      0,
    );

    const move = (event: KeyboardEvent<HTMLDivElement>, from: number) => {
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -PANEL_COLUMNS, ArrowDown: PANEL_COLUMNS }[event.key as 'ArrowLeft'];
      let next: number | undefined;

      if (step !== undefined) next = from + step;
      else if (event.key === 'Home') next = from - (from % PANEL_COLUMNS);
      else if (event.key === 'End') next = from - (from % PANEL_COLUMNS) + PANEL_COLUMNS - 1;
      if (next === undefined || next < 0 || next >= items.length) return;

      event.preventDefault();
      const cells = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="gridcell"]');
      cells[next]?.focus();
    };

    const label =
      view === 'month'
        ? `${labels.labelMonthDropdown()}, ${new Intl.DateTimeFormat(localeCode, { year: 'numeric' }).format(displayed)}`
        : `${labels.labelYearDropdown()}, ${pageStart}–${pageStart + YEARS_PER_PAGE - 1}`;

    return (
      <div
        {...(mergeSlotAttrs(attrsRef.current.monthYearGrid, {
          'id': panelId,
          'role': 'grid',
          'aria-label': attrsRef.current.monthYearGrid['aria-label'] ?? label,
          'data-view': view,
          'ref': panelRef,
          'onKeyDown': (event: KeyboardEvent<HTMLDivElement>) => {
            const cells = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')];
            const from = cells.indexOf(event.target as HTMLButtonElement);
            if (from >= 0) move(event, from);
          },
        }) as HTMLAttributes<HTMLDivElement>)}
      >
        {Array.from({ length: items.length / PANEL_COLUMNS }, (_, row) => (
          <div key={row} role="row" style={displayContents}>
            {items.slice(row * PANEL_COLUMNS, row * PANEL_COLUMNS + PANEL_COLUMNS).map((item, column) => {
              const index = row * PANEL_COLUMNS + column;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!item.enabled}
                  {...(mergeSlotAttrs(attrsRef.current.monthYearCell, {
                    'role': 'gridcell',
                    'aria-label': item.name,
                    'aria-selected': item.current,
                    'data-selected': item.current || undefined,
                    'data-disabled': item.enabled ? undefined : true,
                    'tabIndex': index === activeIndex ? 0 : -1,
                    'onClick': item.select,
                  }) as ComponentProps<'button'>)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  MonthGrid.displayName = 'Calendar.monthGrid';

  // exemption (@bypass Nav): Core's header carries two pairs of arrows — the
  // single ones page the body, the double ones page the year — and the engine's
  // own `Nav` knows only the first pair, only in months. The row is rebuilt
  // here; the day view still delegates to the engine's handlers so
  // `pagedNavigation`, `numberOfMonths` and the navigation bounds are upstream.
  const Nav = (engineProps: ComponentProps<typeof DayPickerNav>) => {
    const { triggersEnabled, view, minDate, maxDate } = viewRef.current;
    const { classNames: engineClassNames, components, goToMonth, labels } = useDayPicker();
    const displayed = useDisplayedMonth();
    const localeCode = useLocaleCode();
    const slotProps = mergeSlotAttrs(attrsRef.current.nav, engineProps as Record<string, unknown>);

    const { onPreviousClick, onNextClick, previousMonth, nextMonth, ...navAttrs } = slotProps as ComponentProps<typeof DayPickerNav>;

    // Each pair steps one rung of the board it is on: the single arrows move a
    // month, or a year once the year board is showing; the double arrows move a
    // year, or a whole twelve-year page.
    const singleStep = view === 'year' ? 12 : 1;
    const doubleStep = view === 'year' ? YEARS_PER_PAGE * 12 : 12;

    const shift = (months: number) => new Date(displayed.getFullYear(), displayed.getMonth() + months, 1);
    const reachable = (target: Date) => isMonthInBounds(target.getFullYear(), target.getMonth(), minDate, maxDate);
    const formatYear = (target: Date) => new Intl.DateTimeFormat(localeCode, { year: 'numeric' }).format(target);

    const arrow = (slot: 'previousMonthButton' | 'nextMonthButton' | 'previousYearButton' | 'nextYearButton', months: number, label: string, icon: ReactNode) => {
      const target = shift(months);
      // Only the month pair has an engine class-name key; the year pair is
      // wrapper-owned, so its class already sits on the slot attrs and must not
      // be overwritten here.
      const engineOwned = slot === 'previousMonthButton' || slot === 'nextMonthButton';
      const delegated = engineOwned && view === 'day';
      const disabled = delegated ? !(months < 0 ? previousMonth : nextMonth) : !reachable(target);
      const Button = slot.startsWith('previous') ? components.PreviousMonthButton : components.NextMonthButton;

      return (
        <Button
          type="button"
          {...(mergeSlotAttrs(attrsRef.current[slot], {
            'className': engineOwned ? engineClassNames[slot === 'previousMonthButton' ? DayPickerUI.PreviousMonthButton : DayPickerUI.NextMonthButton] : undefined,
            'aria-label': label,
            'aria-disabled': disabled || undefined,
            'tabIndex': disabled ? -1 : undefined,
            'onClick': (event: MouseEvent) => {
              if (disabled) return;
              if (delegated) return months < 0 ? onPreviousClick?.(event as never) : onNextClick?.(event as never);
              goToMonth(target);
            },
          }) as ComponentProps<'button'>)}
        >
          {icon}
        </Button>
      );
    };

    const chevron = (orientation: 'left' | 'right') => <components.Chevron orientation={orientation} className={engineClassNames[DayPickerUI.Chevron]} />;
    const doubleChevron = (Icon: typeof DoubleChevronLeftIconOutlinedRounded) => (
      <Icon aria-hidden="true" {...(mergeSlotAttrs(attrsRef.current.chevron, { className: engineClassNames[DayPickerUI.Chevron] }) as Record<string, unknown>)} />
    );

    return (
      <nav {...(navAttrs as HTMLAttributes<HTMLElement>)}>
        {/* A `dropdown*` caption navigates years through its own `<select>`, and
            the row has no width for a second way to do it. */}
        {triggersEnabled && arrow('previousYearButton', -doubleStep, formatYear(shift(-doubleStep)), doubleChevron(DoubleChevronLeftIconOutlinedRounded))}
        {arrow('previousMonthButton', -singleStep, labels.labelPrevious(shift(-singleStep)), chevron('left'))}
        {arrow('nextMonthButton', singleStep, labels.labelNext(shift(singleStep)), chevron('right'))}
        {triggersEnabled && arrow('nextYearButton', doubleStep, formatYear(shift(doubleStep)), doubleChevron(DoubleChevronRightIconOutlinedRounded))}
      </nav>
    );
  };
  Nav.displayName = 'Calendar.nav';

  return {
    Root,
    Chevron,
    CaptionLabel,
    Month,
    MonthGrid,
    Nav,
    Months: withSlot(DayPickerMonths, 'months'),
    PreviousMonthButton: withSlot(DayPickerPreviousMonthButton, 'previousMonthButton'),
    NextMonthButton: withSlot(DayPickerNextMonthButton, 'nextMonthButton'),
    MonthCaption: withSlot(DayPickerMonthCaption, 'monthCaption'),
    DropdownNav: withSlot(DayPickerDropdownNav, 'dropdowns'),
    // The engine hands these props to its own `<select>`, so `dropdown` is the
    // select's anchor. Its wrapping span (`dropdownRoot`) is class-only — see
    // `base.ts`.
    Dropdown: withSlot(DayPickerDropdown, 'dropdown'),
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
    stateAttrs: ({ size = DEFAULT_SIZE, headerType = DEFAULT_HEADER_TYPE }) => ({
      'data-size': size as CalendarSize,
      'data-header-type': headerType as CalendarHeaderType,
    }),
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
    headerType: _headerType,
    view: viewProp,
    defaultView = DEFAULT_VIEW,
    onViewChange,
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

  // The caption triggers cannot coexist with the engine's `<select>`
  // navigation — that layout reuses the caption-label node — but the boards
  // themselves work in every layout.
  const triggersEnabled = !engine.captionLayout?.startsWith('dropdown');
  // Same controlled test as `value`: whether the prop was **passed**, not what
  // it currently holds.
  const isViewControlled = 'view' in rest;
  const [uncontrolledView, setUncontrolledView] = useState<CalendarView>(defaultView);
  const view = isViewControlled ? (viewProp as CalendarView) : uncontrolledView;

  const setView = (next: CalendarView) => {
    if (!isViewControlled) setUncontrolledView(next);
    onViewChange?.(next);
  };

  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef(false);

  const viewRef = useRef<CalendarViewState>({ triggersEnabled, view, setView, minDate, maxDate, panelId, panelRef, restoreRef, pendingFocusRef });
  viewRef.current = { triggersEnabled, view, setView, minDate, maxDate, panelId, panelRef, restoreRef, pendingFocusRef };

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
        ? // `data-view` is live state, not a resolved prop, so it is layered on
          // here rather than through `stateAttrs`.
          { ...rootAttrs, 'data-view': view }
        : buildSlotAttrs(CalendarBase.getSlotProps(slot), slot, {
            themeSlotProps: theme?.slotProps,
            themeClassNames: theme?.classNames,
            instanceSlotProps: props.slotProps,
            instanceClassNames: props.classNames,
          });

    const uiKey = SLOT_TO_UI[slot as keyof typeof SLOT_TO_UI] as keyof DayPickerClassNames | undefined;

    // A panel slot has no engine counterpart, so its class stays on the attrs
    // the override spreads instead of going through `classNames`.
    if (uiKey === undefined) {
      slotAttrs[slot] = composed;
      continue;
    }

    const { className, ...attrs } = composed;
    slotAttrs[slot] = attrs;
    classNames[uiKey] = className ?? '';
  }

  const attrsRef = useRef(slotAttrs);
  attrsRef.current = slotAttrs;
  const refRef = useRef(ref);
  refRef.current = ref;

  const components = useMemo(() => createEngineComponents(attrsRef, refRef, viewRef), []);

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
