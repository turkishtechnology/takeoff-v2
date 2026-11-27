/**
 * API table source-of-truth for the Phone Input docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `phone-input.mdx` page whenever this file or
 * `packages/react-spar/src/components/phone-input/types.ts` changes.
 */

const typesFile = 'packages/react-spar/src/components/phone-input/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlot = slot => ({
  attribute: `data-slot="${slot}"`,
  appliedWhen: 'Always',
  purpose: `Stable selector for the ${slot} slot.`,
});

export default {
  typeDefinitions: {
    PhoneCountryCode: "'TR' | 'US' | 'DE' | … — an ISO 3166-1 alpha-2 region libphonenumber-js knows (its CountryCode)",
    PhoneInputCountry: 'PhoneCountry & { label: string; dialCode: string }',
  },
  components: [
    {
      sourceFile: typesFile,
      typeName: 'PhoneInputProps',
      displayName: 'PhoneInput',
      headingBase: 'phone-input',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Anatomy: `PhoneInput.Field`, `PhoneInput.Prefix` / `Suffix`, `PhoneInput.CountrySelect`, `PhoneInput.DialCode`, `PhoneInput.ClearButton`.',
        },
        countries: {
          type: 'PhoneCountry[]',
          description:
            'The selectable countries, in display order. `PhoneCountry` is `{ code: PhoneCountryCode; label?: string; icon?: React.ReactNode }`. Defaults to every region libphonenumber-js knows, sorted by name.',
        },
        country: { type: 'PhoneCountryCode' },
        defaultCountry: { type: 'PhoneCountryCode' },
        size: { default: "'base'", description: 'Size scale, forwarded to `Input`.' },
        invalid: {
          default: 'false',
          description: 'Marks the row invalid. Inherited from `<Field>` automatically; pass this prop only to override.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-invalid / data-disabled / data-readonly / data-required',
          appliedWhen: 'When the matching state is on.',
          purpose: "Input's own state hooks — the row is Input's element.",
        },
      ],
    },
    {
      sourceFile: typesFile,
      typeName: 'PhoneInputFieldOwnProps',
      displayName: 'PhoneInput.Field',
      headingBase: 'phone-input-field',
      appendPropNames: [],
      propOverrides: {},
      dataAttributes: [
        {
          attribute: 'data-mask / data-mask-completed',
          appliedWhen: 'Always / once the number is valid for its country.',
          purpose: "Spar's mask hooks, unchanged.",
        },
      ],
    },
    {
      sourceFile: typesFile,
      typeName: 'PhoneInputDialCodeProps',
      displayName: 'PhoneInput.DialCode',
      headingBase: 'phone-input-dial-code',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: {
          type: '(country: { code: PhoneCountryCode; dialCode: string }) => React.ReactNode',
          description: "Replaces the dial code. Receives the active country's code and dial code.",
          default: "the country's dial code",
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlot('root')],
    },
    {
      sourceFile: typesFile,
      typeName: 'PhoneInputCountrySelectProps',
      displayName: 'PhoneInput.CountrySelect',
      headingBase: 'phone-input-country-select',
      prependPropNames: ['children', 'trigger'],
      appendPropNames: ['className'],
      propOverrides: {
        children: {
          type: '(country: PhoneInputCountry) => React.ReactNode',
          description: "Replaces a list row's content. Receives the country with its name and dial code resolved.",
          default: 'icon, name, dial code',
        },
        trigger: {
          type: '(country: PhoneInputCountry | undefined) => React.ReactNode',
          description: "Replaces the trigger's content; the chevron stays.",
          default: 'icon and dial code',
        },
        contentWidth: { default: "'content'" },
        searchable: { default: 'true' },
        searchLabel: { default: "'Search countries'" },
        searchPlaceholder: { default: "'Search'" },
        emptyLabel: { default: "'No countries found'" },
        className: classNameOverride,
      },
      dataAttributes: [],
    },
  ],
};
