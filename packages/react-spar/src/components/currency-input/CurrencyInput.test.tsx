import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { fromMaskMeta, getCurrencyMeta, toMaskText, truncateToScale } from './intl';
import { CurrencyInput, type CurrencyInputProps, type CurrencyOption } from './index';

const CURRENCIES: CurrencyOption[] = [
  { code: 'TRY', label: 'Türk Lirası', icon: <i data-testid="flag-tr" /> },
  { code: 'USD', label: 'US Dollar', symbol: 'US$' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'EUR' },
];

const Amount = (props: CurrencyInputProps) => (
  <CurrencyInput locale="tr-TR" {...props}>
    <CurrencyInput.Field aria-label="Amount" />
    <CurrencyInput.Suffix>
      <CurrencyInput.CurrencySelect currencies={CURRENCIES} />
    </CurrencyInput.Suffix>
  </CurrencyInput>
);

const field = () => screen.getByLabelText('Amount');

const pick = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name }));
};

describe('CurrencyInput', () => {
  describe('rendering', () => {
    it('renders Input’s row with the currency hooks on it', () => {
      const { container } = render(<Amount defaultCurrency="USD" />);
      const root = container.querySelector('.tk-currency-input');

      expect(root).toHaveClass('tk-input');
      expect(root).toHaveAttribute('data-currency', 'USD');
      expect(field()).toHaveClass('tk-currency-input-field');
      expect(field()).toHaveAttribute('inputmode', 'decimal');
      expect(container.querySelector('.tk-currency-input-currency-select')).toBeInTheDocument();
    });

    it('shows a seeded amount grouped by the locale', () => {
      render(<Amount defaultValue={1234567.5} />);

      expect(field()).toHaveValue('1.234.567,5');
    });

    it('shows the trigger as icon and code, named for assistive tech', () => {
      render(<Amount />);

      const trigger = screen.getByRole('combobox', { name: 'Currency' });
      expect(trigger).toHaveTextContent('TRY');
      expect(within(trigger).getByTestId('flag-tr')).toBeInTheDocument();
    });

    it('lists icon, symbol and name per currency, preferring the option’s own symbol', async () => {
      const user = userEvent.setup();
      render(<Amount />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByRole('option', { name: 'Türk Lirası' })).toHaveTextContent('₺Türk Lirası');
      expect(screen.getByRole('option', { name: 'US Dollar' })).toHaveTextContent('US$US Dollar');
    });

    it('renders the symbol for a fixed currency, hidden from assistive tech', () => {
      const { container } = render(
        <CurrencyInput currency="EUR" locale="de-DE">
          <CurrencyInput.Field aria-label="Amount" />
          <CurrencyInput.Suffix>
            <CurrencyInput.Symbol />
          </CurrencyInput.Suffix>
        </CurrencyInput>,
      );

      const symbol = container.querySelector('.tk-currency-input-symbol');
      expect(symbol).toHaveTextContent('€');
      expect(symbol).toHaveAttribute('aria-hidden', 'true');
    });

    it('lets Symbol, the trigger and the rows replace their content', async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput locale="tr-TR">
          <CurrencyInput.Field aria-label="Amount" />
          <CurrencyInput.Prefix>
            <CurrencyInput.Symbol>{({ code, symbol }) => `${symbol} (${code})`}</CurrencyInput.Symbol>
          </CurrencyInput.Prefix>
          <CurrencyInput.Suffix>
            <CurrencyInput.CurrencySelect currencies={CURRENCIES} aria-label="Para birimi" trigger={option => `→ ${option?.label}`}>
              {(option, symbol) => `${option.code} · ${symbol}`}
            </CurrencyInput.CurrencySelect>
          </CurrencyInput.Suffix>
        </CurrencyInput>,
      );

      expect(screen.getByText('₺ (TRY)')).toBeInTheDocument();
      const trigger = screen.getByRole('combobox', { name: 'Para birimi' });
      expect(trigger).toHaveTextContent('→ Türk Lirası');

      await user.click(trigger);
      expect(screen.getAllByRole('option')[2]).toHaveTextContent('JPY · ¥');
    });

    it('keeps the default name when the trigger label is blank', () => {
      render(
        <CurrencyInput>
          <CurrencyInput.CurrencySelect currencies={CURRENCIES} aria-label="  " />
        </CurrencyInput>,
      );

      expect(screen.getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
    });
  });

  describe('value', () => {
    it('groups as the user types and reports the amount as a number', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Amount onValueChange={onValueChange} />);

      await user.type(field(), '1234,5');

      expect(field()).toHaveValue('1.234,5');
      expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
    });

    it('keeps a trailing decimal mark while the amount it names stays the same', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Amount onValueChange={onValueChange} />);

      await user.type(field(), '12,');

      expect(field()).toHaveValue('12,');
      expect(onValueChange).toHaveBeenLastCalledWith(12);
    });

    it('reports undefined once the field is cleared, which is not 0', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Amount defaultValue={5} onValueChange={onValueChange} />);

      await user.clear(field());

      expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    });

    it('rejects the minus sign unless allowNegative', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Amount />);

      await user.type(field(), '-5');
      expect(field()).toHaveValue('5');

      rerender(<Amount allowNegative />);
      await user.clear(field());
      await user.type(field(), '-5');
      expect(field()).toHaveValue('-5');
    });

    it('takes the fraction digits from the currency', async () => {
      const user = userEvent.setup();
      render(<Amount defaultCurrency="JPY" />);

      expect(field()).toHaveAttribute('inputmode', 'numeric');
      await user.type(field(), '1234,56');
      expect(field()).toHaveValue('123.456');
    });

    it('lets decimalScale and integerScale override the currency', async () => {
      const user = userEvent.setup();
      render(<Amount decimalScale={3} integerScale={2} />);

      await user.type(field(), '12,5678');
      expect(field()).toHaveValue('12,567');
    });

    it('follows a controlled value set from outside', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [amount, setAmount] = useState<number | undefined>(10);
        return (
          <>
            <Amount value={amount} onValueChange={setAmount} />
            <button type="button" onClick={() => setAmount(2500.25)}>
              Preset
            </button>
            <output>{String(amount)}</output>
          </>
        );
      };
      render(<Controlled />);

      expect(field()).toHaveValue('10');
      await user.click(screen.getByRole('button', { name: 'Preset' }));
      expect(field()).toHaveValue('2.500,25');

      await user.clear(field());
      await user.type(field(), '7,5');
      expect(screen.getByRole('status')).toHaveTextContent('7.5');
    });

    it('works through Input.ClearButton', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <CurrencyInput locale="tr-TR" defaultValue={42} onValueChange={onValueChange}>
          <CurrencyInput.Field aria-label="Amount" />
          <CurrencyInput.ClearButton />
        </CurrencyInput>,
      );

      await user.click(screen.getByRole('button'));

      expect(field()).toHaveValue('');
      expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    });
  });

  describe('currency', () => {
    it('reports a picked currency and moves the mask to it', async () => {
      const user = userEvent.setup();
      const onCurrencyChange = vi.fn();
      const onValueChange = vi.fn();
      const { container } = render(<Amount defaultValue={1234.56} onCurrencyChange={onCurrencyChange} onValueChange={onValueChange} />);

      await pick(user, 'Japanese Yen');

      expect(onCurrencyChange).toHaveBeenLastCalledWith('JPY');
      expect(container.querySelector('.tk-currency-input')).toHaveAttribute('data-currency', 'JPY');
      // Yen has no fraction, so the amount loses the digits the field drops.
      expect(onValueChange).toHaveBeenLastCalledWith(1234);
      expect(field()).toHaveValue('1.234');
    });

    it('leaves a whole or empty amount alone, and names an unlabelled option by its code', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { unmount } = render(<Amount defaultValue={7} onValueChange={onValueChange} />);

      await pick(user, 'Japanese Yen');
      unmount();

      render(<Amount onValueChange={onValueChange} />);
      await pick(user, 'EUR');

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('leaves the amount alone when decimalScale pins the digits', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Amount defaultValue={1.5} decimalScale={2} onValueChange={onValueChange} />);

      await pick(user, 'Japanese Yen');

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('stays on a controlled currency until the parent moves it', async () => {
      const user = userEvent.setup();
      const onCurrencyChange = vi.fn();
      render(<Amount currency="USD" onCurrencyChange={onCurrencyChange} />);

      await pick(user, 'Türk Lirası');

      expect(onCurrencyChange).toHaveBeenLastCalledWith('TRY');
      expect(screen.getByRole('combobox')).toHaveTextContent('USD');
    });
  });

  describe('search', () => {
    const searchField = () => screen.getByRole('combobox', { name: 'Search currencies' });

    it('opens on the search field, as in Core’s design', async () => {
      const user = userEvent.setup();
      render(<Amount />);

      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      expect(searchField()).toHaveFocus();
      expect(searchField()).toHaveAttribute('placeholder', 'Search');
    });

    it('filters by code, name and symbol, ignoring case and accents', async () => {
      const user = userEvent.setup();
      render(<Amount />);
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      await user.keyboard('jpy');
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['¥Japanese Yen']);

      await user.clear(searchField());
      await user.keyboard('turk');
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['₺Türk Lirası']);

      await user.clear(searchField());
      await user.keyboard('US$');
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['US$US Dollar']);
    });

    it('treats the four Turkish i’s as one letter', async () => {
      const user = userEvent.setup();
      render(<Amount />);
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      for (const query of ['LIRASI', 'lirasi', 'LİRASI', 'lırası']) {
        await user.clear(searchField());
        await user.keyboard(query);
        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['₺Türk Lirası']);
      }
    });

    it('picks the first match with Enter and moves the mask to it', async () => {
      const user = userEvent.setup();
      const onCurrencyChange = vi.fn();
      render(<Amount defaultValue={10.5} onCurrencyChange={onCurrencyChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      await user.keyboard('yen{Enter}');

      expect(onCurrencyChange).toHaveBeenLastCalledWith('JPY');
      expect(field()).toHaveValue('10');
    });

    it('says so when nothing matches, and starts over on the next open', async () => {
      const user = userEvent.setup();
      render(<Amount />);
      const trigger = screen.getByRole('combobox', { name: 'Currency' });
      await user.click(trigger);

      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('No currencies found');

      await user.keyboard('{Escape}');
      await user.click(trigger);
      expect(searchField()).toHaveValue('');
      expect(screen.getAllByRole('option')).toHaveLength(CURRENCIES.length);
    });

    it('takes translated strings, keeping defaults for blank ones', async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput locale="tr-TR">
          <CurrencyInput.CurrencySelect currencies={CURRENCIES} searchLabel="Para birimi ara" searchPlaceholder="Ara" emptyLabel="Sonuç yok" />
        </CurrencyInput>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      expect(screen.getByRole('combobox', { name: 'Para birimi ara' })).toHaveAttribute('placeholder', 'Ara');
      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('Sonuç yok');
    });

    it('falls back to the defaults for blank strings', async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput locale="tr-TR">
          <CurrencyInput.CurrencySelect currencies={CURRENCIES} searchLabel=" " searchPlaceholder="" emptyLabel=" " />
        </CurrencyInput>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      expect(searchField()).toHaveAttribute('placeholder', 'Search');
      await user.keyboard('zzz');
      expect(screen.getByRole('status')).toHaveTextContent('No currencies found');
    });

    it('drops the field on searchable={false}, leaving typeahead', async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput locale="tr-TR">
          <CurrencyInput.CurrencySelect currencies={CURRENCIES} searchable={false} />
        </CurrencyInput>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      expect(screen.queryByRole('combobox', { name: 'Search currencies' })).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toHaveFocus();
      expect(screen.getAllByRole('option')).toHaveLength(CURRENCIES.length);
    });

    it('shows Empty for an empty currency list even without a search', async () => {
      const user = userEvent.setup();
      render(
        <CurrencyInput>
          <CurrencyInput.CurrencySelect currencies={[]} searchable={false} />
        </CurrencyInput>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Currency' }));

      expect(screen.getByRole('status')).toHaveTextContent('No currencies found');
    });
  });

  describe('forms and state', () => {
    it('submits the amount canonically under name, and nothing without one', async () => {
      const user = userEvent.setup();
      const { container, rerender } = render(<Amount />);
      expect(container.querySelector('input[type="hidden"][name="amount"]')).toBeNull();

      rerender(<Amount name="amount" form="checkout" />);
      await user.type(field(), '1234,5');

      const hidden = container.querySelector('input[type="hidden"][name="amount"]');
      expect(hidden).toHaveValue('1234.5');
      expect(hidden).toHaveAttribute('form', 'checkout');
    });

    it('submits an empty amount while the field is empty', () => {
      const { container } = render(<Amount name="amount" />);

      expect(container.querySelector('input[type="hidden"][name="amount"]')).toHaveValue('');
    });

    it('inherits disabled and invalid from a surrounding Field', () => {
      const { container } = render(
        <Field disabled invalid>
          <Field.Label>Fare</Field.Label>
          <CurrencyInput>
            <CurrencyInput.Field />
          </CurrencyInput>
        </Field>,
      );

      expect(screen.getByLabelText('Fare')).toBeDisabled();
      expect(container.querySelector('.tk-currency-input')).toHaveAttribute('data-invalid');
    });

    it('takes theme classNames from the provider', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ CurrencyInputSymbol: { classNames: { root: 'brand-symbol' } } }}>
          <CurrencyInput currency="USD" locale="en-US">
            <CurrencyInput.Symbol />
          </CurrencyInput>
        </TakeoffSparProvider>,
      );

      expect(container.querySelector('.tk-currency-input-symbol')).toHaveClass('brand-symbol');
    });

    it('raises the safe-context error for a part used outside its root', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<CurrencyInput.Field />)).toThrow(/CurrencyInputProvider/);

      error.mockRestore();
    });

    it('has no axe violations', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Fare</Field.Label>
          <Amount defaultValue={10} />
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('intl helpers', () => {
    it('falls back to two digits and the code for an unknown currency', () => {
      expect(getCurrencyMeta('tr-TR', 'not-a-code')).toEqual({ decimalScale: 2, decimalMark: ',', symbol: 'not-a-code' });
    });

    it('falls back to a dot for an unusable locale', () => {
      expect(getCurrencyMeta('!!', 'USD').decimalMark).toBe('.');
    });

    it('falls back when Intl names no decimal mark, fraction or symbol', () => {
      const real = Intl.NumberFormat;
      // A class, not an arrow: the helper calls it with `new`, and an arrow
      // would throw and take the catch path instead of the one under test.
      class Bare {
        formatToParts = () => [{ type: 'integer', value: '0' }];
        resolvedOptions = () => ({});
      }
      const stub = vi.spyOn(Intl, 'NumberFormat').mockImplementation(Bare as unknown as typeof Intl.NumberFormat);

      expect(getCurrencyMeta('tr-TR', 'TRY')).toEqual({ decimalScale: 2, decimalMark: '.', symbol: 'TRY' });

      stub.mockRestore();
      expect(Intl.NumberFormat).toBe(real);
    });

    it('spells amounts as plain digits, never in exponent form', () => {
      expect(toMaskText(1e21, ',')).toBe('1000000000000000000000');
      expect(toMaskText(0.5, ',')).toBe('0,5');
      expect(toMaskText(undefined, ',')).toBe('');
      expect(toMaskText(Number.NaN, ',')).toBe('');
    });

    it('reads the amount off the mask meta', () => {
      expect(fromMaskMeta({ raw: '1,5', completed: true, iso: '1.5' })).toBe(1.5);
      expect(fromMaskMeta({ raw: '-', completed: false })).toBeUndefined();
      expect(fromMaskMeta({ raw: '', completed: false, iso: '' })).toBeUndefined();
      expect(fromMaskMeta({ raw: 'x', completed: true, iso: 'x' })).toBeUndefined();
    });

    it('truncates rather than rounds', () => {
      expect(truncateToScale(1.999, 2)).toBe(1.99);
      expect(truncateToScale(1.999, 0)).toBe(1);
      expect(truncateToScale(1.5, 2)).toBe(1.5);
    });
  });
});
