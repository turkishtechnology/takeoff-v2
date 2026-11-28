import { AsYouType, Metadata, getCountries, getCountryCallingCode, getExampleNumber, type CountryCode } from 'libphonenumber-js/min';
import examples from 'libphonenumber-js/mobile/examples';

/**
 * Everything PhoneInput knows about phone numbers comes from libphonenumber-js
 * (`min` metadata). This module only adapts it to the field: nothing here
 * formats a number by hand.
 */

/** What one edit of the field names. */
export interface PhoneText {
  /** The text as libphonenumber-js formats it while typing. */
  value: string;
  /** E.164 (`+905321234567`), or `''` while no digit names a number. */
  e164: string;
  /** Digits after the country calling code, without a trunk prefix. */
  national: string;
  /** Valid for its country per the metadata's lengths and leading digits. */
  isValid: boolean;
  /** The text starts with `+`. */
  international: boolean;
  /** Calling code the text names, without `+`. */
  callingCode: string | undefined;
  /** Country an international text names, once the digits tell. */
  country: CountryCode | undefined;
  /** More digits than any number of that country has. */
  tooLong: boolean;
}

/**
 * The most national digits any number of `country` has (TR 13, US 10), from
 * the metadata's possible lengths. Unbounded while the country is unknown.
 */
const maxLengthOf = (country: CountryCode | undefined): number => {
  if (!country) return Number.POSITIVE_INFINITY;
  const metadata = new Metadata();
  metadata.selectNumberingPlan(country);
  return Math.max(...(metadata.numberingPlan?.possibleLengths() ?? [Number.POSITIVE_INFINITY]));
};

/** Reads `text` as typed into a field set to `country`. */
export const readPhoneText = (text: string, country: CountryCode): PhoneText => {
  // AsYouType gives up on a stray letter, so the field hands it digits and a
  // leading `+` only — which is also how a letter is refused.
  const international = text.trimStart().startsWith('+');
  const formatter = new AsYouType(country);
  const value = formatter.input(`${international ? '+' : ''}${text.replace(/\D/g, '')}`);
  const number = formatter.getNumber();
  const e164 = number?.number ?? '';
  const national = number?.nationalNumber ?? '';
  return {
    value,
    e164,
    national,
    isValid: formatter.isValid(),
    international,
    callingCode: formatter.getCallingCode(),
    country: formatter.getCountry(),
    tooLong: national.length > maxLengthOf(international ? formatter.getCountry() : country),
  };
};

/** The national digits of `country` as the field shows them. */
export const formatNational = (national: string, country: CountryCode): string => new AsYouType(country).input(national);

/** `+90` for `TR`; `''` for a code the metadata does not know. */
export const dialCodeOf = (country: string): string => {
  try {
    return `+${getCountryCallingCode(country as CountryCode)}`;
  } catch {
    return '';
  }
};

/**
 * The field text for a stored E.164 value: national format when it belongs to
 * `country`, international format otherwise.
 */
export const textOfValue = (value: string, country: CountryCode): string => {
  if (!value) return '';
  const dialCode = dialCodeOf(country);
  if (dialCode && value.startsWith(dialCode)) return formatNational(value.slice(dialCode.length), country);
  return new AsYouType().input(value);
};

/**
 * The country a stored E.164 value names, when it is not `country`'s: a value
 * with `country`'s own calling code keeps `country` (`+1` is shared by 25
 * regions, and an outside value must not move a CA field to US).
 */
export const countryOfValue = (value: string, country: CountryCode): CountryCode | undefined => {
  if (!value.startsWith('+') || value.startsWith(dialCodeOf(country))) return undefined;
  const formatter = new AsYouType();
  formatter.input(value);
  return formatter.getCountry();
};

/** Country name in `locale`, from `Intl.DisplayNames`; the code when it has none. */
export const countryName = (country: string, locale: string | undefined): string => {
  try {
    return new Intl.DisplayNames(locale ? [locale] : undefined, { type: 'region' }).of(country) ?? country;
  } catch {
    return country;
  }
};

/** Every region the metadata knows. */
export const allCountries = (): CountryCode[] => getCountries();

/** Orders names the way `locale` reads them; the runtime's order for an unusable locale. */
export const compareNames = (locale: string | undefined): ((a: string, b: string) => number) => {
  try {
    return new Intl.Collator(locale).compare;
  } catch {
    return new Intl.Collator().compare;
  }
};

/** An example mobile number in national format, for the placeholder. */
export const examplePlaceholder = (country: CountryCode): string | undefined => getExampleNumber(country, examples)?.formatNational();

/**
 * Folds case and accents the way a person searching expects: `turkiye`,
 * `TÜRKİYE` and `Türkiye` find each other, and the four Turkish i's (`I İ ı i`)
 * fold together whatever the locale lower-cases them to.
 */
export const fold = (text: string, locale: string | undefined): string =>
  text
    .toLocaleLowerCase(locale)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ı/g, 'i');
