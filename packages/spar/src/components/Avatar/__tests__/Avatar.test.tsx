import { act, render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage, AvatarRoot, useAvatarContext } from '../index';
import { MockImage } from './mockImage';

MockImage.install();

const renderAvatar = (imageProps: Partial<Parameters<typeof AvatarImage>[0]> = {}, fallbackProps: Partial<Parameters<typeof AvatarFallback>[0]> = {}) =>
  render(
    <Avatar data-testid="root">
      <AvatarImage src="/user.png" alt="Ada Lovelace" {...imageProps} />
      <AvatarFallback {...fallbackProps}>AL</AvatarFallback>
    </Avatar>,
  );

describe('Avatar', () => {
  it('renders a span root with the compound statics', () => {
    renderAvatar();
    expect(screen.getByTestId('root').tagName).toBe('SPAN');
    expect(Avatar.Root).toBe(AvatarRoot);
    expect(Avatar.Image).toBe(AvatarImage);
    expect(Avatar.Fallback).toBe(AvatarFallback);
  });

  it('shows the fallback while loading and swaps in the image once it loads', () => {
    const onLoadingStatusChange = jest.fn();
    renderAvatar({ onLoadingStatusChange });

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'loading');
    expect(MockImage.last().src).toBe('/user.png');

    act(() => MockImage.last().load());

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('src', '/user.png');
    expect(screen.queryByText('AL')).not.toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'loaded');
    expect(onLoadingStatusChange.mock.calls).toEqual([['loading'], ['loaded']]);
  });

  it('keeps the fallback when the image fails', () => {
    const onLoadingStatusChange = jest.fn();
    renderAvatar({ onLoadingStatusChange });

    act(() => MockImage.last().fail());

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'error');
    expect(onLoadingStatusChange).toHaveBeenLastCalledWith('error');
  });

  it('treats an empty src as an error without preloading', () => {
    renderAvatar({ src: '' });
    expect(MockImage.instances).toHaveLength(0);
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'error');
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows an already-cached image without a loading state', () => {
    MockImage.cached.add('/user.png');
    const onLoadingStatusChange = jest.fn();
    renderAvatar({ onLoadingStatusChange });

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(onLoadingStatusChange.mock.calls).toEqual([['loaded']]);
  });

  it('reloads when src changes and ignores the stale preload', () => {
    const { rerender } = renderAvatar();
    const first = MockImage.last();

    rerender(
      <Avatar data-testid="root">
        <AvatarImage src="/other.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    const second = MockImage.last();
    expect(second).not.toBe(first);
    expect(second.src).toBe('/other.png');

    // The first preload's handlers are detached; settling it changes nothing.
    act(() => first.load());
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    act(() => second.load());
    expect(screen.getByRole('img')).toHaveAttribute('src', '/other.png');
  });

  it('forwards crossOrigin, referrerPolicy, srcSet and sizes to the preload', () => {
    renderAvatar({ crossOrigin: 'anonymous', referrerPolicy: 'no-referrer', srcSet: '/user@2x.png 2x', sizes: '40px' });
    const image = MockImage.last();
    expect(image.crossOrigin).toBe('anonymous');
    expect(image.referrerPolicy).toBe('no-referrer');
    expect(image.srcset).toBe('/user@2x.png 2x');
    expect(image.sizes).toBe('40px');
  });

  it('preloads from srcSet alone', () => {
    renderAvatar({ src: undefined, srcSet: '/user@2x.png 2x' });
    expect(MockImage.last().srcset).toBe('/user@2x.png 2x');
    act(() => MockImage.last().load());
    expect(screen.getByRole('img')).toHaveAttribute('srcset', '/user@2x.png 2x');
  });

  it('renders the fallback alone, staying idle, when there is no image', () => {
    render(
      <Avatar data-testid="root">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'idle');
  });

  it('returns to the fallback when the image unmounts', () => {
    const { rerender } = renderAvatar();
    act(() => MockImage.last().load());
    expect(screen.queryByText('AL')).not.toBeInTheDocument();

    rerender(
      <Avatar data-testid="root">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByTestId('root')).toHaveAttribute('data-status', 'idle');
  });

  describe('delayMs', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('waits before rendering the fallback', () => {
      renderAvatar({}, { delayMs: 300 });
      expect(screen.queryByText('AL')).not.toBeInTheDocument();

      act(() => jest.advanceTimersByTime(299));
      expect(screen.queryByText('AL')).not.toBeInTheDocument();

      act(() => jest.advanceTimersByTime(1));
      expect(screen.getByText('AL')).toBeInTheDocument();
    });

    it('never shows the fallback when the image loads within the delay', () => {
      renderAvatar({}, { delayMs: 300 });
      act(() => MockImage.last().load());
      act(() => jest.advanceTimersByTime(300));
      expect(screen.queryByText('AL')).not.toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('supports polymorphic parts and forwards refs', () => {
    const rootRef = { current: null as HTMLElement | null };
    const fallbackRef = { current: null as HTMLElement | null };
    render(
      <Avatar as="div" ref={rootRef} className="custom">
        <AvatarFallback as="strong" ref={fallbackRef}>
          AL
        </AvatarFallback>
      </Avatar>,
    );
    expect(rootRef.current?.tagName).toBe('DIV');
    expect(rootRef.current).toHaveClass('custom');
    expect(fallbackRef.current?.tagName).toBe('STRONG');
  });

  it('exposes the status through useAvatarContext', () => {
    const Probe = () => <span data-testid="probe">{useAvatarContext().imageLoadingStatus}</span>;
    render(
      <Avatar>
        <AvatarImage src="/user.png" alt="" />
        <Probe />
      </Avatar>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('loading');
  });

  it('throws when a part is used outside Avatar', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AvatarFallback>AL</AvatarFallback>)).toThrow('Avatar components must be used within an Avatar');
    spy.mockRestore();
  });
});
