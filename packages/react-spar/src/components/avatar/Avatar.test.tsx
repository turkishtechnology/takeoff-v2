import { act, createRef } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Avatar } from './index';

// JSDOM never loads images; drive the preload Spar starts through `window.Image`.
class MockImage {
  static instances: MockImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = false;
  naturalWidth = 0;
  src = '';
  constructor() {
    MockImage.instances.push(this);
  }
  load() {
    this.complete = true;
    this.naturalWidth = 40;
    this.onload?.();
  }
  fail() {
    this.onerror?.();
  }
}

const lastImage = () => MockImage.instances[MockImage.instances.length - 1]!;
const getRoot = (container: HTMLElement) => container.querySelector('.tk-avatar') as HTMLElement;

const originalImage = window.Image;
beforeEach(() => {
  MockImage.instances = [];
  (window as unknown as { Image: unknown }).Image = MockImage;
});
afterEach(() => {
  window.Image = originalImage;
});

describe('Avatar', () => {
  describe('rendering', () => {
    it('renders a span root with the canonical class, data-slot and default data-*', () => {
      const { container } = render(
        <Avatar>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      const root = getRoot(container);

      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).toHaveAttribute('data-type', 'filled');
      expect(root).toHaveAttribute('data-status', 'idle');
      expect(root).not.toHaveAttribute('data-rounded');
      expect(root).not.toHaveAttribute('data-hide-shadow');
      expect(root).not.toHaveAttribute('role');
    });

    it('reflects the visual props as data-*', () => {
      const { container } = render(
        <Avatar size="xxlarge" variant="danger" appearance="filledLight" rounded hideShadow>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-size', 'xxlarge');
      expect(root).toHaveAttribute('data-variant', 'danger');
      expect(root).toHaveAttribute('data-type', 'filledLight');
      expect(root).toHaveAttribute('data-rounded', '');
      expect(root).toHaveAttribute('data-hide-shadow', '');
    });

    it('supports `as` and forwards the ref', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Avatar as="div" ref={ref}>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      expect(ref.current?.tagName).toBe('DIV');
      expect(ref.current).toHaveClass('tk-avatar');
    });
  });

  describe('image loading', () => {
    it('shows the fallback until the image loads, then the image', () => {
      const onLoadingStatusChange = vi.fn();
      const { container } = render(
        <Avatar>
          <Avatar.Image src="/ada.png" alt="Ada Lovelace" onLoadingStatusChange={onLoadingStatusChange} />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );

      expect(screen.getByText('AL')).toHaveClass('tk-avatar-fallback');
      expect(getRoot(container)).toHaveAttribute('data-status', 'loading');

      act(() => lastImage().load());

      const image = screen.getByRole('img', { name: 'Ada Lovelace' });
      expect(image).toHaveClass('tk-avatar-image');
      expect(image).toHaveAttribute('data-slot', 'root');
      expect(image).toHaveAttribute('src', '/ada.png');
      expect(screen.queryByText('AL')).not.toBeInTheDocument();
      expect(getRoot(container)).toHaveAttribute('data-status', 'loaded');
      expect(onLoadingStatusChange.mock.calls).toEqual([['loading'], ['loaded']]);
    });

    it('falls back when the image fails to load', () => {
      const onLoadingStatusChange = vi.fn();
      const { container } = render(
        <Avatar>
          <Avatar.Image src="/broken.png" alt="Ada Lovelace" onLoadingStatusChange={onLoadingStatusChange} />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );

      act(() => lastImage().fail());

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('AL')).toBeInTheDocument();
      expect(getRoot(container)).toHaveAttribute('data-status', 'error');
      expect(onLoadingStatusChange).toHaveBeenLastCalledWith('error');
    });

    it('waits delayMs before showing the fallback', () => {
      vi.useFakeTimers();
      try {
        render(
          <Avatar>
            <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
            <Avatar.Fallback delayMs={200}>AL</Avatar.Fallback>
          </Avatar>,
        );
        expect(screen.queryByText('AL')).not.toBeInTheDocument();
        act(() => vi.advanceTimersByTime(200));
        expect(screen.getByText('AL')).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('fallback', () => {
    it('renders the default person glyph without children', () => {
      const { container } = render(
        <Avatar>
          <Avatar.Fallback />
        </Avatar>,
      );
      const fallback = container.querySelector('.tk-avatar-fallback')!;
      const icon = fallback.querySelector('svg')!;

      expect(fallback).toHaveAttribute('data-icon', '');
      expect(icon).toHaveClass('tk-avatar-icon');
      expect(icon).toHaveAttribute('data-slot', 'icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders its children instead of the glyph', () => {
      const { container } = render(
        <Avatar>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      expect(container.querySelector('.tk-avatar-icon')).toBeNull();
      expect(screen.getByText('AL')).not.toHaveAttribute('data-icon');
    });
  });

  describe('name', () => {
    it('names the whole avatar and hides its parts', () => {
      const { container } = render(
        <Avatar name="Ada Lovelace">
          <Avatar.Image src="/ada.png" alt="Portrait" />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      const root = getRoot(container);

      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBe(root);
      expect(screen.getByText('AL')).toHaveAttribute('aria-hidden', 'true');

      act(() => lastImage().load());
      expect(container.querySelector('.tk-avatar-image')).toHaveAttribute('alt', '');
    });

    it('lets an explicit role / aria-label win over name', () => {
      const { container } = render(
        <Avatar name="Ada" role="presentation" aria-label={undefined}>
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar>,
      );
      expect(getRoot(container)).toHaveAttribute('role', 'presentation');
    });
  });

  describe('badge', () => {
    it('renders a decorative dot Badge by default', () => {
      const { container } = render(
        <Avatar rounded>
          <Avatar.Fallback>AL</Avatar.Fallback>
          <Avatar.Badge />
        </Avatar>,
      );
      const badge = container.querySelector('.tk-avatar-badge')!;

      expect(badge).toHaveClass('tk-badge');
      expect(badge).toHaveAttribute('data-slot', 'root');
      expect(badge).toHaveAttribute('data-dot', '');
      expect(badge).toHaveAttribute('data-variant', 'success');
      expect(badge).toHaveAttribute('aria-hidden', 'true');
      expect(badge).not.toHaveAttribute('role');
    });

    it('becomes a named image with aria-label and shows content when given children', () => {
      render(
        <Avatar>
          <Avatar.Fallback>AL</Avatar.Fallback>
          <Avatar.Badge variant="danger" aria-label="3 unread">
            3
          </Avatar.Badge>
        </Avatar>,
      );
      const badge = screen.getByRole('img', { name: '3 unread' });

      expect(badge).toHaveAttribute('data-variant', 'danger');
      expect(badge).not.toHaveAttribute('data-dot');
      expect(badge).not.toHaveAttribute('aria-hidden');
      expect(badge).toHaveTextContent('3');
    });
  });

  describe('Avatar.Group', () => {
    it('renders a group root that passes size and rounded to its avatars', () => {
      const { container } = render(
        <Avatar.Group size="small" rounded aria-label="Team">
          <Avatar>
            <Avatar.Fallback>A</Avatar.Fallback>
          </Avatar>
          <Avatar size="large" rounded={false}>
            <Avatar.Fallback>B</Avatar.Fallback>
          </Avatar>
        </Avatar.Group>,
      );
      const group = screen.getByRole('group', { name: 'Team' });
      const [first, second] = Array.from(container.querySelectorAll('.tk-avatar'));

      expect(group).toHaveClass('tk-avatar-group');
      expect(group).toHaveAttribute('data-slot', 'root');
      expect(group).toHaveAttribute('data-size', 'small');
      expect(group).not.toHaveAttribute('data-compact');
      expect(first).toHaveAttribute('data-size', 'small');
      expect(first).toHaveAttribute('data-rounded', '');
      expect(second).toHaveAttribute('data-size', 'large');
      expect(second).not.toHaveAttribute('data-rounded');
    });

    it('collapses avatars past max into a +N avatar', () => {
      const { container } = render(
        <Avatar.Group max={2} compact classNames={{ overflow: 'extra' }}>
          {['A', 'B', 'C', 'D', 'E'].map(letter => (
            <Avatar key={letter} name={letter}>
              <Avatar.Fallback>{letter}</Avatar.Fallback>
            </Avatar>
          ))}
        </Avatar.Group>,
      );
      const avatars = container.querySelectorAll('.tk-avatar');
      const overflow = container.querySelector('.tk-avatar-group-overflow')!;

      expect(avatars).toHaveLength(3);
      expect(screen.queryByRole('img', { name: 'C' })).not.toBeInTheDocument();
      expect(overflow).toBe(avatars[2]);
      expect(overflow).toHaveClass('tk-avatar', 'extra');
      expect(overflow).toHaveAttribute('data-overflow', '');
      expect(overflow).toHaveAttribute('data-variant', 'light');
      expect(overflow).toHaveTextContent('+3');
      expect(screen.getByRole('img', { name: '3 more' })).toBe(overflow);
      expect(container.querySelector('.tk-avatar-group')).toHaveAttribute('data-compact', '');
    });

    it('renders no overflow avatar when the count fits', () => {
      const { container } = render(
        <Avatar.Group max={3}>
          <Avatar>
            <Avatar.Fallback>A</Avatar.Fallback>
          </Avatar>
        </Avatar.Group>,
      );
      expect(container.querySelector('.tk-avatar-group-overflow')).toBeNull();
    });

    it('formats custom overflow labels and falls back on blank ones', () => {
      const children = ['A', 'B', 'C'].map(letter => (
        <Avatar key={letter}>
          <Avatar.Fallback>{letter}</Avatar.Fallback>
        </Avatar>
      ));
      const { rerender } = render(
        <Avatar.Group max={1} overflowLabel="{count}+" overflowAriaLabel="{count} kişi daha">
          {children}
        </Avatar.Group>,
      );
      expect(screen.getByRole('img', { name: '2 kişi daha' })).toHaveTextContent('2+');

      rerender(
        <Avatar.Group max={1} overflowLabel="" overflowAriaLabel="">
          {children}
        </Avatar.Group>,
      );
      expect(screen.getByRole('img', { name: '2 more' })).toHaveTextContent('+2');
    });

    it('treats a negative or fractional max as a whole count', () => {
      const { container } = render(
        <Avatar.Group max={-1}>
          <Avatar>
            <Avatar.Fallback>A</Avatar.Fallback>
          </Avatar>
        </Avatar.Group>,
      );
      expect(container.querySelectorAll('.tk-avatar')).toHaveLength(1);
      expect(container.querySelector('.tk-avatar-group-overflow')).toHaveTextContent('+1');
    });
  });

  describe('customization', () => {
    it('applies theme defaults, theme classNames and instance overrides on the right owners', () => {
      const components: ComponentsThemeMap = {
        Avatar: { defaultProps: { size: 'small', rounded: true }, classNames: { root: 'theme-root' } },
        AvatarFallback: { classNames: { icon: 'theme-icon' } },
        AvatarGroup: { defaultProps: { size: 'large' } },
      };
      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Avatar className="instance" slotProps={{ root: { 'data-testid': 'root' } as never }}>
            <Avatar.Fallback slotProps={{ icon: { 'data-testid': 'icon' } as never }} />
          </Avatar>
          <Avatar.Group>
            <Avatar>
              <Avatar.Fallback>G</Avatar.Fallback>
            </Avatar>
          </Avatar.Group>
        </TakeoffSparProvider>,
      );
      const root = screen.getByTestId('root');

      expect(root).toHaveClass('tk-avatar', 'theme-root', 'instance');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-rounded', '');
      expect(screen.getByTestId('icon')).toHaveClass('tk-avatar-icon', 'theme-icon');
      // The group's size beats the Avatar theme default.
      expect(container.querySelector('.tk-avatar-group .tk-avatar')).toHaveAttribute('data-size', 'large');
    });

    it('throws when a part is used outside Avatar', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Avatar.Fallback>AL</Avatar.Fallback>)).toThrow('Avatar.Fallback must be used within Avatar');
      expect(() => render(<Avatar.Badge />)).toThrow('Avatar.Badge must be used within Avatar');
      expect(() => render(<Avatar.Image src="/a.png" alt="" />)).toThrow('Avatar.Image must be used within Avatar');
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('has no violations for a named avatar with a badge, and a group with overflow', async () => {
      const { container } = render(
        <div>
          <Avatar name="Ada Lovelace" rounded>
            <Avatar.Image src="/ada.png" alt="" />
            <Avatar.Fallback>AL</Avatar.Fallback>
            <Avatar.Badge />
          </Avatar>
          <Avatar>
            <Avatar.Image src="/grace.png" alt="Grace Hopper" />
            <Avatar.Fallback />
          </Avatar>
          <Avatar.Group max={1} aria-label="Reviewers">
            <Avatar name="A">
              <Avatar.Fallback>A</Avatar.Fallback>
            </Avatar>
            <Avatar name="B">
              <Avatar.Fallback>B</Avatar.Fallback>
            </Avatar>
          </Avatar.Group>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();

      act(() => MockImage.instances.forEach(image => image.load()));
      expect(screen.getByRole('img', { name: 'Grace Hopper' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
