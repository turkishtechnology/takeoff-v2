import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { compareNames, countryName, countryOfValue, dialCodeOf, examplePlaceholder, fold, readPhoneText, textOfValue } from './phone';
import { PhoneInput, type PhoneCountry, type PhoneInputProps } from './index';

const COUNTRIES: PhoneCountry[] = [
  { code: 'TR', icon: <i data-testid="flag-tr" /> },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Deutschland' },
];

const Phone = (props: PhoneInputProps) => (
  <PhoneInput locale="en-US" countries={COUNTRIES} {...props}>
    <PhoneInput.Prefix>
      <PhoneInput.CountrySelect />
    </PhoneInput.Prefix>
    <PhoneInput.Field aria-label="Phone" />
  </PhoneInput>
);

const field = () => screen.getByLabelText('Phone');
const trigger = () => screen.getByRole('combobox', { name: 'Country code' });

const pick = async (user: ReturnType<typeof userEvent.setup>, name: RegExp) => {
  await user.click(trigger());
  await user.click(screen.getByRole('option', { name }));
};

describe('PhoneInput', () => {
  describe('rendering', () => {
    it('renders Input’s row with a tel field', () => {
      const { container } = render(<Phone />);
      const root = container.querySelector('.tk-phone-input');

      expect(root).toHaveClass('tk-input');
      expect(field()).toHaveClass('tk-phone-input-field');
      expect(field()).toHaveAttribute('type', 'tel');
      expect(field()).toHaveAttribute('inputmode', 'tel');
      expect(field()).toHaveAttribute('autocomplete', 'tel-national');
      expect(container.querySelector('.tk-phone-input-country-select')).toBeInTheDocument();
    });

    it('uses the country’s example number as the placeholder, unless one is given', () => {
      const { rerender } = render(<Phone />);
      expect(field()).toHaveAttribute('placeholder', examplePlaceholder('TR'));

      rerender(
        <PhoneInput>
          <PhoneInput.Field aria-label="Phone" placeholder="Your number" />
        </PhoneInput>,
      );
      expect(field()).toHaveAttribute('placeholder', 'Your number');
    });

    it('shows the trigger as icon and dial code, named for assistive tech', () => {
      render(<Phone />);

      expect(trigger()).toHaveTextContent('+90');
      expect(within(trigger()).getByTestId('flag-tr')).toBeInTheDocument();
    });

    it('lists icon, name and dial code, naming a country by the locale when it has no label', async () => {
      const user = userEvent.setup();
      render(<Phone locale="tr-TR" />);

      await user.click(trigger());

      expect(screen.getByRole('option', { name: /^Türkiye/ })).toHaveTextContent('Türkiye+90');
      expect(screen.getByRole('option', { name: /^Deutschland/ })).toHaveTextContent('Deutschland+49');
    });

    it('lists every region by default, sorted by the locale’s names', async () => {
      const user = userEvent.setup();
      render(
        <PhoneInput locale="tr-TR">
          <PhoneInput.CountrySelect searchable={false} />
        </PhoneInput>,
      );

      await user.click(trigger());
      const names = screen.getAllByRole('option').map(option => option.getAttribute('aria-label') ?? option.textContent ?? '');

      expect(names.length).toBeGreaterThan(200);
      expect(screen.getByRole('option', { name: /^Türkiye/ })).toBeInTheDocument();
      const labels = names.map(name => name.replace(/\+\d+$/, ''));
      expect([...labels].sort(compareNames('tr-TR'))).toEqual(labels);
    });

    it('renders the dial code for a fixed country, hidden from assistive tech', () => {
      const { container } = render(
        <PhoneInput country="DE">
          <PhoneInput.Prefix>
            <PhoneInput.DialCode />
          </PhoneInput.Prefix>
          <PhoneInput.Field aria-label="Phone" />
        </PhoneInput>,
      );

      const dialCode = container.querySelector('.tk-phone-input-dial-code');
      expect(dialCode).toHaveTextContent('+49');
      expect(dialCode).toHaveAttribute('aria-hidden', 'true');
    });

    it('lets DialCode, the trigger and the rows replace their content', async () => {
      const user = userEvent.setup();
      render(
        <PhoneInput locale="en-US" countries={COUNTRIES}>
          <PhoneInput.Prefix>
            <PhoneInput.DialCode>{({ code, dialCode }) => `${code} ${dialCode}`}</PhoneInput.DialCode>
            <PhoneInput.CountrySelect aria-label="Ülke kodu" trigger={option => `→ ${option?.label}`}>
              {option => `${option.code} · ${option.dialCode}`}
            </PhoneInput.CountrySelect>
          </PhoneInput.Prefix>
          <PhoneInput.Field aria-label="Phone" />
        </PhoneInput>,
      );

      expect(screen.getByText('TR +90')).toBeInTheDocument();
      const select = screen.getByRole('combobox', { name: 'Ülke kodu' });
      expect(select).toHaveTextContent('→ Türkiye');

      await user.click(select);
      expect(screen.getAllByRole('option')[1]).toHaveTextContent('US · +1');
    });

    it('keeps the default name when the trigger label is blank, and shows the code of an unlisted country', () => {
      render(
        <PhoneInput country="GB" countries={COUNTRIES}>
          <PhoneInput.CountrySelect aria-label="  " />
        </PhoneInput>,
      );

      expect(trigger()).toHaveTextContent('GB');
    });
  });

  describe('value', () => {
    it('formats as the user types and reports E.164 with the details', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Phone onValueChange={onValueChange} />);

      await user.type(field(), '5321234567');

      expect(field()).toHaveValue('532 123 45 67');
      expect(onValueChange).toHaveBeenLastCalledWith('+905321234567', {
        national: '5321234567',
        formatted: '532 123 45 67',
        isValid: true,
        country: 'TR',
      });
    });

    it('reports a partial number as not valid yet', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Phone onValueChange={onValueChange} />);

      await user.type(field(), '532');

      expect(onValueChange).toHaveBeenLastCalledWith('+90532', expect.objectContaining({ national: '532', isValid: false }));
    });

    it('keeps a typed trunk prefix in the text but not in the number', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Phone onValueChange={onValueChange} />);

      await user.type(field(), '05321234567');

      expect(field()).toHaveValue('0532 123 45 67');
      expect(onValueChange).toHaveBeenLastCalledWith('+905321234567', expect.objectContaining({ national: '5321234567' }));
    });

    it('refuses letters and digits past the longest number', async () => {
      const user = userEvent.setup();
      render(<Phone />);

      await user.type(field(), '532abc');
      expect(field()).toHaveValue('532');

      // TR's longest numbers have 13 national digits.
      await user.type(field(), '12345679999');
      expect(field()).toHaveValue('5321234567999');
    });

    it('collapses the country’s own +code into the national format', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<Phone onCountryChange={onCountryChange} />);

      await user.click(field());
      await user.paste('+90 532 123 45 67');

      expect(field()).toHaveValue('532 123 45 67');
      expect(onCountryChange).not.toHaveBeenCalled();
    });

    it('moves to the listed country an international number names', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      const onValueChange = vi.fn();
      render(<Phone onCountryChange={onCountryChange} onValueChange={onValueChange} />);

      await user.click(field());
      await user.paste('+1 201 555 0123');

      expect(onCountryChange).toHaveBeenLastCalledWith('US');
      expect(trigger()).toHaveTextContent('+1');
      expect(field()).toHaveValue('(201) 555-0123');
      expect(onValueChange).toHaveBeenLastCalledWith('+12015550123', expect.objectContaining({ country: 'US', isValid: true }));
    });

    it('stays on a NANP region for a +1 number', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<Phone defaultCountry="CA" onCountryChange={onCountryChange} />);

      await user.click(field());
      await user.paste('+1 201 555 0123');

      expect(onCountryChange).not.toHaveBeenCalled();
      expect(field()).toHaveValue('(201) 555-0123');
    });

    it('keeps an unlisted country’s number international', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      const onValueChange = vi.fn();
      render(<Phone onCountryChange={onCountryChange} onValueChange={onValueChange} />);

      await user.click(field());
      await user.paste('+44 7400 123456');

      expect(onCountryChange).not.toHaveBeenCalled();
      expect(field()).toHaveValue('+44 7400 123456');
      expect(onValueChange).toHaveBeenLastCalledWith('+447400123456', expect.objectContaining({ country: 'TR' }));
    });

    it('shows a seeded number in national format', () => {
      render(<Phone defaultValue="+905321234567" />);

      expect(field()).toHaveValue('532 123 45 67');
    });

    it('moves to the country a seeded number names', () => {
      const onCountryChange = vi.fn();
      render(<Phone defaultValue="+4915123456789" onCountryChange={onCountryChange} />);

      expect(trigger()).toHaveTextContent('+49');
      expect(onCountryChange).toHaveBeenCalledWith('DE');
      expect(field()).toHaveValue(formatNationalOf('+4915123456789', 'DE'));
    });

    it('follows a controlled value set from outside', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [phone, setPhone] = useState('+905321234567');
        return (
          <>
            <Phone value={phone} onValueChange={setPhone} />
            <button type="button" onClick={() => setPhone('+905551112233')}>
              Preset
            </button>
            <output>{phone}</output>
          </>
        );
      };
      render(<Controlled />);

      expect(field()).toHaveValue('532 123 45 67');
      await user.click(screen.getByRole('button', { name: 'Preset' }));
      expect(field()).toHaveValue('555 111 22 33');

      await user.clear(field());
      await user.type(field(), '212');
      expect(screen.getByRole('status')).toHaveTextContent('+90212');
    });

    it('works through Input.ClearButton', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <PhoneInput defaultValue="+905321234567" onValueChange={onValueChange}>
          <PhoneInput.Field aria-label="Phone" />
          <PhoneInput.ClearButton />
        </PhoneInput>,
      );

      await user.click(screen.getByRole('button'));

      expect(field()).toHaveValue('');
      expect(onValueChange).toHaveBeenLastCalledWith('', expect.objectContaining({ national: '', isValid: false }));
    });
  });

  describe('country', () => {
    it('clears the number on a pick and hands focus to the field, as Core does', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      const onValueChange = vi.fn();
      render(<Phone defaultValue="+905321234567" onCountryChange={onCountryChange} onValueChange={onValueChange} />);

      await pick(user, /^Deutschland/);

      expect(onCountryChange).toHaveBeenLastCalledWith('DE');
      expect(onValueChange).toHaveBeenLastCalledWith('', { national: '', formatted: '', isValid: false, country: 'DE' });
      expect(field()).toHaveValue('');
      expect(field()).toHaveFocus();
      expect(field()).toHaveAttribute('placeholder', examplePlaceholder('DE'));
    });

    it('leaves an empty number alone and keeps the number on the same country', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { unmount } = render(<Phone onValueChange={onValueChange} />);

      await pick(user, /^Canada/);
      unmount();

      render(<Phone defaultValue="+905321234567" onValueChange={onValueChange} />);
      await pick(user, /^Türkiye/);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(field()).toHaveValue('532 123 45 67');
    });

    it('returns focus to the trigger when the list closes without a pick', async () => {
      const user = userEvent.setup();
      render(<Phone />);

      await user.click(trigger());
      await user.keyboard('{Escape}');

      expect(trigger()).toHaveFocus();
    });

    it('stays on a controlled country until the parent moves it', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<Phone country="US" onCountryChange={onCountryChange} />);

      await pick(user, /^Canada/);

      expect(onCountryChange).toHaveBeenLastCalledWith('CA');
      expect(trigger()).toHaveTextContent('+1');
      await user.type(field(), '2015550123');
      expect(field()).toHaveValue('(201) 555-0123');
    });
  });

  describe('search', () => {
    const searchField = () => screen.getByRole('combobox', { name: 'Search countries' });
    const optionNames = () => screen.getAllByRole('option').map(option => option.textContent);

    it('opens on the search field, as in Core’s design', async () => {
      const user = userEvent.setup();
      render(<Phone />);

      await user.click(trigger());

      expect(searchField()).toHaveFocus();
      expect(searchField()).toHaveAttribute('placeholder', 'Search');
    });

    it('filters by name, ISO code and dial code, ignoring case and accents', async () => {
      const user = userEvent.setup();
      render(<Phone />);
      await user.click(trigger());

      await user.keyboard('turkiye');
      expect(optionNames()).toEqual(['Türkiye+90']);

      await user.clear(searchField());
      await user.keyboard('de');
      expect(optionNames()).toEqual(['Deutschland+49']);

      await user.clear(searchField());
      await user.keyboard('+1');
      expect(optionNames()).toEqual(['United States+1', 'Canada+1']);

      await user.clear(searchField());
      await user.keyboard('49');
      expect(optionNames()).toEqual(['Deutschland+49']);
    });

    it('treats the four Turkish i’s as one letter', async () => {
      const user = userEvent.setup();
      render(<Phone locale="tr-TR" />);
      await user.click(trigger());

      for (const query of ['TÜRKIYE', 'türkiye', 'TÜRKİYE', 'türkıye']) {
        await user.clear(searchField());
        await user.keyboard(query);
        expect(optionNames()).toEqual(['Türkiye+90']);
      }
    });

    it('picks the first match with Enter', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<Phone onCountryChange={onCountryChange} />);
      await user.click(trigger());

      await user.keyboard('canada{Enter}');

      expect(onCountryChange).toHaveBeenLastCalledWith('CA');
      expect(field()).toHaveFocus();
    });

    it('says so when nothing matches, and starts over on the next open', async () => {
      const user = userEvent.setup();
      render(<Phone />);
      await user.click(trigger());

      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('No countries found');

      await user.keyboard('{Escape}');
      await user.click(trigger());
      expect(searchField()).toHaveValue('');
      expect(screen.getAllByRole('option')).toHaveLength(COUNTRIES.length);
    });

    it('takes translated strings, keeping defaults for blank ones', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <PhoneInput countries={COUNTRIES}>
          <PhoneInput.CountrySelect searchLabel="Ülke ara" searchPlaceholder="Ara" emptyLabel="Sonuç yok" />
        </PhoneInput>,
      );
      await user.click(trigger());

      expect(screen.getByRole('combobox', { name: 'Ülke ara' })).toHaveAttribute('placeholder', 'Ara');
      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('Sonuç yok');
      unmount();

      render(
        <PhoneInput countries={COUNTRIES}>
          <PhoneInput.CountrySelect searchLabel=" " searchPlaceholder="" emptyLabel=" " />
        </PhoneInput>,
      );
      await user.click(trigger());

      expect(searchField()).toHaveAttribute('placeholder', 'Search');
      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('No countries found');
    });

    it('drops the field on searchable={false}, leaving typeahead', async () => {
      const user = userEvent.setup();
      render(
        <PhoneInput countries={COUNTRIES}>
          <PhoneInput.CountrySelect searchable={false} />
        </PhoneInput>,
      );
      await user.click(trigger());

      expect(screen.queryByRole('combobox', { name: 'Search countries' })).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toHaveFocus();
    });

    it('shows Empty for an empty country list', async () => {
      const user = userEvent.setup();
      render(
        <PhoneInput countries={[]}>
          <PhoneInput.CountrySelect searchable={false} />
        </PhoneInput>,
      );
      await user.click(trigger());

      expect(screen.getByRole('status')).toHaveTextContent('No countries found');
    });
  });

  describe('forms and state', () => {
    it('submits E.164 under name and the country under its own name', async () => {
      const user = userEvent.setup();
      const { container, rerender } = render(<Phone />);
      expect(container.querySelector('input[type="hidden"][name="phone"]')).toBeNull();

      rerender(
        <PhoneInput name="phone" form="signup" countries={COUNTRIES}>
          <PhoneInput.CountrySelect name="country" />
          <PhoneInput.Field aria-label="Phone" />
        </PhoneInput>,
      );
      await user.type(field(), '5321234567');

      const hidden = container.querySelector('input[type="hidden"][name="phone"]');
      expect(hidden).toHaveValue('+905321234567');
      expect(hidden).toHaveAttribute('form', 'signup');
      expect(container.querySelector('input[type="hidden"][name="country"]')).toHaveValue('TR');
    });

    it('cascades disabled and readOnly from the root to the field and the picker', () => {
      const { rerender } = render(<Phone disabled />);

      expect(field()).toBeDisabled();
      expect(trigger()).toBeDisabled();

      rerender(<Phone readOnly />);
      expect(field()).toHaveAttribute('readonly');
      expect(trigger()).toHaveAttribute('aria-readonly', 'true');
    });

    it('lets the picker be disabled on its own', () => {
      render(
        <PhoneInput countries={COUNTRIES}>
          <PhoneInput.CountrySelect disabled />
          <PhoneInput.Field aria-label="Phone" />
        </PhoneInput>,
      );

      expect(trigger()).toBeDisabled();
      expect(field()).toBeEnabled();
    });

    it('inherits disabled and invalid from a surrounding Field', () => {
      const { container } = render(
        <Field disabled invalid>
          <Field.Label>Phone</Field.Label>
          <PhoneInput countries={COUNTRIES}>
            <PhoneInput.CountrySelect />
            <PhoneInput.Field />
          </PhoneInput>
        </Field>,
      );

      expect(screen.getByRole('textbox', { name: 'Phone' })).toBeDisabled();
      expect(trigger()).toBeDisabled();
      expect(container.querySelector('.tk-phone-input')).toHaveAttribute('data-invalid');
    });

    it('takes theme classNames from the provider', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ PhoneInputDialCode: { classNames: { root: 'brand-dial' } } }}>
          <PhoneInput>
            <PhoneInput.DialCode />
          </PhoneInput>
        </TakeoffSparProvider>,
      );

      expect(container.querySelector('.tk-phone-input-dial-code')).toHaveClass('brand-dial');
    });

    it('raises the safe-context error for a part used outside its root', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<PhoneInput.Field />)).toThrow(/PhoneInputProvider/);

      error.mockRestore();
    });

    it('has no axe violations', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Phone</Field.Label>
          <PhoneInput defaultValue="+905321234567" countries={COUNTRIES}>
            <PhoneInput.Prefix>
              <PhoneInput.CountrySelect />
            </PhoneInput.Prefix>
            <PhoneInput.Field />
          </PhoneInput>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('phone helpers', () => {
    it('reads dial codes, and nothing for an unknown code', () => {
      expect(dialCodeOf('TR')).toBe('+90');
      expect(dialCodeOf('XX')).toBe('');
    });

    it('names countries by locale, falling back to the code', () => {
      expect(countryName('DE', 'tr-TR')).toBe('Almanya');
      expect(countryName('DE', undefined)).toEqual(expect.any(String));
      expect(countryName('DE', '!!')).toBe('DE');
    });

    it('falls back to the runtime collation for an unusable locale', () => {
      expect(['b', 'a'].sort(compareNames('!!'))).toEqual(['a', 'b']);
    });

    it('spells stored values for the field', () => {
      expect(textOfValue('', 'TR')).toBe('');
      expect(textOfValue('+905321234567', 'TR')).toBe('532 123 45 67');
      expect(textOfValue('+447400123456', 'TR')).toBe('+44 7400 123456');
    });

    it('names another country only for another calling code', () => {
      expect(countryOfValue('', 'TR')).toBeUndefined();
      expect(countryOfValue('+905321234567', 'TR')).toBeUndefined();
      expect(countryOfValue('+12015550123', 'CA')).toBeUndefined();
      expect(countryOfValue('+12015550123', 'TR')).toBe('US');
    });

    it('reads typed text', () => {
      expect(readPhoneText('', 'TR')).toMatchObject({ value: '', e164: '', national: '', isValid: false, international: false, tooLong: false });
      expect(readPhoneText('+90', 'TR')).toMatchObject({ e164: '', international: true, callingCode: '90' });
      // No country to bound an international number by until its digits name one.
      expect(readPhoneText('+4', 'TR')).toMatchObject({ international: true, country: undefined, tooLong: false });
    });

    it('folds case, accents and the Turkish i', () => {
      expect(fold('TÜRKİYE', 'tr-TR')).toBe('turkiye');
      expect(fold('Türkıye', undefined)).toBe('turkiye');
    });
  });
});

/** The national text a stored number shows as. */
function formatNationalOf(value: string, country: 'DE'): string {
  return textOfValue(value, country);
}
