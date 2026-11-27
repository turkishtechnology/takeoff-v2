import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { PhoneInputDialCodeBase } from './base';
import { usePhoneInputOwnContext } from './context';
import type { PhoneInputDialCodeProps } from './types';

/**
 * The active country's dial code, for a field whose country is fixed. Hidden
 * from assistive tech, as `CurrencyInput.Symbol` is: it is decoration next to a
 * field a label already names — put the country in the label when it matters.
 */
export const PhoneInputDialCode = (props: PhoneInputDialCodeProps) => {
  const theme = useComponentTheme('PhoneInputDialCode');
  const { country, dialCode } = usePhoneInputOwnContext('PhoneInput.DialCode');
  const { rootAttrs, rest } = composeRootAttrs(PhoneInputDialCodeBase, props, theme);
  const { children, ...spanProps } = rest;

  return (
    <span aria-hidden="true" {...spanProps} {...rootAttrs}>
      {children ? children({ code: country, dialCode }) : dialCode}
    </span>
  );
};

PhoneInputDialCode.displayName = 'PhoneInput.DialCode';
