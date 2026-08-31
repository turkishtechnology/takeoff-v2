import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../test-utils';

import { Input, createDateMask, createNumberMask, type MaskChangeMeta, type MaskResolver } from './index';

describe('Input.Field mask', () => {
  it('forwards a shape mask and reports masked edits through onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string, meta: MaskChangeMeta) => void>();

    render(
      <Input>
        <Input.Field aria-label="Card" mask={{ blocks: [4, 4, 4, 4], delimiter: ' ', numericOnly: true }} onValueChange={onValueChange} />
      </Input>,
    );

    const field = screen.getByLabelText('Card');
    await user.type(field, '4242abc4242');

    // Delimiters are inserted by the mask, letters dropped by `numericOnly` —
    // neither is something the wrapper does, so seeing them proves `mask`
    // reached the primitive rather than being swallowed by the pick.
    expect(field).toHaveValue('4242 4242');

    const [value, meta] = onValueChange.mock.lastCall ?? [];
    expect(value).toBe('4242 4242');
    expect(meta?.raw).toBe('42424242');
    expect(meta?.completed).toBe(false);
  });

  it('reports iso once a date mask completes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string, meta: MaskChangeMeta) => void>();

    render(
      <Input>
        <Input.Field aria-label="Date" mask={{ date: true, delimiter: '/' }} onValueChange={onValueChange} />
      </Input>,
    );

    await user.type(screen.getByLabelText('Date'), '31121995');

    expect(screen.getByLabelText('Date')).toHaveValue('31/12/1995');
    expect(onValueChange.mock.lastCall?.[1]).toMatchObject({
      raw: '31121995',
      completed: true,
      iso: '1995-12-31',
    });
  });

  it('accepts a resolver, including one wrapping a built-in mask', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string, meta: MaskChangeMeta) => void>();

    // createDateMask is a plain resolver, so the built-in can be composed the
    // same way any userland mask can — the point of exporting the factory.
    const base = createDateMask({ date: true, delimiter: '.' });
    const businessDay: MaskResolver = (raw, ctx) => {
      const result = base(raw, ctx);
      if (!result.completed || !result.iso) return result;
      const weekday = new Date(`${result.iso}T00:00:00Z`).getUTCDay();
      return weekday === 0 || weekday === 6 ? { ...result, completed: false } : result;
    };

    render(
      <Input>
        <Input.Field aria-label="Settlement" mask={businessDay} onValueChange={onValueChange} />
      </Input>,
    );

    // 2026-08-29 is a Saturday: well-formed, but the wrapper rejects it.
    await user.type(screen.getByLabelText('Settlement'), '29082026');

    expect(screen.getByLabelText('Settlement')).toHaveValue('29.08.2026');
    expect(onValueChange.mock.lastCall?.[1].completed).toBe(false);
  });

  it('groups a number mask by locale and reports a Number()-parseable iso', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string, meta: MaskChangeMeta) => void>();

    render(
      <Input>
        <Input.Prefix>TRY</Input.Prefix>
        <Input.Field aria-label="Fare" inputMode="decimal" mask={{ number: true, numberLocale: 'tr-TR' }} onValueChange={onValueChange} />
      </Input>,
    );

    await user.type(screen.getByLabelText('Fare'), '1234567,89');

    // Separators and group sizes come from Intl, so the tr-TR dots and comma
    // are the mask's doing — the wrapper passes no locale of its own.
    expect(screen.getByLabelText('Fare')).toHaveValue('1.234.567,89');

    const meta = onValueChange.mock.lastCall?.[1];
    expect(meta).toMatchObject({ raw: '1234567,89', completed: true, iso: '1234567.89' });
    expect(Number(meta?.iso)).toBe(1234567.89);
  });

  it('accepts createNumberMask, so the factory export is composable like the others', async () => {
    const user = userEvent.setup();

    // en-IN groups 3 then 2 from the right. Reaching it through the factory
    // rather than the sugar is what proves the new re-export resolves.
    const lakh = createNumberMask({ number: true, numberLocale: 'en-IN', numberDecimalScale: 0 });

    render(
      <Input>
        <Input.Field aria-label="Points" inputMode="numeric" mask={lakh} />
      </Input>,
    );

    await user.type(screen.getByLabelText('Points'), '11234567');

    expect(screen.getByLabelText('Points')).toHaveValue('1,12,34,567');
  });

  it('mirrors imperative mask edits into the Input context so Input.ClearButton stays correct', async () => {
    const user = userEvent.setup();

    render(
      <Input>
        <Input.Field aria-label="Card" mask={{ blocks: [4, 4], delimiter: ' ', numericOnly: true }} />
        <Input.ClearButton />
      </Input>,
    );

    const field = screen.getByLabelText('Card');
    await user.type(field, '42');
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Backspace is applied by the mask directly to the control (it
    // preventDefaults the beforeinput event), so it never surfaces as a React
    // change event. Without the onValueChange mirror in InputField the context
    // value would stay '42' and the button would linger.
    await user.type(field, '{Backspace}{Backspace}');
    expect(field).toHaveValue('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('leaves an unmasked field untouched', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Input>
        <Input.Field aria-label="Plain" onValueChange={onValueChange} />
      </Input>,
    );

    await user.type(screen.getByLabelText('Plain'), '4242abc');

    expect(screen.getByLabelText('Plain')).toHaveValue('4242abc');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
