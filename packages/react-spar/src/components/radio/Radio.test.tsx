import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Radio, type RadioProps, type RadioRenderProps } from './index';

// Spar renders the default `Radio.Item` as `<label role="radio">`. ARIA in HTML
// allows no role override on `<label>`, so axe's best-practice rule
// `aria-allowed-role` flags every item of the documented anatomy. That is an
// upstream Spar defect (reported separately); every other axe rule stays on,
// and the `as="div"` regression check below runs the full rule set.
const AXE_WITHOUT_LABEL_ROLE_RULE = { rules: { 'aria-allowed-role': { enabled: false } } };

const cabinItems = (
  <>
    <Radio.Item value="economy">
      <Radio.Indicator />
      <Radio.Label>Economy</Radio.Label>
    </Radio.Item>
    <Radio.Item value="business">
      <Radio.Indicator />
      <Radio.Label>Business</Radio.Label>
    </Radio.Item>
    <Radio.Item value="first">
      <Radio.Indicator />
      <Radio.Label>First</Radio.Label>
    </Radio.Item>
  </>
);

const cabinGroup = (props: RadioProps = {}) => (
  <Radio aria-label="Cabin class" {...props}>
    {cabinItems}
  </Radio>
);

const getRadio = (name: string) => screen.getByRole('radio', { name });

describe('Radio (compound)', () => {
  describe('rendering', () => {
    it('renders a radiogroup root with the canonical anatomy for every part', () => {
      render(cabinGroup());

      const root = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveClass('tk-radio');
      expect(root).toHaveAttribute('data-slot', 'root');

      const radios = within(root).getAllByRole('radio');
      expect(radios).toHaveLength(3);

      const item = getRadio('Economy');
      expect(item).toBe(radios[0]);
      expect(item.tagName).toBe('LABEL');
      expect(item).toHaveClass('tk-radio-item');
      expect(item).toHaveAttribute('data-slot', 'root');

      const indicator = item.querySelector('.tk-radio-indicator');
      expect(indicator?.tagName).toBe('SPAN');
      expect(indicator?.parentElement).toBe(item);
      expect(indicator).toHaveAttribute('data-slot', 'root');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');

      const icon = indicator?.querySelector('.tk-radio-icon');
      expect(icon?.tagName).toBe('SPAN');
      expect(icon?.parentElement).toBe(indicator);
      expect(icon).toHaveAttribute('data-slot', 'icon');

      const label = item.querySelector('.tk-radio-label');
      expect(label?.tagName).toBe('SPAN');
      expect(label?.parentElement).toBe(item);
      expect(label).toHaveAttribute('data-slot', 'root');
      expect(label).toHaveTextContent('Economy');
    });

    it('emits the default visual data attributes on the root and every item', () => {
      render(cabinGroup());

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-position', 'left');
      expect(root).toHaveAttribute('data-orientation', 'vertical');
      expect(root).not.toHaveAttribute('data-spread');
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('data-required');
      expect(root).not.toHaveAttribute('data-invalid');

      for (const item of screen.getAllByRole('radio')) {
        expect(item).toHaveAttribute('data-size', 'base');
        expect(item).toHaveAttribute('data-position', 'left');
        expect(item).toHaveAttribute('data-state', 'unchecked');
        expect(item).not.toHaveAttribute('data-disabled');
      }
    });

    it('reflects non-default root props into data attributes and cascades size and position to items', () => {
      render(cabinGroup({ size: 'large', position: 'right', spread: true, orientation: 'horizontal' }));

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-position', 'right');
      expect(root).toHaveAttribute('data-spread', '');
      expect(root).toHaveAttribute('data-orientation', 'horizontal');
      // Visual props are consumed as data hooks, never leaked as DOM attributes.
      expect(root).not.toHaveAttribute('spread');
      expect(root).not.toHaveAttribute('size');
      expect(root).not.toHaveAttribute('position');

      for (const item of screen.getAllByRole('radio')) {
        expect(item).toHaveAttribute('data-size', 'large');
        expect(item).toHaveAttribute('data-position', 'right');
      }
    });

    it('lets an item override the group position without affecting its siblings', () => {
      render(
        <Radio aria-label="Contact channel" position="left">
          <Radio.Item value="email">
            <Radio.Indicator />
            <Radio.Label>Email</Radio.Label>
          </Radio.Item>
          <Radio.Item value="sms" position="right">
            <Radio.Indicator />
            <Radio.Label>SMS</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-position', 'left');
      expect(getRadio('Email')).toHaveAttribute('data-position', 'left');
      expect(getRadio('SMS')).toHaveAttribute('data-position', 'right');
      expect(getRadio('SMS')).not.toHaveAttribute('position');
    });

    it('renders every part as a custom element through the as prop', () => {
      render(
        <Radio as="section" aria-label="Cabin class">
          <Radio.Item as="div" value="economy">
            <Radio.Indicator as="i" />
            <Radio.Label as="strong">Economy</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const root = screen.getByRole('radiogroup');
      expect(root.tagName).toBe('SECTION');
      expect(root).toHaveClass('tk-radio');

      const item = getRadio('Economy');
      expect(item.tagName).toBe('DIV');
      expect(item).toHaveClass('tk-radio-item');
      expect(item.querySelector('.tk-radio-indicator')?.tagName).toBe('I');
      expect(item.querySelector('.tk-radio-label')?.tagName).toBe('STRONG');
    });

    it('forwards refs to the DOM node of every part', () => {
      const rootRef = createRef<HTMLDivElement>();
      const itemRef = createRef<HTMLLabelElement>();
      const indicatorRef = createRef<HTMLSpanElement>();
      const labelRef = createRef<HTMLSpanElement>();

      render(
        <Radio ref={rootRef} aria-label="Cabin class">
          <Radio.Item ref={itemRef} value="economy">
            <Radio.Indicator ref={indicatorRef} />
            <Radio.Label ref={labelRef}>Economy</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      expect(rootRef.current).toBe(screen.getByRole('radiogroup'));
      expect(itemRef.current).toBe(getRadio('Economy'));
      expect(indicatorRef.current).toHaveClass('tk-radio-indicator');
      expect(labelRef.current).toHaveClass('tk-radio-label');
      // The refs point at the exact nodes rendered inside this item.
      const item = getRadio('Economy');
      expect(indicatorRef.current).toBe(item.querySelector('.tk-radio-indicator'));
      expect(labelRef.current).toBe(item.querySelector('.tk-radio-label'));
    });

    it('renders custom indicator children in place of the default icon slot', () => {
      render(
        <Radio aria-label="Meal" defaultValue="vegan">
          <Radio.Item value="vegan">
            <Radio.Indicator>
              <span className="custom-mark">✓</span>
            </Radio.Indicator>
            <Radio.Label>Vegan</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const item = getRadio('Vegan');
      const indicator = item.querySelector('.tk-radio-indicator');
      expect(indicator?.querySelector('.custom-mark')).toHaveTextContent('✓');
      expect(indicator?.querySelector('.tk-radio-icon')).toBeNull();
      // Custom content stays decorative and out of the item's accessible name.
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(item).toHaveAccessibleName('Vegan');
    });
  });

  describe('render-prop children', () => {
    it('passes per-item state to a function child and re-renders it on selection', async () => {
      const user = userEvent.setup();
      const renderExitRow = vi.fn(({ isChecked }: RadioRenderProps) => (
        <>
          <Radio.Indicator />
          <Radio.Label>{isChecked ? 'Exit row (selected)' : 'Exit row'}</Radio.Label>
        </>
      ));

      render(
        <Radio aria-label="Seat row" defaultValue="front">
          <Radio.Item value="front">
            <Radio.Indicator />
            <Radio.Label>Front</Radio.Label>
          </Radio.Item>
          <Radio.Item value="exit">{renderExitRow}</Radio.Item>
        </Radio>,
      );

      expect(renderExitRow).toHaveBeenLastCalledWith({ isChecked: false, disabled: false, isFocused: false, select: expect.any(Function) });

      await user.click(getRadio('Exit row'));

      expect(getRadio('Exit row (selected)')).toHaveAttribute('aria-checked', 'true');
      expect(renderExitRow).toHaveBeenLastCalledWith(expect.objectContaining({ isChecked: true, isFocused: true }));
    });

    it('reports a disabled item through the render-prop state', () => {
      const renderUpgrade = vi.fn((_state: RadioRenderProps) => <Radio.Label>Upgrade</Radio.Label>);

      render(
        <Radio aria-label="Ancillary services">
          <Radio.Item value="upgrade" disabled>
            {renderUpgrade}
          </Radio.Item>
        </Radio>,
      );

      expect(renderUpgrade).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true, isChecked: false }));
    });

    it('selects the item when the render-prop select() is invoked', () => {
      const onChange = vi.fn();
      const renderFirst = vi.fn((_state: RadioRenderProps) => <Radio.Label>First</Radio.Label>);

      render(
        <Radio aria-label="Cabin class" defaultValue="economy" onChange={onChange}>
          <Radio.Item value="economy">
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
          <Radio.Item value="first">{renderFirst}</Radio.Item>
        </Radio>,
      );

      const state = renderFirst.mock.lastCall?.[0];
      expect(state).toBeDefined();
      act(() => state?.select());

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(getRadio('First')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('selection', () => {
    it('checks nothing when neither value nor defaultValue is provided', () => {
      render(cabinGroup());

      for (const item of screen.getAllByRole('radio')) {
        expect(item).toHaveAttribute('aria-checked', 'false');
        expect(item).toHaveAttribute('data-state', 'unchecked');
      }
    });

    it('checks the defaultValue item and moves the selection on click (uncontrolled)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ defaultValue: 'economy', onChange }));

      expect(screen.getByRole('radio', { name: 'Economy', checked: true })).toHaveAttribute('data-state', 'checked');
      expect(getRadio('Business')).toHaveAttribute('data-state', 'unchecked');

      await user.click(getRadio('Business'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith('business');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('data-state', 'checked');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('Economy')).toHaveAttribute('data-state', 'unchecked');

      await user.click(getRadio('First'));

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith('first');
      expect(screen.getAllByRole('radio', { checked: true })).toEqual([getRadio('First')]);
    });

    it('keeps the checked item pinned to value until the parent updates it (controlled)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { rerender } = render(cabinGroup({ value: 'economy', onChange }));

      await user.click(getRadio('Business'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('business');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');

      rerender(cabinGroup({ value: 'business', onChange }));

      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'false');
      // A parent-driven value change is not echoed back through onChange.
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('round-trips the selection through parent state', async () => {
      const user = userEvent.setup();
      const RefundPreference = () => {
        const [value, setValue] = useState('return');
        return (
          <>
            <p>Selected: {value}</p>
            <Radio aria-label="Refund preference" value={value} onChange={setValue}>
              <Radio.Item value="return">
                <Radio.Indicator />
                <Radio.Label>Original payment</Radio.Label>
              </Radio.Item>
              <Radio.Item value="voucher">
                <Radio.Indicator />
                <Radio.Label>Travel voucher</Radio.Label>
              </Radio.Item>
            </Radio>
          </>
        );
      };

      render(<RefundPreference />);
      expect(screen.getByText('Selected: return')).toBeInTheDocument();

      await user.click(getRadio('Travel voucher'));

      expect(screen.getByText('Selected: voucher')).toBeInTheDocument();
      expect(getRadio('Travel voucher')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Original payment')).toHaveAttribute('aria-checked', 'false');
    });

    it('submits the selected value with a native form under the given name', async () => {
      const user = userEvent.setup();
      render(<form aria-label="Booking">{cabinGroup({ name: 'cabin' })}</form>);
      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;

      expect(new FormData(form).get('cabin')).toBeNull();

      await user.click(getRadio('Business'));

      expect(new FormData(form).get('cabin')).toBe('business');
    });
  });

  describe('keyboard', () => {
    it('enters the group on the checked item with Tab', async () => {
      const user = userEvent.setup();
      render(cabinGroup({ defaultValue: 'business' }));

      await user.tab();

      expect(getRadio('Business')).toHaveFocus();
    });

    it('enters the group on the first item with Tab when nothing is checked', async () => {
      const user = userEvent.setup();
      render(cabinGroup());

      await user.tab();

      expect(getRadio('Economy')).toHaveFocus();
    });

    it('moves focus and selection with the arrow keys, wrapping at both ends', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ defaultValue: 'economy', onChange }));
      await user.tab();

      await user.keyboard('{ArrowDown}');
      expect(getRadio('Business')).toHaveFocus();
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');

      await user.keyboard('{ArrowRight}');
      expect(getRadio('First')).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(getRadio('Economy')).toHaveFocus();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');

      await user.keyboard('{ArrowUp}');
      expect(getRadio('First')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(getRadio('Business')).toHaveFocus();
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');

      expect(onChange.mock.calls).toEqual([['business'], ['first'], ['economy'], ['first'], ['business']]);
    });

    it('jumps to the last and first item with End and Home', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ defaultValue: 'business', onChange }));
      await user.tab();

      await user.keyboard('{End}');
      expect(getRadio('First')).toHaveFocus();
      expect(getRadio('First')).toHaveAttribute('aria-checked', 'true');

      await user.keyboard('{Home}');
      expect(getRadio('Economy')).toHaveFocus();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');

      expect(onChange.mock.calls).toEqual([['first'], ['economy']]);
    });

    it('decouples focus from selection when selectOnFocus is false and selects with Space', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ defaultValue: 'economy', selectOnFocus: false, onChange }));
      await user.tab();

      await user.keyboard('{ArrowDown}');

      expect(getRadio('Business')).toHaveFocus();
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(onChange).not.toHaveBeenCalled();

      await user.keyboard(' ');

      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('business');

      // Space on the item that is already checked is a no-op.
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('skips disabled items during keyboard navigation and ignores clicks on them', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Radio aria-label="Ancillary services" defaultValue="lounge" onChange={onChange}>
          <Radio.Item value="lounge">
            <Radio.Indicator />
            <Radio.Label>Lounge access</Radio.Label>
          </Radio.Item>
          <Radio.Item value="upgrade" disabled>
            <Radio.Indicator />
            <Radio.Label>Upgrade</Radio.Label>
          </Radio.Item>
          <Radio.Item value="wifi">
            <Radio.Indicator />
            <Radio.Label>Wi-Fi</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const upgrade = getRadio('Upgrade');
      expect(upgrade).toHaveAttribute('aria-disabled', 'true');
      expect(upgrade).toHaveAttribute('data-disabled', '');
      expect(getRadio('Lounge access')).not.toHaveAttribute('data-disabled');

      await user.tab();
      await user.keyboard('{ArrowDown}');

      expect(getRadio('Wi-Fi')).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('wifi');

      await user.click(upgrade);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(upgrade).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('Wi-Fi')).toHaveAttribute('aria-checked', 'true');
    });

    it('focuses the checked item on mount with autoFocus', async () => {
      render(cabinGroup({ defaultValue: 'business', autoFocus: true }));

      await waitFor(() => expect(getRadio('Business')).toHaveFocus());
    });
  });

  describe('states', () => {
    it('disables every item and blocks selection when the group is disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ disabled: true, defaultValue: 'economy', onChange }));

      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
      for (const item of screen.getAllByRole('radio')) {
        expect(item).toHaveAttribute('aria-disabled', 'true');
        expect(item).toHaveAttribute('data-disabled', '');
      }

      await user.click(getRadio('Business'));

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
    });

    it('removes a disabled group from the tab order', async () => {
      const user = userEvent.setup();
      render(cabinGroup({ disabled: true, defaultValue: 'economy' }));

      await user.tab();

      expect(document.body).toHaveFocus();
    });

    it('blocks pointer selection in a read-only group', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ readOnly: true, defaultValue: 'economy', onChange }));

      await user.click(getRadio('Business'));

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
    });

    it('surfaces required and invalid on the radiogroup for styling and assistive tech', () => {
      render(cabinGroup({ required: true, invalid: true }));

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveAttribute('data-required', '');
      expect(root).toHaveAttribute('aria-required', 'true');
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('aria-invalid', 'true');
      // Invalid is a group concept: items style through the ancestor selector.
      for (const item of screen.getAllByRole('radio')) {
        expect(item).not.toHaveAttribute('data-invalid');
      }
    });
  });

  describe('Field context inheritance', () => {
    it('inherits invalid from a wrapping Field', () => {
      render(
        <Field invalid>
          <Field.Label>Cabin class</Field.Label>
          <Radio>{cabinItems}</Radio>
        </Field>,
      );

      const root = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('aria-invalid', 'true');
    });

    it('inherits disabled from a wrapping Field and blocks selection', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Field disabled>
          <Field.Label>Cabin class</Field.Label>
          <Radio defaultValue="economy" onChange={onChange}>
            {cabinItems}
          </Radio>
        </Field>,
      );

      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
      expect(getRadio('Business')).toHaveAttribute('aria-disabled', 'true');

      await user.click(getRadio('Business'));

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
    });

    it('inherits required from a wrapping Field', () => {
      render(
        <Field required>
          <Field.Label>Cabin class</Field.Label>
          <Radio>{cabinItems}</Radio>
        </Field>,
      );

      const root = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(root).toHaveAttribute('data-required', '');
      expect(root).toHaveAttribute('aria-required', 'true');
    });

    it('inherits readOnly from a wrapping Field and blocks pointer selection', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Field readOnly>
          <Field.Label>Cabin class</Field.Label>
          <Radio defaultValue="economy" onChange={onChange}>
            {cabinItems}
          </Radio>
        </Field>,
      );

      await user.click(getRadio('Business'));

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
    });

    it('lets explicit props on Radio override the Field values', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Field invalid disabled>
          <Field.Label>Cabin class</Field.Label>
          <Radio invalid={false} disabled={false} onChange={onChange}>
            {cabinItems}
          </Radio>
        </Field>,
      );

      const root = screen.getByRole('radiogroup');
      expect(root).not.toHaveAttribute('data-invalid');
      expect(root).not.toHaveAttribute('aria-invalid');
      expect(root).not.toHaveAttribute('data-disabled');

      await user.click(getRadio('Business'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('business');
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto the owner node of each part', () => {
      render(
        <Radio aria-label="Cabin class" className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'group' } }}>
          <Radio.Item value="economy" className="item-extra" classNames={{ root: 'item-slot' }} slotProps={{ root: { title: 'item' } }}>
            <Radio.Indicator
              className="indicator-extra"
              classNames={{ root: 'indicator-slot', icon: 'icon-slot' }}
              slotProps={{ root: { title: 'indicator' }, icon: { title: 'icon' } }}
            />
            <Radio.Label className="label-extra" classNames={{ root: 'label-slot' }} slotProps={{ root: { title: 'label' } }}>
              Economy
            </Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveClass('tk-radio', 'root-extra', 'root-slot');
      expect(root).toHaveAttribute('title', 'group');

      const item = getRadio('Economy');
      expect(item).toHaveClass('tk-radio-item', 'item-extra', 'item-slot');
      expect(item).not.toHaveClass('root-slot');
      expect(item).toHaveAttribute('title', 'item');

      const indicator = item.querySelector('.tk-radio-indicator');
      expect(indicator).toHaveClass('indicator-extra', 'indicator-slot');
      expect(indicator).not.toHaveClass('icon-slot');
      expect(indicator).toHaveAttribute('title', 'indicator');

      const icon = item.querySelector('.tk-radio-icon');
      expect(icon).toHaveClass('icon-slot');
      expect(icon).not.toHaveClass('indicator-slot');
      expect(icon).not.toHaveClass('indicator-extra');
      expect(icon).toHaveAttribute('title', 'icon');

      const label = item.querySelector('.tk-radio-label');
      expect(label).toHaveClass('label-extra', 'label-slot');
      expect(label).toHaveAttribute('title', 'label');
    });

    it('keeps canonical slot hooks and state attributes when slotProps try to override them', () => {
      const hijack = { 'title': 'hijack', 'data-slot': 'hijacked', 'data-size': 'small', 'data-position': 'left' } as HTMLAttributes<HTMLElement>;

      render(
        <Radio aria-label="Cabin class" size="large" position="right" slotProps={{ root: hijack }}>
          <Radio.Item value="economy" slotProps={{ root: hijack }}>
            <Radio.Indicator slotProps={{ root: { 'aria-hidden': false }, icon: hijack }} />
            <Radio.Label slotProps={{ root: hijack }}>Economy</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveAttribute('title', 'hijack');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-position', 'right');

      const item = getRadio('Economy');
      expect(item).toHaveAttribute('data-slot', 'root');
      expect(item).toHaveAttribute('data-size', 'large');
      expect(item).toHaveAttribute('data-position', 'right');

      expect(item.querySelector('.tk-radio-indicator')).toHaveAttribute('aria-hidden', 'true');
      expect(item.querySelector('.tk-radio-icon')).toHaveAttribute('data-slot', 'icon');
      expect(item.querySelector('.tk-radio-label')).toHaveAttribute('data-slot', 'root');
    });

    it('applies provider theme layers beneath instance props', () => {
      render(
        <TakeoffSparProvider
          components={{
            Radio: { className: 'theme-root', defaultProps: { size: 'small', position: 'right' } },
            RadioItem: { classNames: { root: 'theme-item' }, slotProps: { root: { title: 'theme-item' } } },
            RadioIndicator: { classNames: { root: 'theme-indicator', icon: 'theme-icon' }, slotProps: { icon: { title: 'theme-icon' } } },
            RadioLabel: { className: 'theme-label' },
          }}
        >
          <Radio aria-label="Cabin class" size="large" className="instance-root">
            <Radio.Item value="economy" slotProps={{ root: { title: 'instance-item' } }}>
              <Radio.Indicator classNames={{ icon: 'instance-icon' }} slotProps={{ icon: { title: 'instance-icon' } }} />
              <Radio.Label>Economy</Radio.Label>
            </Radio.Item>
            <Radio.Item value="business">
              <Radio.Indicator />
              <Radio.Label>Business</Radio.Label>
            </Radio.Item>
          </Radio>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('radiogroup');
      expect(root).toHaveClass('tk-radio', 'theme-root', 'instance-root');
      // The instance size beats the theme default; the theme position fills the gap.
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-position', 'right');

      const economy = getRadio('Economy');
      const business = getRadio('Business');
      expect(economy).toHaveAttribute('data-size', 'large');
      expect(economy).toHaveAttribute('data-position', 'right');
      expect(economy).toHaveClass('tk-radio-item', 'theme-item');
      expect(economy).toHaveAttribute('title', 'instance-item');
      expect(business).toHaveAttribute('title', 'theme-item');

      expect(economy.querySelector('.tk-radio-indicator')).toHaveClass('tk-radio-indicator', 'theme-indicator');
      expect(economy.querySelector('.tk-radio-icon')).toHaveClass('tk-radio-icon', 'theme-icon', 'instance-icon');
      // Instance slotProps on the internal icon slot beat the theme entry; the theme fills the gap on Business.
      expect(economy.querySelector('.tk-radio-icon')).toHaveAttribute('title', 'instance-icon');
      expect(business.querySelector('.tk-radio-icon')).toHaveAttribute('title', 'theme-icon');
      expect(economy.querySelector('.tk-radio-label')).toHaveClass('tk-radio-label', 'theme-label');
    });
  });

  describe('accessibility', () => {
    it('names each radio from its Radio.Label and keeps the indicator decorative', () => {
      render(
        <Radio aria-label="Cabin class" defaultValue="economy">
          <Radio.Item value="economy">
            <Radio.Indicator aria-hidden={false} />
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      const item = screen.getByRole('radio', { name: 'Economy', checked: true });
      expect(item.querySelector('.tk-radio-indicator')).toHaveAttribute('aria-hidden', 'true');
    });

    it('has no axe violations across the documented anatomy, layouts and states', async () => {
      const { container } = render(
        <>
          {cabinGroup({ defaultValue: 'economy' })}
          <Radio aria-label="Trip type" orientation="horizontal" spread position="right" size="small" defaultValue="one">
            <Radio.Item value="one">
              <Radio.Indicator />
              <Radio.Label>One-way</Radio.Label>
            </Radio.Item>
            <Radio.Item value="round" disabled>
              <Radio.Indicator />
              <Radio.Label>Round trip</Radio.Label>
            </Radio.Item>
          </Radio>
          <Field invalid required>
            <Field.Label>Passport type</Field.Label>
            <Radio>
              <Radio.Item value="standard">
                <Radio.Indicator />
                <Radio.Label>Standard passport</Radio.Label>
              </Radio.Item>
            </Radio>
            <Field.ErrorMessage>Choose a passport type.</Field.ErrorMessage>
          </Field>
        </>,
      );

      expect(await axe(container, AXE_WITHOUT_LABEL_ROLE_RULE)).toHaveNoViolations();
    });

    it('passes every axe rule when items render as a non-label element', async () => {
      const { container } = render(
        <Radio aria-label="Cabin class" defaultValue="economy">
          <Radio.Item as="div" value="economy">
            <Radio.Indicator />
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
          <Radio.Item as="div" value="business">
            <Radio.Indicator />
            <Radio.Label>Business</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('focus management', () => {
    it('exposes the group as a single roving tab stop and still calls consumer focus handlers', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      render(
        <>
          <button type="button">Before</button>
          {cabinGroup({ defaultValue: 'business', onFocus, onBlur })}
          <button type="button">After</button>
        </>,
      );

      expect(screen.getAllByRole('radio').map(item => item.tabIndex)).toEqual([-1, 0, -1]);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

      await user.tab();
      expect(getRadio('Business')).toHaveFocus();
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).not.toHaveBeenCalled();

      // Tab leaves the group instead of walking through the remaining items.
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
      expect(onBlur).toHaveBeenCalledTimes(1);

      await user.tab({ shift: true });
      expect(getRadio('Business')).toHaveFocus();
    });

    it('enters on the first enabled item when nothing is checked and the first item is disabled', async () => {
      const user = userEvent.setup();
      render(
        <Radio aria-label="Cabin class">
          <Radio.Item value="economy" disabled>
            <Radio.Indicator />
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
          <Radio.Item value="business">
            <Radio.Indicator />
            <Radio.Label>Business</Radio.Label>
          </Radio.Item>
        </Radio>,
      );

      expect(getRadio('Economy')).toHaveAttribute('tabindex', '-1');
      expect(getRadio('Business')).toHaveAttribute('tabindex', '0');

      await user.tab();

      expect(getRadio('Business')).toHaveFocus();
    });

    it('focuses the first item on mount with autoFocus when nothing is checked', async () => {
      render(cabinGroup({ autoFocus: true }));

      await waitFor(() => expect(getRadio('Economy')).toHaveFocus());
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-autofocus', '');
    });

    it('does not move focus into a disabled group with autoFocus', () => {
      render(cabinGroup({ autoFocus: true, disabled: true, defaultValue: 'business' }));

      expect(document.body).toHaveFocus();
      for (const item of screen.getAllByRole('radio')) {
        expect(item).not.toHaveFocus();
      }
    });

    it('reports arrow-key selection through onChange without moving a controlled value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { rerender } = render(cabinGroup({ value: 'economy', onChange }));
      await user.tab();

      await user.keyboard('{ArrowDown}');

      expect(getRadio('Business')).toHaveFocus();
      expect(onChange.mock.calls).toEqual([['business']]);
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');

      rerender(cabinGroup({ value: 'business', onChange }));

      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveFocus();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'false');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('blocked interaction', () => {
    it('ignores arrow keys, Home, End and Space in a disabled group even when an item is focused programmatically', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(cabinGroup({ disabled: true, defaultValue: 'economy', onChange }));

      expect(screen.getAllByRole('radio').map(item => item.tabIndex)).toEqual([-1, -1, -1]);

      act(() => {
        getRadio('Business').focus();
      });
      await user.keyboard('{ArrowDown}{End}{Home} ');

      expect(getRadio('Business')).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
    });

    it('blocks Space and the render-prop select() on a disabled item', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const renderFirst = vi.fn((_state: RadioRenderProps) => <Radio.Label>First</Radio.Label>);
      render(
        <Radio aria-label="Cabin class" defaultValue="economy" onChange={onChange}>
          <Radio.Item value="economy">
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
          <Radio.Item value="business" disabled>
            <Radio.Label>Business</Radio.Label>
          </Radio.Item>
          <Radio.Item value="first" disabled>
            {renderFirst}
          </Radio.Item>
        </Radio>,
      );

      act(() => {
        getRadio('Business').focus();
      });
      await user.keyboard(' ');

      const firstState = renderFirst.mock.lastCall?.[0];
      expect(firstState).toEqual(expect.objectContaining({ disabled: true, isChecked: false }));
      act(() => firstState?.select());

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('First')).toHaveAttribute('aria-checked', 'false');
    });

    it('keeps a read-only group reachable by keyboard but blocks Space and the render-prop select()', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const renderFirst = vi.fn((_state: RadioRenderProps) => <Radio.Label>First</Radio.Label>);
      render(
        <Radio aria-label="Cabin class" readOnly selectOnFocus={false} defaultValue="economy" onChange={onChange}>
          <Radio.Item value="economy">
            <Radio.Label>Economy</Radio.Label>
          </Radio.Item>
          <Radio.Item value="business">
            <Radio.Label>Business</Radio.Label>
          </Radio.Item>
          <Radio.Item value="first">{renderFirst}</Radio.Item>
        </Radio>,
      );

      // Inspectable: Tab enters and arrows move focus (selectOnFocus is off, so
      // focus movement alone never selects).
      await user.tab();
      expect(getRadio('Economy')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(getRadio('Business')).toHaveFocus();

      await user.keyboard(' ');
      const firstState = renderFirst.mock.lastCall?.[0];
      expect(firstState).toBeDefined();
      act(() => firstState?.select());

      expect(onChange).not.toHaveBeenCalled();
      expect(getRadio('Economy')).toHaveAttribute('aria-checked', 'true');
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'false');
      expect(getRadio('First')).toHaveAttribute('aria-checked', 'false');
    });

    it('lets explicit required and readOnly props on Radio override the Field values', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Field required readOnly>
          <Field.Label>Cabin class</Field.Label>
          <Radio required={false} readOnly={false} onChange={onChange}>
            {cabinItems}
          </Radio>
        </Field>,
      );

      const root = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(root).not.toHaveAttribute('aria-required');
      expect(root).not.toHaveAttribute('data-required');

      await user.click(getRadio('Business'));

      expect(onChange.mock.calls).toEqual([['business']]);
      expect(getRadio('Business')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('form participation', () => {
    it('applies the id prop to the radiogroup root', () => {
      render(cabinGroup({ id: 'cabin-group' }));

      expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'cabin-group');
    });

    it('submits the defaultValue before any interaction', () => {
      render(<form aria-label="Booking">{cabinGroup({ name: 'cabin', defaultValue: 'first' })}</form>);
      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;

      expect(new FormData(form).get('cabin')).toBe('first');
    });

    it('submits the controlled value and follows parent updates', () => {
      const { rerender } = render(<form aria-label="Booking">{cabinGroup({ name: 'cabin', value: 'economy', onChange: vi.fn() })}</form>);
      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
      expect(new FormData(form).get('cabin')).toBe('economy');

      rerender(<form aria-label="Booking">{cabinGroup({ name: 'cabin', value: 'first', onChange: vi.fn() })}</form>);

      expect(new FormData(form).get('cabin')).toBe('first');
    });

    it('leaves a disabled group out of the submitted form data', () => {
      render(<form aria-label="Booking">{cabinGroup({ name: 'cabin', defaultValue: 'first', disabled: true })}</form>);
      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;

      expect(new FormData(form).get('cabin')).toBeNull();
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Radio.Item renders outside Radio', () => {
      expect(() => render(<Radio.Item value="economy" />)).toThrow(/Radio\.Item must be used within RadioGroupProvider/);
    });

    it('throws a descriptive error when Radio.Indicator renders outside Radio.Item', () => {
      expect(() =>
        render(
          <Radio aria-label="Cabin class">
            <Radio.Indicator />
          </Radio>,
        ),
      ).toThrow(/Radio\.Indicator must be used within RadioItemProvider/);
    });

    it('throws a descriptive error when Radio.Label renders outside Radio.Item', () => {
      expect(() =>
        render(
          <Radio aria-label="Cabin class">
            <Radio.Label>Economy</Radio.Label>
          </Radio>,
        ),
      ).toThrow(/Radio\.Label must be used within RadioItemProvider/);
    });
  });
});
