---
name: takeoff-phone-input
description:
  'Build a phone number field with a country picker — the PhoneInput from
  @takeoff-ui/react-spar (Takeoff UI / Spar React): a number formatted as you
  type by libphonenumber-js (532 123 45 67 in Türkiye), a searchable country
  list or a fixed dial code, and an E.164 string (+905321234567) as the value.
  Trigger contexts: phone field, mobile number, telephone input, country code
  selector, dial code, contact number, sign-up / checkout phone. Use this skill
  WHENEVER building, adding, importing, styling, or fixing a phone number field
  in a React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# PhoneInput — @takeoff-ui/react-spar

`PhoneInput` is a phone number field with a country: the country picker in the
prefix, the number on the right. libphonenumber-js formats and validates as the
user types; the value your code gets is an E.164 string.

**When to use:** Any phone number — sign-up, contact details, checkout, two-
factor enrolment. Not this — use `takeoff-input` with a `mask` for other
fixed-shape codes (a card number, an IBAN).

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import {
  Field,
  PhoneInput,
  type PhoneCountry,
  type PhoneInputValueDetails,
} from '@takeoff-ui/react-spar';
```

## Compound parts

- `PhoneInput.Field` — the number: an `Input.Field` (`type="tel"`) with a
  libphonenumber-js mask resolver. Takes `placeholder` (defaults to the
  country's example mobile number), `aria-label` and the usual input attributes;
  `mask`, `value` and `type` belong to the root.
- `PhoneInput.CountrySelect` — the country picker (a `Select`). Lists every
  region by default (names from `Intl.DisplayNames` in `locale`, sorted); opens
  on a search field (name, ISO code, dial code; case- and accent-insensitive)
  unless `searchable={false}`; `trigger` / `children` replace its content; its
  own `name` submits the ISO code.
- `PhoneInput.DialCode` — the active country's dial code, for a fixed country.
- `PhoneInput.Prefix` / `Suffix` / `ClearButton` — `Input`'s own parts.

## Basic usage

```tsx
const [phone, setPhone] = useState(''); // '+905321234567'

<Field>
  <Field.Label>Mobile number</Field.Label>
  <PhoneInput value={phone} onValueChange={setPhone} locale="tr-TR">
    <PhoneInput.Prefix>
      <PhoneInput.CountrySelect />
    </PhoneInput.Prefix>
    <PhoneInput.Field />
  </PhoneInput>
</Field>;
```

## Examples

### A short list with flags

```tsx
// `icon` is any node; the package ships no flag set.
const COUNTRIES: PhoneCountry[] = [
  { code: 'TR', icon: <FlagTR /> },
  { code: 'DE', icon: <FlagDE /> },
  { code: 'GB', icon: <FlagGB />, label: 'UK' },
];

<PhoneInput countries={COUNTRIES} defaultCountry="DE">
  <PhoneInput.Prefix>
    <PhoneInput.CountrySelect searchable={false} />
  </PhoneInput.Prefix>
  <PhoneInput.Field aria-label="Phone" />
</PhoneInput>;
```

### A fixed country

```tsx
<PhoneInput country="TR">
  <PhoneInput.Prefix>
    <PhoneInput.DialCode />
  </PhoneInput.Prefix>
  <PhoneInput.Field aria-label="Phone (Türkiye)" />
  <PhoneInput.ClearButton />
</PhoneInput>
```

### Validation and form submission

```tsx
// Submits phone=+905321234567 and country=TR. `isValid` informs; you decide
// when to show the error.
const [valid, setValid] = useState(false);
const [touched, setTouched] = useState(false);

<Field invalid={touched && !valid} required>
  <Field.Label>Contact number</Field.Label>
  <PhoneInput
    name="phone"
    onValueChange={(_, details) => setValid(details.isValid)}
  >
    <PhoneInput.Prefix>
      <PhoneInput.CountrySelect name="country" />
    </PhoneInput.Prefix>
    <PhoneInput.Field onBlur={() => setTouched(true)} />
  </PhoneInput>
  <Field.ErrorMessage>Enter a valid phone number.</Field.ErrorMessage>
</Field>;
```

### Translated picker strings

```tsx
<PhoneInput.CountrySelect
  aria-label="Ülke kodu"
  searchLabel="Ülke ara"
  searchPlaceholder="Ara"
  emptyLabel="Ülke bulunamadı"
/>
```

`usePhoneInputContext()` gives `country`, `countries` and `pickCountry` for a
picker that is not a `Select`.

## Key props

| Prop                                               | Type                                                       | Default                                                    | Notes                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `value`                                            | `string`                                                   | -                                                          | Controlled number in E.164 (`'+905321234567'`); `''` is empty.          |
| `defaultValue`                                     | `string`                                                   | -                                                          | Uncontrolled initial number, E.164.                                     |
| `onValueChange`                                    | `(value: string, details: PhoneInputValueDetails) => void` | -                                                          | `details` is `{ national, formatted, isValid, country }`.               |
| `country`                                          | `PhoneCountryCode`                                         | -                                                          | Controlled ISO 3166-1 alpha-2 code.                                     |
| `defaultCountry`                                   | `PhoneCountryCode`                                         | `'TR'`                                                     | Uncontrolled initial country.                                           |
| `onCountryChange`                                  | `(country: PhoneCountryCode) => void`                      | -                                                          | Fires on a pick, a typed `+<code>`, or a `value` from another country.  |
| `countries`                                        | `PhoneCountry[]`                                           | every region                                               | `{ code, label?, icon? }`; keeps your order. Default is sorted by name. |
| `locale`                                           | `string`                                                   | runtime locale                                             | Country names, their order and search folding.                          |
| `name` / `form`                                    | `string`                                                   | -                                                          | Submits the E.164 number through a hidden input.                        |
| `size`                                             | `'small' \| 'base' \| 'large'`                             | `'base'`                                                   | Forwarded to `Input`.                                                   |
| `invalid`                                          | `boolean`                                                  | `false`                                                    | Inherited from `Field`; also `disabled`, `readOnly`, `required`, `id`.  |
| `searchable`                                       | `boolean`                                                  | `true`                                                     | On `CountrySelect`: search field above the list.                        |
| `searchLabel` / `searchPlaceholder` / `emptyLabel` | `string`                                                   | `'Search countries'` / `'Search'` / `'No countries found'` | On `CountrySelect`: the search's strings.                               |
| `aria-label`                                       | `string`                                                   | `'Country code'`                                           | On `CountrySelect`: the trigger's name.                                 |
| `open` / `defaultOpen` / `onOpenChange`            | `boolean` / `(open: boolean) => void`                      | -                                                          | On `CountrySelect`: the list's open state.                              |
| `contentWidth`                                     | `SelectContentWidth`                                       | `'content'`                                                | On `CountrySelect`: list width.                                         |
| `classNames`                                       | `Partial<Record<PhoneInputSlot, string>>`                  | -                                                          | Per-slot class overrides; `slotProps` for attributes.                   |
| `children`                                         | `ReactNode`                                                | -                                                          | The anatomy: `Field`, `Prefix` / `Suffix`, `CountrySelect`, `DialCode`. |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Behavior notes

- Formatting and validation are libphonenumber-js's (`min` metadata); Spar's
  mask owns the caret. Digits past the country's longest number are refused.
- A trunk prefix stays as typed (`0532 123 45 67`) but not in the value
  (`+905321234567`).
- Typing or pasting `+<code>…` collapses the country's own code, or moves the
  picker to another listed country. `+1` keeps a NANP field on its region.
- Picking a country clears the number and focuses the field (Core's design).
- The field never sets `invalid` itself; use `details.isValid`.

## Accessibility

- The picker's trigger shows only an icon and a dial code, so it is named
  `"Country code"` by default; pass `aria-label` to translate it.
- Inside a `Field`, the label names the number field; the picker keeps its own
  name and follows the row's `disabled` / `readOnly`.
- The list opens on its search field (the combobox); arrows and Enter pick a
  match. A search that matches nothing is announced as a status.
- `PhoneInput.DialCode` is `aria-hidden`; put the country in the label when it
  matters.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/phone-input
- Source: `packages/react-spar/src/components/phone-input/`
- Formatting library: https://github.com/catamphetamine/libphonenumber-js
