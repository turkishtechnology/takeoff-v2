import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';
import { Field } from '../field';

import { Input, createDateMask, createNumberMask, type MaskChangeMeta, type MaskResolver } from './index';

const strengthLevels = (container: HTMLElement) => Array.from(container.querySelectorAll('.tk-input-strength-segment')).map(segment => segment.getAttribute('data-level'));

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

  it('resets the mask state when Input.ClearButton empties a masked field', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string, meta: MaskChangeMeta) => void>();

    render(
      <Input>
        <Input.Field aria-label="Card" mask={{ blocks: [4, 4], delimiter: ' ', numericOnly: true }} onValueChange={onValueChange} />
        <Input.ClearButton />
      </Input>,
    );

    const field = screen.getByLabelText('Card');
    await user.type(field, '42425252');
    expect(field).toHaveValue('4242 5252');

    // ClearButton takes a third path: neither a keyboard delete (which the mask
    // applies imperatively) nor a normal keystroke. It writes through the
    // native setter and dispatches a plain `input` event, so this checks the
    // mask actually resyncs rather than carrying stale block/caret bookkeeping.
    await user.click(screen.getByRole('button'));
    expect(field).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('', expect.objectContaining({ raw: '', completed: false }));

    // Typing straight after the clear has to mask from scratch, delimiter and
    // all — a stale previous-value would show up here first.
    await user.type(field, '11112222');
    expect(field).toHaveValue('1111 2222');
    expect(onValueChange).toHaveBeenLastCalledWith('1111 2222', expect.objectContaining({ raw: '11112222', completed: true }));
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

describe('Input.Field', () => {
  describe('rendering', () => {
    it('renders the native control with the root slot contract inside the Input root', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="Passenger name" placeholder="Ada Lovelace" />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Passenger name' });
      expect(field.tagName).toBe('INPUT');
      expect(field).toHaveClass('tk-input-field');
      expect(field).toHaveAttribute('data-slot', 'root');
      expect(field).toHaveAttribute('placeholder', 'Ada Lovelace');
      expect(container.querySelector('.tk-input')).toContainElement(field);
    });

    it('passes native attributes through to the control', () => {
      render(
        <Input>
          <Input.Field aria-label="Email" type="email" name="email" inputMode="email" maxLength={64} autoComplete="email" />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Email' });
      expect(field).toHaveAttribute('type', 'email');
      expect(field).toHaveAttribute('name', 'email');
      expect(field).toHaveAttribute('inputmode', 'email');
      expect(field).toHaveAttribute('maxlength', '64');
      expect(field).toHaveAttribute('autocomplete', 'email');
    });

    it('renders a textarea without a type attribute through as="textarea"', () => {
      render(
        <Input>
          <Input.Field as="textarea" aria-label="Notes" rows={4} defaultValue="Window seat" />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Notes' });
      expect(field.tagName).toBe('TEXTAREA');
      expect(field).toHaveClass('tk-input-field');
      expect(field).toHaveAttribute('rows', '4');
      expect(field).not.toHaveAttribute('type');
      expect(field).toHaveValue('Window seat');
    });

    it('lands className, classNames.root and slotProps.root on the control, not the Input root', () => {
      const { container } = render(
        <Input>
          <Input.Field
            aria-label="Search"
            className="instance-class"
            classNames={{ root: 'slot-class' }}
            slotProps={{ root: { title: 'Where to?', style: { fontWeight: 500 } } }}
          />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Search' });
      expect(field).toHaveClass('tk-input-field', 'instance-class', 'slot-class');
      expect(field).toHaveAttribute('title', 'Where to?');
      expect(field).toHaveStyle({ fontWeight: 500 });
      expect(container.querySelector('.tk-input')).not.toHaveClass('slot-class');
      expect(container.querySelector('.tk-input')).not.toHaveAttribute('title');
    });

    it('layers the provider theme under the instance classes', () => {
      render(
        <TakeoffSparProvider components={{ InputField: { className: 'theme-class', slotProps: { root: { title: 'from theme' } } } }}>
          <Input>
            <Input.Field aria-label="Search" classNames={{ root: 'instance-class' }} />
          </Input>
        </TakeoffSparProvider>,
      );

      const field = screen.getByRole('textbox', { name: 'Search' });
      expect(field).toHaveClass('tk-input-field', 'theme-class', 'instance-class');
      expect(field).toHaveAttribute('title', 'from theme');
    });

    it('focuses the control on mount with autoFocus', async () => {
      render(
        <Input>
          <Input.Field aria-label="Name" autoFocus />
        </Input>,
      );

      // Spar defers the mount focus to the next animation frame.
      await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
    });

    it('forwards an object ref to the control', () => {
      const ref = createRef<HTMLInputElement>();
      render(
        <Input>
          <Input.Field aria-label="Name" ref={ref} />
        </Input>,
      );

      expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }));
    });

    it('forwards a callback ref and releases it on unmount', () => {
      const ref = vi.fn();
      const { unmount } = render(
        <Input>
          <Input.Field aria-label="Name" ref={ref} />
        </Input>,
      );

      expect(ref).toHaveBeenCalledWith(screen.getByRole('textbox', { name: 'Name' }));

      unmount();
      expect(ref).toHaveBeenLastCalledWith(null);
    });
  });

  describe('value mirroring', () => {
    it('calls the consumer onInput and onChange for every keystroke', async () => {
      const user = userEvent.setup();
      const onInput = vi.fn();
      const onChange = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Name" onInput={onInput} onChange={onChange} />
        </Input>,
      );

      await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');

      expect(onInput).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onInput.mock.lastCall?.[0].target).toHaveValue('Ada');
      expect(onChange.mock.lastCall?.[0].target).toHaveValue('Ada');
    });

    it('mirrors a controlled value changed from outside into dependent parts', () => {
      const noop = () => undefined;
      const { container, rerender } = render(
        <Input>
          <Input.Field aria-label="Password" type="password" value="" onChange={noop} />
          <Input.ClearButton />
          <Input.Strength />
        </Input>,
      );
      expect(strengthLevels(container)).toEqual([null, null, null, null]);
      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

      rerender(
        <Input>
          <Input.Field aria-label="Password" type="password" value="Abcdefg1" onChange={noop} />
          <Input.ClearButton />
          <Input.Strength />
        </Input>,
      );

      expect(strengthLevels(container)).toEqual(['strong', 'strong', 'strong', 'strong']);
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();
    });

    it('keeps a controlled field and its dependent parts in sync while typing', async () => {
      const user = userEvent.setup();
      const ControlledName = () => {
        const [value, setValue] = useState('');
        return (
          <>
            <Input>
              <Input.Field aria-label="Name" value={value} onChange={event => setValue(event.target.value)} />
              <Input.ClearButton />
            </Input>
            <span data-testid="mirror">{value}</span>
          </>
        );
      };
      render(<ControlledName />);
      expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

      await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
      expect(screen.getByTestId('mirror')).toHaveTextContent('Ada');
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();
    });
  });

  describe('data-* styling hooks', () => {
    it('emits data-mask while a mask is set and data-mask-completed once the value fills it', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Expiry" mask={{ blocks: [2, 2], delimiter: '/', numericOnly: true }} />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Expiry' });
      expect(field).toHaveAttribute('data-mask', '');
      expect(field).not.toHaveAttribute('data-mask-completed');

      await user.type(field, '12');
      expect(field).not.toHaveAttribute('data-mask-completed');

      await user.type(field, '28');
      expect(field).toHaveValue('12/28');
      expect(field).toHaveAttribute('data-mask-completed', '');
    });

    it('omits the mask hooks on an unmasked field', () => {
      render(
        <Input>
          <Input.Field aria-label="Plain" defaultValue="1228" />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Plain' });
      expect(field).not.toHaveAttribute('data-mask');
      expect(field).not.toHaveAttribute('data-mask-completed');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a labelled textarea and a masked field', async () => {
      const { container } = render(
        <>
          <Field>
            <Field.Label>Special assistance note</Field.Label>
            <Input>
              <Input.Field as="textarea" rows={4} placeholder="Add any details." />
            </Input>
            <Field.Description>Shared with the ground team.</Field.Description>
          </Field>
          <Field>
            <Field.Label>Date of birth</Field.Label>
            <Input>
              <Input.Field placeholder="dd/mm/yyyy" mask={{ date: true, delimiter: '/' }} />
            </Input>
          </Field>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
