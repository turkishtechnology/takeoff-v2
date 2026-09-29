import userEvent from '@testing-library/user-event';
import { createRef, type FormEvent } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

const getRevealButton = () => screen.getByRole('button', { name: 'Toggle password visibility' });
const getPasswordField = () => screen.getByLabelText('Password');

const PasswordInput = () => (
  <Input>
    <Input.Field aria-label="Password" type="password" defaultValue="s3cret" />
    <Input.RevealButton />
  </Input>
);

describe('Input.RevealButton', () => {
  describe('rendering', () => {
    it('renders a toggle button with the canonical class, aria-pressed=false and a default icon', () => {
      render(<PasswordInput />);

      const button = getRevealButton();
      expect(button).toHaveClass('tk-button', 'tk-input-reveal-button');
      expect(button).toHaveAttribute('data-slot', 'root');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button.querySelector('svg')).toBeInTheDocument();
      expect(getPasswordField()).toHaveAttribute('type', 'password');
    });

    it('renders custom children in place of the default icon', () => {
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton>
            <span data-testid="custom-eye" />
          </Input.RevealButton>
        </Input>,
      );

      const button = getRevealButton();
      expect(within(button).getByTestId('custom-eye')).toBeInTheDocument();
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });

    it('cascades the Input size and lands className, classNames and slotProps on the button', () => {
      render(
        <Input size="small">
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton className="instance-class" classNames={{ root: 'slot-class' }} slotProps={{ root: { title: 'Show or hide' } }} />
        </Input>,
      );

      const button = getRevealButton();
      expect(button).toHaveAttribute('data-size', 'small');
      expect(button).toHaveClass('tk-input-reveal-button', 'instance-class', 'slot-class');
      expect(button).toHaveAttribute('title', 'Show or hide');
    });

    it('accepts a custom accessible name in place of the default', () => {
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton aria-label="Şifreyi göster" />
        </Input>,
      );

      expect(screen.getByRole('button', { name: 'Şifreyi göster' })).toHaveClass('tk-input-reveal-button');
      expect(screen.queryByRole('button', { name: 'Toggle password visibility' })).not.toBeInTheDocument();
    });

    it('forwards the ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton ref={ref} />
        </Input>,
      );

      expect(ref.current).toBe(getRevealButton());
    });
  });

  describe('toggling', () => {
    it('reveals and hides the password on click, keeping focus on the field', async () => {
      const user = userEvent.setup();
      render(<PasswordInput />);

      await user.click(getRevealButton());
      expect(getPasswordField()).toHaveAttribute('type', 'text');
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'true');
      expect(getPasswordField()).toHaveFocus();

      await user.click(getRevealButton());
      expect(getPasswordField()).toHaveAttribute('type', 'password');
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles from the keyboard with Enter and Space', async () => {
      const user = userEvent.setup();
      render(<PasswordInput />);

      await user.click(getPasswordField());
      await user.tab();
      expect(getRevealButton()).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(getPasswordField()).toHaveAttribute('type', 'text');

      await user.tab();
      await user.keyboard(' ');
      expect(getPasswordField()).toHaveAttribute('type', 'password');
      expect(getPasswordField()).toHaveValue('s3cret');
    });

    it('keeps aria-pressed tied to the reveal state even when a consumer passes one', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton aria-pressed />
        </Input>,
      );

      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');

      await user.click(getRevealButton());
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'true');
      expect(getPasswordField()).toHaveAttribute('type', 'text');
    });

    it('leaves a non-password field type untouched while revealed', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Email" type="email" />
          <Input.RevealButton />
        </Input>,
      );

      await user.click(getRevealButton());

      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
    });

    it('runs the consumer onClick, then slotProps.root.onClick, then toggles', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const slotOnClick = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton onClick={onClick} slotProps={{ root: { onClick: slotOnClick } }} />
        </Input>,
      );

      await user.click(getRevealButton());

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(slotOnClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(slotOnClick.mock.invocationCallOrder[0]);
      expect(getPasswordField()).toHaveAttribute('type', 'text');
    });

    it('does not toggle when the consumer onClick prevents default', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton onClick={event => event.preventDefault()} />
        </Input>,
      );

      await user.click(getRevealButton());

      expect(getPasswordField()).toHaveAttribute('type', 'password');
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not toggle when slotProps.root.onClick prevents default', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton slotProps={{ root: { onClick: event => event.preventDefault() } }} />
        </Input>,
      );

      await user.click(getRevealButton());

      expect(getPasswordField()).toHaveAttribute('type', 'password');
    });

    it('hides the password again when the owning form is submitted', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      render(
        <form aria-label="Sign in" onSubmit={onSubmit}>
          <PasswordInput />
          <button type="submit">Sign in</button>
        </form>,
      );
      const submit = screen.getByRole('button', { name: 'Sign in' });

      // Submitting while hidden leaves the field hidden.
      await user.click(submit);
      expect(getPasswordField()).toHaveAttribute('type', 'password');

      await user.click(getRevealButton());
      expect(getPasswordField()).toHaveAttribute('type', 'text');

      await user.click(submit);
      expect(getPasswordField()).toHaveAttribute('type', 'password');
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    it('starts hidden again when the field remounts after being revealed', async () => {
      const user = userEvent.setup();
      const TogglableField = ({ showField }: { showField: boolean }) => (
        <Input>
          {showField && <Input.Field aria-label="Password" type="password" />}
          <Input.RevealButton />
        </Input>
      );
      const { rerender } = render(<TogglableField showField />);

      await user.click(getRevealButton());
      expect(getPasswordField()).toHaveAttribute('type', 'text');

      rerender(<TogglableField showField={false} />);
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');

      rerender(<TogglableField showField />);
      expect(getPasswordField()).toHaveAttribute('type', 'password');
    });
  });

  describe('disabled and readOnly', () => {
    it.each([{ disabled: true }, { readOnly: true }])('disables the button when the Input is %o', async stateProps => {
      const user = userEvent.setup();
      render(
        <Input {...stateProps}>
          <Input.Field aria-label="Password" type="password" defaultValue="s3cret" />
          <Input.RevealButton />
        </Input>,
      );

      expect(getRevealButton()).toBeDisabled();

      await user.click(getRevealButton());

      expect(getPasswordField()).toHaveAttribute('type', 'password');
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('consumer disabled', () => {
    it('disables the button on its own while the field stays editable', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Password" type="password" defaultValue="s3cret" />
          <Input.RevealButton disabled />
        </Input>,
      );

      expect(getRevealButton()).toBeDisabled();
      expect(getPasswordField()).toBeEnabled();

      await user.click(getRevealButton());
      expect(getPasswordField()).toHaveAttribute('type', 'password');
    });

    it('cannot re-enable the button in a disabled Input', () => {
      render(
        <Input disabled>
          <Input.Field aria-label="Password" type="password" />
          <Input.RevealButton disabled={false} />
        </Input>,
      );

      expect(getRevealButton()).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in the hidden and revealed states', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Field>
          <Field.Label>Password</Field.Label>
          <Input>
            <Input.Field type="password" defaultValue="s3cret" />
            <Input.RevealButton />
          </Input>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();

      await user.click(getRevealButton());
      expect(getRevealButton()).toHaveAttribute('aria-pressed', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
