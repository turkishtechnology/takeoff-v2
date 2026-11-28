import type { PhoneCountryCode } from './types';

/** The country an uncontrolled field starts on when `defaultCountry` is not given (Core's default). */
export const DEFAULT_COUNTRY: PhoneCountryCode = 'TR';

/** Accessible name of `PhoneInput.CountrySelect`'s trigger, which shows only an icon and a dial code. */
export const DEFAULT_COUNTRY_SELECT_LABEL = 'Country code';

/** Accessible name of the country list's search field. */
export const DEFAULT_SEARCH_LABEL = 'Search countries';

/** Placeholder of the country list's search field. */
export const DEFAULT_SEARCH_PLACEHOLDER = 'Search';

/** What the country list says once a search matches nothing. */
export const DEFAULT_EMPTY_LABEL = 'No countries found';
