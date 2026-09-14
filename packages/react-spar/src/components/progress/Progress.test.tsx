import type { HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen } from '../../test-utils';

import { Field } from '../field';

import { Progress } from './index';

// The console spies below restore themselves, but only if the case reaches that
// line — this keeps a failing case from leaking its spy into the next one.
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Progress (compound)', () => {
  describe('rendering', () => {
    it('renders the default linear anatomy — track wrapping the indicator', () => {
      const { container } = render(<Progress value={60} />);

      const root = container.querySelector('.tk-progress');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const track = root?.querySelector('div.tk-progress-track[data-slot="root"]');
      expect(track).not.toBeNull();
      expect(track?.parentElement).toBe(root);

      const indicator = track?.querySelector('span.tk-progress-indicator[data-slot="root"]');
      expect(indicator).not.toBeNull();
      expect(indicator?.parentElement).toBe(track);
    });

    it('supports an explicitly composed track and indicator', () => {
      const { container } = render(
        <Progress value={60}>
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress>,
      );

      const root = container.querySelector('.tk-progress');
      const track = root?.querySelector('div.tk-progress-track');
      const indicator = track?.querySelector('span.tk-progress-indicator');

      expect(track).not.toBeNull();
      expect(indicator).not.toBeNull();
    });

    it('renders the default indicator inside a childless track', () => {
      const { container } = render(
        <Progress value={60}>
          <Progress.Track />
        </Progress>,
      );

      const indicator = container.querySelector('.tk-progress-track .tk-progress-indicator');
      expect(indicator).not.toBeNull();
    });

    it('renders the circular track as the ring svg hosting the rail and arc indicator', () => {
      const { container } = render(<Progress appearance="circular" value={25} />);

      const root = container.querySelector('.tk-progress');
      const track = root?.querySelector('svg.tk-progress-track');

      expect(track).not.toBeNull();
      expect(track?.parentElement).toBe(root);
      expect(track).toHaveAttribute('aria-hidden', 'true');
      expect(track?.querySelectorAll('circle')).toHaveLength(2);

      const rail = track?.querySelector('circle.tk-progress-rail');
      expect(rail).not.toBeNull();
      expect(rail).toHaveAttribute('data-slot', 'rail');

      const indicator = track?.querySelector('circle.tk-progress-indicator');
      expect(indicator).not.toBeNull();
      expect(indicator).toBe(track?.querySelector('circle:last-child'));
    });

    it('stamps the resolved appearance on every part as data-type', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Track />
          <Progress.Value>%60</Progress.Value>
        </Progress>,
      );

      expect(container.querySelector('.tk-progress-track')).toHaveAttribute('data-type', 'circular');
      expect(container.querySelector('.tk-progress-indicator')).toHaveAttribute('data-type', 'circular');
      expect(container.querySelector('.tk-progress-value')).toHaveAttribute('data-type', 'circular');
    });

    it('emits the resolved variant data attributes on the root', () => {
      const { container } = render(<Progress value={10} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('data-type', 'linear');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).not.toHaveAttribute('data-disabled');
    });

    it('reflects non-default root props into data attributes', () => {
      const { container } = render(<Progress appearance="circular" size="large" variant="success" value={10} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('data-type', 'circular');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-variant', 'success');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(<Progress as="section" value={5} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;
      expect(root.tagName).toBe('SECTION');
    });
  });

  describe('value model', () => {
    it('writes the percentage to the linear indicator width', () => {
      const { container } = render(<Progress value={30} />);
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;
      expect(indicator.style.width).toBe('30%');
    });

    it('writes the dash offset to the circular arc indicator as inline style', () => {
      const { container } = render(<Progress appearance="circular" value={60} />);
      const arc = container.querySelector('circle.tk-progress-indicator') as SVGCircleElement;
      expect(arc).toHaveAttribute('pathLength', '100');
      // Inline style, not a presentation attribute — a presentation
      // attribute would lose to any stylesheet rule.
      expect(arc.style.strokeDasharray).toBe('100');
      expect(arc.style.strokeDashoffset).toBe('40');
    });

    it('clamps value into [0, max] for the aria surface and the width', () => {
      const { container, rerender } = render(<Progress value={150} />);
      const root = () => container.querySelector('.tk-progress') as HTMLElement;
      const indicator = () => container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root()).toHaveAttribute('aria-valuenow', '100');
      expect(indicator().style.width).toBe('100%');

      rerender(<Progress value={-5} />);
      expect(root()).toHaveAttribute('aria-valuenow', '0');
      expect(indicator().style.width).toBe('0%');
    });

    it('clamps a float-imprecise percentage back into range', () => {
      // 0.3 - 0.1 divides to 100.00000000000001 in IEEE-754; without the clamp
      // the linear width overshoots 100% and the circular offset goes negative.
      const { container } = render(<Progress min={0.1} max={0.3} value={0.3} />);
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('100%');

      const { container: circular } = render(<Progress appearance="circular" min={0.1} max={0.3} value={0.3} />);
      expect((circular.querySelector('circle.tk-progress-indicator') as SVGCircleElement).style.strokeDashoffset).toBe('0');
    });

    it('supports a custom max', () => {
      const { container } = render(<Progress value={5} max={20} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('aria-valuemax', '20');
      expect(root).toHaveAttribute('aria-valuenow', '5');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('25%');
    });

    it('supports a custom min and measures the width from it', () => {
      const { container } = render(<Progress value={150} min={100} max={200} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('aria-valuemin', '100');
      expect(root).toHaveAttribute('aria-valuenow', '150');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('50%');
    });

    it('clamps value up to a custom min', () => {
      const { container } = render(<Progress value={50} min={100} max={200} />);

      expect(container.querySelector('.tk-progress')).toHaveAttribute('aria-valuenow', '100');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('0%');
    });

    it('falls back to the default max when max is not positive', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container } = render(<Progress value={50} max={0} />);
      expect(container.querySelector('.tk-progress')).toHaveAttribute('aria-valuemax', '100');
      warn.mockRestore();
    });

    it('falls back to a min-based max and warns in dev when max is not greater than a custom min', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container } = render(<Progress value={80} min={60} max={50} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('aria-valuemin', '60');
      expect(root).toHaveAttribute('aria-valuemax', '160');
      expect(root).toHaveAttribute('aria-valuenow', '80');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[Progress]'));
      warn.mockRestore();
    });

    it('warns only once per broken range even across re-renders', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = render(<Progress value={5} min={10} max={7} />);
      rerender(<Progress value={6} min={10} max={7} />);
      rerender(<Progress value={7} min={10} max={7} />);

      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('falls back to the default min when min is not finite', () => {
      const { container } = render(<Progress value={50} min={Number.NaN} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      // A NaN bound would otherwise poison the max, the clamp, and the width.
      expect(root).toHaveAttribute('aria-valuemin', '0');
      expect(root).toHaveAttribute('aria-valuemax', '100');
      expect(root).toHaveAttribute('aria-valuenow', '50');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('50%');
    });

    it('marks the root complete when the clamped value reaches max', () => {
      const { container, rerender } = render(<Progress value={100} />);
      const root = () => container.querySelector('.tk-progress') as HTMLElement;

      expect(root()).toHaveAttribute('data-complete');

      // Clamping counts: an overshooting value is complete too.
      rerender(<Progress value={150} />);
      expect(root()).toHaveAttribute('data-complete');

      rerender(<Progress value={99} />);
      expect(root()).not.toHaveAttribute('data-complete');
    });

    it('does not mark complete while indeterminate', () => {
      const { container } = render(<Progress indeterminate value={100} />);
      expect(container.querySelector('.tk-progress')).not.toHaveAttribute('data-complete');
    });
  });

  describe('indeterminate', () => {
    it('marks the root and skips the written fill — no aria-valuenow', () => {
      const { container } = render(<Progress indeterminate />);
      const root = container.querySelector('.tk-progress') as HTMLElement;
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root).toHaveAttribute('data-indeterminate');
      expect(root).not.toHaveAttribute('aria-valuenow');
      expect(root).toHaveAttribute('aria-valuemin', '0');
      expect(root).toHaveAttribute('aria-valuemax', '100');
      expect(indicator).toHaveAttribute('data-indeterminate');
      expect(indicator.style.width).toBe('');
    });

    it('takes precedence over a numeric value', () => {
      const { container } = render(<Progress indeterminate value={60} />);
      const root = container.querySelector('.tk-progress') as HTMLElement;
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root).toHaveAttribute('data-indeterminate');
      expect(root).not.toHaveAttribute('aria-valuenow');
      expect(indicator).toHaveAttribute('data-indeterminate');
      expect(indicator.style.width).toBe('');
    });

    it('leaves the circular arc without a dash offset so the recipe can animate it', () => {
      const { container } = render(<Progress appearance="circular" indeterminate />);
      const arc = container.querySelector('circle.tk-progress-indicator') as SVGCircleElement;

      expect(arc).toHaveAttribute('data-indeterminate');
      expect(arc).toHaveAttribute('pathLength', '100');
      expect(arc.style.strokeDasharray).toBe('100');
      expect(arc.style.strokeDashoffset).toBe('');
    });

    it('clears a leaked consumer width so the recipe animates the sweep (linear)', () => {
      const { container } = render(
        <Progress indeterminate>
          <Progress.Track>
            <Progress.Indicator style={{ width: '10%' }} />
          </Progress.Track>
        </Progress>,
      );
      // The consumer width would otherwise outrank the recipe's sweep rule
      // (inline > stylesheet) and freeze the animation at 10%.
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('');
    });

    it('clears a leaked consumer dash offset so the recipe animates the arc (circular)', () => {
      const { container } = render(
        <Progress appearance="circular" indeterminate>
          <Progress.Track>
            <Progress.Indicator style={{ strokeDashoffset: 10 } as never} />
          </Progress.Track>
        </Progress>,
      );
      const arc = container.querySelector('circle.tk-progress-indicator') as SVGCircleElement;
      expect(arc.style.strokeDashoffset).toBe('');
      expect(arc.style.strokeDasharray).toBe('100');
    });

    it('stays determinate when the value is merely omitted', () => {
      const { container } = render(<Progress />);
      const root = container.querySelector('.tk-progress') as HTMLElement;
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root).not.toHaveAttribute('data-indeterminate');
      expect(root).toHaveAttribute('aria-valuenow', '0');
      expect(indicator.style.width).toBe('0%');
    });
  });

  describe('value text', () => {
    it('renders as a decorative overlay inside the circular root', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Track />
          <Progress.Value>%60</Progress.Value>
        </Progress>,
      );

      const root = container.querySelector('.tk-progress') as HTMLElement;
      const valueText = container.querySelector('span.tk-progress-value') as HTMLElement;

      expect(valueText).not.toBeNull();
      expect(valueText.parentElement).toBe(root);
      expect(valueText).toHaveAttribute('aria-hidden', 'true');
      expect(valueText).toHaveAttribute('data-slot', 'root');
      expect(valueText).toHaveTextContent('%60');
    });

    it('renders in flow next to the linear track', () => {
      const { container } = render(
        <Progress value={40}>
          <Progress.Track />
          <Progress.Value>%40</Progress.Value>
        </Progress>,
      );

      const root = container.querySelector('.tk-progress') as HTMLElement;
      const track = container.querySelector('.tk-progress-track') as HTMLElement;
      const valueText = container.querySelector('span.tk-progress-value') as HTMLElement;

      expect(valueText).not.toBeNull();
      expect(valueText.parentElement).toBe(root);
      expect(valueText.previousElementSibling).toBe(track);
      expect(valueText).toHaveAttribute('aria-hidden', 'true');
      expect(valueText).toHaveTextContent('%40');
    });

    it('stays out of the accessible name — the value is announced via aria-valuenow', () => {
      render(
        <Progress appearance="circular" value={60} aria-label="Upload progress">
          <Progress.Track />
          <Progress.Value>%60</Progress.Value>
        </Progress>,
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAccessibleName('Upload progress');
      expect(progressbar).toHaveAttribute('aria-valuenow', '60');
    });

    it('keeps the decorative aria-hidden invariant even when a prop tries to override it', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Track />
          <Progress.Value aria-hidden="false">%60</Progress.Value>
        </Progress>,
      );

      expect(container.querySelector('.tk-progress-value')).toHaveAttribute('aria-hidden', 'true');
    });

    it('merges classNames and slotProps onto the value node', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Track />
          <Progress.Value className="value-extra" slotProps={{ root: { title: 'value-slot' } }}>
            %60
          </Progress.Value>
        </Progress>,
      );

      const valueText = container.querySelector('.tk-progress-value') as HTMLElement;
      expect(valueText).toHaveClass('value-extra');
      expect(valueText).toHaveAttribute('title', 'value-slot');
    });
  });

  describe('disabled', () => {
    it('emits data-disabled and aria-disabled when disabled', () => {
      const { container } = render(<Progress value={40} disabled />);
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('data-disabled');
      expect(root).toHaveAttribute('aria-disabled', 'true');
    });

    it('inherits the disabled state from a surrounding Field', () => {
      const { container } = render(
        <Field disabled>
          <Progress value={40} />
        </Field>,
      );

      expect(container.querySelector('.tk-progress')).toHaveAttribute('data-disabled');
    });

    it('lets the instance prop override the Field disabled state', () => {
      const { container } = render(
        <Field disabled>
          <Progress value={40} disabled={false} />
        </Field>,
      );

      expect(container.querySelector('.tk-progress')).not.toHaveAttribute('data-disabled');
    });
  });

  describe('accessibility', () => {
    it('exposes the progressbar role with the value surface', () => {
      render(<Progress value={60} />);
      const progressbar = screen.getByRole('progressbar');

      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-valuenow', '60');
      expect(progressbar).toHaveAttribute('aria-label', 'Progress');
    });

    it('prefers a consumer aria-label over the default', () => {
      render(<Progress value={60} aria-label="Yükleme durumu" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Yükleme durumu');
    });

    it('drops the default aria-label when a consumer passes aria-labelledby', () => {
      render(
        <>
          <span id="upload-label">Uploading files</span>
          <Progress value={60} aria-labelledby="upload-label" />
        </>,
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-labelledby', 'upload-label');
      expect(progressbar).not.toHaveAttribute('aria-label');
      expect(progressbar).toHaveAccessibleName('Uploading files');
    });

    it('passes aria-valuetext through for formatted announcements', () => {
      render(<Progress value={3} max={10} aria-valuetext="3 of 10 steps" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
      expect(progressbar).toHaveAttribute('aria-valuetext', '3 of 10 steps');
    });

    it('wires aria-labelledby to a composed Field.Label automatically', () => {
      const { container } = render(
        <Field>
          <Field.Label>Upload progress</Field.Label>
          <Progress value={60} />
        </Field>,
      );

      const root = container.querySelector('.tk-progress') as HTMLElement;
      const label = container.querySelector('.tk-field-label') as HTMLElement;

      expect(label.id).not.toBe('');
      expect(root).toHaveAttribute('aria-labelledby', label.id);
      // The default aria-label stays on as a fallback (the Field always exposes
      // a labelId even without a label), but the composed label resolves and
      // wins the accessible name.
      expect(root).toHaveAttribute('aria-label', 'Progress');
      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Upload progress');
    });

    it('keeps an accessible name inside a Field that renders no Field.Label', () => {
      // Spar's FieldRoot exposes a labelId even here, so aria-labelledby points
      // at an element that never renders. The default aria-label must keep the
      // progressbar named rather than letting the dangling reference blank it.
      render(
        <Field disabled>
          <Progress value={40} />
        </Field>,
      );

      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Progress');
    });

    it('drops aria-valuetext alongside aria-valuenow while indeterminate', () => {
      render(<Progress indeterminate aria-valuetext="Loading…" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('has no a11y violations for linear and circular', async () => {
      const { container } = render(
        <>
          <Progress value={60} />
          <Progress value={40}>
            <Progress.Track />
            <Progress.Value>%40</Progress.Value>
          </Progress>
          <Progress appearance="circular" value={60}>
            <Progress.Track />
            <Progress.Value>%60</Progress.Value>
          </Progress>
          <Field>
            <Field.Label>Upload progress</Field.Label>
            <Progress value={60} />
          </Field>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('customization', () => {
    it('merges classNames and slotProps onto the slot owner nodes', () => {
      const { container } = render(
        <Progress value={60} className="root-extra">
          <Progress.Track className="track-extra" slotProps={{ root: { title: 'track-slot' } }}>
            <Progress.Indicator className="indicator-extra" slotProps={{ root: { title: 'indicator-slot' } }} />
          </Progress.Track>
        </Progress>,
      );

      const root = container.querySelector('.tk-progress') as HTMLElement;
      const track = container.querySelector('.tk-progress-track') as HTMLElement;
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root).toHaveClass('root-extra');
      expect(track).toHaveClass('track-extra');
      expect(track).toHaveAttribute('title', 'track-slot');
      expect(indicator).toHaveClass('indicator-extra');
      expect(indicator).toHaveAttribute('title', 'indicator-slot');
    });

    it('keeps the width invariant when the indicator receives a style prop', () => {
      const { container } = render(
        <Progress value={50}>
          <Progress.Track>
            <Progress.Indicator style={{ opacity: 0.5, width: '10%' }} />
          </Progress.Track>
        </Progress>,
      );
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(indicator.style.opacity).toBe('0.5');
      expect(indicator.style.width).toBe('50%');
    });

    it('merges classNames and slotProps onto the circular rail slot', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Track classNames={{ rail: 'rail-extra' }} slotProps={{ rail: { id: 'rail-slot' } }} />
        </Progress>,
      );

      const rail = container.querySelector('.tk-progress-rail') as SVGCircleElement;
      expect(rail).toHaveClass('rail-extra');
      expect(rail).toHaveAttribute('id', 'rail-slot');
    });

    it('keeps the dash-offset invariant when the arc indicator receives slot props', () => {
      const { container } = render(
        <Progress appearance="circular" value={70}>
          <Progress.Track>
            <Progress.Indicator slotProps={{ root: { pathLength: 360, style: { strokeDashoffset: 5, strokeDasharray: 360 } } as never }} />
          </Progress.Track>
        </Progress>,
      );
      const arc = container.querySelector('circle.tk-progress-indicator') as SVGCircleElement;

      expect(arc).toHaveAttribute('pathLength', '100');
      expect(arc.style.strokeDasharray).toBe('100');
      expect(arc.style.strokeDashoffset).toBe('30');
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Progress.Track renders outside the root', () => {
      expect(() => render(<Progress.Track />)).toThrow(/Progress\.Track must be used within ProgressProvider/);
    });

    it('throws a descriptive error when Progress.Indicator renders outside the root', () => {
      expect(() => render(<Progress.Indicator />)).toThrow(/Progress\.Indicator must be used within ProgressProvider/);
    });

    it('throws a descriptive error when Progress.Value renders outside the root', () => {
      expect(() => render(<Progress.Value>%60</Progress.Value>)).toThrow(/Progress\.Value must be used within ProgressProvider/);
    });
  });
  describe('theme, refs and invariants', () => {
    it('layers provider theme classNames and defaults under instance props on every part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Progress: { defaultProps: { variant: 'danger', size: 'small' }, classNames: { root: 'theme-root' } },
            ProgressTrack: { classNames: { root: 'theme-track', rail: 'theme-rail' } },
            ProgressIndicator: { classNames: { root: 'theme-indicator' } },
            ProgressValue: { classNames: { root: 'theme-value' } },
          }}
        >
          <Progress appearance="circular" value={50} size="large" className="instance-root">
            <Progress.Track className="instance-track">
              <Progress.Indicator className="instance-indicator" />
            </Progress.Track>
            <Progress.Value className="instance-value">%50</Progress.Value>
          </Progress>
        </TakeoffSparProvider>,
      );

      const root = container.querySelector('.tk-progress');
      expect(root).toHaveClass('theme-root', 'instance-root');
      expect(root).toHaveAttribute('data-variant', 'danger');
      expect(root).toHaveAttribute('data-size', 'large');

      expect(container.querySelector('svg.tk-progress-track')).toHaveClass('theme-track', 'instance-track');
      expect(container.querySelector('circle.tk-progress-rail')).toHaveClass('theme-rail');
      expect(container.querySelector('circle.tk-progress-indicator')).toHaveClass('theme-indicator', 'instance-indicator');
      expect(container.querySelector('.tk-progress-value')).toHaveClass('theme-value', 'instance-value');
    });

    it('keeps the state data attributes on every part when slotProps try to override them', () => {
      const { container } = render(
        <Progress
          value={100}
          disabled
          variant="success"
          slotProps={{ root: { 'data-variant': 'danger', 'data-disabled': 'no', 'data-complete': 'no', 'data-type': 'circular' } as HTMLAttributes<HTMLElement> }}
        >
          <Progress.Track slotProps={{ root: { 'data-type': 'circular' } as HTMLAttributes<HTMLElement> }}>
            <Progress.Indicator slotProps={{ root: { 'data-type': 'circular' } as HTMLAttributes<HTMLElement> }} />
          </Progress.Track>
          <Progress.Value slotProps={{ root: { 'data-type': 'circular' } as HTMLAttributes<HTMLElement> }}>%100</Progress.Value>
        </Progress>,
      );

      const root = container.querySelector('.tk-progress');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-complete', '');
      expect(root).toHaveAttribute('data-type', 'linear');

      expect(container.querySelector('.tk-progress-track')).toHaveAttribute('data-type', 'linear');
      expect(container.querySelector('.tk-progress-indicator')).toHaveAttribute('data-type', 'linear');
      expect(container.querySelector('.tk-progress-value')).toHaveAttribute('data-type', 'linear');
    });

    it('keeps the track and indicator decorative against consumer overrides, in both appearances', () => {
      const { container: linear } = render(
        <Progress value={40}>
          <Progress.Track>
            <Progress.Indicator aria-hidden={false} />
          </Progress.Track>
        </Progress>,
      );
      expect(linear.querySelector('.tk-progress-indicator')).toHaveAttribute('aria-hidden', 'true');

      const { container: circular } = render(
        <Progress appearance="circular" value={40}>
          <Progress.Track aria-hidden={false} slotProps={{ root: { 'aria-hidden': false } }} />
        </Progress>,
      );
      const ring = circular.querySelector('svg.tk-progress-track');
      expect(ring).toHaveAttribute('aria-hidden', 'true');
      expect(ring).toHaveAttribute('focusable', 'false');
      expect(ring).toHaveAttribute('viewBox', '0 0 40 40');
    });

    it('falls back to a min-based max without warning when max is not finite', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container } = render(
        <>
          <Progress value={50} max={Number.POSITIVE_INFINITY} />
          <Progress value={50} min={20} max={Number.NaN} />
        </>,
      );

      const [infinite, notANumber] = Array.from(container.querySelectorAll('.tk-progress'));
      expect(infinite).toHaveAttribute('aria-valuemax', '100');
      expect(infinite).toHaveAttribute('aria-valuenow', '50');
      expect(notANumber).toHaveAttribute('aria-valuemin', '20');
      expect(notANumber).toHaveAttribute('aria-valuemax', '120');
      // A non-finite max is an unset one, not an inverted range the consumer wrote.
      expect(warn).not.toHaveBeenCalled();
    });

    it('announces the disabled state it inherits from a Field', () => {
      render(
        <>
          <Field disabled>
            <Progress value={40} aria-label="Inherited" />
          </Field>
          <Progress value={40} aria-label="Standalone" />
        </>,
      );

      expect(screen.getByRole('progressbar', { name: 'Inherited' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('progressbar', { name: 'Standalone' })).not.toHaveAttribute('aria-disabled');
    });

    it('forwards refs to every part, on the element the appearance renders', () => {
      const rootRef = vi.fn();
      const trackRef = vi.fn();
      const indicatorRef = vi.fn();
      const valueRef = vi.fn();
      const { container, unmount } = render(
        <Progress value={40} ref={rootRef}>
          <Progress.Track ref={trackRef}>
            <Progress.Indicator ref={indicatorRef} />
          </Progress.Track>
          <Progress.Value ref={valueRef}>%40</Progress.Value>
        </Progress>,
      );

      expect(rootRef).toHaveBeenCalledWith(container.querySelector('div.tk-progress'));
      expect(trackRef).toHaveBeenCalledWith(container.querySelector('div.tk-progress-track'));
      expect(indicatorRef).toHaveBeenCalledWith(container.querySelector('span.tk-progress-indicator'));
      expect(valueRef).toHaveBeenCalledWith(container.querySelector('span.tk-progress-value'));
      unmount();

      const ringRef = vi.fn();
      const arcRef = vi.fn();
      const { container: circular } = render(
        <Progress appearance="circular" value={40}>
          <Progress.Track ref={ringRef}>
            <Progress.Indicator ref={arcRef} />
          </Progress.Track>
        </Progress>,
      );

      expect(ringRef).toHaveBeenCalledWith(circular.querySelector('svg.tk-progress-track'));
      expect(arcRef).toHaveBeenCalledWith(circular.querySelector('circle.tk-progress-indicator'));
    });
  });
});
