---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
'@turkish-technology/spar': patch
---

Add `PhoneInput` — a phone number field with a country picker. The number is
formatted as the user types by libphonenumber-js (`532 123 45 67` in Türkiye),
and the value is an E.164 string (`+905321234567`).

```tsx
<PhoneInput value={phone} onValueChange={setPhone} locale="tr-TR">
  <PhoneInput.Prefix>
    <PhoneInput.CountrySelect />
  </PhoneInput.Prefix>
  <PhoneInput.Field />
</PhoneInput>
```

- `PhoneInput.CountrySelect` lists every region by default, named in `locale`,
  opens on a search field (name, ISO code or dial code; case- and
  accent-insensitive), and binds to `country` / `onCountryChange` on the root.
  Picking a country clears the number and focuses the field.
- `PhoneInput.DialCode` shows the dial code for a fixed country.
- `onValueChange` also passes `{ national, formatted, isValid, country }`.
- Typing or pasting `+<code>…` moves the picker to that country.
- `name` submits the E.164 number through a hidden input.
- `libphonenumber-js` (MIT, `min` metadata, about 33 KB gzipped) is a new
  dependency of `@takeoff-ui/react-spar`; only bundles that import `PhoneInput`
  include it.

Spar: a `Select` inside an `Input` row (an affix picker) no longer claims the
surrounding `Field`'s control ID, label and messages — the row's field owns
them. It keeps its own IDs and follows the row's `disabled` / `readOnly`.
