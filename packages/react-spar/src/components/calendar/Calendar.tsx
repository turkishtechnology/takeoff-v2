import {
  createContext,
  useContext,
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
  DateLib as DayPickerDateLib,
  DayFlag as DayPickerDayFlag,
  DayPicker,
  Day as DayPickerDay,
  DayButton as DayPickerDayButton,
  defaultLocale as dayPickerDefaultLocale,
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
import { assignRef, buildDisabledMatchers, isMonthInBounds, isYearInBounds, isYearPageInBounds, yearPageStart, YEARS_PER_PAGE } from './helpers';
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
  /** The engine's own prop, read by the wrapper-owned arrows. */
  navigationDisabled: boolean;
  minDate?: Date;
  maxDate?: Date;
  panelId: string;
  panelRef: RefObject<HTMLDivElement | null>;
  /** The trigger to hand focus back to once a panel closes. */
  restoreRef: RefObject<HTMLElement | null>;
  /** Set when a board should take focus as it opens. */
  pendingFocusRef: RefObject<boolean>;
}

/**
 * The month a caption belongs to, published by the `MonthCaption` override.
 *
 * The engine hands `calendarMonth` to `MonthCaption` but not to `CaptionLabel`,
 * which receives only the already-formatted caption as its children. A
 * rewritten caption therefore has no way of its own to tell which month it
 * labels, and reading the *displayed* month would make every caption repeat
 * that one month as soon as `numberOfMonths > 1`.
 */
const CaptionMonthContext = createContext<Date | null>(null);

/** The panel is a four-column board, so vertical arrows move by four. */
const PANEL_COLUMNS = 4;

/**
 * What a header arrow steps — which is both what it is named after and the
 * granularity its bounds are measured in. A year arrow stays live while any
 * month of the target year is in range, a page arrow while any year of the
 * target page is; the engine clamps the landing month either way (`goToMonth`).
 */
type NavStep = 'month' | 'year' | 'page';

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

  /**
   * The month a board belongs to: the engine's *first* displayed month, which
   * is what `goToMonth` moves.
   *
   * Not simply `months[0]` — `reverseMonths` reverses that array, so the first
   * entry is then the last month on screen and a board would anchor to a month
   * `goToMonth` does not move.
   */
  const useDisplayedMonth = () => {
    const { months, dayPickerProps } = useDayPicker();
    const first = dayPickerProps.reverseMonths ? months[months.length - 1] : months[0];

    return first?.date ?? new Date();
  };

  /**
   * The engine's date library, rebuilt from the props the engine was given.
   *
   * `useDayPicker()` publishes `formatters` and `labels` but not the `dateLib`
   * they take, and every label this file writes has to be produced the way the
   * engine produces the caption above it — a bare `Intl` would drift from the
   * grid: with no `locale` prop it falls back to the *browser's* locale where
   * the engine falls back to `en-US`, and for `ar-SA` it would name Hijri
   * months over a Gregorian grid. Rebuilding is also what carries `numerals`
   * through to the panel.
   */
  const useDateLib = () => {
    const { locale, timeZone, numerals, dateLib } = useDayPicker().dayPickerProps;

    return useMemo(
      // The same merge the engine makes, so a partial `locale` still resolves
      // against `en-US` rather than leaving fields undefined.
      () => new DayPickerDateLib({ locale: { ...dayPickerDefaultLocale, ...locale }, timeZone, numerals }, dateLib),
      [locale, timeZone, numerals, dateLib],
    );
  };

  // Publishes the month each caption belongs to. It also has to re-apply the
  // slot attrs `withSlot` used to add, since the provider is what wraps the
  // engine's part now.
  const MonthCaption = ({ calendarMonth, displayIndex, ...engineProps }: ComponentProps<typeof DayPickerMonthCaption>) => (
    <CaptionMonthContext.Provider value={calendarMonth.date}>
      <DayPickerMonthCaption
        calendarMonth={calendarMonth}
        displayIndex={displayIndex}
        {...(mergeSlotAttrs(attrsRef.current.monthCaption, engineProps as Record<string, unknown>) as HTMLAttributes<HTMLDivElement>)}
      />
    </CaptionMonthContext.Provider>
  );
  MonthCaption.displayName = 'Calendar.monthCaption';

  const CaptionLabel = ({ children, ...engineProps }: HTMLAttributes<HTMLSpanElement>) => {
    const { triggersEnabled, view, setView, navigationDisabled, panelId, pendingFocusRef, restoreRef } = viewRef.current;
    const { formatters, labels } = useDayPicker();
    const caption = useContext(CaptionMonthContext);
    const anchor = useDisplayedMonth();
    const dateLib = useDateLib();
    // Each caption labels its own month; the anchor is only a fallback for a
    // caption rendered outside `MonthCaption`.
    const displayed = caption ?? anchor;
    const slotProps = mergeSlotAttrs(attrsRef.current.captionLabel, engineProps as Record<string, unknown>);

    // Two captions that keep the engine's plain label:
    //
    // - a `dropdown*` caption, which renders this label *inside* the engine's
    //   own `<select>` wrapper, where turning it into buttons would break the
    //   select;
    // - every month but the anchor, because the board is a calendar-level
    //   surface belonging to that one month, so a trigger elsewhere would open
    //   a board for a month it does not name. Deferring also leaves the
    //   engine's per-month `role="status"` announcement intact rather than
    //   repeating the anchor's.
    if (!triggersEnabled || displayed.getTime() !== anchor.getTime())
      return <DayPickerCaptionLabel {...(slotProps as HTMLAttributes<HTMLSpanElement>)}>{children}</DayPickerCaptionLabel>;

    const trigger = (target: Exclude<CalendarView, 'day'>, label: string, describe: string) => {
      // A board's cells all navigate, so `disableNavigation` closes the way in
      // — but never the way out: a board opened by `defaultView` or a
      // controlled `view` has to stay closable, or it traps the body.
      const opens = view !== target;
      const disabled = navigationDisabled && opens;

      return (
        <button
          type="button"
          {...(mergeSlotAttrs(attrsRef.current.captionTrigger, {
            'data-view': target,
            // The engine's own label, so `labels` translates the panel too; a
            // per-instance override still wins through `slotProps`.
            'aria-label': attrsRef.current.captionTrigger['aria-label'] ?? `${label}, ${describe}`,
            'aria-expanded': view === target,
            'aria-controls': view === target ? panelId : undefined,
            'aria-disabled': disabled || undefined,
            'onClick': (event: MouseEvent<HTMLButtonElement>) => {
              if (disabled) return;
              const next = opens ? target : 'day';
              restoreRef.current = next === 'day' ? null : event.currentTarget;
              pendingFocusRef.current = next !== 'day';
              setView(next);
            },
          }) as ComponentProps<'button'>)}
        >
          {label}
        </button>
      );
    };

    // The engine's own formatters, so a `formatters` override reaches the
    // triggers exactly as it reaches a `dropdown*` caption.
    const monthLabel = formatters.formatMonthDropdown(displayed, dateLib);
    const yearLabel = formatters.formatYearDropdown(displayed, dateLib);

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

  const MonthGrid = ({ children, ...engineProps }: HTMLAttributes<HTMLTableElement>) => {
    const { view, setView, navigationDisabled, minDate, maxDate, panelId, panelRef, pendingFocusRef, restoreRef } = viewRef.current;
    const { dayPickerProps, formatters, goToMonth, labels } = useDayPicker();
    const displayed = useDisplayedMonth();
    const dateLib = useDateLib();

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

    // Focus goes back to the trigger the board was opened from. A board opened
    // by `defaultView` or by a controlled `view` was never clicked, so nothing
    // was recorded and the trigger it belongs to is found in the DOM instead —
    // otherwise closing the board would drop focus onto `<body>`.
    const restoreFocus = () => {
      const trigger = panelRef.current?.closest('[data-slot="root"]')?.querySelector<HTMLElement>(`[data-slot="caption-trigger"][data-view="${view}"]`);

      (restoreRef.current ?? trigger)?.focus();
    };

    const items =
      view === 'month'
        ? Array.from({ length: 12 }, (_, month) => {
            const date = new Date(year, month, 1);
            return {
              key: String(month),
              // No engine formatter abbreviates a month — the dropdown spells
              // it out — so this is the one label built from a pattern; the
              // date library is still the engine's, so locale and numerals
              // hold.
              label: dateLib.format(date, 'LLL'),
              name: formatters.formatCaption(date, dateLib.options, dateLib),
              current: displayed.getMonth() === month,
              // Picking a cell is navigation, so `disableNavigation` takes the
              // whole board down with the arrows — `goToMonth` would no-op and
              // leave an enabled-looking cell that does nothing.
              enabled: !navigationDisabled && isMonthInBounds(year, month, minDate, maxDate),
              select: () => {
                goToMonth(date);
                setView('day');
                restoreFocus();
              },
            };
          })
        : Array.from({ length: YEARS_PER_PAGE }, (_, offset) => {
            const candidate = pageStart + offset;
            const label = formatters.formatYearDropdown(new Date(candidate, 0, 1), dateLib);
            return {
              key: String(candidate),
              label,
              name: label,
              current: candidate === year,
              enabled: !navigationDisabled && isYearInBounds(candidate, minDate, maxDate),
              select: () => {
                goToMonth(new Date(candidate, displayed.getMonth(), 1));
                // Core drills down rather than closing: a picked year lands on
                // the month list for that year. The board changes hands with
                // it, so the recorded trigger — the year one — is dropped and
                // the month board finds its own when it closes.
                restoreRef.current = null;
                pendingFocusRef.current = true;
                setView('month');
              },
            };
          });

    // A disabled cell is out of the way rather than in it: `focus()` on a
    // disabled button does nothing, so a key that landed on one would be
    // swallowed and the board would feel stuck. Every direction keeps going
    // until it reaches a cell that can take focus, or the edge.
    const seek = (start: number, delta: number, min = 0, max = items.length - 1) => {
      for (let index = start; index >= min && index <= max; index += delta) if (items[index]?.enabled) return index;
      return undefined;
    };

    // One tab stop: the cell the panel is "on" — the current one, or the first
    // that can be reached. Every other cell is skipped and reached by arrow,
    // and a board with nothing to reach (`disableNavigation`) has no tab stop
    // at all rather than one on a cell that cannot take focus.
    const current = items.findIndex(item => item.current && item.enabled);
    const activeIndex = current >= 0 ? current : (seek(0, 1) ?? -1);

    // The board is a CSS grid, so `dir="rtl"` mirrors it on screen while the DOM
    // order stays put: the physically-left key has to step *forward* through the
    // array. Read from the same prop the engine's own day grid reads, and
    // mirrored on the same two keys — `Home`/`End` stay logical there too, and
    // the vertical pair is not a direction the writing mode turns around.
    const inline = dayPickerProps.dir === 'rtl' ? -1 : 1;

    const move = (event: KeyboardEvent<HTMLDivElement>, from: number) => {
      const step = { ArrowLeft: -inline, ArrowRight: inline, ArrowUp: -PANEL_COLUMNS, ArrowDown: PANEL_COLUMNS }[event.key as 'ArrowLeft'];
      const rowStart = from - (from % PANEL_COLUMNS);
      const rowEnd = rowStart + PANEL_COLUMNS - 1;
      let next: number | undefined;

      if (step !== undefined) next = seek(from + step, step);
      else if (event.key === 'Home') next = seek(rowStart, 1, rowStart, rowEnd);
      else if (event.key === 'End') next = seek(rowEnd, -1, rowStart, rowEnd);
      if (next === undefined) return;

      event.preventDefault();
      const cells = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="gridcell"]');
      cells[next]?.focus();
    };

    const label =
      view === 'month'
        ? `${labels.labelMonthDropdown()}, ${formatters.formatYearDropdown(displayed, dateLib)}`
        : `${labels.labelYearDropdown()}, ${dateLib.formatNumber(pageStart)}–${dateLib.formatNumber(pageStart + YEARS_PER_PAGE - 1)}`;

    return (
      <div
        {...(mergeSlotAttrs(attrsRef.current.monthYearGrid, {
          'id': panelId,
          'role': 'grid',
          'aria-label': attrsRef.current.monthYearGrid['aria-label'] ?? label,
          'data-view': view,
          'ref': panelRef,
          'onKeyDown': (event: KeyboardEvent<HTMLDivElement>) => {
            // The caption trigger is a disclosure (`aria-expanded` and all), so
            // Escape closes what it opened. Kept from bubbling: a surface that
            // holds the calendar — a picker popover — must not close with it.
            if (event.key === 'Escape') {
              event.stopPropagation();
              setView('day');
              restoreFocus();
              return;
            }

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

  // `navLayout="around"` is the one layout where the engine renders the month
  // arrows itself — the row is [prev, caption, next] inside the month — and
  // never asks for `Nav`, so the board stepping below never reaches them. Only
  // the year board needs it: on the month board these still step a month,
  // which is what the engine already does. The year pair has no place in this
  // layout, the same way a `dropdown*` caption drops it, and none is needed —
  // stepping a year walks off the end of a twelve-year page on its own.
  const aroundArrow = (slot: 'previousMonthButton' | 'nextMonthButton') => {
    const Engine = slot === 'previousMonthButton' ? DayPickerPreviousMonthButton : DayPickerNextMonthButton;

    const Arrow = ({ children, ...engineProps }: ComponentProps<typeof DayPickerPreviousMonthButton>) => {
      const { view, navigationDisabled, minDate, maxDate } = viewRef.current;
      const { formatters, goToMonth } = useDayPicker();
      const displayed = useDisplayedMonth();
      const dateLib = useDateLib();
      const slotProps = mergeSlotAttrs(attrsRef.current[slot], engineProps as Record<string, unknown>);

      if (view !== 'year') return <Engine {...(slotProps as ComponentProps<typeof DayPickerPreviousMonthButton>)}>{children}</Engine>;

      const target = new Date(displayed.getFullYear() + (slot === 'previousMonthButton' ? -1 : 1), displayed.getMonth(), 1);
      const disabled = navigationDisabled || !isYearInBounds(target.getFullYear(), minDate, maxDate);

      // A plain spread, not `mergeSlotAttrs`: on the year board these values
      // replace the engine's, `undefined` included — its `aria-disabled` is
      // about the next *month*, which is not what this arrow moves any more.
      return (
        <Engine
          {...(slotProps as ComponentProps<typeof DayPickerPreviousMonthButton>)}
          aria-label={formatters.formatYearDropdown(target, dateLib)}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={() => {
            if (!disabled) goToMonth(target);
          }}
        >
          {children}
        </Engine>
      );
    };
    Arrow.displayName = `Calendar.${slot}`;

    return Arrow;
  };

  // exemption (@bypass Nav): Core's header carries two pairs of arrows — the
  // single ones page the body, the double ones page the year — and the engine's
  // own `Nav` knows only the first pair, only in months. The row is rebuilt
  // here; the day view still delegates to the engine's handlers so
  // `pagedNavigation`, `numberOfMonths` and the navigation bounds are upstream.
  const Nav = (engineProps: ComponentProps<typeof DayPickerNav>) => {
    const { triggersEnabled, view, navigationDisabled, minDate, maxDate } = viewRef.current;
    const { classNames: engineClassNames, components, formatters, goToMonth, labels } = useDayPicker();
    const displayed = useDisplayedMonth();
    const dateLib = useDateLib();
    const slotProps = mergeSlotAttrs(attrsRef.current.nav, engineProps as Record<string, unknown>);

    const { onPreviousClick, onNextClick, previousMonth, nextMonth, ...navAttrs } = slotProps as ComponentProps<typeof DayPickerNav>;

    // Each pair steps one rung of the board it is on: the single arrows move a
    // month, or a year once the year board is showing; the double arrows move a
    // year, or a whole twelve-year page.
    const singleStep = view === 'year' ? 12 : 1;
    const doubleStep = view === 'year' ? YEARS_PER_PAGE * 12 : 12;
    const singleGrain: NavStep = view === 'year' ? 'year' : 'month';
    const doubleGrain: NavStep = view === 'year' ? 'page' : 'year';

    const shift = (months: number) => new Date(displayed.getFullYear(), displayed.getMonth() + months, 1);

    // Measured in what the arrow steps, not in the month it happens to land on:
    // a board whose year or page is only partly in range is still worth
    // reaching, and `goToMonth` clamps the landing month to the bounds.
    const reachable = (target: Date, grain: NavStep) =>
      grain === 'month'
        ? isMonthInBounds(target.getFullYear(), target.getMonth(), minDate, maxDate)
        : grain === 'year'
          ? isYearInBounds(target.getFullYear(), minDate, maxDate)
          : isYearPageInBounds(target.getFullYear(), minDate, maxDate);

    const formatYear = (target: Date) => formatters.formatYearDropdown(target, dateLib);
    const formatPage = (target: Date) => {
      const start = yearPageStart(target.getFullYear());
      return `${dateLib.formatNumber(start)}–${dateLib.formatNumber(start + YEARS_PER_PAGE - 1)}`;
    };

    // Every arrow is named after what it lands on, so the name follows the
    // board too: the engine's month label only tells the truth while the body
    // is showing months.
    const arrowLabel = (grain: NavStep, target: Date, previous: boolean) =>
      grain === 'month' ? (previous ? labels.labelPrevious(target) : labels.labelNext(target)) : grain === 'year' ? formatYear(target) : formatPage(target);

    const arrow = (slot: 'previousMonthButton' | 'nextMonthButton' | 'previousYearButton' | 'nextYearButton', months: number, grain: NavStep, icon: ReactNode) => {
      const target = shift(months);
      const label = arrowLabel(grain, target, months < 0);
      // Only the month pair has an engine class-name key; the year pair is
      // wrapper-owned, so its class already sits on the slot attrs and must not
      // be overwritten here.
      const engineOwned = slot === 'previousMonthButton' || slot === 'nextMonthButton';
      const delegated = engineOwned && view === 'day';
      // The engine's own arrows go `aria-disabled` under `disableNavigation`
      // (it drops `previousMonth` / `nextMonth`); the wrapper-owned pair has to
      // say so for itself.
      const disabled = navigationDisabled || (delegated ? !(months < 0 ? previousMonth : nextMonth) : !reachable(target, grain));
      // The engine's own part rather than `components.*`: those overrides carry
      // the month pair's slot attrs, which would then land on the year pair as
      // well — one `slotProps.previousMonthButton` `id`, two nodes. Each
      // arrow's own slot attrs are merged below.
      const Button = slot.startsWith('previous') ? DayPickerPreviousMonthButton : DayPickerNextMonthButton;

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
        {triggersEnabled && arrow('previousYearButton', -doubleStep, doubleGrain, doubleChevron(DoubleChevronLeftIconOutlinedRounded))}
        {arrow('previousMonthButton', -singleStep, singleGrain, chevron('left'))}
        {arrow('nextMonthButton', singleStep, singleGrain, chevron('right'))}
        {triggersEnabled && arrow('nextYearButton', doubleStep, doubleGrain, doubleChevron(DoubleChevronRightIconOutlinedRounded))}
      </nav>
    );
  };
  Nav.displayName = 'Calendar.nav';

  return {
    Root,
    Chevron,
    CaptionLabel,
    MonthCaption,
    MonthGrid,
    Nav,
    Months: withSlot(DayPickerMonths, 'months'),
    Month: withSlot(DayPickerMonth, 'month'),
    PreviousMonthButton: aroundArrow('previousMonthButton'),
    NextMonthButton: aroundArrow('nextMonthButton'),
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
  //
  // Asked of `props`, not of `rest`: `resolveProps` merges the theme's
  // `defaultProps` into `rest`, and a provider-level default is a *fallback* —
  // a theme that sets `value` must not put every instance into controlled mode
  // with no handler to advance it. It still seeds the uncontrolled state, which
  // is what a fallback means here.
  const isControlled = 'value' in props;
  const [uncontrolledValue, setUncontrolledValue] = useState<CalendarValue>(isControlled ? undefined : (value ?? defaultValue));
  const selected = isControlled ? value : uncontrolledValue;

  const setSelected = (next: CalendarValue) => {
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  // The caption triggers cannot coexist with the engine's `<select>`
  // navigation — that layout reuses the caption-label node — but the boards
  // themselves work in every layout.
  const triggersEnabled = !engine.captionLayout?.startsWith('dropdown');
  // Read from `props` for the same reason as `value` above — a theme default
  // must not force controlled mode — but by its value rather than its presence,
  // for the opposite one: a board is always one of three, so `undefined` is not
  // a state a parent can be in, where a date is `undefined` until it is picked.
  // That is also what keeps `view={undefined}` (an optional prop forwarded on, a
  // `useState<CalendarView>()`) from latching and leaving the body on no board
  // at all. A theme default still chooses the opening board.
  const isViewControlled = props.view !== undefined;
  const [uncontrolledView, setUncontrolledView] = useState<CalendarView>(viewProp ?? defaultView);
  const view = isViewControlled ? (props.view as CalendarView) : uncontrolledView;

  const setView = (next: CalendarView) => {
    if (!isViewControlled) setUncontrolledView(next);
    onViewChange?.(next);
  };

  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef(false);

  const navigationDisabled = Boolean(engine.disableNavigation);

  const viewState: CalendarViewState = { triggersEnabled, view, setView, navigationDisabled, minDate, maxDate, panelId, panelRef, restoreRef, pendingFocusRef };
  const viewRef = useRef<CalendarViewState>(viewState);
  viewRef.current = viewState;

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
    // A board belongs to the calendar, not to a month, so only one month is
    // displayed while one is open — the board would otherwise be repeated per
    // month, `id` and all. Mapped on the prop rather than by dropping the extra
    // months from the `Month` override, which would take the engine's
    // navigation down with them: `navLayout="after"` and `"around"` render it
    // inside a month.
    numberOfMonths: view === 'day' ? engine.numberOfMonths : 1,
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
