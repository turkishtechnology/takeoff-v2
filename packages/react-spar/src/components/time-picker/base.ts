import { createComponentBase } from '../../core';

import type {
  TimePickerBodyProps,
  TimePickerBodySlot,
  TimePickerFooterProps,
  TimePickerHeaderProps,
  TimePickerMeridiemProps,
  TimePickerMeridiemSlot,
  TimePickerProps,
  TimePickerSlot,
} from './types';

// @archetype react-enhancement — Spar ships no time primitive and no
// third-party engine is pulled in for one, so the wrapper owns the whole
// slice: controlled/uncontrolled reconciliation, the step/clamp math, the
// keyboard surface and the `role="spinbutton"` ARIA wiring. Same
// no-upstream situation as Slider and Progress, and the same obligation — if a
// Spar TimePicker lands upstream, the behavior moves there and these parts
// migrate to Inherited in that release (composition-archetype rule 3).
//
// Takeoff Core's `tk-datepicker` implements only the `columns` body, and only as
// a panel bolted to a date field; the dial and the panel's own chrome come from
// the Figma "timer" component, whose tokens ship as `component/timepicker.json`.
//
// The root is the state owner and the `role="group"` the units sit in; it
// renders no picking surface of its own so the chrome can be composed around it —
// `TimePicker.Body` alone goes inside a `Popover.Content`, the full
// Header/Body/Footer stack stands on its own.
//
// Data-attribute vocabulary (data-attribute-vocabulary.md rule 10 — v2-owned
// with no upstream primitive; the shipped entry lives under
// "Component-specific decisions → TimePicker"):
//   Root: data-mode, data-type, data-time-format (v2 visual vocabulary),
//         data-empty (nothing picked yet) plus the shared state hooks.
//   Body: data-mode mirrored so the two layouts can be styled without reaching
//         through the root, and data-unit / data-active / data-selected /
//         data-disabled on the generated nodes.
export const TimePickerBase = createComponentBase<TimePickerProps, TimePickerSlot>({
  name: 'TimePicker',
  slots: ['root'] as const,
  classes: { root: 'tk-timepicker' },
});

// @archetype react-enhancement — no upstream part; the panel's title row. It is
// a layout owner only — a heading, a close button, whatever the panel needs goes
// in as children, and the panel's accessible name comes from a surrounding
// Field or the root's own `aria-label` / `aria-labelledby`.
export const TimePickerHeaderBase = createComponentBase<TimePickerHeaderProps, 'root'>({
  name: 'TimePickerHeader',
  slots: ['root'] as const,
  classes: { root: 'tk-timepicker-header' },
});

// @archetype react-enhancement — no upstream part; the picking surface and the
// only part that reads the committed time.
//
// Multi-slot with no sub-parts of its own: a column, a value cell, a dial
// number are generated from the resolved unit list and the step props, so a
// consumer cannot place one. They are reached through the slot keys below,
// which is the same surface a compound part would have exposed — the anatomy
// decision Calendar and Table already carry.
export const TimePickerBodyBase = createComponentBase<TimePickerBodyProps, TimePickerBodySlot>({
  name: 'TimePickerBody',
  slots: [
    'root',
    'columns',
    'column',
    'highlight',
    'previousTrigger',
    'nextTrigger',
    'chevron',
    'valueGroup',
    'value',
    'separator',
    'inputGroup',
    'input',
    'inputValue',
    'inputLabel',
    'inputStack',
    'inputOption',
    'dial',
    'dialFace',
    'dialHand',
    'dialCap',
    'dialNumber',
  ] as const,
  classes: {
    root: 'tk-timepicker-body',
    columns: 'tk-timepicker-columns',
    column: 'tk-timepicker-column',
    highlight: 'tk-timepicker-highlight',
    previousTrigger: 'tk-timepicker-previous',
    nextTrigger: 'tk-timepicker-next',
    chevron: 'tk-timepicker-chevron',
    valueGroup: 'tk-timepicker-value-group',
    value: 'tk-timepicker-value',
    separator: 'tk-timepicker-separator',
    inputGroup: 'tk-timepicker-input-group',
    input: 'tk-timepicker-input',
    inputValue: 'tk-timepicker-input-value',
    inputLabel: 'tk-timepicker-input-label',
    inputStack: 'tk-timepicker-input-stack',
    inputOption: 'tk-timepicker-input-option',
    dial: 'tk-timepicker-dial',
    dialFace: 'tk-timepicker-dial-face',
    dialHand: 'tk-timepicker-dial-hand',
    dialCap: 'tk-timepicker-dial-cap',
    dialNumber: 'tk-timepicker-dial-number',
  },
});

// @archetype react-enhancement — no upstream part. Public because the consumer
// places it: the AM/PM toggle belongs in the header on a panel too narrow for a
// fourth column, and nowhere at all on a 24-hour clock (justification criterion
// 1). It is also a focus owner with its own radiogroup semantics (criterion 2).
export const TimePickerMeridiemBase = createComponentBase<TimePickerMeridiemProps, TimePickerMeridiemSlot>({
  name: 'TimePickerMeridiem',
  slots: ['root', 'option'] as const,
  classes: { root: 'tk-timepicker-meridiem', option: 'tk-timepicker-meridiem-option' },
});

// @archetype react-enhancement — no upstream part; the panel's action row.
export const TimePickerFooterBase = createComponentBase<TimePickerFooterProps, 'root'>({
  name: 'TimePickerFooter',
  slots: ['root'] as const,
  classes: { root: 'tk-timepicker-footer' },
});
