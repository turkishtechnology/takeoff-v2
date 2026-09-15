import { createRef, type ComponentProps, type ReactElement } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render as renderWithoutProvider, renderWithProvider as render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

const getRoot = (container: HTMLElement) => container.querySelector('.tk-input') as HTMLElement;

interface PartOverrides {
  className?: string;
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
}

interface LayoutPartCase {
  name: string;
  className: string;
  tagName: string;
  ariaHidden: string | null;
  renderPart: (overrides?: PartOverrides) => ReactElement;
}

// Parts that render a plain owner node (no Spar primitive underneath) and only
// guard on the Input context.
const layoutParts: LayoutPartCase[] = [
  { name: 'Input.Prefix', className: 'tk-input-prefix', tagName: 'SPAN', ariaHidden: null, renderPart: overrides => <Input.Prefix {...overrides}>USD</Input.Prefix> },
  { name: 'Input.Suffix', className: 'tk-input-suffix', tagName: 'SPAN', ariaHidden: null, renderPart: overrides => <Input.Suffix {...overrides}>.00</Input.Suffix> },
  {
    name: 'Input.LeadingIcon',
    className: 'tk-input-leading-icon',
    tagName: 'SPAN',
    ariaHidden: 'true',
    renderPart: overrides => (
      <Input.LeadingIcon {...overrides}>
        <svg />
      </Input.LeadingIcon>
    ),
  },
  {
    name: 'Input.TrailingIcon',
    className: 'tk-input-trailing-icon',
    tagName: 'SPAN',
    ariaHidden: 'true',
    renderPart: overrides => (
      <Input.TrailingIcon {...overrides}>
        <svg />
      </Input.TrailingIcon>
    ),
  },
  { name: 'Input.Spinner', className: 'tk-input-spinner', tagName: 'SPAN', ariaHidden: 'true', renderPart: overrides => <Input.Spinner {...overrides} /> },
  { name: 'Input.Stepper', className: 'tk-input-stepper', tagName: 'DIV', ariaHidden: null, renderPart: overrides => <Input.Stepper {...overrides} /> },
  { name: 'Input.Strength', className: 'tk-input-strength', tagName: 'DIV', ariaHidden: null, renderPart: overrides => <Input.Strength {...overrides} /> },
];

describe('Input (compound)', () => {
  describe('rendering', () => {
    it('renders the root slot contract around the composed field', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="Passenger name" />
        </Input>,
      );

      const root = getRoot(container);
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toContainElement(screen.getByRole('textbox', { name: 'Passenger name' }));
    });

    it.each(['small', 'base', 'large'] as const)('reflects size="%s" as data-size on the root', size => {
      const { container } = render(
        <Input size={size}>
          <Input.Field aria-label="Name" />
        </Input>,
      );

      expect(getRoot(container)).toHaveAttribute('data-size', size);
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(
        <Input as="section">
          <Input.Field aria-label="Name" />
        </Input>,
      );

      expect(getRoot(container).tagName).toBe('SECTION');
    });

    it('forwards the ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(
        <Input ref={ref}>
          <Input.Field aria-label="Name" />
        </Input>,
      );

      expect(ref.current).toBe(getRoot(container));
    });

    it('passes consumer attributes such as data-layout="counter" through to the root', () => {
      const { container } = render(
        <Input data-layout="counter">
          <Input.Field aria-label="Passengers" type="number" />
        </Input>,
      );

      expect(getRoot(container)).toHaveAttribute('data-layout', 'counter');
    });

    it('derives the field id from the id prop', () => {
      render(
        <Input id="pnr">
          <Input.Field aria-label="PNR" />
        </Input>,
      );

      expect(screen.getByRole('textbox', { name: 'PNR' })).toHaveAttribute('id', 'pnr-field');
    });

    it('keeps row parts inside the root in authored order', () => {
      const { container } = render(
        <Input>
          <Input.LeadingIcon>
            <svg />
          </Input.LeadingIcon>
          <Input.Prefix>USD</Input.Prefix>
          <Input.Field aria-label="Amount" />
          <Input.Suffix>.00</Input.Suffix>
          <Input.TrailingIcon>
            <svg />
          </Input.TrailingIcon>
        </Input>,
      );

      const order = Array.from(getRoot(container).children).map(child => child.classList[0]);
      expect(order).toEqual(['tk-input-leading-icon', 'tk-input-prefix', 'tk-input-field', 'tk-input-suffix', 'tk-input-trailing-icon']);
    });

    it('hoists Input.Strength out of the bordered row so it renders just after the root', () => {
      // Authored *before* the field on purpose: placement is decided by the
      // part's identity, not its position among the children.
      const { container } = render(
        <Input>
          <Input.Strength />
          <Input.Field aria-label="Password" type="password" />
        </Input>,
      );

      const root = getRoot(container);
      const strength = container.querySelector('.tk-input-strength') as HTMLElement;
      expect(strength).toBeInTheDocument();
      expect(root).not.toContainElement(strength);
      expect(root.nextElementSibling).toBe(strength);
    });
  });

  describe('state', () => {
    it('emits no state data attributes by default', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="Email" />
        </Input>,
      );

      const root = getRoot(container);
      expect(root).not.toHaveAttribute('data-invalid');
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('data-required');
      expect(root).not.toHaveAttribute('data-readonly');
    });

    it('emits data-invalid, data-disabled, data-required and data-readonly on the root', () => {
      const { container } = render(
        <Input invalid disabled required readOnly>
          <Input.Field aria-label="Email" />
        </Input>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-required', '');
      expect(root).toHaveAttribute('data-readonly', '');
    });

    it('forwards root state to the native field', () => {
      render(
        <Input invalid disabled required readOnly>
          <Input.Field aria-label="Email" />
        </Input>,
      );

      const field = screen.getByRole('textbox', { name: 'Email' });
      expect(field).toBeDisabled();
      expect(field).toBeRequired();
      expect(field).toHaveAttribute('readonly');
      expect(field).toHaveAttribute('aria-invalid', 'true');
    });

    it('inherits state and label/description wiring from a wrapping Field', () => {
      const { container } = render(
        <Field invalid disabled required readOnly>
          <Field.Label>Email</Field.Label>
          <Input>
            <Input.Field />
          </Input>
          <Field.ErrorMessage>Enter a valid email.</Field.ErrorMessage>
        </Field>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-required', '');
      expect(root).toHaveAttribute('data-readonly', '');

      const field = screen.getByRole('textbox', { name: /Email/ });
      expect(field).toBeDisabled();
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription('Enter a valid email.');
    });

    it('lets an explicit prop override the inherited Field state', () => {
      const { container } = render(
        <Field disabled>
          <Field.Label>Email</Field.Label>
          <Input disabled={false}>
            <Input.Field />
          </Input>
        </Field>,
      );

      expect(getRoot(container)).not.toHaveAttribute('data-disabled');
      expect(screen.getByRole('textbox', { name: /Email/ })).toBeEnabled();
    });
  });

  describe('classNames and slotProps', () => {
    it('lands className, classNames.root and slotProps.root on the root owner node', () => {
      const { container } = render(
        <Input className="instance-class" classNames={{ root: 'slot-class' }} slotProps={{ root: { title: 'Search flights', style: { borderRadius: '9999px' } } }}>
          <Input.Field aria-label="Search" />
        </Input>,
      );

      const root = getRoot(container);
      expect(root).toHaveClass('tk-input', 'instance-class', 'slot-class');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('title', 'Search flights');
      expect(root).toHaveStyle({ borderRadius: '9999px' });
      expect(screen.getByRole('textbox', { name: 'Search' })).not.toHaveClass('slot-class');
    });

    it('layers the provider theme under the instance without dropping the canonical class', () => {
      const { container } = renderWithoutProvider(
        <TakeoffSparProvider components={{ Input: { className: 'theme-class', defaultProps: { size: 'large' }, slotProps: { root: { title: 'from theme' } } } }}>
          <Input classNames={{ root: 'instance-class' }}>
            <Input.Field aria-label="Name" />
          </Input>
        </TakeoffSparProvider>,
      );

      const root = getRoot(container);
      expect(root).toHaveClass('tk-input', 'theme-class', 'instance-class');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('title', 'from theme');
    });

    it('lets instance props win over provider theme defaults and slotProps', () => {
      const { container } = renderWithoutProvider(
        <TakeoffSparProvider components={{ Input: { defaultProps: { size: 'large' }, slotProps: { root: { title: 'from theme' } } } }}>
          <Input size="small" slotProps={{ root: { title: 'from instance' } }}>
            <Input.Field aria-label="Name" />
          </Input>
        </TakeoffSparProvider>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('title', 'from instance');
    });
  });

  describe.each(layoutParts)('$name', ({ className, tagName, ariaHidden, renderPart }) => {
    const renderInInput = (overrides?: PartOverrides) =>
      render(
        <Input>
          <Input.Field aria-label="Value" />
          {renderPart(overrides)}
        </Input>,
      );

    it('renders its canonical class and root data-slot', () => {
      const { container } = renderInInput();

      const part = container.querySelector(`.${className}`);
      expect(part?.tagName).toBe(tagName);
      expect(part).toHaveAttribute('data-slot', 'root');
      expect(part?.getAttribute('aria-hidden')).toBe(ariaHidden);
    });

    it('lands className, classNames.root and slotProps.root on its own root', () => {
      const { container } = renderInInput({ className: 'instance-class', classNames: { root: 'slot-class' }, slotProps: { root: { title: 'part title' } } });

      const part = container.querySelector(`.${className}`);
      expect(part).toHaveClass(className, 'instance-class', 'slot-class');
      expect(part).toHaveAttribute('title', 'part title');
      expect(getRoot(container)).not.toHaveClass('slot-class');
      expect(getRoot(container)).not.toHaveAttribute('title');
    });
  });

  describe('layout parts', () => {
    it('renders affix text in Input.Prefix and Input.Suffix', () => {
      render(
        <Input>
          <Input.Prefix>USD</Input.Prefix>
          <Input.Field aria-label="Amount" />
          <Input.Suffix>.00</Input.Suffix>
        </Input>,
      );

      expect(screen.getByText('USD')).toHaveClass('tk-input-prefix');
      expect(screen.getByText('.00')).toHaveClass('tk-input-suffix');
    });

    it('lets the consumer override the default aria-hidden on icon parts', () => {
      const { container } = render(
        <Input>
          <Input.LeadingIcon aria-hidden={false}>
            <svg />
          </Input.LeadingIcon>
          <Input.Field aria-label="Search" />
          <Input.TrailingIcon aria-hidden={false}>
            <svg />
          </Input.TrailingIcon>
        </Input>,
      );

      expect(container.querySelector('.tk-input-leading-icon')).toHaveAttribute('aria-hidden', 'false');
      expect(container.querySelector('.tk-input-trailing-icon')).toHaveAttribute('aria-hidden', 'false');
    });

    it('renders layout parts as custom elements through the as prop', () => {
      const { container } = render(
        <Input>
          <Input.LeadingIcon as="i" />
          <Input.Prefix as="div">USD</Input.Prefix>
          <Input.Field aria-label="Amount" />
          <Input.Suffix as="div">.00</Input.Suffix>
          <Input.TrailingIcon as="i" />
          <Input.Spinner as="div" />
          <Input.Stepper as="span" />
          <Input.Strength as="section" />
        </Input>,
      );

      expect(container.querySelector('.tk-input-leading-icon')?.tagName).toBe('I');
      expect(container.querySelector('.tk-input-prefix')?.tagName).toBe('DIV');
      expect(container.querySelector('.tk-input-suffix')?.tagName).toBe('DIV');
      expect(container.querySelector('.tk-input-trailing-icon')?.tagName).toBe('I');
      expect(container.querySelector('.tk-input-spinner')?.tagName).toBe('DIV');
      expect(container.querySelector('.tk-input-stepper')?.tagName).toBe('SPAN');
      expect(container.querySelector('.tk-input-strength')?.tagName).toBe('SECTION');
    });

    it('forwards refs to the layout part roots', () => {
      const prefixRef = createRef<HTMLSpanElement>();
      const stepperRef = createRef<HTMLDivElement>();
      const strengthRef = createRef<HTMLDivElement>();
      const { container } = render(
        <Input>
          <Input.Prefix ref={prefixRef}>USD</Input.Prefix>
          <Input.Field aria-label="Amount" type="number" />
          <Input.Stepper ref={stepperRef} />
          <Input.Strength ref={strengthRef} />
        </Input>,
      );

      expect(prefixRef.current).toBe(container.querySelector('.tk-input-prefix'));
      expect(stepperRef.current).toBe(container.querySelector('.tk-input-stepper'));
      expect(strengthRef.current).toBe(container.querySelector('.tk-input-strength'));
    });

    it('wraps Input.Decrement and Input.Increment inside Input.Stepper', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="Bags" type="number" />
          <Input.Stepper>
            <Input.Decrement />
            <Input.Increment />
          </Input.Stepper>
        </Input>,
      );

      const stepper = container.querySelector('.tk-input-stepper') as HTMLElement;
      expect(
        within(stepper)
          .getAllByRole('button')
          .map(button => button.getAttribute('aria-label')),
      ).toEqual(['Decrement value', 'Increment value']);
    });
  });

  describe('Input.Spinner', () => {
    it('renders the default spinner glyph inside a hidden owner node', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="PNR" />
          <Input.Spinner />
        </Input>,
      );

      const spinner = container.querySelector('.tk-input-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner?.querySelector('.tk-input-default-spinner')).toBeInTheDocument();
    });

    it('renders custom children in place of the default glyph', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="PNR" />
          <Input.Spinner>
            <svg data-testid="custom-spinner" />
          </Input.Spinner>
        </Input>,
      );

      const spinner = container.querySelector('.tk-input-spinner') as HTMLElement;
      expect(within(spinner).getByTestId('custom-spinner')).toBeInTheDocument();
      expect(spinner.querySelector('.tk-input-default-spinner')).not.toBeInTheDocument();
    });

    it('renders only while composed — rendered and skipped paths', () => {
      const LoadingInput = ({ loading }: { loading: boolean }) => (
        <Input>
          <Input.Field aria-label="PNR" />
          {loading && <Input.Spinner />}
        </Input>
      );
      const { container, rerender } = render(<LoadingInput loading={false} />);

      expect(container.querySelector('.tk-input-spinner')).not.toBeInTheDocument();

      rerender(<LoadingInput loading />);
      expect(getRoot(container).querySelector('.tk-input-spinner')).toBeInTheDocument();

      rerender(<LoadingInput loading={false} />);
      expect(container.querySelector('.tk-input-spinner')).not.toBeInTheDocument();
    });
  });

  describe('provider theme per part', () => {
    type ThemeComponents = NonNullable<ComponentProps<typeof TakeoffSparProvider>['components']>;

    interface ThemedPartCase {
      themeKey: keyof ThemeComponents;
      className: string;
      renderPart: (overrides: PartOverrides) => ReactElement;
    }

    const themedParts: ThemedPartCase[] = [
      { themeKey: 'InputPrefix', className: 'tk-input-prefix', renderPart: overrides => <Input.Prefix {...overrides}>USD</Input.Prefix> },
      { themeKey: 'InputSuffix', className: 'tk-input-suffix', renderPart: overrides => <Input.Suffix {...overrides}>.00</Input.Suffix> },
      { themeKey: 'InputLeadingIcon', className: 'tk-input-leading-icon', renderPart: overrides => <Input.LeadingIcon {...overrides} /> },
      { themeKey: 'InputTrailingIcon', className: 'tk-input-trailing-icon', renderPart: overrides => <Input.TrailingIcon {...overrides} /> },
      { themeKey: 'InputSpinner', className: 'tk-input-spinner', renderPart: overrides => <Input.Spinner {...overrides} /> },
      { themeKey: 'InputStepper', className: 'tk-input-stepper', renderPart: overrides => <Input.Stepper {...overrides} /> },
      { themeKey: 'InputStrength', className: 'tk-input-strength', renderPart: overrides => <Input.Strength {...overrides} /> },
      { themeKey: 'InputClearButton', className: 'tk-input-clear-button', renderPart: overrides => <Input.ClearButton {...overrides} /> },
      { themeKey: 'InputRevealButton', className: 'tk-input-reveal-button', renderPart: overrides => <Input.RevealButton {...overrides} /> },
      { themeKey: 'InputDecrement', className: 'tk-input-decrement', renderPart: overrides => <Input.Decrement {...overrides} /> },
      { themeKey: 'InputIncrement', className: 'tk-input-increment', renderPart: overrides => <Input.Increment {...overrides} /> },
      { themeKey: 'InputChips', className: 'tk-input-chips', renderPart: overrides => <Input.Chips {...overrides} /> },
    ];

    it.each(themedParts)('reads its own $themeKey theme and layers the instance on top', ({ themeKey, className, renderPart }) => {
      const components = { [themeKey]: { className: 'theme-class', slotProps: { root: { title: 'from theme', lang: 'tr' } } } } as ThemeComponents;
      const { container } = renderWithoutProvider(
        <TakeoffSparProvider components={components}>
          <Input>
            <Input.Field aria-label="Value" defaultValue="TK1928" />
            {renderPart({ classNames: { root: 'instance-class' }, slotProps: { root: { title: 'from instance' } } })}
          </Input>
        </TakeoffSparProvider>,
      );

      const part = container.querySelector(`.${className}`);
      expect(part).toHaveClass(className, 'theme-class', 'instance-class');
      expect(part).toHaveAttribute('data-slot', 'root');
      // Theme slotProps land underneath; the instance wins on a conflicting key.
      expect(part).toHaveAttribute('lang', 'tr');
      expect(part).toHaveAttribute('title', 'from instance');
      // The theme entry is scoped to this part alone.
      expect(container.querySelectorAll('.theme-class')).toHaveLength(1);
      expect(getRoot(container)).not.toHaveClass('theme-class');
    });
  });

  describe('context boundary', () => {
    let consoleError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // React logs the thrown render error; keep the expected throw quiet.
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      consoleError.mockRestore();
    });

    it.each([
      ['Input.Field', () => <Input.Field />],
      ['Input.Prefix', () => <Input.Prefix />],
      ['Input.Suffix', () => <Input.Suffix />],
      ['Input.LeadingIcon', () => <Input.LeadingIcon />],
      ['Input.TrailingIcon', () => <Input.TrailingIcon />],
      ['Input.Spinner', () => <Input.Spinner />],
      ['Input.Strength', () => <Input.Strength />],
      ['Input.Stepper', () => <Input.Stepper />],
    ])('throws the safe-context error when %s is rendered outside Input', (name, renderPart) => {
      expect(() => render(renderPart())).toThrow(`${name} must be used within InputProvider`);
    });

    // These parts read Spar's Input context first, so Spar's guard fires
    // before the wrapper's own context guard.
    it.each([
      ['Input.ClearButton', () => <Input.ClearButton />],
      ['Input.RevealButton', () => <Input.RevealButton />],
      ['Input.Decrement', () => <Input.Decrement />],
      ['Input.Increment', () => <Input.Increment />],
      ['Input.Chips', () => <Input.Chips />],
    ])('throws when %s is rendered outside Input', (_name, renderPart) => {
      expect(() => render(renderPart())).toThrow(/must be used within Input/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a labelled field with affixes, icons and actions', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Search booking</Field.Label>
          <Input>
            <Input.LeadingIcon>
              <svg />
            </Input.LeadingIcon>
            <Input.Prefix>PNR</Input.Prefix>
            <Input.Field defaultValue="TK1928" />
            <Input.Suffix>TK</Input.Suffix>
            <Input.ClearButton />
            <Input.Spinner />
          </Input>
          <Field.Description>Six characters.</Field.Description>
        </Field>,
      );

      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for an invalid, required field with an error message', async () => {
      const { container } = render(
        <Field invalid required>
          <Field.Label>Phone number</Field.Label>
          <Input>
            <Input.Field defaultValue="not-a-phone" />
          </Input>
          <Field.ErrorMessage>Enter a valid phone number.</Field.ErrorMessage>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
