/**
 * API table source-of-truth for the Carousel docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * `api-tables` block in `carousel.mdx` whenever this file or
 * `packages/react-spar/src/components/carousel/types.ts` changes.
 */

const carouselTypesFile = 'packages/react-spar/src/components/carousel/types.ts';
const sparCarouselDocsUrl = 'https://v2.takeoffui.com/headless/docs/Components/Carousel';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const dataSlot = slot => ({
  attribute: `data-slot="${slot}"`,
  appliedWhen: 'Always',
  purpose: `Stable selector for the ${slot} slot.`,
});

const part = (typeName, displayName, headingBase, extra = {}) => ({
  sourceFile: carouselTypesFile,
  typeName,
  displayName,
  headingBase,
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  sparDocsUrl: sparCarouselDocsUrl,
  sparDocsLabel: 'Spar Carousel docs',
  ...extra,
  propOverrides: { className: classNameOverride, ...extra.propOverrides },
  dataAttributes: [dataSlot('root'), ...(extra.dataAttributes ?? [])],
});

export default {
  components: [
    part('CarouselProps', 'Carousel', 'carousel', {
      prependPropNames: ['children'],
      sparBehaviorProps: [
        'id',
        'value',
        'defaultValue',
        'onValueChange',
        'loop',
        'slidesPerView',
        'orientation',
        'autoplay',
        'autoplayInterval',
        'isPlaying',
        'defaultPlaying',
        'onPlayingChange',
      ],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Carousel.Viewport` with its `Carousel.Slide`s, and usually `Carousel.Controls`.',
        },
        controlsPlacement: { default: "'inside'" },
        controlsPosition: { default: "'distributed'" },
        labels: {
          description:
            'Overrides for the user-facing strings (`previous`, `next`, `play`, `pause`, `indicator`, `slide`, `roleDescription`, `slideRoleDescription`). `{index}` / `{count}` are filled in; blank entries fall back to English.',
        },
      },
      dataAttributes: [
        { attribute: 'data-orientation', appliedWhen: 'Always', purpose: 'Reflects the resolved `orientation`. Emitted by Spar.' },
        { attribute: 'data-controls-placement', appliedWhen: 'Always', purpose: 'Reflects `controlsPlacement` (`inside` | `outside`).' },
        { attribute: 'data-controls-position', appliedWhen: 'Always', purpose: 'Reflects `controlsPosition` (`distributed` | `start` | `end`).' },
      ],
    }),
    part('CarouselViewportProps', 'Carousel.Viewport', 'carousel-viewport', {
      prependPropNames: ['children'],
      propOverrides: {
        children: { type: 'React.ReactNode', description: 'The `Carousel.Slide` elements.' },
      },
      dataAttributes: [dataSlot('track')],
    }),
    part('CarouselSlideProps', 'Carousel.Slide', 'carousel-slide', {
      prependPropNames: ['children'],
      dataAttributes: [
        { attribute: 'data-active', appliedWhen: 'While the slide is inside the visible window', purpose: 'Visible-slide hook. Emitted by Spar; other slides are `inert`.' },
      ],
    }),
    part('CarouselControlsProps', 'Carousel.Controls', 'carousel-controls', {
      prependPropNames: ['children'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description:
            'The controls to place. Omit for the default set: `Carousel.PrevTrigger`, `Carousel.Indicators` (with `Carousel.AutoplayTrigger` in front), `Carousel.NextTrigger`.',
        },
      },
    }),
    part('CarouselTriggerProps', 'Carousel.PrevTrigger / Carousel.NextTrigger', 'carousel-trigger', {
      prependPropNames: ['children'],
      propOverrides: {
        children: { type: 'React.ReactNode', description: 'Replaces the chevron glyph (the default `aria-label` is then dropped).' },
      },
    }),
    part('CarouselIndicatorsProps', 'Carousel.Indicators', 'carousel-indicators', {
      prependPropNames: ['children'],
      propOverrides: {
        children: { type: 'React.ReactNode', description: 'Content placed before the dots, e.g. `Carousel.AutoplayTrigger`.' },
      },
      dataAttributes: [
        dataSlot('indicator'),
        dataSlot('indicator-dot'),
        { attribute: 'data-active', appliedWhen: 'On the indicator of the current page', purpose: 'Active dot treatment; `aria-current="true"` is set too. Emitted by Spar.' },
      ],
    }),
    part('CarouselAutoplayTriggerProps', 'Carousel.AutoplayTrigger', 'carousel-autoplay-trigger', {
      prependPropNames: ['children'],
    }),
  ],
};
