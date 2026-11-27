/**
 * API table source-of-truth for the ColorPicker docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `color-picker.mdx` page whenever this file or
 * `packages/react-spar/src/components/color-picker/types.ts` changes.
 */

const typesFile = 'packages/react-spar/src/components/color-picker/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const part = (typeName, displayName, headingBase, dataAttributes = [dataSlotRoot], extra = {}) => ({
  sourceFile: typesFile,
  typeName,
  displayName,
  headingBase,
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  propOverrides: { className: classNameOverride, ...extra },
  dataAttributes,
});

export default {
  components: [
    {
      sourceFile: typesFile,
      typeName: 'ColorPickerProps',
      displayName: 'ColorPicker',
      headingBase: 'color-picker',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
        swatches: {
          type: 'string[]',
          default: "['#326FD1', '#C79807', …]",
          description: 'Preset colors for `ColorPicker.Swatches` (Core’s 11 presets by default). Pass `[]` to render none.',
        },
        children: {
          type: 'React.ReactNode',
          description:
            'Anatomy override. When omitted, the root renders `ColorPicker.Input` and a `ColorPicker.Content` holding the default `ColorPicker.Panel`. Render only a `ColorPicker.Panel` for the inline picker.',
        },
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-layout',
          appliedWhen: 'Always',
          purpose:
            'Reflects the resolved `orientation` (`vertical` | `horizontal`) panel layout. Named `data-layout` rather than `data-orientation` so the inner sliders keep their own axis.',
        },
        {
          attribute: 'data-format',
          appliedWhen: 'Always',
          purpose: 'The active notation (`hex` | `rgb` | `hsl`); the recipe widens the channel row for three numeric fields.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Blocks every control and keeps the panel closed.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'When read-only (own prop or inherited from a surrounding `Field`)',
          purpose: 'Shows the value while blocking changes; the panel cannot open.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: 'When invalid (own prop or inherited from a surrounding `Field`)',
          purpose: 'Invalid treatment; the trigger field also exposes `aria-invalid`.',
        },
      ],
    },
    part('ColorPickerInputProps', 'ColorPicker.Input', 'color-picker-input', [
      dataSlotRoot,
      {
        attribute: 'data-slot="preview"',
        appliedWhen: 'Always',
        purpose: 'The leading dot painted with the current color over a checkerboard.',
      },
    ]),
    {
      sourceFile: 'packages/react-spar/src/components/popover/types.ts',
      typeName: 'PopoverContentProps',
      displayName: 'ColorPicker.Content',
      headingBase: 'color-picker-content',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
        children: {
          type: 'React.ReactNode',
          description: 'Panel content. When omitted, the default `ColorPicker.Panel` renders.',
        },
      },
      dataAttributes: [dataSlotRoot],
    },
    part(
      'ColorPickerPanelProps',
      'ColorPicker.Panel',
      'color-picker-panel',
      [
        dataSlotRoot,
        {
          attribute: 'data-layout',
          appliedWhen: 'Always',
          purpose: 'The root’s `orientation`; the horizontal layout puts upright sliders beside the area.',
        },
        {
          attribute: 'role="group"',
          appliedWhen: 'Always',
          purpose: 'Named by the surrounding `Field.Label`, else by `labels.panel`.',
        },
      ],
      {
        children: {
          type: 'React.ReactNode',
          description:
            'Panel anatomy. When omitted, Core’s layout for the root `orientation` renders: area, eyedropper, sliders, preview, format select, channel fields and swatches.',
        },
      },
    ),
    part('ColorPickerAreaProps', 'ColorPicker.Area', 'color-picker-area', [
      dataSlotRoot,
      {
        attribute: 'data-slot="thumb"',
        appliedWhen: 'Always',
        purpose: 'The `role="slider"` thumb: `aria-valuenow` is saturation, `aria-valuetext` reads both axes.',
      },
      {
        attribute: 'data-dragging',
        appliedWhen: 'On the thumb while the pointer drags',
        purpose: 'Marks an active drag.',
      },
      {
        attribute: 'data-focus',
        appliedWhen: 'On the thumb while it holds focus',
        purpose: 'Draws the focus ring.',
      },
      {
        attribute: 'data-disabled / data-readonly',
        appliedWhen: 'When the picker is disabled / read-only',
        purpose: 'Changes the cursor and mutes the plane.',
      },
    ]),
    part('ColorPickerHueSliderProps', 'ColorPicker.HueSlider', 'color-picker-hue-slider'),
    part('ColorPickerAlphaSliderProps', 'ColorPicker.AlphaSlider', 'color-picker-alpha-slider'),
    part('ColorPickerEyeDropperProps', 'ColorPicker.EyeDropper', 'color-picker-eye-dropper'),
    part('ColorPickerPreviewProps', 'ColorPicker.Preview', 'color-picker-preview'),
    part('ColorPickerFormatSelectProps', 'ColorPicker.FormatSelect', 'color-picker-format-select'),
    part('ColorPickerChannelFieldsProps', 'ColorPicker.ChannelFields', 'color-picker-channel-fields', [
      dataSlotRoot,
      {
        attribute: 'data-slot="field"',
        appliedWhen: 'On each channel Input',
        purpose: 'One typed channel (hex, R/G/B, H/S/L or alpha).',
      },
    ]),
    part('ColorPickerSwatchesProps', 'ColorPicker.Swatches', 'color-picker-swatches'),
    part('ColorPickerSwatchProps', 'ColorPicker.Swatch', 'color-picker-swatch', [
      dataSlotRoot,
      {
        attribute: 'data-selected',
        appliedWhen: 'When the swatch matches the current value',
        purpose: 'Draws the selection ring; `aria-pressed` carries it for assistive technology.',
      },
    ]),
  ],
};
