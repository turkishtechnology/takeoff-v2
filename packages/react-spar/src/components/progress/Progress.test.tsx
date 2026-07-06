import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProvider as render, screen } from '../../test-utils';

import { Field } from '../field';

import { Progress } from './index';

describe('Progress (compound)', () => {
  describe('rendering', () => {
    it('renders the default linear indicator — the root doubles as the track', () => {
      const { container } = render(<Progress value={60} />);

      const root = container.querySelector('.tk-progress');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const indicator = root?.querySelector('span.tk-progress-indicator[data-slot="root"]');
      expect(indicator).not.toBeNull();
      expect(indicator?.parentElement).toBe(root);
    });

    it('supports an explicitly composed linear indicator', () => {
      const { container } = render(
        <Progress value={60}>
          <Progress.Indicator />
        </Progress>,
      );

      const root = container.querySelector('.tk-progress');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const indicator = root?.querySelector('span.tk-progress-indicator[data-slot="root"]');
      expect(indicator).not.toBeNull();
      expect(indicator?.parentElement).toBe(root);
    });

    it('renders the circular indicator as a ring svg', () => {
      const { container } = render(
        <Progress appearance="circular" value={25}>
          <Progress.Indicator />
        </Progress>,
      );

      const indicator = container.querySelector('svg.tk-progress-indicator');
      expect(indicator).not.toBeNull();
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator?.querySelectorAll('circle')).toHaveLength(2);
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
      const { container } = render(
        <Progress value={30}>
          <Progress.Indicator />
        </Progress>,
      );
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;
      expect(indicator.style.width).toBe('30%');
    });

    it('writes the dash offset to the circular arc circle', () => {
      const { container } = render(
        <Progress appearance="circular" value={60}>
          <Progress.Indicator />
        </Progress>,
      );
      const arc = container.querySelector('.tk-progress-indicator circle:last-child') as SVGCircleElement;
      expect(arc).toHaveAttribute('pathLength', '100');
      expect(arc).toHaveAttribute('stroke-dashoffset', '40');
    });

    it('clamps value into [0, max] for the aria surface and the width', () => {
      const { container, rerender } = render(
        <Progress value={150}>
          <Progress.Indicator />
        </Progress>,
      );
      const root = () => container.querySelector('.tk-progress') as HTMLElement;
      const indicator = () => container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root()).toHaveAttribute('aria-valuenow', '100');
      expect(indicator().style.width).toBe('100%');

      rerender(
        <Progress value={-5}>
          <Progress.Indicator />
        </Progress>,
      );
      expect(root()).toHaveAttribute('aria-valuenow', '0');
      expect(indicator().style.width).toBe('0%');
    });

    it('supports a custom max', () => {
      const { container } = render(
        <Progress value={5} max={20}>
          <Progress.Indicator />
        </Progress>,
      );
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('aria-valuemax', '20');
      expect(root).toHaveAttribute('aria-valuenow', '5');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('25%');
    });

    it('supports a custom min and measures the width from it', () => {
      const { container } = render(
        <Progress value={150} min={100} max={200}>
          <Progress.Indicator />
        </Progress>,
      );
      const root = container.querySelector('.tk-progress') as HTMLElement;

      expect(root).toHaveAttribute('aria-valuemin', '100');
      expect(root).toHaveAttribute('aria-valuenow', '150');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('50%');
    });

    it('clamps value up to a custom min', () => {
      const { container } = render(
        <Progress value={50} min={100} max={200}>
          <Progress.Indicator />
        </Progress>,
      );

      expect(container.querySelector('.tk-progress')).toHaveAttribute('aria-valuenow', '100');
      expect((container.querySelector('.tk-progress-indicator') as HTMLElement).style.width).toBe('0%');
    });

    it('falls back to the default max when max is not positive', () => {
      const { container } = render(<Progress value={50} max={0} />);
      expect(container.querySelector('.tk-progress')).toHaveAttribute('aria-valuemax', '100');
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
      expect(root).not.toHaveAttribute('aria-label');
      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Upload progress');
    });

    it('has no a11y violations for linear and circular', async () => {
      const { container } = render(
        <>
          <Progress value={60}>
            <Progress.Indicator />
          </Progress>
          <Progress appearance="circular" value={60}>
            <Progress.Indicator />
          </Progress>
          <Field>
            <Field.Label>Upload progress</Field.Label>
            <Progress value={60}>
              <Progress.Indicator />
            </Progress>
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
          <Progress.Indicator className="indicator-extra" slotProps={{ root: { title: 'indicator-slot' } }} />
        </Progress>,
      );

      const root = container.querySelector('.tk-progress') as HTMLElement;
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(root).toHaveClass('root-extra');
      expect(indicator).toHaveClass('indicator-extra');
      expect(indicator).toHaveAttribute('title', 'indicator-slot');
    });

    it('keeps the width invariant when the indicator receives a style prop', () => {
      const { container } = render(
        <Progress value={50}>
          <Progress.Indicator style={{ opacity: 0.5, width: '10%' }} />
        </Progress>,
      );
      const indicator = container.querySelector('.tk-progress-indicator') as HTMLElement;

      expect(indicator.style.opacity).toBe('0.5');
      expect(indicator.style.width).toBe('50%');
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Progress.Indicator renders outside the root', () => {
      expect(() => render(<Progress.Indicator />)).toThrow(/Progress\.Indicator must be used within ProgressProvider/);
    });
  });
});
