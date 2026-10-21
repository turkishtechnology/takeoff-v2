/**
 * API table source-of-truth for the FlightLoader docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `flight-loader.mdx` page whenever this file or
 * `packages/react-spar/src/components/flight-loader/types.ts` changes.
 */

const flightLoaderTypesFile = 'packages/react-spar/src/components/flight-loader/types.ts';

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
      sourceFile: flightLoaderTypesFile,
      typeName: 'FlightLoaderProps',
      displayName: 'FlightLoader',
      headingBase: 'flight-loader',
      prependPropNames: ['children'],
      appendPropNames: ['className', 'aria-label', 'aria-labelledby', 'aria-hidden'],
      propOverrides: {
        'children': childrenOverride('FlightLoader.Logo, FlightLoader.Tagline and FlightLoader.Status, in any order.'),
        'className': classNameOverride,
        'aria-label': {
          type: 'string',
          default: "'Loading'",
          description: 'Accessible name for the loading status. Override it for domain-specific loading text.',
        },
        'aria-labelledby': {
          type: 'string',
          description: 'ID reference for visible loading text, e.g. the `FlightLoader.Status` id. When provided, the default `aria-label` is not applied.',
        },
        'aria-hidden': {
          type: 'boolean',
          default: 'false',
          description: 'Hides a decorative loader from assistive technology. When true, status role and default accessible name are not applied.',
        },
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop; drives the accent color.',
        },
      ],
    },
    {
      sourceFile: flightLoaderTypesFile,
      typeName: 'FlightLoaderLogoProps',
      displayName: 'FlightLoader.Logo',
      headingBase: 'flight-loader-logo',
      propOverrides: { className: classNameOverride },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: flightLoaderTypesFile,
      typeName: 'FlightLoaderTaglineProps',
      displayName: 'FlightLoader.Tagline',
      headingBase: 'flight-loader-tagline',
      propOverrides: {
        children: childrenOverride('Short brand line shown under the scene.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: flightLoaderTypesFile,
      typeName: 'FlightLoaderStatusProps',
      displayName: 'FlightLoader.Status',
      headingBase: 'flight-loader-status',
      propOverrides: {
        children: childrenOverride('Loading message shown under the progress bar.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
