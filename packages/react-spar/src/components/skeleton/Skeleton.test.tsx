import { createRef, type CSSProperties, type HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';

import { describe, expect, it } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render } from '../../test-utils';

import { Skeleton } from './index';

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders the anatomy — the root bar with the shimmer strip inside', () => {
      const { container } = render(<Skeleton />);

      const root = container.querySelector('.tk-skeleton');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('aria-hidden', 'true');

      const shimmer = root?.querySelector('span.tk-skeleton-shimmer[data-slot="shimmer"]');
      expect(shimmer).not.toBeNull();
      expect(shimmer).toHaveAttribute('aria-hidden', 'true');
    });

    it('emits the resolved variant data attributes on the root', () => {
      const { container } = render(<Skeleton />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root).toHaveAttribute('data-type', 'rectangle');
      expect(root).toHaveAttribute('data-animation', 'shimmer');
    });

    it('reflects non-default root props into data attributes', () => {
      const { container } = render(<Skeleton animation="none" shape="circle" />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root).toHaveAttribute('data-type', 'circle');
      expect(root).toHaveAttribute('data-animation', 'none');
    });

    it('appends instance className without dropping the canonical class', () => {
      const { container } = render(<Skeleton className="extra" />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.className).toContain('tk-skeleton');
      expect(root.className).toContain('extra');
    });

    it('applies per-slot classNames and slotProps to the shimmer slot', () => {
      const { container } = render(<Skeleton classNames={{ shimmer: 'custom-shimmer' }} slotProps={{ shimmer: { id: 'shimmer-override' } }} />);
      const shimmer = container.querySelector('.tk-skeleton-shimmer') as HTMLElement;

      expect(shimmer.className).toContain('tk-skeleton-shimmer');
      expect(shimmer.className).toContain('custom-shimmer');
      expect(shimmer).toHaveAttribute('id', 'shimmer-override');
    });

    it('layers provider theme defaults and classNames under instance props', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ Skeleton: { defaultProps: { shape: 'circle', animation: 'none' }, classNames: { root: 'theme-root', shimmer: 'theme-shimmer' } } }}>
          <Skeleton animation="shimmer" className="instance-root" />
        </TakeoffSparProvider>,
      );
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root).toHaveAttribute('data-type', 'circle');
      expect(root).toHaveAttribute('data-animation', 'shimmer');
      expect(root).toHaveClass('tk-skeleton', 'theme-root', 'instance-root');
      expect(container.querySelector('.tk-skeleton-shimmer')).toHaveClass('tk-skeleton-shimmer', 'theme-shimmer');
    });

    it('forwards a ref to the root span', () => {
      const ref = createRef<HTMLSpanElement>();
      const { container } = render(<Skeleton ref={ref} />);

      expect(ref.current).toBe(container.querySelector('span.tk-skeleton'));
    });
  });

  describe('sizing', () => {
    it('publishes numeric width/height as px custom properties', () => {
      const { container } = render(<Skeleton height={24} width={320} />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('320px');
      expect(root.style.getPropertyValue('--tk-skeleton-height')).toBe('24px');
    });

    it('passes string lengths through unchanged', () => {
      const { container } = render(<Skeleton height="1.5rem" width="50%" />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('50%');
      expect(root.style.getPropertyValue('--tk-skeleton-height')).toBe('1.5rem');
    });

    it('publishes no size custom properties when the props are omitted', () => {
      const { container } = render(<Skeleton />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('');
      expect(root.style.getPropertyValue('--tk-skeleton-height')).toBe('');
    });

    it('keeps a size custom property set through `style` when the matching prop is omitted', () => {
      const { container } = render(<Skeleton style={{ '--tk-skeleton-width': '10rem' } as CSSProperties} />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('10rem');
    });

    it('lets the size props win over custom properties set through `style`', () => {
      const { container } = render(<Skeleton style={{ '--tk-skeleton-width': '10rem' } as CSSProperties} width={320} />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('320px');
    });
  });

  describe('root layers and invariants', () => {
    it('lands root classNames and slotProps on the root span', () => {
      const { container } = render(<Skeleton classNames={{ root: 'root-extra' }} slotProps={{ root: { id: 'loading-bar', style: { opacity: 0.5 } } }} width={10} />);
      const root = container.querySelector('span.tk-skeleton') as HTMLElement;

      expect(root).toHaveClass('tk-skeleton', 'root-extra');
      expect(root).toHaveAttribute('id', 'loading-bar');
      expect(root.style.opacity).toBe('0.5');
      expect(root.style.getPropertyValue('--tk-skeleton-width')).toBe('10px');
    });

    it('keeps the variant hooks and the hidden shimmer strip against slotProps overrides', () => {
      const { container } = render(
        <Skeleton
          shape="circle"
          animation="none"
          slotProps={{ root: { 'data-type': 'rectangle', 'data-animation': 'shimmer' } as HTMLAttributes<HTMLElement>, shimmer: { 'aria-hidden': false } }}
        />,
      );

      const root = container.querySelector('.tk-skeleton');
      expect(root).toHaveAttribute('data-type', 'circle');
      expect(root).toHaveAttribute('data-animation', 'none');
      expect(container.querySelector('.tk-skeleton-shimmer')).toHaveAttribute('aria-hidden', 'true');
    });

    it('lets the size props win over a size custom property passed through slotProps', () => {
      const { container } = render(<Skeleton height={24} slotProps={{ root: { style: { '--tk-skeleton-height': '3rem' } as CSSProperties } }} />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root.style.getPropertyValue('--tk-skeleton-height')).toBe('24px');
    });
  });

  describe('accessibility', () => {
    it('stays out of the accessibility tree by default but honors an override', () => {
      const { container } = render(<Skeleton aria-hidden={false} />);
      const root = container.querySelector('.tk-skeleton') as HTMLElement;

      expect(root).toHaveAttribute('aria-hidden', 'false');
    });

    it('has no a11y violations for either shape', async () => {
      const { container } = render(
        <div>
          <Skeleton height={16} width={200} />
          <Skeleton shape="circle" height={40} />
        </div>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
