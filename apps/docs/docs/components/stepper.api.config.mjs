/**
 * API table source-of-truth for the Stepper docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `stepper.mdx` whenever this file or
 * `packages/react-spar/src/components/stepper/types.ts` changes.
 */

const stepperTypesFile = 'packages/react-spar/src/components/stepper/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: stepperTypesFile,
      typeName: 'StepperProps',
      displayName: 'Stepper',
      headingBase: 'stepper',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('`Stepper.Item` elements. The root derives each step’s index from its position in `children`.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` prop (`horizontal` | `vertical`). Emitted by the wrapper.',
        },
        {
          attribute: 'data-mode',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `mode` prop (`default` | `compact`).',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop so theme recipes can scope size variants.',
        },
        {
          attribute: 'data-linear',
          appliedWhen: 'When `linear` is true.',
          purpose: 'Marks linear progression; selection gating itself is wrapper-owned.',
        },
        {
          attribute: 'data-reverse',
          appliedWhen: 'When `reverse` is true.',
          purpose: 'Styling hook for the flipped indicator/content layout.',
        },
      ],
    },
    {
      sourceFile: stepperTypesFile,
      typeName: 'StepperItemProps',
      displayName: 'Stepper.Item',
      headingBase: 'stepper-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride(
          'Step content — typically `Stepper.Title` and `Stepper.Description`. Renders inside the step’s `<button>` trigger and provides its accessible name.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: 'Resolved progress status: `inactive` | `active` | `completed`.',
        },
        {
          attribute: 'data-error',
          appliedWhen: 'When `error` is true.',
          purpose: 'Error treatment modifier; can coexist with any progress status.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Disabled treatment modifier; the trigger is natively disabled.',
        },
        {
          attribute: 'data-clickable',
          appliedWhen: 'When pressing the step may change the active step — never on the active step itself.',
          purpose: 'Cursor/hover affordance hook. Respects `disabled`, `isClickable`, and linear gating.',
        },
      ],
    },
    {
      sourceFile: stepperTypesFile,
      typeName: 'StepperTitleProps',
      displayName: 'Stepper.Title',
      headingBase: 'stepper-title',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Step title.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: stepperTypesFile,
      typeName: 'StepperDescriptionProps',
      displayName: 'Stepper.Description',
      headingBase: 'stepper-description',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Step description shown under the title.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
