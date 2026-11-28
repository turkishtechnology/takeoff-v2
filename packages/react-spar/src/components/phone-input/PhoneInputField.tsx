import { useMemo, useState } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Input, type MaskResolver } from '../input';

import { PhoneInputFieldBase } from './base';
import { usePhoneInputOwnContext } from './context';
import { dialCodeOf, examplePlaceholder, formatNational, readPhoneText, textOfValue } from './phone';
import type { PhoneInputFieldProps } from './types';

/**
 * The number field — `Input.Field` with a libphonenumber-js mask resolver.
 *
 * The resolver formats as the user types and Spar's mask owns the caret; this
 * part bridges the field's text and the root's E.164 value. The text is kept
 * here rather than derived from the value on every render: `0532` and `532`
 * name the same number, and re-deriving would eat the trunk `0` the user just
 * typed. It is re-derived only when the value or the country changes from
 * outside (a reset, a preset, a picked country).
 */
export const PhoneInputField = (props: PhoneInputFieldProps) => {
  const theme = useComponentTheme('PhoneInputField');
  const { value, setValue, country, setCountry, countries } = usePhoneInputOwnContext('PhoneInput.Field');

  const { rootAttrs, rest } = composeRootAttrs(PhoneInputFieldBase, props, theme);
  const { placeholder, ...fieldProps } = rest;

  const [text, setText] = useState(() => textOfValue(value, country));
  const [synced, setSynced] = useState({ value, country });
  if (synced.value !== value || synced.country !== country) {
    setSynced({ value, country });
    setText(textOfValue(value, country));
  }

  // A digit past the longest number the country has is refused, as Core's
  // pattern refused it; everything else is libphonenumber-js's formatting.
  const mask = useMemo<MaskResolver>(
    () => (raw, context) => {
      const read = readPhoneText(raw, country);
      if (read.tooLong) return { value: context.previousValue };
      return { value: read.value, iso: read.e164 || undefined, completed: read.isValid };
    },
    [country],
  );

  const handleValueChange = (next: string) => {
    const read = readPhoneText(next, country);
    let nextCountry = country;
    let nextText = next;

    // `+<code>…` typed or pasted: with this country's own code the prefix
    // collapses into the national format; with a listed country's, the field
    // moves to it. `+1` stays on the current NANP region — the digits alone
    // would otherwise bounce a CA field to US while the area code is typed.
    if (read.international && read.national) {
      if (`+${read.callingCode}` === dialCodeOf(country)) {
        nextText = formatNational(read.national, country);
      } else if (read.country && countries.some(option => option.code === read.country)) {
        nextCountry = read.country;
        nextText = formatNational(read.national, read.country);
      }
    }

    setText(nextText);
    setSynced({ value: read.e164, country: nextCountry });
    if (nextCountry !== country) setCountry(nextCountry);
    if (read.e164 !== value || nextCountry !== country) {
      setValue(read.e164, { national: read.national, formatted: nextText, isValid: read.isValid, country: nextCountry });
    }
  };

  return (
    <Input.Field
      placeholder={placeholder ?? examplePlaceholder(country)}
      {...fieldProps}
      {...rootAttrs}
      // After rootAttrs on purpose: these are the field's value pipeline, so
      // `slotProps.root` may restyle the element but must not detach it.
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      mask={mask}
      value={text}
      onValueChange={handleValueChange}
    />
  );
};

PhoneInputField.displayName = 'PhoneInput.Field';
