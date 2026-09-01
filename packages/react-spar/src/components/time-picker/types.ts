import type { ElementType, Ref } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * TimePicker is a **no-upstream** component: Spar ships no time primitive and
 * there is no third-party engine in this package's dependency budget, so the
 * wrapper owns what would normally be Spar's slice — controlled/uncontrolled
 * reconciliation, the step/clamp math, the keyboard surface and the ARIA
 * wiring. That is the same situation Slider and Progress are in, and the same
 * obligation applies: if a Spar TimePicker primitive lands upstream, the
 * behavior moves there and these parts migrate to Inherited in that release
 * (`docs/component-authoring-contract.md` → Upstream-first rule).
 *
 * The public types are therefore v2-owned and carry no `Pick<SparTimePickerProps, …>`
 * boundary; there is no `SparTimePicker` to pick from.
 */

/**
 * Which body the panel picks with → root `data-mode`. `columns` stacks the
 * units as spinning columns, `dial` pairs two number fields with a clock face.
 *
 * Named after the shape rather than after a treatment, so a call site never
 * reads `mode="basic" type="basic"` with the two words meaning different
 * things.
 *
 * @defaultValue 'columns'
 */
export type TimePickerMode = 'columns' | 'dial';

/**
 * Twelve- or twenty-four-hour clock → root `data-time-format`. String values
 * rather than a number or a boolean, so the prop reads the same as it does
 * everywhere else in the design system.
 *
 * @defaultValue '24'
 */
export type TimePickerFormat = '12' | '24';

/**
 * Column scale → root `data-size`.
 *
 * Two values, not three, because the design draws two: `base` is the 40px cell
 * with 14px digits, `small` a 32px cell with 12px digits in the recessive ink,
 * for a picker sitting beside something else. Calendar makes the same
 * two-value choice for its day cell.
 *
 * `columns` only — the dial is drawn at one scale.
 *
 * @defaultValue 'base'
 */
export type TimePickerSize = 'small' | 'base';

/**
 * Panel treatment → root `data-type`. Unlike Calendar's `headerType` it does
 * not stop at the header: every treatment but `divided` repaints the body and
 * inverts the selection band against it, which is why the prop is `type` here.
 *
 * `basic` is the plain surface and `divided` the same one with the header and
 * footer ruled off; `light`, `dark` and `primary` repaint it.
 *
 * Further treatments are built by overriding the `--tk-timepicker-*` palette
 * the recipe resolves every colour through.
 *
 * @defaultValue 'basic'
 */
export type TimePickerType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

/**
 * The units a body can carry. `second` appears only when `showSeconds` is set —
 * and only in `columns` mode, the one the design gives a seconds column;
 * `meridiem` only under `timeFormat="12"`.
 */
export type TimePickerUnit = 'hour' | 'minute' | 'second' | 'meridiem';

/**
 * Where AM/PM is picked, under `timeFormat="12"`.
 *
 * `column` gives the meridiem a spinning column of its own, beside the hours
 * and minutes. `toggle` takes it out of that row and hands it to a composed
 * `TimePicker.Meridiem` — a two-option segmented control the consumer places,
 * typically in the header, for panels where a fourth column will not fit.
 *
 * The prop decides the *form* and the part decides *where*: the two together
 * rather than one registering with the other, so nothing about the layout waits
 * on an effect and a server render matches the first client one.
 *
 * @defaultValue 'column'
 */
export type TimePickerMeridiemPlacement = 'column' | 'toggle';

/**
 * Names for the units. English defaults ship because the package has no locale
 * layer; an app in another language passes its own strings, the same way
 * Calendar takes its month names from the consumer rather than calling `Intl`
 * itself.
 *
 * The keys are not all the same kind of string, which is worth knowing before
 * translating them:
 *
 * - `hour` / `minute` — the accessible name of the control, **and** the caption
 *   the `dial` body prints under its number fields. One string serves both.
 * - `second` / `meridiem` — accessible names only; neither has a visible
 *   counterpart.
 * - `am` / `pm` — rendered text, and what the meridiem announces as its value.
 *
 * A later release may split the rendered half into a formatter and narrow this
 * to accessible names; that would be an additive change.
 */
export interface TimePickerLabels {
  /**
   * Names the hour column / field.
   * @defaultValue 'Hour'
   */
  hour?: string;
  /**
   * Names the minute column / field.
   * @defaultValue 'Minute'
   */
  minute?: string;
  /**
   * Names the seconds column.
   * @defaultValue 'Second'
   */
  second?: string;
  /**
   * Names the AM/PM column.
   * @defaultValue 'AM/PM'
   */
  meridiem?: string;
  /**
   * The before-noon value, rendered and announced.
   * @defaultValue 'AM'
   */
  am?: string;
  /**
   * The after-noon value, rendered and announced.
   * @defaultValue 'PM'
   */
  pm?: string;
}

/** Slot vocabulary for the root. */
export type TimePickerSlot = 'root';

/** Slot vocabulary for `TimePicker.Header`. */
export type TimePickerHeaderSlot = 'root';

/** Slot vocabulary for `TimePicker.Footer`. */
export type TimePickerFooterSlot = 'root';

/** Slot vocabulary for `TimePicker.Meridiem` — the track and each of its two choices. */
export type TimePickerMeridiemSlot = 'root' | 'option';

/**
 * Slot vocabulary for `TimePicker.Body` — the picking surface.
 *
 * Every node below `root` is generated from the resolved unit list rather than
 * placed by a consumer, so they are reached through `classNames` / `slotProps`
 * keys instead of compound parts (the Calendar / Table precedent,
 * `docs/component-authoring-contract.md` → Compound component rule).
 *
 * `columns` … `separator` belong to the `columns` body, `inputGroup` …
 * `dialNumber` to the `dial` one; `root` is shared. A key whose body is not rendered simply
 * matches nothing.
 */
export type TimePickerBodySlot =
  | 'root'
  | 'columns'
  | 'column'
  | 'highlight'
  | 'previousTrigger'
  | 'nextTrigger'
  | 'chevron'
  | 'valueGroup'
  | 'value'
  | 'separator'
  | 'inputGroup'
  | 'input'
  | 'inputValue'
  | 'inputLabel'
  | 'inputStack'
  | 'inputOption'
  | 'dial'
  | 'dialFace'
  | 'dialHand'
  | 'dialCap'
  | 'dialNumber';

export interface TimePickerOwnProps {
  /**
   * Which body the panel picks with.
   * @defaultValue 'columns'
   */
  mode?: TimePickerMode;
  /**
   * Column scale. `small` is the 32px cell with 12px digits. `columns` only;
   * the dial is drawn at one scale.
   * @defaultValue 'base'
   */
  size?: TimePickerSize;
  /**
   * Panel treatment. `divided` rules off the header and footer; `light` tints
   * the surface and flips the selection band to white against it; `dark` and
   * `primary` repaint the whole panel.
   * @defaultValue 'basic'
   */
  type?: TimePickerType;
  /**
   * Selected time (controlled). Only the hour, minute and second are read; the
   * date part is carried through to every emitted value untouched, so a picker
   * bound to a date keeps it.
   */
  value?: Date;
  /** Initially selected time (uncontrolled). */
  defaultValue?: Date;
  /**
   * Fires with the new time. Always a full `Date`: when nothing was selected
   * yet, the first pick lands on `referenceDate`'s day.
   */
  onValueChange?: (value: Date) => void;
  /**
   * The day an emitted time falls on while `value` is empty, and the time the
   * body shows before anything is picked (clamped into `minTime` / `maxTime`).
   * @defaultValue the current date at 00:00:00.000, resolved once per instance
   */
  referenceDate?: Date;
  /**
   * Twelve- or twenty-four-hour clock.
   * @defaultValue '24'
   */
  timeFormat?: TimePickerFormat;
  /**
   * Where AM/PM is picked. Only read under `timeFormat="12"`; a 24-hour clock
   * has no meridiem to place.
   * @defaultValue 'column'
   */
  meridiem?: TimePickerMeridiemPlacement;
  /**
   * Distance between selectable hours.
   * @defaultValue 1
   */
  hourStep?: number;
  /**
   * Distance between selectable minutes.
   * @defaultValue 1
   */
  minuteStep?: number;
  /**
   * Distance between selectable seconds.
   * @defaultValue 1
   */
  secondStep?: number;
  /**
   * Add a seconds column. `columns` only — the `dial` body has two fields by
   * design and no third hand.
   * @defaultValue false
   */
  showSeconds?: boolean;
  /**
   * The shorter form of whichever body is rendering: `dial` stacks its face
   * under the number fields instead of setting the two side by side, and
   * `columns` drops the spinning columns for those same fields.
   *
   * @defaultValue false
   */
  compact?: boolean;
  /**
   * Earliest selectable time, inclusive. Only the hour, minute and second are
   * read — a bound is a time of day, not a moment, so the date part is ignored.
   */
  minTime?: Date;
  /** Latest selectable time, inclusive. The date part is ignored, as with `minTime`. */
  maxTime?: Date;
  /**
   * Rejects individual times the bounds allow — a closed lunch hour, a slot
   * already taken.
   *
   * Called once per rendered cell with the time that cell would commit and the
   * unit being asked about, so answering is a comparison rather than a scan:
   * a column of hours asks 24 times, not 1440. A coarse unit is asked about
   * itself only, so disabling 12:00–12:30 means answering `false` for the hour
   * 12 (some of it is open) and `true` for the minutes inside it.
   *
   * Unlike `minTime` / `maxTime`, an unavailable time is only made
   * unselectable — the finer units are not pulled onto a legal value, because
   * there is no bound to pull them to.
   */
  isTimeUnavailable?: (time: Date, unit: TimePickerUnit) => boolean;
  /**
   * Submits the value with a surrounding form under this name, as `HH:mm` (or
   * `HH:mm:ss` with `showSeconds`) — the shape a native `<input type="time">`
   * submits. Without it the picker contributes no form data.
   */
  name?: string;
  /** `id` of the form to submit with, when the picker is not inside it. */
  form?: string;
  /** Accessible names, and the `dial` body's visible field labels. */
  labels?: TimePickerLabels;
  /** Blocks interaction and dims the panel. Inherited from a surrounding `Field` when unset. */
  disabled?: boolean;
  /** Renders the value but commits nothing. Inherited from a surrounding `Field` when unset. */
  readOnly?: boolean;
  /** Marks the group invalid. Inherited from a surrounding `Field` when unset. */
  invalid?: boolean;
  /** Marks the group required. Inherited from a surrounding `Field` when unset. */
  required?: boolean;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TimePickerSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TimePickerSlot>;
  /** Ref to the root element. */
  ref?: Ref<HTMLDivElement>;
}

export type TimePickerProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimePickerOwnProps>;

export interface TimePickerHeaderOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TimePickerHeaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TimePickerHeaderSlot>;
}

export type TimePickerHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimePickerHeaderOwnProps>;

export interface TimePickerBodyOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TimePickerBodySlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TimePickerBodySlot>;
}

export type TimePickerBodyProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimePickerBodyOwnProps>;

export interface TimePickerFooterOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TimePickerFooterSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TimePickerFooterSlot>;
}

export type TimePickerFooterProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimePickerFooterOwnProps>;

export interface TimePickerMeridiemOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<TimePickerMeridiemSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<TimePickerMeridiemSlot>;
}

export type TimePickerMeridiemProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimePickerMeridiemOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    TimePicker: import('../../core').ComponentThemeConfig<TimePickerProps, TimePickerSlot>;
    TimePickerHeader: import('../../core').ComponentThemeConfig<TimePickerHeaderProps, TimePickerHeaderSlot>;
    TimePickerBody: import('../../core').ComponentThemeConfig<TimePickerBodyProps, TimePickerBodySlot>;
    TimePickerFooter: import('../../core').ComponentThemeConfig<TimePickerFooterProps, TimePickerFooterSlot>;
    TimePickerMeridiem: import('../../core').ComponentThemeConfig<TimePickerMeridiemProps, TimePickerMeridiemSlot>;
  }
}
