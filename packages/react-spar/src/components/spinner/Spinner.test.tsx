import { createRef } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Spinner, type SpinnerAppearance } from './index';

const getRoot = (container: HTMLElement) => container.querySelector('.tk-spinner') as HTMLElement;
const getIndicator = (container: HTMLElement) => container.querySelector('.tk-spinner-indicator') as HTMLElement;

describe('Spinner', () => {
  describe('rendering', () => {
    it('renders a span root carrying the canonical class and data-slot', () => {
      render(<Spinner />);

      const root = screen.getByRole('status');
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveClass('tk-spinner');
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('renders the indicator slot as the only, aria-hidden child of the root', () => {
      const { container } = render(<Spinner />);

      const root = getRoot(container);
      const indicator = getIndicator(container);

      expect(indicator).not.toBeNull();
      expect(indicator.tagName).toBe('SPAN');
      expect(indicator.parentElement).toBe(root);
      expect(root.children).toHaveLength(1);
      expect(indicator).toHaveAttribute('data-slot', 'indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('emits the default variant, size and appearance as data attributes', () => {
      const { container } = render(<Spinner />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-variant', 'neutral');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-type', 'rounded');
    });

    it('reflects non-default props into data attributes', () => {
      const { container } = render(<Spinner variant="success" size="xlarge" appearance="dots" />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('data-size', 'xlarge');
      expect(root).toHaveAttribute('data-type', 'dots');
    });

    it('keeps visual props off the DOM', () => {
      const { container } = render(<Spinner variant="danger" size="large" appearance="lines" />);
      const root = getRoot(container);

      expect(root).not.toHaveAttribute('variant');
      expect(root).not.toHaveAttribute('size');
      expect(root).not.toHaveAttribute('appearance');
    });

    it('forwards native attributes and the ref to the root span', () => {
      const ref = createRef<HTMLSpanElement>();
      render(<Spinner ref={ref} id="search-spinner" title="Searching" />);

      const root = screen.getByRole('status');
      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute('id', 'search-spinner');
      expect(root).toHaveAttribute('title', 'Searching');
    });
  });

  describe('appearance anatomy', () => {
    it.each<{ appearance: SpinnerAppearance; svgs: number; viewBox: string; dots: number; lines: number }>([
      { appearance: 'rounded', svgs: 2, viewBox: '0 0 40 40', dots: 0, lines: 0 },
      { appearance: 'loader', svgs: 1, viewBox: '0 0 40 40', dots: 0, lines: 0 },
      { appearance: 'logo', svgs: 1, viewBox: '0 0 48 48', dots: 0, lines: 0 },
      { appearance: 'dots', svgs: 0, viewBox: '', dots: 8, lines: 0 },
      { appearance: 'lines', svgs: 0, viewBox: '', dots: 0, lines: 8 },
      { appearance: 'threeDots', svgs: 0, viewBox: '', dots: 3, lines: 0 },
      { appearance: 'pulse', svgs: 0, viewBox: '', dots: 0, lines: 0 },
    ])('renders the $appearance indicator anatomy', ({ appearance, svgs, viewBox, dots, lines }) => {
      const { container } = render(<Spinner appearance={appearance} />);
      const indicator = getIndicator(container);

      expect(getRoot(container)).toHaveAttribute('data-type', appearance);

      const svgElements = Array.from(indicator.querySelectorAll('svg'));
      expect(svgElements).toHaveLength(svgs);
      for (const svg of svgElements) {
        expect(svg).toHaveAttribute('viewBox', viewBox);
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg).toHaveAttribute('focusable', 'false');
      }

      expect(indicator.querySelectorAll('.tk-spinner-dot')).toHaveLength(dots);
      expect(indicator.querySelectorAll('.tk-spinner-line')).toHaveLength(lines);
      // Every rendered part is a direct child of the indicator — nothing extra.
      expect(indicator.children).toHaveLength(svgs + dots + lines);
    });

    it('swaps the indicator anatomy when the appearance changes', () => {
      const { container, rerender } = render(<Spinner appearance="dots" />);
      expect(getIndicator(container).querySelectorAll('.tk-spinner-dot')).toHaveLength(8);

      rerender(<Spinner appearance="lines" />);

      expect(getRoot(container)).toHaveAttribute('data-type', 'lines');
      expect(getIndicator(container).querySelectorAll('.tk-spinner-dot')).toHaveLength(0);
      expect(getIndicator(container).querySelectorAll('.tk-spinner-line')).toHaveLength(8);
    });
  });

  describe('accessibility semantics', () => {
    it('exposes a status role named "Loading" by default', () => {
      render(<Spinner />);

      expect(screen.getByRole('status', { name: 'Loading' })).toHaveAttribute('aria-label', 'Loading');
    });

    it('uses a domain-specific aria-label instead of the default', () => {
      render(<Spinner aria-label="Loading flight results" />);

      expect(screen.getByRole('status', { name: 'Loading flight results' })).toBeInTheDocument();
      expect(screen.queryByRole('status', { name: 'Loading' })).toBeNull();
    });

    it('drops the default aria-label when aria-labelledby points at visible text', () => {
      render(
        <div>
          <Spinner aria-labelledby="flight-loading-label" />
          <span id="flight-loading-label">Loading flights</span>
        </div>,
      );

      const status = screen.getByRole('status', { name: 'Loading flights' });
      expect(status).toHaveAttribute('aria-labelledby', 'flight-loading-label');
      expect(status).not.toHaveAttribute('aria-label');
    });

    it('keeps the default status role and "Loading" name when role / aria-label are explicitly undefined', () => {
      const maybeLabel: string | undefined = undefined;
      render(<Spinner role={undefined} aria-label={maybeLabel} />);

      expect(screen.getByRole('status', { name: 'Loading' })).toHaveAttribute('aria-label', 'Loading');
    });

    it('lets a consumer-provided role replace the default status role', () => {
      render(<Spinner role="progressbar" />);

      expect(screen.getByRole('progressbar', { name: 'Loading' })).toHaveClass('tk-spinner');
      expect(screen.queryByRole('status')).toBeNull();
    });

    it.each<{ label: string; ariaHidden: true | 'true' }>([
      { label: 'boolean true', ariaHidden: true },
      { label: "string 'true'", ariaHidden: 'true' },
    ])('treats aria-hidden ($label) as decorative: no status role and no default name', ({ ariaHidden }) => {
      const { container } = render(<Spinner aria-hidden={ariaHidden} />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-label');
      expect(screen.queryByRole('status', { hidden: true })).toBeNull();
    });

    it('keeps status semantics when aria-hidden is explicitly false', () => {
      render(<Spinner aria-hidden={false} />);

      expect(screen.getByRole('status', { name: 'Loading' })).toHaveAttribute('aria-hidden', 'false');
    });

    it('keeps an explicit aria-label when aria-labelledby is also provided', () => {
      render(
        <div>
          <Spinner aria-label="Loading fares" aria-labelledby="fares-label" />
          <span id="fares-label">Fares</span>
        </div>,
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading fares');
      expect(status).toHaveAttribute('aria-labelledby', 'fares-label');
    });
  });

  describe('classNames and slotProps', () => {
    it('merges className and classNames onto their owner nodes', () => {
      const { container } = render(<Spinner className="instance-root" classNames={{ root: 'custom-root', indicator: 'custom-indicator' }} />);
      const root = getRoot(container);
      const indicator = getIndicator(container);

      expect(root).toHaveClass('tk-spinner', 'instance-root', 'custom-root');
      expect(root).not.toHaveClass('custom-indicator');
      expect(indicator).toHaveClass('tk-spinner-indicator', 'custom-indicator');
      expect(indicator).not.toHaveClass('custom-root');
      expect(indicator).not.toHaveClass('instance-root');
    });

    it('forwards slotProps to their owner nodes', () => {
      const { container } = render(<Spinner slotProps={{ root: { title: 'Root title' }, indicator: { title: 'Indicator title' } }} />);

      expect(getRoot(container)).toHaveAttribute('title', 'Root title');
      expect(getIndicator(container)).toHaveAttribute('title', 'Indicator title');
    });

    it('keeps canonical slot hooks, state attributes and the hidden indicator over slotProps overrides', () => {
      const rootOverrides = { 'title': 'Root title', 'data-slot': 'hijacked', 'data-type': 'hijacked' };
      const indicatorOverrides = { 'title': 'Indicator title', 'data-slot': 'hijacked', 'aria-hidden': false };

      const { container } = render(<Spinner appearance="dots" slotProps={{ root: rootOverrides, indicator: indicatorOverrides }} />);
      const root = getRoot(container);
      const indicator = getIndicator(container);

      expect(root).toHaveAttribute('title', 'Root title');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-type', 'dots');
      expect(indicator).toHaveAttribute('title', 'Indicator title');
      expect(indicator).toHaveAttribute('data-slot', 'indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('provider theme', () => {
    it('applies theme defaultProps below instance props, including the indicator anatomy', () => {
      const components: ComponentsThemeMap = { Spinner: { defaultProps: { appearance: 'threeDots', variant: 'primary' } } };

      const { container, rerender } = render(
        <TakeoffSparProvider components={components}>
          <Spinner />
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-type', 'threeDots');
      expect(getRoot(container)).toHaveAttribute('data-variant', 'primary');
      expect(getIndicator(container).querySelectorAll('.tk-spinner-dot')).toHaveLength(3);

      rerender(
        <TakeoffSparProvider components={components}>
          <Spinner appearance="lines" />
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-type', 'lines');
      expect(getRoot(container)).toHaveAttribute('data-variant', 'primary');
      expect(getIndicator(container).querySelectorAll('.tk-spinner-line')).toHaveLength(8);
      expect(getIndicator(container).querySelectorAll('.tk-spinner-dot')).toHaveLength(0);
    });

    it('concatenates canonical, theme and instance classes and layers instance slotProps over theme slotProps', () => {
      const components: ComponentsThemeMap = {
        Spinner: {
          className: 'theme-root',
          classNames: { indicator: 'theme-indicator' },
          slotProps: { root: { title: 'Theme root' }, indicator: { id: 'theme-indicator-id', title: 'Theme indicator' } },
        },
      };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Spinner className="instance-root" classNames={{ indicator: 'instance-indicator' }} slotProps={{ indicator: { title: 'Instance indicator' } }} />
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);
      const indicator = getIndicator(container);

      expect(root).toHaveClass('tk-spinner', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('title', 'Theme root');
      expect(indicator).toHaveClass('tk-spinner-indicator', 'theme-indicator', 'instance-indicator');
      expect(indicator).toHaveAttribute('title', 'Instance indicator');
      expect(indicator).toHaveAttribute('id', 'theme-indicator-id');
    });

    it('uses a theme aria-label default and lets the instance aria-label replace it', () => {
      const components: ComponentsThemeMap = { Spinner: { defaultProps: { 'aria-label': 'Loading content' } } };

      const { rerender } = render(
        <TakeoffSparProvider components={components}>
          <Spinner />
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('status', { name: 'Loading content' })).toHaveClass('tk-spinner');

      rerender(
        <TakeoffSparProvider components={components}>
          <Spinner aria-label="Loading seat map" />
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('status', { name: 'Loading seat map' })).toHaveClass('tk-spinner');
      expect(screen.queryByRole('status', { name: 'Loading content' })).toBeNull();
    });

    it('treats a theme aria-hidden default as decorative', () => {
      const components: ComponentsThemeMap = { Spinner: { defaultProps: { 'aria-hidden': true } } };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Spinner />
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('aria-hidden', 'true');
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-label');
    });

    it('layers instance slotProps.root over theme slotProps.root and keeps the theme className off the indicator', () => {
      const components: ComponentsThemeMap = {
        Spinner: { className: 'theme-root', slotProps: { root: { title: 'Theme root', lang: 'tr' } } },
      };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Spinner slotProps={{ root: { title: 'Instance root' } }} />
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('title', 'Instance root');
      expect(root).toHaveAttribute('lang', 'tr');
      expect(root).toHaveClass('tk-spinner', 'theme-root');
      expect(getIndicator(container)).not.toHaveClass('theme-root');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with the default status semantics', async () => {
      const { container } = render(<Spinner />);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when named by visible text', async () => {
      const { container } = render(
        <div>
          <Spinner appearance="threeDots" aria-labelledby="saving-label" variant="success" />
          <span id="saving-label">Saving changes</span>
        </div>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations as a decorative spinner beside a loading message', async () => {
      const { container } = render(
        <p>
          <Spinner aria-hidden appearance="logo" />
          <span>Preparing your trip</span>
        </p>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
