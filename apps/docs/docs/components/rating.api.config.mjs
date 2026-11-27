/**
 * API table source-of-truth for the Rating docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `rating.mdx` whenever this file or
 * `packages/react-spar/src/components/rating/types.ts` changes.
 */

const ratingTypesFile = 'packages/react-spar/src/components/rating/types.ts';

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
      sourceFile: ratingTypesFile,
      typeName: 'RatingProps',
      displayName: 'Rating',
      headingBase: 'rating',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Rating.Item`s for custom content. When omitted, the root renders `max` default items.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `type` (`star` | `heart` | `dot` | `number`) so the recipe picks the glyph colours.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Greys every item out and turns the hover preview off (Spar-emitted).',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'readOnly (own prop or inherited from a surrounding `Field`)',
          purpose: 'Turns the hover preview off; the value stays inspectable (Spar-emitted).',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: 'invalid (own prop or inherited from a surrounding `Field`)',
          purpose: 'Mirrors `aria-invalid` for styling (Spar-emitted).',
        },
      ],
    },
    {
      sourceFile: ratingTypesFile,
      typeName: 'RatingItemProps',
      displayName: 'Rating.Item',
      headingBase: 'rating-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: RatingItemRenderProps) => React.ReactNode)',
          description: 'Replaces the default glyph and value text. The function form receives `{ value, fill, isChecked }`.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="icon"',
          appliedWhen: 'Default content',
          purpose: 'The decorative glyph (or the number for `type="number"`); style it via `classNames.icon` / `slotProps.icon`.',
        },
        {
          attribute: 'data-slot="value"',
          appliedWhen: '`showValue` on a glyph type',
          purpose: 'The zero-padded score under the glyph; style it via `classNames.value` / `slotProps.value`.',
        },
        {
          attribute: 'data-fill',
          appliedWhen: 'Always',
          purpose: '`full` up to the value, `half` on the next item for a fractional part of .5 or more, `empty` after.',
        },
        {
          attribute: 'data-level',
          appliedWhen: '`type="number"`',
          purpose: 'The score bucketed into five steps (1–5) for the red-to-green colour scale.',
        },
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: '`checked` on the picked score, `unchecked` otherwise (Spar-emitted).',
        },
      ],
    },
  ],
};
