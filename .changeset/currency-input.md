---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `CurrencyInput` — an amount field with a currency. The amount is grouped as
the user types by the Input `number` mask, following `locale` (`1.234,56` in
tr-TR), and the value is a plain `number` (`undefined` when empty).

```tsx
<CurrencyInput value={amount} onValueChange={setAmount} locale="tr-TR">
  <CurrencyInput.Field />
  <CurrencyInput.Suffix>
    <CurrencyInput.CurrencySelect currencies={CURRENCIES} />
  </CurrencyInput.Suffix>
</CurrencyInput>
```

- `CurrencyInput.CurrencySelect` opens on a search field (code, name or symbol;
  case- and accent-insensitive), shows each currency's icon, symbol and name,
  and binds to `currency` / `onCurrencyChange` on the root.
- `CurrencyInput.Symbol` shows the locale's symbol for a fixed currency.
- Fraction digits follow the currency (TRY 2, JPY 0); `decimalScale`,
  `integerScale` and `allowNegative` adjust them.
- `name` submits the amount canonically (`1234.5`) through a hidden input.
