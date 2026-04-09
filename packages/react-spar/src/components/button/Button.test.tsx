import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import type { ComponentPropsWithoutRef, Ref } from 'react';
import { Button } from './Button';

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

describe('Button', () => {
  describe('rendering', () => {
    it('should render a button element by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply tk-button root class', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('tk-button');
    });

    it('should set data-slot="root" on root element', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-slot', 'root');
    });

    it('should merge custom className with root class', () => {
      render(<Button className="my-custom">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('tk-button');
      expect(button.className).toContain('my-custom');
    });
  });

  describe('default props', () => {
    it('should apply default data attributes', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'base');
      expect(button).toHaveAttribute('data-type', 'filled');
      expect(button).toHaveAttribute('data-mode', 'button');
    });

    it('should not set boolean data attributes when false', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('data-loading');
      expect(button).not.toHaveAttribute('data-full-width');
      expect(button).not.toHaveAttribute('data-underline');
    });
  });

  describe('label slot', () => {
    it('should render children in a label span with data-slot="label"', () => {
      render(<Button>Hello</Button>);
      const label = screen.getByText('Hello');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(label.className).toContain('tk-button-label');
    });

    it('should render label prop when no children', () => {
      render(<Button label="From label" />);
      const label = screen.getByText('From label');
      expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('should prefer children over label prop', () => {
      render(<Button label="label text">children text</Button>);
      expect(screen.getByText('children text')).toBeInTheDocument();
      expect(screen.queryByText('label text')).not.toBeInTheDocument();
    });
  });

  describe('icon slots', () => {
    it('should render leading icon with correct slot and classes', () => {
      render(<Button leadingIcon={<span data-testid="lead-icon">L</span>}>Text</Button>);
      const iconSlot = screen.getByTestId('lead-icon').parentElement!;
      expect(iconSlot).toHaveAttribute('data-slot', 'leading-icon');
      expect(iconSlot).toHaveAttribute('aria-hidden', 'true');
      expect(iconSlot.className).toContain('tk-button-icon');
      expect(iconSlot.className).toContain('tk-button-leading-icon');
    });

    it('should render trailing icon with correct slot and classes', () => {
      render(<Button trailingIcon={<span data-testid="trail-icon">T</span>}>Text</Button>);
      const iconSlot = screen.getByTestId('trail-icon').parentElement!;
      expect(iconSlot).toHaveAttribute('data-slot', 'trailing-icon');
      expect(iconSlot.className).toContain('tk-button-icon');
      expect(iconSlot.className).toContain('tk-button-trailing-icon');
    });

    it('should render string icon as Material Symbol span', () => {
      render(<Button icon="home">Text</Button>);
      const symbolSpan = screen.getByText('home');
      expect(symbolSpan).toHaveAttribute('data-icon-kind', 'symbol');
      expect(symbolSpan.className).toContain('tk-button-icon-symbol');
    });

    it('should place icon based on iconPosition prop', () => {
      const { container } = render(
        <Button icon="home" iconPosition="right">
          Text
        </Button>,
      );
      const trailingSlot = container.querySelector('[data-slot="trailing-icon"]');
      expect(trailingSlot).toBeInTheDocument();
    });

    it('should default icon to leading position', () => {
      const { container } = render(<Button icon="home">Text</Button>);
      const leadingSlot = container.querySelector('[data-slot="leading-icon"]');
      expect(leadingSlot).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should set data-disabled on root when disabled', () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-disabled', '');
    });
  });

  describe('loading state', () => {
    it('should set data-loading on root when loading', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-loading', '');
    });

    it('should set aria-busy when loading', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should render spinner slot when loading', () => {
      const { container } = render(
        <Button loading spinner={<span data-testid="custom-spinner" />}>
          Text
        </Button>,
      );
      const spinnerSlot = container.querySelector('[data-slot="spinner"]');
      expect(spinnerSlot).toBeInTheDocument();
      expect(spinnerSlot!.className).toContain('tk-button-spinner');
      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
    });
  });

  describe('link mode', () => {
    it('should render as anchor when mode="link"', () => {
      render(
        <Button mode="link" href="/test">
          Link
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render as anchor when as="a"', () => {
      render(
        <Button as="a" href="/test">
          Link
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });

    it('should render as anchor when href is provided', () => {
      render(<Button href="/test">Link</Button>);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });

    it('should not set data-type for link mode', () => {
      render(
        <Button mode="link" href="/test">
          Link
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('data-type');
    });

    it('should add rel="noopener noreferrer" for target="_blank"', () => {
      render(
        <Button mode="link" href="/test" target="_blank">
          Link
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should set aria-disabled on disabled link', () => {
      const { container } = render(
        <Button mode="link" href="/test" disabled>
          Link
        </Button>,
      );
      const link = container.querySelector('a')!;
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).not.toHaveAttribute('href');
    });

    it('should prevent click on disabled link', async () => {
      const onClick = vi.fn();
      const { container } = render(
        <Button mode="link" href="/test" disabled onClick={onClick}>
          Link
        </Button>,
      );
      const link = container.querySelector('a')!;
      await userEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('variant data attributes', () => {
    it('should set data-variant', () => {
      render(<Button variant="danger">Delete</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger');
    });

    it('should set data-size', () => {
      render(<Button size="large">Big</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'large');
    });

    it('should set data-type', () => {
      render(<Button type="outlined">Outlined</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-type', 'outlined');
    });

    it('should set data-full-width when fullWidth', () => {
      render(<Button fullWidth>Full</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-full-width', '');
    });

    it('should set data-underline when underline', () => {
      render(<Button underline>Underlined</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-underline', '');
    });
  });

  describe('icon-only mode', () => {
    it('should set data-icon-only when no label and icon present', () => {
      render(<Button icon="home" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-icon-only', '');
    });

    it('should set data-rounded when icon-only and rounded', () => {
      render(<Button icon="home" rounded />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-rounded', '');
    });

    it('should not set data-icon-only when label present', () => {
      render(<Button icon="home">Text</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-icon-only');
    });
  });

  describe('form attributes', () => {
    it('should pass native button type for submit mode', () => {
      render(<Button mode="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should pass native button type for reset mode', () => {
      render(<Button mode="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('accessibility', () => {
    it('should have no a11y violations for default button', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations for link mode', async () => {
      const { container } = render(
        <Button mode="link" href="/test">
          Link
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations for icon-only button with aria-label', async () => {
      const { container } = render(<Button icon="home" aria-label="Home" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when loading', async () => {
      const { container } = render(<Button loading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
