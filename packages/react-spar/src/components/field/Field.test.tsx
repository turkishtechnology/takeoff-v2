import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';
import { Radio } from '../radio';

import { Field, type FieldProps } from './index';

const STATE_ATTRIBUTES = ['data-invalid', 'data-disabled', 'data-required', 'data-optional', 'data-readonly'];

interface FieldRenderState {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  optional: boolean;
  readOnly: boolean;
}

const cabinRadio = (
  <Radio>
    <Radio.Item value="economy">
      <Radio.Indicator />
      <Radio.Label>Economy</Radio.Label>
    </Radio.Item>
    <Radio.Item value="business">
      <Radio.Indicator />
      <Radio.Label>Business</Radio.Label>
    </Radio.Item>
  </Radio>
);

describe('Field (compound)', () => {
  describe('rendering', () => {
    it('renders the root and every part with the canonical anatomy', () => {
      const { container } = render(
        <Field id="email" invalid required>
          <Field.Label>Email</Field.Label>
          <input id="email-field" />
          <Field.Description>We only use this for booking updates.</Field.Description>
          <Field.ErrorMessage>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );

      const root = container.querySelector('.tk-field');
      expect(root?.tagName).toBe('DIV');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('id', 'email');

      const label = container.querySelector('.tk-field-label');
      expect(label?.tagName).toBe('LABEL');
      expect(label?.parentElement).toBe(root);
      expect(label).toHaveAttribute('data-slot', 'root');
      expect(label).toHaveAttribute('id', 'email-label');
      expect(label).toHaveAttribute('for', 'email-field');

      const asterisk = label?.querySelector('.tk-field-asterisk');
      expect(asterisk?.tagName).toBe('SPAN');
      expect(label?.lastElementChild).toBe(asterisk);
      expect(asterisk).toHaveAttribute('data-slot', 'asterisk');
      expect(asterisk).toHaveAttribute('aria-hidden', 'true');
      expect(asterisk).toHaveTextContent('*');

      const description = container.querySelector('.tk-field-description');
      expect(description?.tagName).toBe('DIV');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description).toHaveAttribute('id', 'email-description');
      expect(description).toHaveTextContent('We only use this for booking updates.');

      const descriptionIcon = description?.querySelector('.tk-field-description-icon');
      expect(descriptionIcon?.tagName).toBe('SPAN');
      expect(description?.firstElementChild).toBe(descriptionIcon);
      expect(descriptionIcon).toHaveAttribute('data-slot', 'icon');
      expect(descriptionIcon).toHaveAttribute('aria-hidden', 'true');
      expect(descriptionIcon?.querySelector('svg')).not.toBeNull();

      const error = screen.getByRole('alert');
      expect(error.tagName).toBe('DIV');
      expect(error).toHaveClass('tk-field-error-message');
      expect(error).toHaveAttribute('data-slot', 'root');
      expect(error).toHaveAttribute('id', 'email-error');
      expect(error).toHaveTextContent('Enter a complete email address.');

      const errorIcon = error.querySelector('.tk-field-error-message-icon');
      expect(errorIcon?.tagName).toBe('SPAN');
      expect(error.firstElementChild).toBe(errorIcon);
      expect(errorIcon).toHaveAttribute('data-slot', 'icon');
      expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
      expect(errorIcon?.querySelector('svg')).not.toBeNull();
    });

    it('derives coordinated part ids from a generated base id when none is provided', () => {
      const { container } = render(
        <Field>
          <Field.Label>Passenger name</Field.Label>
          <Field.Description>Exactly as printed on your passport.</Field.Description>
        </Field>,
      );

      const root = container.querySelector('.tk-field') as HTMLElement;
      expect(root.id).not.toBe('');

      const label = container.querySelector('.tk-field-label');
      expect(label).toHaveAttribute('id', `${root.id}-label`);
      expect(label).toHaveAttribute('for', `${root.id}-field`);
      expect(container.querySelector('.tk-field-description')).toHaveAttribute('id', `${root.id}-description`);
    });

    it('emits no state data attributes and no asterisk by default', () => {
      const { container } = render(
        <Field>
          <Field.Label>Passenger name</Field.Label>
        </Field>,
      );

      const root = container.querySelector('.tk-field');
      for (const attribute of STATE_ATTRIBUTES) {
        expect(root).not.toHaveAttribute(attribute);
      }
      expect(container.querySelector('.tk-field-asterisk')).toBeNull();
    });

    it.each<{ props: Partial<FieldProps>; attribute: string }>([
      { props: { invalid: true }, attribute: 'data-invalid' },
      { props: { disabled: true }, attribute: 'data-disabled' },
      { props: { required: true }, attribute: 'data-required' },
      { props: { optional: true }, attribute: 'data-optional' },
      { props: { readOnly: true }, attribute: 'data-readonly' },
    ])('reflects only $attribute onto the root for its state prop', ({ props, attribute }) => {
      const { container } = render(
        <Field {...props}>
          <Field.Label>Passenger name</Field.Label>
        </Field>,
      );

      const root = container.querySelector('.tk-field');
      expect(root).toHaveAttribute(attribute, '');
      for (const other of STATE_ATTRIBUTES.filter(name => name !== attribute)) {
        expect(root).not.toHaveAttribute(other);
      }
    });

    it('renders every part as a custom element through the as prop', () => {
      const { container } = render(
        <Field as="section" invalid>
          <Field.Label as="span">Cabin</Field.Label>
          <Field.Description as="p">Pick one cabin.</Field.Description>
          <Field.ErrorMessage as="p">A cabin is required.</Field.ErrorMessage>
        </Field>,
      );

      expect(container.querySelector('.tk-field')?.tagName).toBe('SECTION');
      expect(container.querySelector('.tk-field-label')?.tagName).toBe('SPAN');
      expect(container.querySelector('.tk-field-description')?.tagName).toBe('P');
      expect(screen.getByRole('alert').tagName).toBe('P');
    });

    it('forwards refs to the DOM node of every part', () => {
      const rootRef = createRef<HTMLDivElement>();
      const labelRef = createRef<HTMLLabelElement>();
      const descriptionRef = createRef<HTMLDivElement>();
      const errorRef = createRef<HTMLDivElement>();

      render(
        <Field ref={rootRef} invalid>
          <Field.Label ref={labelRef}>Email</Field.Label>
          <Field.Description ref={descriptionRef}>We only use this for booking updates.</Field.Description>
          <Field.ErrorMessage ref={errorRef}>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );

      expect(rootRef.current).toHaveClass('tk-field');
      expect(labelRef.current).toHaveClass('tk-field-label');
      expect(descriptionRef.current).toHaveClass('tk-field-description');
      expect(errorRef.current).toBe(screen.getByRole('alert'));
    });

    it('passes the resolved field state to a render-prop child', () => {
      const renderChildren = vi.fn((_state: FieldRenderState) => <Field.Label>Email</Field.Label>);

      render(
        <Field invalid required>
          {renderChildren}
        </Field>,
      );

      expect(renderChildren).toHaveBeenLastCalledWith({ invalid: true, disabled: false, required: true, optional: false, readOnly: false });
      expect(screen.getByText('Email')).toHaveClass('tk-field-label');
    });
  });

  describe('Field.Label', () => {
    it('renders the required asterisk only while the field is required', () => {
      const { container, rerender } = render(
        <Field>
          <Field.Label>Email</Field.Label>
        </Field>,
      );
      expect(container.querySelector('.tk-field-asterisk')).toBeNull();

      rerender(
        <Field required>
          <Field.Label>Email</Field.Label>
        </Field>,
      );
      expect(container.querySelector('.tk-field-asterisk')).toHaveTextContent('*');

      rerender(
        <Field required={false}>
          <Field.Label>Email</Field.Label>
        </Field>,
      );
      expect(container.querySelector('.tk-field-asterisk')).toBeNull();
    });

    it('labels its control and keeps the decorative asterisk out of the accessible name', async () => {
      const user = userEvent.setup();
      render(
        <Field id="email" required>
          <Field.Label slotProps={{ asterisk: { 'aria-hidden': false } }}>Email</Field.Label>
          <input id="email-field" />
        </Field>,
      );

      const input = screen.getByRole('textbox', { name: 'Email' });
      // The aria-hidden invariant survives a slotProps override attempt.
      expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');

      await user.click(screen.getByText('Email'));

      expect(input).toHaveFocus();
    });
  });

  describe('Field.Description', () => {
    it.each([
      ['no children', undefined],
      ['an empty string', ''],
      ['null', null],
      ['a false boolean (`cond && message` collapsing)', false],
    ])('renders no leading icon for %s', (_case, children) => {
      const { container } = render(
        <Field>
          <Field.Description>{children}</Field.Description>
        </Field>,
      );

      const description = container.querySelector('.tk-field-description');
      expect(description).not.toBeNull();
      expect(description?.querySelector('.tk-field-description-icon')).toBeNull();
    });
  });

  describe('Field.ErrorMessage', () => {
    it('renders only while the field is invalid', () => {
      const { container, rerender } = render(
        <Field>
          <Field.ErrorMessage>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );
      expect(screen.queryByRole('alert')).toBeNull();
      expect(container.querySelector('.tk-field-error-message')).toBeNull();
      expect(container.querySelector('.tk-field-error-message-icon')).toBeNull();

      rerender(
        <Field invalid>
          <Field.ErrorMessage>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete email address.');
      expect(container.querySelector('.tk-field-error-message-icon')).not.toBeNull();

      rerender(
        <Field invalid={false}>
          <Field.ErrorMessage>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it.each([
      ['no children', undefined],
      ['an empty string', ''],
      ['null', null],
      ['a false boolean (`cond && message` collapsing)', false],
    ])('renders no leading icon for %s', (_case, children) => {
      render(
        <Field invalid>
          <Field.ErrorMessage>{children}</Field.ErrorMessage>
        </Field>,
      );

      expect(screen.getByRole('alert').querySelector('.tk-field-error-message-icon')).toBeNull();
    });
  });

  describe('control wiring', () => {
    it('labels and describes a nested Radio group through the Field parts', () => {
      render(
        <Field>
          <Field.Label>Cabin class</Field.Label>
          {cabinRadio}
          <Field.Description>Pick the cabin for every passenger.</Field.Description>
        </Field>,
      );

      const group = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(group).toHaveAccessibleDescription('Pick the cabin for every passenger.');
      expect(group).not.toHaveAttribute('aria-invalid');
      expect(group).not.toHaveAttribute('aria-required');
    });

    it('points the control description at the error message and cascades state while invalid', () => {
      render(
        <Field invalid required>
          <Field.Label>Cabin class</Field.Label>
          {cabinRadio}
          <Field.Description>Pick the cabin for every passenger.</Field.Description>
          <Field.ErrorMessage>Choose a cabin to continue.</Field.ErrorMessage>
        </Field>,
      );

      // The accessible name excludes the decorative required asterisk.
      const group = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(group).toHaveAccessibleDescription('Choose a cabin to continue.');
      expect(group).toHaveAttribute('aria-invalid', 'true');
      expect(group).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('renderable content', () => {
    it.each<[string, ReactNode, string]>([
      ['the number zero', 0, '0'],
      ['an element', <strong key="element">Required for international flights</strong>, 'Required for international flights'],
    ])('renders the leading description and error icons for %s', (_case, children, text) => {
      const { container } = render(
        <Field invalid>
          <Field.Description>{children}</Field.Description>
          <Field.ErrorMessage>{children}</Field.ErrorMessage>
        </Field>,
      );

      const description = container.querySelector('.tk-field-description');
      expect(description).toHaveTextContent(text);
      expect(description?.firstElementChild).toHaveClass('tk-field-description-icon');

      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent(text);
      expect(error.firstElementChild).toHaveClass('tk-field-error-message-icon');
    });

    it('re-invokes a render-prop child with the updated field state', () => {
      const renderChildren = vi.fn((state: FieldRenderState) => <Field.Label>{state.disabled ? 'Email (locked)' : 'Email'}</Field.Label>);
      const { rerender } = render(<Field>{renderChildren}</Field>);

      expect(renderChildren).toHaveBeenLastCalledWith({ invalid: false, disabled: false, required: false, optional: false, readOnly: false });
      expect(screen.getByText('Email')).toHaveClass('tk-field-label');

      rerender(
        <Field disabled optional readOnly>
          {renderChildren}
        </Field>,
      );

      expect(renderChildren).toHaveBeenLastCalledWith({ invalid: false, disabled: true, required: false, optional: true, readOnly: true });
      expect(screen.getByText('Email (locked)')).toHaveClass('tk-field-label');
    });
  });

  describe('coordinated ids with a nested control', () => {
    it('derives the Radio group id, label target and description link from the Field id', () => {
      const { container } = render(
        <Field id="cabin">
          <Field.Label>Cabin class</Field.Label>
          {cabinRadio}
          <Field.Description>Pick the cabin for every passenger.</Field.Description>
        </Field>,
      );

      const group = screen.getByRole('radiogroup', { name: 'Cabin class' });
      expect(group).toHaveAttribute('id', 'cabin-field');
      expect(container.querySelector('.tk-field-label')).toHaveAttribute('for', group.id);
      expect(group).toHaveAttribute('aria-labelledby', 'cabin-label');
      expect(group).toHaveAttribute('aria-describedby', 'cabin-description');
    });

    it('lets an explicit aria-describedby on the Radio replace the Field description wiring', () => {
      render(
        <Field>
          <Field.Label>Cabin class</Field.Label>
          <Radio aria-describedby="fare-note">
            <Radio.Item value="economy">
              <Radio.Indicator />
              <Radio.Label>Economy</Radio.Label>
            </Radio.Item>
          </Radio>
          <Field.Description>Pick the cabin for every passenger.</Field.Description>
          <p id="fare-note">Fares differ by cabin.</p>
        </Field>,
      );

      expect(screen.getByRole('radiogroup', { name: 'Cabin class' })).toHaveAccessibleDescription('Fares differ by cabin.');
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto the owner node of each part', () => {
      const { container } = render(
        <Field required invalid className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'field' } }}>
          <Field.Label
            className="label-extra"
            classNames={{ root: 'label-slot', asterisk: 'asterisk-slot' }}
            slotProps={{ root: { title: 'label' }, asterisk: { title: 'asterisk' } }}
          >
            Email
          </Field.Label>
          <Field.Description
            className="description-extra"
            classNames={{ root: 'description-slot', icon: 'description-icon-slot' }}
            slotProps={{ root: { title: 'description' }, icon: { title: 'description-icon' } }}
          >
            We only use this for booking updates.
          </Field.Description>
          <Field.ErrorMessage
            className="error-extra"
            classNames={{ root: 'error-slot', icon: 'error-icon-slot' }}
            slotProps={{ root: { title: 'error' }, icon: { title: 'error-icon' } }}
          >
            Enter a complete email address.
          </Field.ErrorMessage>
        </Field>,
      );

      const root = container.querySelector('.tk-field');
      expect(root).toHaveClass('tk-field', 'root-extra', 'root-slot');
      expect(root).toHaveAttribute('title', 'field');

      const label = container.querySelector('.tk-field-label');
      expect(label).toHaveClass('tk-field-label', 'label-extra', 'label-slot');
      expect(label).not.toHaveClass('asterisk-slot');
      expect(label).toHaveAttribute('title', 'label');

      const asterisk = container.querySelector('.tk-field-asterisk');
      expect(asterisk).toHaveClass('tk-field-asterisk', 'asterisk-slot');
      expect(asterisk).not.toHaveClass('label-slot');
      expect(asterisk).not.toHaveClass('label-extra');
      expect(asterisk).toHaveAttribute('title', 'asterisk');

      const description = container.querySelector('.tk-field-description');
      expect(description).toHaveClass('tk-field-description', 'description-extra', 'description-slot');
      expect(description).not.toHaveClass('description-icon-slot');
      expect(description).toHaveAttribute('title', 'description');

      const descriptionIcon = container.querySelector('.tk-field-description-icon');
      expect(descriptionIcon).toHaveClass('tk-field-description-icon', 'description-icon-slot');
      expect(descriptionIcon).not.toHaveClass('description-slot');
      expect(descriptionIcon).not.toHaveClass('description-extra');
      expect(descriptionIcon).toHaveAttribute('title', 'description-icon');

      const error = screen.getByRole('alert');
      expect(error).toHaveClass('tk-field-error-message', 'error-extra', 'error-slot');
      expect(error).not.toHaveClass('error-icon-slot');
      expect(error).toHaveAttribute('title', 'error');

      const errorIcon = container.querySelector('.tk-field-error-message-icon');
      expect(errorIcon).toHaveClass('tk-field-error-message-icon', 'error-icon-slot');
      expect(errorIcon).not.toHaveClass('error-slot');
      expect(errorIcon).not.toHaveClass('error-extra');
      expect(errorIcon).toHaveAttribute('title', 'error-icon');
    });

    it('keeps the coordinated ids, the alert role and decorative icons when slotProps try to override them', () => {
      const { container } = render(
        <Field id="email" required invalid>
          <Field.Label slotProps={{ root: { id: 'custom-label' }, asterisk: { 'aria-hidden': false } }}>Email</Field.Label>
          <Field.Description slotProps={{ root: { id: 'custom-description' }, icon: { 'aria-hidden': false } }}>We only use this for booking updates.</Field.Description>
          <Field.ErrorMessage slotProps={{ root: { id: 'custom-error', role: 'status' }, icon: { 'aria-hidden': false } }}>Enter a complete email address.</Field.ErrorMessage>
        </Field>,
      );

      expect(container.querySelector('.tk-field-label')).toHaveAttribute('id', 'email-label');
      expect(container.querySelector('.tk-field-asterisk')).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelector('.tk-field-description')).toHaveAttribute('id', 'email-description');
      expect(container.querySelector('.tk-field-description-icon')).toHaveAttribute('aria-hidden', 'true');

      expect(screen.queryByRole('status')).toBeNull();
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'email-error');
      expect(error.querySelector('.tk-field-error-message-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies provider theme layers beneath instance props', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Field: { className: 'theme-field', defaultProps: { required: true } },
            FieldLabel: { classNames: { asterisk: 'theme-asterisk' }, slotProps: { asterisk: { title: 'Required' } } },
            FieldDescription: { classNames: { root: 'theme-description', icon: 'theme-description-icon' }, slotProps: { icon: { title: 'theme' } } },
            FieldErrorMessage: { className: 'theme-error', classNames: { icon: 'theme-error-icon' }, slotProps: { icon: { title: 'theme' } } },
          }}
        >
          <Field invalid className="instance-field">
            <Field.Label>Email</Field.Label>
            <Field.Description classNames={{ icon: 'instance-description-icon' }}>We only use this for booking updates.</Field.Description>
            <Field.ErrorMessage slotProps={{ icon: { title: 'instance' } }}>Enter a complete email address.</Field.ErrorMessage>
          </Field>
        </TakeoffSparProvider>,
      );

      const root = container.querySelector('.tk-field');
      expect(root).toHaveClass('tk-field', 'theme-field', 'instance-field');
      // The theme default fills in `required`, which drives the asterisk.
      expect(root).toHaveAttribute('data-required', '');

      const asterisk = container.querySelector('.tk-field-asterisk');
      expect(asterisk).toHaveClass('tk-field-asterisk', 'theme-asterisk');
      expect(asterisk).toHaveAttribute('title', 'Required');

      expect(container.querySelector('.tk-field-description')).toHaveClass('tk-field-description', 'theme-description');
      const descriptionIcon = container.querySelector('.tk-field-description-icon');
      expect(descriptionIcon).toHaveClass('theme-description-icon', 'instance-description-icon');
      expect(descriptionIcon).toHaveAttribute('title', 'theme');

      const error = screen.getByRole('alert');
      expect(error).toHaveClass('tk-field-error-message', 'theme-error');
      const errorIcon = error.querySelector('.tk-field-error-message-icon');
      expect(errorIcon).toHaveClass('theme-error-icon');
      expect(errorIcon).toHaveAttribute('title', 'instance');
    });

    it('lets an instance state prop override a theme default', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ Field: { defaultProps: { required: true } } }}>
          <Field required={false}>
            <Field.Label>Email</Field.Label>
          </Field>
        </TakeoffSparProvider>,
      );

      expect(container.querySelector('.tk-field')).not.toHaveAttribute('data-required');
      expect(container.querySelector('.tk-field-asterisk')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for label, description and error parts', async () => {
      const { container } = render(
        <>
          <Field id="passenger" required>
            <Field.Label>Passenger name</Field.Label>
            <input id="passenger-field" aria-describedby="passenger-description" required />
            <Field.Description>Exactly as printed on your passport.</Field.Description>
          </Field>
          <Field id="email" invalid>
            <Field.Label>Email</Field.Label>
            <input id="email-field" aria-describedby="email-error" aria-invalid="true" defaultValue="ada@" />
            <Field.ErrorMessage>Enter a complete email address.</Field.ErrorMessage>
          </Field>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Field.Label renders outside Field', () => {
      expect(() => render(<Field.Label>Email</Field.Label>)).toThrow(/Field compound components must be used within Field/);
    });

    it('throws a descriptive error when Field.Description renders outside Field', () => {
      expect(() => render(<Field.Description>Hint</Field.Description>)).toThrow(/Field compound components must be used within Field/);
    });

    it('throws a descriptive error when Field.ErrorMessage renders outside Field', () => {
      expect(() => render(<Field.ErrorMessage>Error</Field.ErrorMessage>)).toThrow(/Field compound components must be used within Field/);
    });
  });
});
