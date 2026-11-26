/** The currency an uncontrolled field starts on when `defaultCurrency` is not given. */
export const DEFAULT_CURRENCY = 'TRY';

/** Accessible name of `CurrencyInput.CurrencySelect`'s trigger, which shows only an icon and a code. */
export const DEFAULT_CURRENCY_SELECT_LABEL = 'Currency';

/** Accessible name of the currency list's search field. */
export const DEFAULT_SEARCH_LABEL = 'Search currencies';

/** Placeholder of the currency list's search field. */
export const DEFAULT_SEARCH_PLACEHOLDER = 'Search';

/** What the currency list says once a search matches nothing. */
export const DEFAULT_EMPTY_LABEL = 'No currencies found';

/**
 * Fraction digits used when `Intl` cannot describe the currency (an unknown
 * code throws a `RangeError`). Two is what most ISO 4217 currencies use.
 */
export const FALLBACK_DECIMAL_SCALE = 2;
