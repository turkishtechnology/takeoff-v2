import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from './components/button';
import type { ComponentsThemeMap } from './core';
import { TakeoffSparProvider, useComponentTheme, useTheme, type TakeoffSparProviderProps } from './provider';
import { render, screen } from './test-utils';

const html = document.documentElement;

const ThemeReadout = () => <output>{useTheme().colorMode}</output>;

const providerWrapper =
  (props: Omit<TakeoffSparProviderProps, 'children'>) =>
  ({ children }: { children: ReactNode }) => <TakeoffSparProvider {...props}>{children}</TakeoffSparProvider>;

/**
 * `useTheme` latches its missing-provider warning for the lifetime of the
 * module, so each warning test loads a fresh copy instead of depending on
 * test order.
 */
const loadFreshProvider = async () => {
  vi.resetModules();
  return import('./provider');
};

beforeEach(() => {
  delete html.dataset.theme;
  html.removeAttribute('lang');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('TakeoffSparProvider', () => {
  describe('rendering', () => {
    it('renders its children without adding DOM of its own', () => {
      const { container } = render(
        <TakeoffSparProvider>
          <p>Content</p>
        </TakeoffSparProvider>,
      );

      expect(container.childElementCount).toBe(1);
      expect(container.firstElementChild).toBe(screen.getByText('Content'));
    });
  });

  describe('color mode', () => {
    it('writes the light theme to the document element by default', () => {
      render(<TakeoffSparProvider>content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('data-theme', 'light');
    });

    it('writes the dark theme when colorMode is dark', () => {
      render(<TakeoffSparProvider colorMode="dark">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('data-theme', 'dark');
    });

    it('moves data-theme and the hook value together when colorMode changes', () => {
      const { rerender } = render(
        <TakeoffSparProvider colorMode="light">
          <ThemeReadout />
        </TakeoffSparProvider>,
      );

      expect(html).toHaveAttribute('data-theme', 'light');
      expect(screen.getByRole('status')).toHaveTextContent('light');

      rerender(
        <TakeoffSparProvider colorMode="dark">
          <ThemeReadout />
        </TakeoffSparProvider>,
      );

      expect(html).toHaveAttribute('data-theme', 'dark');
      expect(screen.getByRole('status')).toHaveTextContent('dark');
    });

    it('removes data-theme on unmount when the document had none', () => {
      const { unmount } = render(<TakeoffSparProvider colorMode="dark">content</TakeoffSparProvider>);

      unmount();

      expect(html).not.toHaveAttribute('data-theme');
    });

    it('restores a server-rendered data-theme on unmount', () => {
      html.dataset.theme = 'dark';
      const { unmount } = render(<TakeoffSparProvider colorMode="light">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('data-theme', 'light');

      unmount();

      expect(html).toHaveAttribute('data-theme', 'dark');
    });

    it('leaves no data-theme behind after colorMode changed while mounted', () => {
      const { rerender, unmount } = render(<TakeoffSparProvider colorMode="light">content</TakeoffSparProvider>);

      rerender(<TakeoffSparProvider colorMode="dark">content</TakeoffSparProvider>);
      expect(html).toHaveAttribute('data-theme', 'dark');

      unmount();

      expect(html).not.toHaveAttribute('data-theme');
    });

    it('keeps the theme of a still-mounted sibling and restores the original only after the last one leaves', () => {
      // Two independent islands on one page (e.g. micro-frontends). Whatever
      // order they unmount in, the document must never lose the theme while
      // one is still mounted, nor keep a stale one after both are gone.
      const { unmount: unmountFirst } = render(<TakeoffSparProvider colorMode="dark">first</TakeoffSparProvider>);
      const { unmount: unmountSecond } = render(<TakeoffSparProvider colorMode="light">second</TakeoffSparProvider>);

      expect(html).toHaveAttribute('data-theme', 'light');

      unmountFirst();
      expect(html).toHaveAttribute('data-theme', 'light');

      unmountSecond();
      expect(html).not.toHaveAttribute('data-theme');
    });

    it('restores a server-rendered data-theme when siblings unmount out of mount order', () => {
      html.dataset.theme = 'dark';
      const { unmount: unmountFirst } = render(<TakeoffSparProvider colorMode="light">first</TakeoffSparProvider>);
      const { unmount: unmountSecond } = render(<TakeoffSparProvider colorMode="light">second</TakeoffSparProvider>);

      unmountFirst();
      unmountSecond();

      expect(html).toHaveAttribute('data-theme', 'dark');
    });

    it('lets only the outermost provider write the document theme when providers nest', () => {
      const { unmount } = render(
        <TakeoffSparProvider colorMode="light">
          <TakeoffSparProvider colorMode="dark">
            <ThemeReadout />
          </TakeoffSparProvider>
        </TakeoffSparProvider>,
      );

      // The nested provider scopes the hook value; the document stays with the outer one.
      expect(screen.getByRole('status')).toHaveTextContent('dark');
      expect(html).toHaveAttribute('data-theme', 'light');

      unmount();

      expect(html).not.toHaveAttribute('data-theme');
    });

    it('restores a server-rendered data-theme after colorMode changed while mounted', () => {
      html.dataset.theme = 'dark';
      const { rerender, unmount } = render(<TakeoffSparProvider colorMode="light">content</TakeoffSparProvider>);

      rerender(<TakeoffSparProvider colorMode="dark">content</TakeoffSparProvider>);
      rerender(<TakeoffSparProvider colorMode="light">content</TakeoffSparProvider>);
      expect(html).toHaveAttribute('data-theme', 'light');

      unmount();

      expect(html).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('locale', () => {
    it('restores the previous lang when locale is removed while mounted', () => {
      html.lang = 'en';
      const { rerender } = render(<TakeoffSparProvider locale="tr">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'tr');

      rerender(<TakeoffSparProvider>content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'en');
    });

    it('leaves lang untouched when locale is omitted', () => {
      html.lang = 'en';
      const { unmount } = render(<TakeoffSparProvider>content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'en');

      unmount();

      expect(html).toHaveAttribute('lang', 'en');
    });

    it('writes lang to the document element when locale is set', () => {
      render(<TakeoffSparProvider locale="tr">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'tr');
    });

    it('updates lang when locale changes', () => {
      const { rerender } = render(<TakeoffSparProvider locale="tr">content</TakeoffSparProvider>);

      rerender(<TakeoffSparProvider locale="en-GB">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'en-GB');
    });

    it('removes lang on unmount when the document had none', () => {
      const { unmount } = render(<TakeoffSparProvider locale="tr">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'tr');

      unmount();

      expect(html).not.toHaveAttribute('lang');
    });

    it('lets only the outermost provider write the document lang when providers nest', () => {
      render(
        <TakeoffSparProvider locale="en">
          <TakeoffSparProvider locale="tr">content</TakeoffSparProvider>
        </TakeoffSparProvider>,
      );

      expect(html).toHaveAttribute('lang', 'en');
    });

    it('restores the previous lang on unmount', () => {
      html.lang = 'en';
      const { unmount } = render(<TakeoffSparProvider locale="tr">content</TakeoffSparProvider>);

      expect(html).toHaveAttribute('lang', 'tr');

      unmount();

      expect(html).toHaveAttribute('lang', 'en');
    });
  });
});

describe('useTheme', () => {
  it('returns only the color mode of the nearest provider', () => {
    const components: ComponentsThemeMap = { Button: { className: 'product-button' } };
    const { result } = renderHook(() => useTheme(), { wrapper: providerWrapper({ colorMode: 'dark', locale: 'tr', components }) });

    expect(result.current).toStrictEqual({ colorMode: 'dark' });
  });

  it('reports the light default for a provider without colorMode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: providerWrapper({}) });

    expect(result.current).toStrictEqual({ colorMode: 'light' });
  });

  it('lets the nearest provider win when providers nest', () => {
    render(
      <TakeoffSparProvider colorMode="dark">
        <TakeoffSparProvider colorMode="light">
          <ThemeReadout />
        </TakeoffSparProvider>
      </TakeoffSparProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('light');
  });

  it('falls back to the light theme without a provider and warns once in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { useTheme: freshUseTheme } = await loadFreshProvider();

    const { result, rerender } = renderHook(() => freshUseTheme());
    rerender();
    renderHook(() => freshUseTheme());

    expect(result.current).toStrictEqual({ colorMode: 'light' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[TakeoffSparProvider] `useTheme` was called outside a provider'));
  });

  it('does not warn inside a provider, and keeps the one-time warning for a real miss', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { TakeoffSparProvider: FreshProvider, useTheme: freshUseTheme } = await loadFreshProvider();

    const { result } = renderHook(() => freshUseTheme(), {
      wrapper: ({ children }: { children: ReactNode }) => <FreshProvider colorMode="dark">{children}</FreshProvider>,
    });

    expect(result.current).toStrictEqual({ colorMode: 'dark' });
    expect(warn).not.toHaveBeenCalled();

    renderHook(() => freshUseTheme());

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('falls back silently in production', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { useTheme: freshUseTheme } = await loadFreshProvider();
    vi.stubEnv('NODE_ENV', 'production');

    const { result } = renderHook(() => freshUseTheme());

    expect(result.current).toStrictEqual({ colorMode: 'light' });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('useComponentTheme', () => {
  it('returns the entry the provider configures for the component', () => {
    const components: ComponentsThemeMap = { Button: { defaultProps: { size: 'large' }, className: 'product-button' } };
    const { result } = renderHook(() => useComponentTheme('Button'), { wrapper: providerWrapper({ components }) });

    expect(result.current).toBe(components.Button);
  });

  it('returns undefined for a component the map does not configure', () => {
    const components: ComponentsThemeMap = { Button: { className: 'product-button' } };
    const { result } = renderHook(() => useComponentTheme('Badge'), { wrapper: providerWrapper({ components }) });

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when the provider has no components map', () => {
    const { result } = renderHook(() => useComponentTheme('Button'), { wrapper: providerWrapper({ colorMode: 'dark' }) });

    expect(result.current).toBeUndefined();
  });

  it('returns undefined silently without a provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useComponentTheme('Button'));

    expect(result.current).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('hands consumers the new entry when the components map changes', () => {
    const first: ComponentsThemeMap = { Button: { className: 'product-button' } };
    const next: ComponentsThemeMap = { Button: { className: 'campaign-button' } };
    // The wrapper reads this binding on every render.
    let currentComponents: ComponentsThemeMap = first;
    const { result, rerender } = renderHook(() => useComponentTheme('Button'), {
      wrapper: ({ children }: { children: ReactNode }) => <TakeoffSparProvider components={currentComponents}>{children}</TakeoffSparProvider>,
    });

    expect(result.current).toBe(first.Button);

    currentComponents = next;
    rerender();

    expect(result.current).toBe(next.Button);
  });

  it('feeds shared defaults and classes to components, below the instance props', () => {
    render(
      <TakeoffSparProvider components={{ Button: { defaultProps: { size: 'large' }, className: 'product-button' } }}>
        <Button>Save</Button>
        <Button size="small" className="dialog-cancel">
          Cancel
        </Button>
      </TakeoffSparProvider>,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('tk-button', 'product-button', 'dialog-cancel');

    const save = screen.getByRole('button', { name: 'Save' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });

    // The provider layer is concatenated, never replacing the canonical class.
    expect(save).toHaveClass('tk-button', 'product-button');
    expect(save).toHaveAttribute('data-size', 'large');
    expect(cancel).toHaveClass('tk-button', 'product-button');
    expect(cancel).toHaveAttribute('data-size', 'small');
  });

  it('applies a provider default when the instance passes the prop as an explicit undefined', () => {
    const size: 'small' | undefined = undefined;
    render(
      <TakeoffSparProvider components={{ Button: { defaultProps: { size: 'large' } } }}>
        <Button size={size}>Save</Button>
      </TakeoffSparProvider>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-size', 'large');
  });

  it('keeps what an instance sets directly over the provider slotProps, and still adds the rest', async () => {
    const user = userEvent.setup();
    const themeClick = vi.fn();
    const instanceClick = vi.fn();

    render(
      <TakeoffSparProvider components={{ Button: { slotProps: { root: { title: 'Theme title', id: 'theme-id', className: 'theme-slot', onClick: themeClick } } } }}>
        <Button title="Instance title" onClick={instanceClick}>
          Save
        </Button>
      </TakeoffSparProvider>,
    );

    const save = screen.getByRole('button', { name: 'Save' });
    await user.click(save);

    expect(save).toHaveAttribute('title', 'Instance title');
    expect(instanceClick).toHaveBeenCalledTimes(1);
    expect(themeClick).not.toHaveBeenCalled();
    // Keys the instance leaves unset still come from the provider.
    expect(save).toHaveAttribute('id', 'theme-id');
    expect(save).toHaveClass('tk-button', 'theme-slot');
  });

  it('merges a provider slotProps style under the instance style key by key', () => {
    render(
      <TakeoffSparProvider components={{ Button: { slotProps: { root: { style: { marginTop: '4px', color: 'rgb(0, 0, 1)' } } } } }}>
        <Button style={{ color: 'rgb(0, 0, 2)' }}>Save</Button>
      </TakeoffSparProvider>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({ marginTop: '4px', color: 'rgb(0, 0, 2)' });
  });
});
