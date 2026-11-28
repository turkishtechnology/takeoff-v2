import { createRef, type CSSProperties } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { GlobeSpinner } from './index';

const getRoot = (container: HTMLElement) => container.querySelector('.tk-globe-spinner') as HTMLElement;
const getIndicator = (container: HTMLElement) => container.querySelector('.tk-globe-spinner-indicator') as HTMLElement;
const getLabel = (container: HTMLElement) => container.querySelector('.tk-globe-spinner-label') as SVGTextElement;

describe('GlobeSpinner (compound)', () => {
  describe('rendering', () => {
    it('renders a span root carrying the canonical class and data-slot', () => {
      render(<GlobeSpinner />);

      const root = screen.getByRole('status');
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveClass('tk-globe-spinner');
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('renders the aria-hidden indicator slot with the globe, track, orbit, arc and plane', () => {
      const { container } = render(<GlobeSpinner />);
      const indicator = getIndicator(container);

      expect(indicator.parentElement).toBe(getRoot(container));
      expect(indicator).toHaveAttribute('data-slot', 'indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');

      const svg = indicator.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 120 120');
      expect(svg).toHaveAttribute('focusable', 'false');

      for (const part of ['globe', 'ocean', 'land', 'track', 'orbit', 'arc', 'plane']) {
        expect(indicator.querySelector(`.tk-globe-spinner-${part}`)).not.toBeNull();
      }
      // Two copies of the continents make the horizontal scroll seamless.
      expect(indicator.querySelectorAll('.tk-globe-spinner-land path')).toHaveLength(2);
    });

    it('emits the default variant and size as data attributes', () => {
      const { container } = render(<GlobeSpinner />);

      expect(getRoot(container)).toHaveAttribute('data-variant', 'primary');
      expect(getRoot(container)).toHaveAttribute('data-size', 'base');
    });

    it('reflects non-default props into data attributes and keeps them off the DOM', () => {
      const { container } = render(<GlobeSpinner size="xlarge" variant="danger" />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-variant', 'danger');
      expect(root).toHaveAttribute('data-size', 'xlarge');
      expect(root).not.toHaveAttribute('variant');
      expect(root).not.toHaveAttribute('size');
    });

    it('forwards native attributes, inline custom properties and the ref to the root span', () => {
      const ref = createRef<HTMLSpanElement>();
      const style = { '--tk-globe-spinner-accent': '#c90019' } as CSSProperties;
      render(<GlobeSpinner id="boot-loader" ref={ref} style={style} />);

      const root = screen.getByRole('status');
      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute('id', 'boot-loader');
      expect(root.style.getPropertyValue('--tk-globe-spinner-accent')).toBe('#c90019');
    });

    it('gives every instance its own clip-path and label-path ids', () => {
      const { container } = render(
        <>
          <GlobeSpinner />
          <GlobeSpinner />
        </>,
      );
      const clipIds = Array.from(container.querySelectorAll('clipPath')).map(node => node.id);

      expect(new Set(clipIds).size).toBe(2);
      for (const id of clipIds) {
        expect(id).toMatch(/^[\w-]+$/);
        expect(container.querySelector(`[clip-path="url(#${id})"]`)).not.toBeNull();
      }
    });
  });

  describe('GlobeSpinner.Label', () => {
    it('renders the text on a textPath that references the arc path inside the orbit', () => {
      const { container } = render(
        <GlobeSpinner>
          <GlobeSpinner.Label>Widen your world</GlobeSpinner.Label>
        </GlobeSpinner>,
      );
      const label = getLabel(container);
      const textPath = label.querySelector('textPath') as SVGTextPathElement;
      const pathId = textPath.getAttribute('href')?.slice(1) ?? '';

      expect(label.tagName.toLowerCase()).toBe('text');
      expect(label).toHaveAttribute('data-slot', 'root');
      expect(label.closest('.tk-globe-spinner-orbit')).not.toBeNull();
      expect(textPath).toHaveTextContent('Widen your world');
      expect(textPath).toHaveAttribute('textLength');
      expect(container.querySelector(`path[id="${pathId}"]`)).not.toBeNull();
    });

    it('is optional', () => {
      const { container } = render(<GlobeSpinner />);

      expect(getLabel(container)).toBeNull();
    });

    it('merges className, classNames and slotProps onto the text node', () => {
      const { container } = render(
        <GlobeSpinner>
          <GlobeSpinner.Label className="instance" classNames={{ root: 'custom' }} slotProps={{ root: { id: 'arc-text' } }}>
            Hello
          </GlobeSpinner.Label>
        </GlobeSpinner>,
      );
      const label = getLabel(container);

      expect(label).toHaveClass('tk-globe-spinner-label', 'instance', 'custom');
      expect(label).toHaveAttribute('id', 'arc-text');
    });

    it('throws a descriptive error outside GlobeSpinner', () => {
      expect(() => render(<GlobeSpinner.Label>Orphan</GlobeSpinner.Label>)).toThrow('GlobeSpinner.Label must be used within GlobeSpinner');
    });
  });

  describe('accessibility semantics', () => {
    it('exposes a status role named "Loading" by default', () => {
      render(<GlobeSpinner />);

      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    it('does not take its name from the decorative arc label', () => {
      render(
        <GlobeSpinner aria-label="Loading flight plan">
          <GlobeSpinner.Label>Widen your world</GlobeSpinner.Label>
        </GlobeSpinner>,
      );

      expect(screen.getByRole('status', { name: 'Loading flight plan' })).toBeInTheDocument();
    });

    it('drops the default aria-label when aria-labelledby points at visible text', () => {
      render(
        <div>
          <GlobeSpinner aria-labelledby="globe-label" />
          <span id="globe-label">Preparing dashboard</span>
        </div>,
      );

      const status = screen.getByRole('status', { name: 'Preparing dashboard' });
      expect(status).not.toHaveAttribute('aria-label');
    });

    it('treats aria-hidden as decorative: no status role and no default name', () => {
      const { container } = render(<GlobeSpinner aria-hidden />);
      const root = getRoot(container);

      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-label');
    });
  });

  describe('classNames and slotProps', () => {
    it('lands classNames and slotProps on their owner nodes and keeps canonical hooks', () => {
      const rootOverrides = { 'title': 'Root', 'data-size': 'hijacked' };
      const indicatorOverrides = { 'title': 'Indicator', 'aria-hidden': false };
      const { container } = render(
        <GlobeSpinner
          className="instance-root"
          classNames={{ root: 'custom-root', indicator: 'custom-indicator' }}
          slotProps={{ root: rootOverrides, indicator: indicatorOverrides }}
        />,
      );
      const root = getRoot(container);
      const indicator = getIndicator(container);

      expect(root).toHaveClass('tk-globe-spinner', 'instance-root', 'custom-root');
      expect(root).toHaveAttribute('title', 'Root');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(indicator).toHaveClass('tk-globe-spinner-indicator', 'custom-indicator');
      expect(indicator).not.toHaveClass('custom-root');
      expect(indicator).toHaveAttribute('title', 'Indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('provider theme', () => {
    it('applies theme defaultProps below instance props', () => {
      const components: ComponentsThemeMap = { GlobeSpinner: { defaultProps: { variant: 'neutral', size: 'large' } } };

      const { container, rerender } = render(
        <TakeoffSparProvider components={components}>
          <GlobeSpinner />
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'neutral');
      expect(getRoot(container)).toHaveAttribute('data-size', 'large');

      rerender(
        <TakeoffSparProvider components={components}>
          <GlobeSpinner variant="success" />
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'success');
      expect(getRoot(container)).toHaveAttribute('data-size', 'large');
    });

    it('applies theme classNames to the label part', () => {
      const components: ComponentsThemeMap = { GlobeSpinnerLabel: { classNames: { root: 'theme-label' } } };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <GlobeSpinner>
            <GlobeSpinner.Label>Hello</GlobeSpinner.Label>
          </GlobeSpinner>
        </TakeoffSparProvider>,
      );

      expect(getLabel(container)).toHaveClass('tk-globe-spinner-label', 'theme-label');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with a label', async () => {
      const { container } = render(
        <GlobeSpinner aria-label="Loading">
          <GlobeSpinner.Label>Widen your world</GlobeSpinner.Label>
        </GlobeSpinner>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
