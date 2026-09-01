/**
 * API table source-of-truth for the TimePicker docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `time-picker.mdx` page whenever this file or
 * `packages/react-spar/src/components/time-picker/types.ts` changes.
 */

const timePickerTypesFile = 'packages/react-spar/src/components/time-picker/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const classNamePartOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: timePickerTypesFile,
      typeName: 'TimePickerProps',
      displayName: 'TimePicker',
      headingBase: 'time-picker',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
        children: childrenOverride(
          'Panel anatomy. The root renders no picking surface of its own, so a `TimePicker.Body` is required; `TimePicker.Header` and `TimePicker.Footer` are optional chrome around it.',
        ),
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-mode',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `mode` prop (`columns` | `dial`) that decides which body renders.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `type` prop (`basic` | `divided` | `light` | `dark` | `primary`) — the panel treatment every colour in the recipe resolves through.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop (`small` | `base`) — the column scale. `small` is a 32px cell with 12px digits.',
        },
        {
          attribute: 'data-compact',
          appliedWhen: 'When `compact` is set',
          purpose: 'The shorter form of whichever body renders: the dial stacks under its fields, the column body drops the columns for those fields. Mirrored onto the body.',
        },
        {
          attribute: 'data-time-format',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `timeFormat` prop (`12` | `24`).',
        },
        {
          attribute: 'data-empty',
          appliedWhen: 'While no time has been picked',
          purpose: 'The body is showing the reference time rather than a committed one, so the recipe can mute an untouched panel.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Mutes the panel and blocks every interaction; each unit also drops out of the tab order.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'When read-only (own prop or inherited from a surrounding `Field`)',
          purpose: 'Renders and focuses the value while blocking value-changing interaction.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: 'When invalid (own prop or inherited from a surrounding `Field`)',
          purpose: 'Applies the invalid treatment; each unit also exposes `aria-invalid`.',
        },
        {
          attribute: 'data-required',
          appliedWhen: 'When required (own prop or inherited from a surrounding `Field`)',
          purpose: 'Marks the control as required; each unit also exposes `aria-required`.',
        },
        {
          attribute: 'role="group"',
          appliedWhen: 'Always',
          purpose: 'Ties the unit spinbuttons together. Named by a surrounding `Field` label, or by an `aria-label` / `aria-labelledby` passed to the root.',
        },
      ],
    },
    {
      sourceFile: timePickerTypesFile,
      typeName: 'TimePickerHeaderProps',
      displayName: 'TimePicker.Header',
      headingBase: 'time-picker-header',
      propOverrides: {
        children: childrenOverride('Header content — typically a heading and any icon actions the panel offers.'),
        className: classNamePartOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: timePickerTypesFile,
      typeName: 'TimePickerBodyProps',
      displayName: 'TimePicker.Body',
      headingBase: 'time-picker-body',
      propOverrides: {
        children: childrenOverride(
          'Appended below the picking surface. The surface itself is generated from the root’s props and is reached through `classNames` / `slotProps`, not by placing parts.',
        ),
        className: classNamePartOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-mode',
          appliedWhen: 'Always',
          purpose: 'Mirrors the root’s `mode` so the two layouts can be styled from the body itself — a `Popover.Content` may sit between the two in the DOM.',
        },
        {
          attribute: 'data-slot="column" | "input"',
          appliedWhen: 'On each rendered unit',
          purpose: 'The unit is the `role="spinbutton"` focus stop: a column in the `columns` body, a number field in the `dial` one.',
        },
        {
          attribute: 'data-unit',
          appliedWhen: 'On each unit, and on each dial hand',
          purpose: '`hour` | `minute` | `second` | `meridiem` — which part of the time the node belongs to.',
        },
        {
          attribute: 'data-active',
          appliedWhen: 'On the `dial` field the dial is editing',
          purpose: 'One dial serves both fields; this marks the one a dial press writes to.',
        },
        {
          attribute: 'data-selected',
          appliedWhen: 'On the committed value cell and dial mark',
          purpose: 'Gives the current value its full-contrast treatment while the neighbours recede.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'On a cell or dial mark the bounds forbid',
          purpose: 'Mutes a value that `minTime` / `maxTime` or the step grid does not allow.',
        },
        {
          attribute: 'data-blank',
          appliedWhen: 'On a padding cell past either end of a column',
          purpose:
            'Holds the column’s height so the selection band stays centred at the ends of the list. Distinct from the root’s `data-empty`, which means nothing has been picked.',
        },
        {
          attribute: 'role="spinbutton"',
          appliedWhen: 'On every unit',
          purpose:
            'The unit is the accessibility owner: it carries `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-valuetext` and the keyboard surface. The cells, arrows and dial marks are pointer affordances, hidden from assistive tech.',
        },
      ],
    },
    {
      sourceFile: timePickerTypesFile,
      typeName: 'TimePickerMeridiemProps',
      displayName: 'TimePicker.Meridiem',
      headingBase: 'time-picker-meridiem',
      propOverrides: {
        className: classNamePartOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'role="radiogroup"',
          appliedWhen: 'Always, when the part renders',
          purpose: 'Two mutually exclusive choices: one tab stop, `role="radio"` options inside it, arrows moving between them.',
        },
        {
          attribute: 'data-slot="option"',
          appliedWhen: 'On each of the two choices',
          purpose: 'The AM and PM buttons; the chosen one carries `data-selected` and is the group’s single tab stop.',
        },
        {
          attribute: 'data-selected',
          appliedWhen: 'On the chosen half-day',
          purpose: 'Raises that option as the active segment.',
        },
      ],
    },
    {
      sourceFile: timePickerTypesFile,
      typeName: 'TimePickerFooterProps',
      displayName: 'TimePicker.Footer',
      headingBase: 'time-picker-footer',
      propOverrides: {
        children: childrenOverride('Footer content — typically the panel’s confirm and cancel actions.'),
        className: classNamePartOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
