import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import type { ComponentPropsWithoutRef, Ref } from 'react';
import { Button } from './Button';
import { SparReactProvider } from '../../provider';

vi.mock('@turkish-technology/spar', () => {
  function MockButton({
    as: _as,
    isLoading: _isLoading,
    ref,
    children,
    ...props
  }: ComponentPropsWithoutRef<'button'> & { as?: string; isLoading?: boolean; ref?: Ref<HTMLButtonElement> }) {
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  }
  return { Button: MockButton };
});

describe('Button (compound)', () => {
  describe('rendering', () => {
    it('renders a button element by default', () => {
      render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies tk-button root class and data-slot', () => {
      render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('tk-button');
      expect(button).toHaveAttribute('data-slot', 'root');
    });

    it('merges custom className with root class', () => {
      render(
        <Button className="my-custom">
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('tk-button');
      expect(button.className).toContain('my-custom');
    });
  });

  describe('default data attributes', () => {
    it('applies default data attributes', () => {
      render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'base');
      expect(button).toHaveAttribute('data-type', 'filled');
      expect(button).toHaveAttribute('data-mode', 'button');
    });

    it('omits boolean data attributes when false', () => {
      render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('data-loading');
      expect(button).not.toHaveAttribute('data-full-width');
      expect(button).not.toHaveAttribute('data-underline');
      expect(button).not.toHaveAttribute('data-icon-only');
    });
  });

  describe('Button.Label', () => {
    it('renders inside a span with canonical slot markers', () => {
      render(
        <Button>
          <Button.Label>Hello</Button.Label>
        </Button>,
      );
      const label = screen.getByText('Hello');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(label.className).toContain('tk-button-label');
    });
  });

  describe('Button.LeadingIcon / TrailingIcon', () => {
    it('renders leading icon with canonical slot and class markers', () => {
      render(
        <Button>
          <Button.LeadingIcon>
            <span data-testid="lead-icon">L</span>
          </Button.LeadingIcon>
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      const iconSlot = screen.getByTestId('lead-icon').parentElement!;
      expect(iconSlot).toHaveAttribute('data-slot', 'leading-icon');
      expect(iconSlot).toHaveAttribute('aria-hidden', 'true');
      expect(iconSlot.className).toContain('tk-button-icon');
      expect(iconSlot.className).toContain('tk-button-leading-icon');
    });

    it('renders trailing icon with canonical slot and class markers', () => {
      render(
        <Button>
          <Button.Label>Text</Button.Label>
          <Button.TrailingIcon>
            <span data-testid="trail-icon">T</span>
          </Button.TrailingIcon>
        </Button>,
      );
      const iconSlot = screen.getByTestId('trail-icon').parentElement!;
      expect(iconSlot).toHaveAttribute('data-slot', 'trailing-icon');
      expect(iconSlot.className).toContain('tk-button-icon');
      expect(iconSlot.className).toContain('tk-button-trailing-icon');
    });

    it('renders string icons as Material Symbol spans', () => {
      render(
        <Button>
          <Button.LeadingIcon>home</Button.LeadingIcon>
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      const symbolSpan = screen.getByText('home');
      expect(symbolSpan).toHaveAttribute('data-icon-kind', 'symbol');
      expect(symbolSpan.className).toContain('tk-button-icon-symbol');
    });
  });

  describe('disabled state', () => {
    it('sets data-disabled on root when disabled', () => {
      render(
        <Button disabled>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-disabled', '');
    });
  });

  describe('loading state', () => {
    it('sets data-loading and aria-busy on root when loading', () => {
      render(
        <Button loading>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-loading', '');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('renders Button.Spinner only when loading', () => {
      const { container, rerender } = render(
        <Button>
          <Button.Spinner />
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      expect(container.querySelector('[data-slot="spinner"]')).toBeNull();

      rerender(
        <Button loading>
          <Button.Spinner />
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      const spinnerSlot = container.querySelector('[data-slot="spinner"]');
      expect(spinnerSlot).toBeInTheDocument();
      expect(spinnerSlot!.className).toContain('tk-button-spinner');
    });

    it('renders a default spinner indicator when Button.Spinner has no children', () => {
      const { container } = render(
        <Button loading>
          <Button.Spinner />
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      const defaultIndicator = container.querySelector('[data-slot="spinner-indicator"]');
      expect(defaultIndicator).toBeInTheDocument();
      expect(defaultIndicator!.className).toContain('tk-button-default-spinner');
    });

    it('renders custom spinner content when provided as children', () => {
      const { container } = render(
        <Button loading>
          <Button.Spinner>
            <span data-testid="custom-spinner" />
          </Button.Spinner>
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="spinner-indicator"]')).toBeNull();
    });
  });

  describe('link mode', () => {
    it('renders as anchor when mode="link"', () => {
      render(
        <Button mode="link" href="/test">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders as anchor when as="a"', () => {
      render(
        <Button as="a" href="/test">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('link').tagName).toBe('A');
    });

    it('renders as anchor when href is provided', () => {
      render(
        <Button href="/test">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('link').tagName).toBe('A');
    });

    it('does not set data-type in link mode', () => {
      render(
        <Button mode="link" href="/test">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('link')).not.toHaveAttribute('data-type');
    });

    it('applies rel="noopener noreferrer" for target="_blank"', () => {
      render(
        <Button mode="link" href="/test" target="_blank">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('marks a disabled link with aria-disabled and strips href', () => {
      const { container } = render(
        <Button mode="link" href="/test" disabled>
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      const link = container.querySelector('a')!;
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).not.toHaveAttribute('href');
    });

    it('blocks click on disabled link', async () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button mode="link" href="/test" disabled onClick={onClick}>
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      const link = container.querySelector('a')!;
      await userEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('variant data attributes', () => {
    it('sets data-variant', () => {
      render(
        <Button variant="danger">
          <Button.Label>Delete</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger');
    });

    it('sets data-size', () => {
      render(
        <Button size="large">
          <Button.Label>Big</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'large');
    });

    it('sets data-type', () => {
      render(
        <Button type="outlined">
          <Button.Label>Outlined</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-type', 'outlined');
    });

    it('sets data-full-width when fullWidth', () => {
      render(
        <Button fullWidth>
          <Button.Label>Full</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-full-width', '');
    });

    it('sets data-underline when underline', () => {
      render(
        <Button underline>
          <Button.Label>Underlined</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-underline', '');
    });
  });

  describe('icon-only mode', () => {
    it('sets data-icon-only when iconOnly prop is true', () => {
      render(
        <Button iconOnly aria-label="Home">
          <Button.LeadingIcon>home</Button.LeadingIcon>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-icon-only', '');
    });

    it('sets data-rounded when iconOnly and rounded', () => {
      render(
        <Button iconOnly rounded aria-label="Home">
          <Button.LeadingIcon>home</Button.LeadingIcon>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-rounded', '');
    });

    it('does not apply data-rounded when iconOnly is false', () => {
      render(
        <Button rounded>
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).not.toHaveAttribute('data-rounded');
    });
  });

  describe('form attributes', () => {
    it('sets native submit type for mode="submit"', () => {
      render(
        <Button mode="submit">
          <Button.Label>Submit</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('sets native reset type for mode="reset"', () => {
      render(
        <Button mode="reset">
          <Button.Label>Reset</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for default button', async () => {
      const { container } = render(
        <Button>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations for link mode', async () => {
      const { container } = render(
        <Button mode="link" href="/test">
          <Button.Label>Link</Button.Label>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations for icon-only button with aria-label', async () => {
      const { container } = render(
        <Button iconOnly aria-label="Home">
          <Button.LeadingIcon>home</Button.LeadingIcon>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations when loading', async () => {
      const { container } = render(
        <Button loading>
          <Button.Spinner />
          <Button.Label>Loading</Button.Label>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations when disabled', async () => {
      const { container } = render(
        <Button disabled>
          <Button.Label>Disabled</Button.Label>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('classNames prop', () => {
    it('merges instance classNames.root with root class', () => {
      render(
        <Button classNames={{ root: 'custom-root' }}>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('tk-button');
      expect(button.className).toContain('custom-root');
    });

    it('merges instance classNames.label with label class', () => {
      render(
        <Button classNames={{ label: 'custom-label' }}>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      const label = screen.getByText('Click me');
      expect(label.className).toContain('tk-button-label');
      expect(label.className).toContain('custom-label');
    });

    it('merges instance classNames.spinner with spinner slot', () => {
      const { container } = render(
        <Button loading classNames={{ spinner: 'custom-spinner' }}>
          <Button.Spinner>
            <span>...</span>
          </Button.Spinner>
          <Button.Label>Text</Button.Label>
        </Button>,
      );
      const spinnerSlot = container.querySelector('[data-slot="spinner"]')!;
      expect(spinnerSlot.className).toContain('tk-button-spinner');
      expect(spinnerSlot.className).toContain('custom-spinner');
    });
  });

  describe('slotProps prop', () => {
    it('forwards slotProps.root attributes to root element', () => {
      render(
        <Button slotProps={{ root: { 'aria-describedby': 'desc' } }}>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'desc');
    });

    it('forwards slotProps.label attributes to label span', () => {
      render(
        <Button slotProps={{ label: { id: 'my-label' } }}>
          <Button.Label>Click me</Button.Label>
        </Button>,
      );
      expect(screen.getByText('Click me')).toHaveAttribute('id', 'my-label');
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      render(
        <SparReactProvider components={{ Button: { defaultProps: { variant: 'danger', size: 'large' } } }}>
          <Button>
            <Button.Label>Themed</Button.Label>
          </Button>
        </SparReactProvider>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'danger');
      expect(button).toHaveAttribute('data-size', 'large');
    });

    it('allows instance props to override theme defaultProps', () => {
      render(
        <SparReactProvider components={{ Button: { defaultProps: { variant: 'danger' } } }}>
          <Button variant="success">
            <Button.Label>Override</Button.Label>
          </Button>
        </SparReactProvider>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'success');
    });

    it('merges theme classNames with instance classNames', () => {
      render(
        <SparReactProvider components={{ Button: { classNames: { root: 'theme-root' } } }}>
          <Button classNames={{ root: 'instance-root' }}>
            <Button.Label>Merged</Button.Label>
          </Button>
        </SparReactProvider>,
      );
      const button = screen.getByRole('button');
      expect(button.className).toContain('theme-root');
      expect(button.className).toContain('instance-root');
      expect(button.className).toContain('tk-button');
    });
  });
});
