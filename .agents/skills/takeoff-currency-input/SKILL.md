---
name: takeoff-currency-input
description:
  'Build a money / amount field with a currency — the CurrencyInput from
  @takeoff-ui/react-spar (Takeoff UI / Spar React): an amount grouped as you
  type by locale (1.234,56 in tr-TR), a currency picker or a fixed symbol, and a
  plain number as the value. Trigger contexts: price field, amount input, money
  input, currency selector, fare / payment / refund amount, exchange rate. Use
  this skill WHENEVER building, adding, importing, styling, or fixing an
  amount-with-currency field in a React app that uses @takeoff-ui/react-spar /
  Takeoff / Spar.'
---

# CurrencyInput — @takeoff-ui/react-spar

`CurrencyInput` is an amount field with a currency: the amount on the left, the
currency picker in the suffix. Spar's `number` mask groups the amount as the
user types; the value your code gets is a `number`.

**When to use:** Any amount of money — prices, fares, refunds, deposits, rates.
Not this — use `takeoff-input` with `mask={{ number: true }}` for a plain number
that is not money (a quantity, a distance), and `Input.Stepper` for a counter.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import {
  CurrencyInput,
  Field,
  type CurrencyOption,
} from '@takeoff-ui/react-spar';
```

## Compound parts

- `CurrencyInput.Field` — the amount: an `Input.Field` with the `number` mask.
  Takes `placeholder`, `aria-label` and the usual input attributes; `mask`,
  `value` and `type` belong to the root.
- `CurrencyInput.CurrencySelect` — the currency picker (a `Select`). Needs
  `currencies`; opens on a search field (code, name, symbol; case- and
  accent-insensitive) unless `searchable={false}`; `trigger` / `children`
  replace its content; its own `name` submits the code.
- `CurrencyInput.Symbol` — the active currency's symbol, for a fixed currency.
- `CurrencyInput.Prefix` / `Suffix` / `ClearButton` — `Input`'s own parts.
  Placing the picker or the symbol in `Prefix` or `Suffix` is how its side is
  chosen; there is no `position` prop.

## Basic usage

```tsx
const CURRENCIES: CurrencyOption[] = [
  { code: 'TRY', label: 'Türk Lirası', icon: <FlagTR /> },
  { code: 'USD', label: 'US Dollar', icon: <FlagUS /> },
  { code: 'EUR', label: 'Euro', icon: <FlagEU /> },
];

const [amount, setAmount] = useState<number | undefined>(1234.5);
const [currency, setCurrency] = useState('TRY');

<Field>
  <Field.Label>Ticket price</Field.Label>
  <CurrencyInput
    value={amount}
    onValueChange={setAmount}
    currency={currency}
    onCurrencyChange={setCurrency}
    locale="tr-TR"
  >
    <CurrencyInput.Field placeholder="0,00" />
    <CurrencyInput.Suffix>
      <CurrencyInput.CurrencySelect currencies={CURRENCIES} />
    </CurrencyInput.Suffix>
  </CurrencyInput>
</Field>;
```

## Examples

### A fixed currency

```tsx
<CurrencyInput defaultValue={49.9} currency="EUR" locale="de-DE">
  <CurrencyInput.Field aria-label="Refund" />
  <CurrencyInput.Suffix>
    <CurrencyInput.Symbol />
  </CurrencyInput.Suffix>
</CurrencyInput>
```

### Digits, sign and clearing

```tsx
// Four fraction digits whatever the currency, at most three integer digits.
<CurrencyInput defaultValue={34.1234} locale="tr-TR" decimalScale={4} integerScale={3}>
  <CurrencyInput.Field aria-label="Exchange rate" />
</CurrencyInput>

// A minus sign is rejected unless allowNegative.
<CurrencyInput defaultValue={-250} locale="tr-TR" allowNegative>
  <CurrencyInput.Field aria-label="Adjustment" />
  <CurrencyInput.ClearButton />
</CurrencyInput>
```

### Form submission

```tsx
// Submits amount=1234.5 (canonical, not the grouped text) and currency=TRY.
<CurrencyInput locale="tr-TR" name="amount" form="checkout">
  <CurrencyInput.Field aria-label="Deposit" />
  <CurrencyInput.Suffix>
    <CurrencyInput.CurrencySelect currencies={CURRENCIES} name="currency" />
  </CurrencyInput.Suffix>
</CurrencyInput>
```

### Custom trigger and rows

```tsx
<CurrencyInput.CurrencySelect
  currencies={CURRENCIES}
  aria-label="Para birimi"
  trigger={option => option?.code}
>
  {(option, symbol) => `${option.label} (${symbol})`}
</CurrencyInput.CurrencySelect>
```

`useCurrencyInputContext()` gives `currency` / `setCurrency` for a picker that
is not a `Select`.

## Key props

| Prop                                               | Type                                         | Default                                                      | Notes                                                                               |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `value`                                            | `number`                                     | -                                                            | Controlled amount. `undefined` is empty, which is not `0`.                          |
| `defaultValue`                                     | `number`                                     | -                                                            | Uncontrolled initial amount.                                                        |
| `onValueChange`                                    | `(value: number \| undefined) => void`       | -                                                            | Fires on each edit that changes the amount; `undefined` when none is named.         |
| `currency`                                         | `string`                                     | -                                                            | Controlled ISO 4217 code.                                                           |
| `defaultCurrency`                                  | `string`                                     | `'TRY'`                                                      | Uncontrolled initial code.                                                          |
| `onCurrencyChange`                                 | `(currency: string) => void`                 | -                                                            | Fires when the picker commits a code.                                               |
| `locale`                                           | `string`                                     | runtime locale                                               | Separators and symbol. Pass it on server-rendered pages.                            |
| `decimalScale`                                     | `number`                                     | currency's own                                               | Fraction digits accepted (TRY 2, JPY 0).                                            |
| `integerScale`                                     | `number`                                     | -                                                            | Integer digits accepted; unset is unbounded.                                        |
| `allowNegative`                                    | `boolean`                                    | `false`                                                      | Accept a minus sign.                                                                |
| `name` / `form`                                    | `string`                                     | -                                                            | Submits the amount canonically through a hidden input.                              |
| `size`                                             | `'small' \| 'base' \| 'large'`               | `'base'`                                                     | Forwarded to `Input`.                                                               |
| `invalid`                                          | `boolean`                                    | `false`                                                      | Inherited from `Field`; also `disabled`, `readOnly`, `required`, `id`.              |
| `searchable`                                       | `boolean`                                    | `true`                                                       | On `CurrencySelect`: search field above the list.                                   |
| `searchLabel` / `searchPlaceholder` / `emptyLabel` | `string`                                     | `'Search currencies'` / `'Search'` / `'No currencies found'` | On `CurrencySelect`: the search's strings.                                          |
| `currencies`                                       | `CurrencyOption[]`                           | -                                                            | On `CurrencySelect`: `{ code, label?, symbol?, icon? }`.                            |
| `open` / `defaultOpen` / `onOpenChange`            | `boolean` / `(open: boolean) => void`        | -                                                            | On `CurrencySelect`: the list's open state.                                         |
| `contentWidth`                                     | `SelectContentWidth`                         | `'content'`                                                  | On `CurrencySelect`: list width; `'content'` fits the rows rather than the trigger. |
| `classNames`                                       | `Partial<Record<CurrencyInputSlot, string>>` | -                                                            | Per-slot class overrides; `slotProps` for attributes.                               |
| `children`                                         | `ReactNode`                                  | -                                                            | The anatomy: `Field`, `Prefix` / `Suffix`, `CurrencySelect`, `Symbol`.              |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Behavior notes

- Formatting is Spar's mask, not this component: grouping, the decimal mark and
  the caret follow `locale`. While typing `1.234,` the trailing comma stays and
  the value is `1234`.
- Nothing is padded on blur — `1.234,5` stays `1.234,5`.
- Switching to a currency with fewer fraction digits cuts the amount to match
  (unless `decimalScale` pins the count).
- No `min` / `max`: validate the number in the form.

## Accessibility

- The picker's trigger shows only an icon and a code, so it is named
  `"Currency"` by default; pass `aria-label` to translate it.
- The list opens on its search field (the combobox); arrows and Enter pick a
  match. A search that matches nothing is announced as a status.
- `CurrencyInput.Symbol` is `aria-hidden`; name the field with `Field.Label` (or
  `aria-label` on `CurrencyInput.Field`).
- The field opens a numeric keyboard (`inputMode="decimal"`, `"numeric"` for a
  currency with no fraction) and turns autocomplete off.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/currency-input
- Source: `packages/react-spar/src/components/currency-input/`
- Mask engine: https://v2.takeoffui.com/headless/docs/Components/Input
