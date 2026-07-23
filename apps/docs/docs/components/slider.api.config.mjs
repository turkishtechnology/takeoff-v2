/**
 * API table source-of-truth for the Slider docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `slider.mdx` page whenever this file or
 * `packages/react-spar/src/components/slider/types.ts` changes.
 */

const sliderTypesFile = 'packages/react-spar/src/components/slider/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

export default {
  components: [
    {
      sourceFile: sliderTypesFile,
      typeName: 'SliderProps',
      displayName: 'Slider',
      headingBase: 'slider',
      // `range` / `value` / `defaultValue` / `onValueChange` / `onValueChangeEnd`
      // live in the `SliderSingleValueProps | SliderRangeValueProps` union
      // rather than in `SliderOwnProps`, so the extractor cannot reach them from
      // the declared members. They are the component's primary surface, so they
      // are documented explicitly here.
      prependPropNames: ['range', 'value', 'defaultValue', 'onValueChange', 'onValueChangeEnd'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
        children: childrenOverride('Optional anatomy override. When omitted, `Slider` renders `Slider.Track` wrapping `Slider.Range` and one thumb per value.'),
        range: {
          type: 'boolean',
          default: 'false',
          description:
            'Renders a multi-handle slider: the value becomes an array and one thumb renders per entry (two by default). Dragging one handle past another swaps them, so the committed array stays ascending.',
        },
        value: {
          type: 'number | number[]',
          description:
            'Controlled value — a `number` by default, an array when `range` is set (one thumb per entry; fewer than two entries fall back to `[min, max]`). Each entry is clamped into `[min, max]`, snapped to `step`, and the array is ordered ascending. Takes precedence over `defaultValue`, which is ignored when both are passed.',
        },
        defaultValue: {
          type: 'number | number[]',
          description:
            'Initial value for uncontrolled usage — a `number` by default, an array when `range` is set (one thumb per entry). Defaults to `min` for a single slider and `[min, max]` for a range. Controlled/uncontrolled mode is latched on the first render.',
        },
        onValueChange: {
          type: '(value: number | number[]) => void',
          description:
            'Fired on every committed value change while interacting — each drag frame, keystroke, or track press. Receives a `number` by default and the full ascending array when `range` is set.',
        },
        onValueChangeEnd: {
          type: '(value: number | number[]) => void',
          description:
            'Fired once at the end of an interaction with the final value: on pointer release after a drag or track press, and once per committed keystroke. Use it when only the settled value matters, while `onValueChange` streams the live value.',
        },
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop for theme recipe scoping (rail thickness and thumb diameter).',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop that drives the fill color.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` prop. A vertical rail runs bottom-to-top and takes its height from its container, as a horizontal rail takes its width.',
        },
        {
          attribute: 'data-tooltip',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `tooltip` prop (`auto` | `always` | `never`) that controls when the value bubble shows.',
        },
        {
          attribute: 'data-track',
          appliedWhen: 'Always',
          purpose:
            'Reflects the resolved `track` prop (`normal` | `inverted` | `none`) that sets the rail fill mode; `inverted` fills the complement of the selection, `none` drops the fill but keeps the rail.',
        },
        {
          attribute: 'data-range',
          appliedWhen: 'When `range` is set',
          purpose: 'Marks a multi-thumb slider (two or more handles) so the recipe can style the fill as a band between the outermost handles.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Mutes the fill and blocks every interaction.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'When read-only (own prop or inherited from a surrounding `Field`)',
          purpose: 'Renders the value while blocking value-changing interaction.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: 'When invalid (own prop or inherited from a surrounding `Field`)',
          purpose: 'Applies the invalid treatment; each thumb also exposes `aria-invalid`.',
        },
        {
          attribute: 'data-required',
          appliedWhen: 'When required (own prop or inherited from a surrounding `Field`)',
          purpose: 'Marks the control as required; each thumb also exposes `aria-required`.',
        },
        {
          attribute: 'data-thumb',
          appliedWhen: 'On each thumb of a range slider',
          purpose: '`min` on the first handle and `max` on the last. A handle between them is neither end, so it carries no `data-thumb` rather than a misleading one.',
        },
        {
          attribute: 'data-dragging',
          appliedWhen: 'On the thumb the pointer currently controls',
          purpose: 'Reveals the value tooltip and suppresses the position transition so the handle tracks the pointer exactly.',
        },
        {
          attribute: 'data-focus',
          appliedWhen: 'On the focused thumb',
          purpose: 'Draws the focus ring and reveals the value tooltip for keyboard users.',
        },
        {
          attribute: 'role="slider"',
          appliedWhen: 'On every thumb',
          purpose: 'The thumb is the accessibility owner: it carries `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and the keyboard surface.',
        },
        {
          attribute: 'role="group"',
          appliedWhen: 'When `range` is set',
          purpose: 'Ties the two `role="slider"` thumbs together under the surrounding `Field` label.',
        },
      ],
    },
  ],
};
