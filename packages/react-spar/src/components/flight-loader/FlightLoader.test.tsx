import { createRef } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { FlightLoader } from './index';

const LOGO_SRC = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const getRoot = (container: HTMLElement) => container.querySelector('.tk-flight-loader') as HTMLElement;
const getScene = (container: HTMLElement) => container.querySelector('.tk-flight-loader-scene') as HTMLElement;
const getProgress = (container: HTMLElement) => container.querySelector('.tk-flight-loader-progress') as HTMLElement;

const renderFull = () =>
  render(
    <FlightLoader>
      <FlightLoader.Logo alt="Airline" src={LOGO_SRC} />
      <FlightLoader.Tagline>Widen your world</FlightLoader.Tagline>
      <FlightLoader.Status>Loading…</FlightLoader.Status>
    </FlightLoader>,
  );

describe('FlightLoader (compound)', () => {
  describe('rendering', () => {
    it('renders a div root carrying the canonical class, data-slot and default variant', () => {
      const { container } = render(<FlightLoader />);
      const root = getRoot(container);

      expect(root.tagName).toBe('DIV');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-variant', 'primary');
    });

    it('always renders the aria-hidden scene and progress slots', () => {
      const { container } = render(<FlightLoader />);
      const scene = getScene(container);
      const progress = getProgress(container);

      expect(scene).toHaveAttribute('data-slot', 'scene');
      expect(scene).toHaveAttribute('aria-hidden', 'true');
      expect(scene.querySelector('.tk-flight-loader-plane .tk-flight-loader-plane-climb svg.tk-flight-loader-plane-body')).not.toBeNull();
      expect(scene.querySelector('.tk-flight-loader-runway')).not.toBeNull();
      expect(progress).toHaveAttribute('data-slot', 'progress');
      expect(progress).toHaveAttribute('aria-hidden', 'true');
    });

    it('reflects the variant into data-variant and keeps it off the DOM', () => {
      const { container } = render(<FlightLoader variant="danger" />);

      expect(getRoot(container)).toHaveAttribute('data-variant', 'danger');
      expect(getRoot(container)).not.toHaveAttribute('variant');
    });

    it('forwards the ref to the root element', () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(<FlightLoader ref={ref} />);

      expect(ref.current).toBe(getRoot(container));
    });

    it('renders as another element through `as`', () => {
      const { container } = render(<FlightLoader as="section" />);

      expect(getRoot(container).tagName).toBe('SECTION');
    });
  });

  describe('parts', () => {
    it('renders Logo, Tagline and Status with their canonical classes and data-slot', () => {
      renderFull();

      const logo = screen.getByRole('img', { name: 'Airline' });
      expect(logo).toHaveClass('tk-flight-loader-logo');
      expect(logo).toHaveAttribute('src', LOGO_SRC);
      expect(logo).toHaveAttribute('data-slot', 'root');

      const tagline = screen.getByText('Widen your world');
      expect(tagline.tagName).toBe('P');
      expect(tagline).toHaveClass('tk-flight-loader-tagline');

      const status = screen.getByText('Loading…');
      expect(status.tagName).toBe('P');
      expect(status).toHaveClass('tk-flight-loader-status');
    });

    it('renders only the parts that are composed', () => {
      const { container } = render(
        <FlightLoader>
          <FlightLoader.Status>Saving</FlightLoader.Status>
        </FlightLoader>,
      );

      expect(container.querySelector('.tk-flight-loader-logo')).toBeNull();
      expect(container.querySelector('.tk-flight-loader-tagline')).toBeNull();
      expect(screen.getByText('Saving')).toHaveClass('tk-flight-loader-status');
    });

    it('supports `as` on parts', () => {
      render(
        <FlightLoader>
          <FlightLoader.Status as="span">Saving</FlightLoader.Status>
        </FlightLoader>,
      );

      expect(screen.getByText('Saving').tagName).toBe('SPAN');
    });

    it.each([
      ['Logo', () => <FlightLoader.Logo alt="" src={LOGO_SRC} />],
      ['Tagline', () => <FlightLoader.Tagline>Tagline</FlightLoader.Tagline>],
      ['Status', () => <FlightLoader.Status>Status</FlightLoader.Status>],
    ])('throws a descriptive error when FlightLoader.%s is used outside the root', (name, renderPart) => {
      expect(() => render(renderPart())).toThrow(`FlightLoader.${name} must be used within FlightLoader`);
    });
  });

  describe('accessibility semantics', () => {
    it('exposes a status role named "Loading" by default', () => {
      renderFull();

      expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass('tk-flight-loader');
    });

    it('names the status from visible text through aria-labelledby', () => {
      render(
        <FlightLoader aria-labelledby="loader-status">
          <FlightLoader.Status id="loader-status">Loading flights</FlightLoader.Status>
        </FlightLoader>,
      );

      const status = screen.getByRole('status', { name: 'Loading flights' });
      expect(status).not.toHaveAttribute('aria-label');
    });

    it('treats aria-hidden as decorative', () => {
      const { container } = render(<FlightLoader aria-hidden />);

      expect(getRoot(container)).not.toHaveAttribute('role');
      expect(getRoot(container)).not.toHaveAttribute('aria-label');
    });
  });

  describe('classNames and slotProps', () => {
    it('lands classNames and slotProps on root, scene and progress and keeps canonical hooks', () => {
      const rootOverrides = { 'title': 'Root', 'data-variant': 'hijacked' };
      const sceneOverrides = { 'title': 'Scene', 'aria-hidden': false };
      const { container } = render(
        <FlightLoader
          className="instance-root"
          classNames={{ root: 'custom-root', scene: 'custom-scene', progress: 'custom-progress' }}
          slotProps={{ root: rootOverrides, scene: sceneOverrides, progress: { title: 'Progress' } }}
        />,
      );
      const root = getRoot(container);
      const scene = getScene(container);
      const progress = getProgress(container);

      expect(root).toHaveClass('tk-flight-loader', 'instance-root', 'custom-root');
      expect(root).toHaveAttribute('title', 'Root');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(scene).toHaveClass('tk-flight-loader-scene', 'custom-scene');
      expect(scene).toHaveAttribute('title', 'Scene');
      expect(scene).toHaveAttribute('aria-hidden', 'true');
      expect(progress).toHaveClass('tk-flight-loader-progress', 'custom-progress');
      expect(progress).not.toHaveClass('custom-root');
      expect(progress).toHaveAttribute('title', 'Progress');
    });
  });

  describe('provider theme', () => {
    it('applies theme defaultProps below instance props and theme classes to parts', () => {
      const components: ComponentsThemeMap = {
        FlightLoader: { defaultProps: { variant: 'secondary' }, classNames: { progress: 'theme-progress' } },
        FlightLoaderTagline: { className: 'theme-tagline' },
      };

      const { container, rerender } = render(
        <TakeoffSparProvider components={components}>
          <FlightLoader>
            <FlightLoader.Tagline>Hello</FlightLoader.Tagline>
          </FlightLoader>
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'secondary');
      expect(getProgress(container)).toHaveClass('theme-progress');
      expect(screen.getByText('Hello')).toHaveClass('tk-flight-loader-tagline', 'theme-tagline');

      rerender(
        <TakeoffSparProvider components={components}>
          <FlightLoader variant="info" />
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'info');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with the full anatomy', async () => {
      const { container } = renderFull();

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
