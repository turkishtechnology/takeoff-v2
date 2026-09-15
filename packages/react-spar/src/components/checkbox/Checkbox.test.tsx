import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { RemoveIconOutlinedRounded } from '@takeoff-icons/react/remove';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ComponentType } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Checkbox, type CheckboxIndicatorRenderProps, type CheckboxRenderProps } from './index';

const indicatorOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-slot="indicator"]');
const iconOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-slot="icon"]');

/** Renders a reference glyph off-document so the built-in icon slot can be compared structurally. */
const referenceGlyph = (Glyph: ComponentType) => {
  const host = document.createElement('div');
  render(<Glyph />, { container: host });
  return host.firstElementChild;
};

const showsGlyph = (root: HTMLElement, Glyph: ComponentType) => iconOf(root)?.firstElementChild?.isEqualNode(referenceGlyph(Glyph)) ?? false;

const SelectAllExtras = ({ onParentChange }: { onParentChange: (next: boolean) => void }) => {
  const [items, setItems] = useState({ seat: true, meal: false });
  const values = Object.values(items);
  const allChecked = values.every(Boolean);
  const indeterminate = !allChecked && values.some(Boolean);

  return (
    <>
      <Checkbox
        aria-label="All extras"
        checked={allChecked}
        indeterminate={indeterminate}
        onChange={next => {
          onParentChange(next);
          setItems({ seat: next, meal: next });
        }}
      >
        <Checkbox.Indicator />
      </Checkbox>
      <Checkbox aria-label="Seat" checked={items.seat} onChange={seat => setItems(previous => ({ ...previous, seat }))}>
        <Checkbox.Indicator />
      </Checkbox>
      <Checkbox aria-label="Meal" checked={items.meal} onChange={meal => setItems(previous => ({ ...previous, meal }))}>
        <Checkbox.Indicator />
      </Checkbox>
    </>
  );
};

describe('Checkbox', () => {
  it('renders a checkbox role by default', () => {
    render(
      <Checkbox>
        <Checkbox.Indicator />
      </Checkbox>,
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  describe('Field context inheritance', () => {
    // Regression: the wrapper used to apply an eager `disabled = false`
    // default and forward it unconditionally, which overrode Spar's
    // `disabled ?? fieldCtx?.disabled` chain — a `<Field disabled>` checkbox
    // stayed interactive. These tests lock the pass-through behavior in.

    it('inherits disabled from a wrapping Field (no explicit prop)', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Disabled option</Field.Label>
          <Checkbox onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      expect(checkbox).toHaveAttribute('data-disabled', '');

      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('inherits invalid from a wrapping Field', () => {
      render(
        <Field invalid>
          <Field.Label>Terms</Field.Label>
          <Checkbox>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('data-invalid', '');
    });

    it('inherits required from a wrapping Field', () => {
      render(
        <Field required>
          <Field.Label>Booking updates</Field.Label>
          <Checkbox>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('data-required', '');
    });

    it('inherits readOnly from a wrapping Field', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field readOnly>
          <Field.Label>Read-only selection</Field.Label>
          <Checkbox onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-readonly', '');

      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('lets an explicit prop override the Field value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Override</Field.Label>
          <Checkbox disabled={false} onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toHaveAttribute('data-disabled');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('takes its accessible name and description from the Field parts and toggles from the label', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field id="terms">
          <Field.Label>I accept the booking terms</Field.Label>
          <Field.Description>Required before payment.</Field.Description>
          <Checkbox onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'I accept the booking terms' });
      expect(checkbox).toHaveAttribute('id', 'terms-field');
      expect(checkbox).toHaveAccessibleDescription('Required before payment.');

      await user.click(screen.getByText('I accept the booking terms'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Standalone behavior', () => {
    it('does not respond to clicks when disabled directly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox disabled onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('toggles on click when enabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('rendering', () => {
    it('renders the root slot contract with the default size and unchecked state', () => {
      render(
        <Checkbox aria-label="Terms">
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox', { name: 'Terms' });
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveClass('tk-checkbox');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('aria-checked', 'false');
      expect(root).toHaveAttribute('tabindex', '0');
      for (const attribute of ['data-checked', 'data-indeterminate', 'data-disabled', 'data-readonly', 'data-required', 'data-invalid']) {
        expect(root).not.toHaveAttribute(attribute);
      }
    });

    it('renders the canonical indicator anatomy with a decorative check glyph', () => {
      render(
        <Checkbox aria-label="Terms">
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      const indicator = indicatorOf(root);
      expect(indicator?.tagName).toBe('SPAN');
      expect(indicator).toHaveClass('tk-checkbox-indicator');
      expect(indicator?.parentElement).toBe(root);

      const icon = iconOf(root);
      expect(icon?.tagName).toBe('SPAN');
      expect(icon).toHaveClass('tk-checkbox-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon?.parentElement).toBe(indicator);
      expect(showsGlyph(root, CheckIconOutlinedRounded)).toBe(true);
      expect(showsGlyph(root, RemoveIconOutlinedRounded)).toBe(false);
    });

    it('reflects size="small" as data-size without leaking a raw size attribute', () => {
      render(
        <Checkbox aria-label="Terms" size="small">
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).not.toHaveAttribute('size');
    });

    it('renders as a native button through the as prop', () => {
      render(
        <Checkbox as="button" aria-label="Terms" disabled>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox', { name: 'Terms' });
      expect(root.tagName).toBe('BUTTON');
      expect(root).toHaveAttribute('type', 'button');
      expect(root).toHaveClass('tk-checkbox');
      expect(root).toBeDisabled();
      expect(root).not.toHaveAttribute('aria-disabled');
    });

    it('forwards refs to the root and the indicator span', () => {
      const rootRef = createRef<HTMLSpanElement>();
      const indicatorRef = createRef<HTMLSpanElement>();

      render(
        <Checkbox aria-label="Terms" ref={rootRef}>
          <Checkbox.Indicator ref={indicatorRef} />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(rootRef.current).toBe(root);
      expect(indicatorRef.current).toBe(indicatorOf(root));
    });

    it('spreads extra Checkbox.Indicator props onto the indicator span', () => {
      render(
        <Checkbox aria-label="Terms">
          <Checkbox.Indicator title="Box" />
        </Checkbox>,
      );

      expect(indicatorOf(screen.getByRole('checkbox'))).toHaveAttribute('title', 'Box');
    });
  });

  describe('classNames and slotProps', () => {
    it('merges className, classNames and the indicator className onto their owner nodes', () => {
      render(
        <Checkbox aria-label="Terms" className="instance-root" classNames={{ root: 'extra-root', indicator: 'extra-indicator', icon: 'extra-icon' }}>
          <Checkbox.Indicator className="own-indicator" />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(root).toHaveClass('tk-checkbox', 'instance-root', 'extra-root');
      expect(root).not.toHaveClass('extra-indicator', 'extra-icon');

      const indicator = indicatorOf(root);
      expect(indicator).toHaveClass('tk-checkbox-indicator', 'own-indicator', 'extra-indicator');
      expect(indicator).not.toHaveClass('extra-root', 'extra-icon');

      const icon = iconOf(root);
      expect(icon).toHaveClass('tk-checkbox-icon', 'extra-icon');
      expect(icon).not.toHaveClass('extra-indicator', 'own-indicator');
    });

    it('lands slotProps on the matching slot and keeps the canonical slot hooks', () => {
      render(
        <Checkbox aria-label="Terms" slotProps={{ root: { title: 'root-title' }, indicator: { title: 'indicator-title' }, icon: { title: 'icon-title' } }}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(root).toHaveAttribute('title', 'root-title');
      expect(root).toHaveAttribute('data-slot', 'root');

      const indicator = indicatorOf(root);
      expect(indicator).toHaveAttribute('title', 'indicator-title');
      expect(indicator).toHaveClass('tk-checkbox-indicator');

      const icon = iconOf(root);
      expect(icon).toHaveAttribute('title', 'icon-title');
      expect(icon).toHaveClass('tk-checkbox-icon');
    });

    it('applies provider theme layers beneath instance props', () => {
      render(
        <TakeoffSparProvider
          components={{
            Checkbox: {
              defaultProps: { size: 'small' },
              className: 'theme-root',
              classNames: { indicator: 'theme-indicator', icon: 'theme-icon' },
              slotProps: { root: { title: 'theme-root' }, icon: { title: 'theme-icon' } },
            },
          }}
        >
          <Checkbox aria-label="Themed" classNames={{ icon: 'instance-icon' }}>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Override" size="base" slotProps={{ root: { title: 'instance-root' } }}>
            <Checkbox.Indicator />
          </Checkbox>
        </TakeoffSparProvider>,
      );

      const themed = screen.getByRole('checkbox', { name: 'Themed' });
      expect(themed).toHaveClass('tk-checkbox', 'theme-root');
      expect(themed).toHaveAttribute('data-size', 'small');
      expect(themed).toHaveAttribute('title', 'theme-root');
      expect(indicatorOf(themed)).toHaveClass('tk-checkbox-indicator', 'theme-indicator');
      expect(iconOf(themed)).toHaveClass('tk-checkbox-icon', 'theme-icon', 'instance-icon');
      expect(iconOf(themed)).toHaveAttribute('title', 'theme-icon');

      const override = screen.getByRole('checkbox', { name: 'Override' });
      expect(override).toHaveAttribute('data-size', 'base');
      expect(override).toHaveAttribute('title', 'instance-root');
    });
  });

  describe('checked state', () => {
    it('starts from defaultChecked and toggles internally when uncontrolled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="Terms" defaultChecked onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps a controlled value until the parent updates checked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <Checkbox aria-label="Terms" checked onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');

      rerender(
        <Checkbox aria-label="Terms" checked={false} onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('follows parent state when controlled through onChange', async () => {
      const user = userEvent.setup();

      const ControlledCheckbox = () => {
        const [accepted, setAccepted] = useState(false);
        return (
          <>
            <Checkbox aria-label="Terms" checked={accepted} onChange={setAccepted}>
              <Checkbox.Indicator />
            </Checkbox>
            <output>{accepted ? 'accepted' : 'pending'}</output>
          </>
        );
      };

      render(<ControlledCheckbox />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('status')).toHaveTextContent('accepted');

      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('status')).toHaveTextContent('pending');
    });
  });

  describe('indeterminate', () => {
    it('emits aria-checked="mixed", data-indeterminate and the dash glyph', () => {
      render(
        <Checkbox aria-label="All extras" indeterminate>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
      expect(checkbox).toHaveAttribute('data-indeterminate', '');
      expect(checkbox).not.toHaveAttribute('data-checked');
      expect(showsGlyph(checkbox, RemoveIconOutlinedRounded)).toBe(true);
      expect(showsGlyph(checkbox, CheckIconOutlinedRounded)).toBe(false);
    });

    it('overrides checked and defaultChecked while set', () => {
      render(
        <>
          <Checkbox aria-label="Controlled" checked indeterminate onChange={vi.fn()}>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Uncontrolled" defaultChecked indeterminate>
            <Checkbox.Indicator />
          </Checkbox>
        </>,
      );

      for (const name of ['Controlled', 'Uncontrolled']) {
        const checkbox = screen.getByRole('checkbox', { name });
        expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
        expect(checkbox).not.toHaveAttribute('data-checked');
      }
    });

    it('reports a plain boolean true from the first toggle out of the mixed state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="All extras" indeterminate onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('leaves the mixed state with a single click when an uncontrolled checkbox clears indeterminate from onChange', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const UncontrolledParent = () => {
        const [indeterminate, setIndeterminate] = useState(true);
        return (
          <Checkbox
            aria-label="All extras"
            indeterminate={indeterminate}
            onChange={next => {
              handleChange(next);
              setIndeterminate(false);
            }}
          >
            <Checkbox.Indicator />
          </Checkbox>
        );
      };

      render(<UncontrolledParent />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-checked', '');
      expect(checkbox).not.toHaveAttribute('data-indeterminate');
      expect(showsGlyph(checkbox, CheckIconOutlinedRounded)).toBe(true);

      await user.click(checkbox);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('drives a controlled select-all parent in and out of the mixed state', async () => {
      const user = userEvent.setup();
      const handleParentChange = vi.fn();

      render(<SelectAllExtras onParentChange={handleParentChange} />);

      const parent = screen.getByRole('checkbox', { name: 'All extras' });
      const seat = screen.getByRole('checkbox', { name: 'Seat' });
      const meal = screen.getByRole('checkbox', { name: 'Meal' });
      expect(parent).toHaveAttribute('aria-checked', 'mixed');

      await user.click(parent);
      expect(handleParentChange).toHaveBeenLastCalledWith(true);
      expect(parent).toHaveAttribute('aria-checked', 'true');
      expect(parent).not.toHaveAttribute('data-indeterminate');
      expect(showsGlyph(parent, CheckIconOutlinedRounded)).toBe(true);
      expect(seat).toHaveAttribute('aria-checked', 'true');
      expect(meal).toHaveAttribute('aria-checked', 'true');

      await user.click(parent);
      expect(handleParentChange).toHaveBeenLastCalledWith(false);
      expect(parent).toHaveAttribute('aria-checked', 'false');
      expect(seat).toHaveAttribute('aria-checked', 'false');
      expect(meal).toHaveAttribute('aria-checked', 'false');

      await user.click(meal);
      expect(parent).toHaveAttribute('aria-checked', 'mixed');
      expect(parent).toHaveAttribute('data-indeterminate', '');
      expect(showsGlyph(parent, RemoveIconOutlinedRounded)).toBe(true);
      expect(handleParentChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('keyboard interaction', () => {
    it('is reachable with Tab and toggles with Space', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="Terms" onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('does not toggle on Enter', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="Terms" onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.tab();
      await user.keyboard('{Enter}');
      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('state props', () => {
    it('removes a disabled checkbox from the tab order and marks it aria-disabled', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Checkbox aria-label="Terms" disabled>
            <Checkbox.Indicator />
          </Checkbox>
          <button type="button">After</button>
        </>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      expect(checkbox).toHaveAttribute('data-disabled', '');
      expect(checkbox).toHaveAttribute('tabindex', '-1');

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('keeps a read-only checkbox focusable but ignores clicks and Space', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="Terms" readOnly defaultChecked onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-readonly', 'true');
      expect(checkbox).toHaveAttribute('data-readonly', '');

      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.keyboard(' ');
      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('exposes required and invalid through ARIA and data hooks', () => {
      render(
        <Checkbox aria-label="Terms" required invalid>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
      expect(checkbox).toHaveAttribute('data-required', '');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(checkbox).toHaveAttribute('data-invalid', '');
    });
  });

  describe('Checkbox.Indicator children', () => {
    it('replaces the default icon slot with ReactNode children', () => {
      render(
        <Checkbox aria-label="Favorite">
          <Checkbox.Indicator>
            <span>Star</span>
          </Checkbox.Indicator>
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(within(indicatorOf(root) as HTMLElement).getByText('Star')).toBeInTheDocument();
      expect(iconOf(root)).toBeNull();
    });

    it('passes { checked, indeterminate } booleans to function children and re-renders on toggle', async () => {
      const user = userEvent.setup();
      const renderIndicator = vi.fn(({ checked }: CheckboxIndicatorRenderProps) => <span>{checked ? 'Starred' : 'Unstarred'}</span>);

      render(
        <Checkbox aria-label="Favorite">
          <Checkbox.Indicator>{renderIndicator}</Checkbox.Indicator>
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: false, indeterminate: false });
      expect(indicatorOf(root)).toHaveTextContent('Unstarred');
      expect(iconOf(root)).toBeNull();

      await user.click(root);
      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: true, indeterminate: false });
      expect(indicatorOf(root)).toHaveTextContent('Starred');
    });

    it('splits the mixed state into checked=false and indeterminate=true for function children', () => {
      const renderIndicator = vi.fn((_state: CheckboxIndicatorRenderProps) => null);

      render(
        <Checkbox aria-label="All extras" checked indeterminate onChange={vi.fn()}>
          <Checkbox.Indicator>{renderIndicator}</Checkbox.Indicator>
        </Checkbox>,
      );

      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: false, indeterminate: true });
    });
  });

  describe('root render prop', () => {
    it("exposes Spar's tri-state to function children while still providing compound context", () => {
      const renderRoot = vi.fn((state: CheckboxRenderProps) => (
        <>
          <Checkbox.Indicator />
          <span>{String(state.checked)}</span>
        </>
      ));

      render(
        <Checkbox aria-label="All extras" indeterminate invalid>
          {renderRoot}
        </Checkbox>,
      );

      const root = screen.getByRole('checkbox');
      expect(renderRoot).toHaveBeenLastCalledWith(
        expect.objectContaining({ checked: 'indeterminate', disabled: false, readOnly: false, required: false, invalid: true, setChecked: expect.any(Function) }),
      );
      expect(root).toHaveTextContent('indeterminate');
      expect(iconOf(root)?.parentElement).toBe(indicatorOf(root));
      expect(showsGlyph(root, RemoveIconOutlinedRounded)).toBe(true);
    });

    it('re-renders function children with the toggled boolean state', async () => {
      const user = userEvent.setup();
      const renderRoot = vi.fn((state: CheckboxRenderProps) => <span>{String(state.checked)}</span>);

      render(<Checkbox aria-label="Terms">{renderRoot}</Checkbox>);

      const root = screen.getByRole('checkbox');
      expect(root).toHaveTextContent('false');

      await user.click(root);
      expect(renderRoot).toHaveBeenLastCalledWith(expect.objectContaining({ checked: true }));
      expect(root).toHaveTextContent('true');
    });
  });

  describe('form integration', () => {
    it('submits checked values through synchronized hidden inputs that share a name', async () => {
      const user = userEvent.setup();

      render(
        <form aria-label="Extras">
          <Checkbox aria-label="Seat" name="extras" value="seat" defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Meal" name="extras" value="meal">
            <Checkbox.Indicator />
          </Checkbox>
        </form>,
      );

      const form = screen.getByRole('form', { name: 'Extras' }) as HTMLFormElement;
      const hiddenInputs = within(form)
        .getAllByRole('checkbox', { hidden: true })
        .filter(element => element.tagName === 'INPUT');
      expect(hiddenInputs).toHaveLength(2);
      for (const input of hiddenInputs) {
        expect(input).toHaveAttribute('name', 'extras');
        expect(input).toHaveAttribute('aria-hidden', 'true');
        expect(input).toHaveAttribute('tabindex', '-1');
      }
      expect(new FormData(form).getAll('extras')).toEqual(['seat']);

      await user.click(screen.getByRole('checkbox', { name: 'Meal' }));
      expect(new FormData(form).getAll('extras')).toEqual(['seat', 'meal']);

      await user.click(screen.getByRole('checkbox', { name: 'Seat' }));
      expect(new FormData(form).getAll('extras')).toEqual(['meal']);
    });

    it('renders no hidden input without a name', () => {
      render(
        <form aria-label="Unnamed">
          <Checkbox aria-label="Terms" defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
        </form>,
      );

      const form = screen.getByRole('form', { name: 'Unnamed' });
      expect(within(form).getAllByRole('checkbox', { hidden: true })).toEqual([screen.getByRole('checkbox', { name: 'Terms' })]);
    });
  });

  describe('Field error wiring', () => {
    it('points aria-describedby at Field.ErrorMessage while invalid and back at Field.Description once valid', () => {
      const renderField = (invalid: boolean) => (
        <Field id="terms" invalid={invalid}>
          <Field.Label>I accept the booking terms</Field.Label>
          <Checkbox>
            <Checkbox.Indicator />
          </Checkbox>
          <Field.Description>Required before payment.</Field.Description>
          <Field.ErrorMessage>You must accept the terms to continue.</Field.ErrorMessage>
        </Field>
      );

      const { rerender } = render(renderField(true));

      const checkbox = screen.getByRole('checkbox', { name: 'I accept the booking terms' });
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
      expect(checkbox).toHaveAccessibleDescription('You must accept the terms to continue.');

      rerender(renderField(false));

      expect(checkbox).not.toHaveAttribute('aria-invalid');
      expect(checkbox).not.toHaveAttribute('data-invalid');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-description');
      expect(checkbox).toHaveAccessibleDescription('Required before payment.');
    });
  });

  describe('blocked and form keyboard paths', () => {
    it('ignores Space on a disabled checkbox even when it holds focus', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox aria-label="Terms" disabled onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      const checkbox = screen.getByRole('checkbox');
      act(() => checkbox.focus());
      expect(checkbox).toHaveFocus();

      await user.keyboard(' ');
      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toHaveAttribute('data-checked');
    });

    it('submits the owning form on Enter without toggling the checkbox', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleSubmit = vi.fn((event: SubmitEvent | { preventDefault: () => void }) => event.preventDefault());

      render(
        <form aria-label="Checkout" onSubmit={handleSubmit}>
          <Checkbox aria-label="Terms" onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </form>,
      );

      await user.tab();
      await user.keyboard('{Enter}');
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('autoFocus', () => {
    it('moves focus to the checkbox after mount only when autoFocus is set', async () => {
      render(
        <>
          <Checkbox aria-label="Plain">
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Focused" autoFocus>
            <Checkbox.Indicator />
          </Checkbox>
        </>,
      );

      await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Focused' })).toHaveFocus());
      expect(screen.getByRole('checkbox', { name: 'Plain' })).not.toHaveFocus();
    });
  });

  describe('root layering', () => {
    it('merges theme and instance classes on the root and keeps data-* hooks above slotProps.root', () => {
      const rootOverrides = { 'data-size': 'small', 'data-slot': 'hijacked' } as Record<string, string>;

      render(
        <TakeoffSparProvider components={{ Checkbox: { className: 'theme-root' } }}>
          <Checkbox aria-label="Terms" className="instance-root" classNames={{ root: 'instance-root-slot' }} slotProps={{ root: rootOverrides }}>
            <Checkbox.Indicator />
          </Checkbox>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('checkbox');
      expect(root).toHaveClass('tk-checkbox', 'theme-root', 'instance-root', 'instance-root-slot');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-slot', 'root');
    });
  });

  describe('external form association', () => {
    it('forwards the form prop to the hidden input so a form elsewhere in the document receives the value', () => {
      render(
        <>
          <form id="extras-form" aria-label="Extras" />
          <Checkbox aria-label="Seat" name="extras" value="seat" form="extras-form" defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
        </>,
      );

      const hiddenInput = screen.getAllByRole('checkbox', { hidden: true }).find(element => element.tagName === 'INPUT');
      expect(hiddenInput).toHaveAttribute('form', 'extras-form');
      expect(new FormData(screen.getByRole('form', { name: 'Extras' }) as HTMLFormElement).getAll('extras')).toEqual(['seat']);
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Checkbox.Indicator renders outside Checkbox', () => {
      expect(() => render(<Checkbox.Indicator />)).toThrow(/Checkbox\.Indicator must be used within CheckboxProvider/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations inside a Field with a label and description', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Notifications</Field.Label>
          <Checkbox defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
          <Field.Description>We will only email you when a saved route drops in price.</Field.Description>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations across sizes, indeterminate and state variants', async () => {
      const { container } = render(
        <>
          <Checkbox aria-label="Small" size="small" defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="All extras" indeterminate>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Disabled" disabled>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Read-only" readOnly required invalid defaultChecked>
            <Checkbox.Indicator />
          </Checkbox>
          <Checkbox aria-label="Favorite">
            <Checkbox.Indicator>{({ checked }) => (checked ? <span aria-hidden>starred</span> : null)}</Checkbox.Indicator>
          </Checkbox>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
