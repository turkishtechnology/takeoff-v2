/**
 * API table source-of-truth for the Currency Input docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `currency-input.mdx` page whenever this file or
 * `packages/react-spar/src/components/currency-input/types.ts` changes.
 */

const typesFile = 'packages/react-spar/src/components/currency-input/types.ts';

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
  components: [
    {
      sourceFile: typesFile,
      typeName: 'CurrencyInputProps',
      displayName: 'CurrencyInput',
      headingBase: 'currency-input',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Anatomy: `CurrencyInput.Field`, `CurrencyInput.Prefix` / `Suffix`, `CurrencyInput.CurrencySelect`, `CurrencyInput.Symbol`, `CurrencyInput.ClearButton`.',
        },
        size: { default: "'base'", description: 'Size scale, forwarded to `Input`.' },
        invalid: {
          default: 'false',
          description: 'Marks the row invalid. Inherited from `<Field>` automatically; pass this prop only to override.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-currency',
          appliedWhen: 'Always',
          purpose: 'The active ISO 4217 code, so a recipe can style one currency (e.g. a wider trigger for a long code).',
        },
        {
          attribute: 'data-invalid / data-disabled / data-readonly / data-required',
          appliedWhen: 'When the matching state is on.',
          purpose: "Input's own state hooks — the row is Input's element.",
        },
      ],
    },
    {
      sourceFile: typesFile,
      typeName: 'CurrencyInputFieldOwnProps',
      displayName: 'CurrencyInput.Field',
      headingBase: 'currency-input-field',
      appendPropNames: [],
      propOverrides: {},
      dataAttributes: [
        {
          attribute: 'data-mask / data-mask-completed',
          appliedWhen: 'Always / once an integer digit exists.',
          purpose: "Spar's mask hooks, unchanged.",
        },
      ],
    },
    {
      sourceFile: typesFile,
      typeName: 'CurrencyInputSymbolProps',
      displayName: 'CurrencyInput.Symbol',
      headingBase: 'currency-input-symbol',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: {
          type: '(currency: { code: string; symbol: string }) => React.ReactNode',
          description: "Replaces the symbol. Receives the active code and the locale's symbol for it.",
          default: "the locale's narrow symbol",
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlot('root')],
    },
    {
      sourceFile: typesFile,
      typeName: 'CurrencyInputCurrencySelectProps',
      displayName: 'CurrencyInput.CurrencySelect',
      headingBase: 'currency-input-currency-select',
      prependPropNames: ['currencies', 'children', 'trigger'],
      appendPropNames: ['className'],
      propOverrides: {
        currencies: {
          type: 'CurrencyOption[]',
          description: 'The selectable currencies, in display order. `CurrencyOption` is `{ code: string; label?: string; symbol?: string; icon?: React.ReactNode }`.',
        },
        children: {
          type: '(currency: CurrencyOption, symbol: string) => React.ReactNode',
          description: "Replaces a list row's content. Receives the option and the locale's symbol for it.",
          default: 'icon, symbol, name',
        },
        trigger: {
          type: '(currency: CurrencyOption | undefined) => React.ReactNode',
          description: "Replaces the trigger's content; the chevron stays.",
          default: 'icon and code',
        },
        contentWidth: { default: "'content'" },
        searchable: { default: 'true' },
        searchLabel: { default: "'Search currencies'" },
        searchPlaceholder: { default: "'Search'" },
        emptyLabel: { default: "'No currencies found'" },
        className: classNameOverride,
      },
      dataAttributes: [],
    },
  ],
};
