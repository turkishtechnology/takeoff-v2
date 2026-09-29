import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Breadcrumb, type BreadcrumbItemRenderProps, type BreadcrumbNavigationHandler, type BreadcrumbPressEvent, type BreadcrumbProps } from './index';

const spyOnConsoleError = () => vi.spyOn(console, 'error');

const Trail = (props: BreadcrumbProps) => (
  <Breadcrumb {...props}>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#flights">Flights</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Istanbul → London</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
);

const getRoot = (container: HTMLElement) => container.querySelector('.tk-breadcrumb') as HTMLElement;

describe('Breadcrumb (compound)', () => {
  let consoleError: ReturnType<typeof spyOnConsoleError>;

  beforeEach(() => {
    consoleError = spyOnConsoleError();
  });

  afterEach(() => {
    // React act() warnings and invalid-markup warnings surface through console.error.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  afterEach(() => {
    // An onPress click does not block native hash navigation; keep jsdom's URL test-independent.
    window.history.replaceState(null, '', window.location.pathname);
  });

  describe('rendering', () => {
    it('renders the canonical anatomy with a tk-* class and data-slot on every part', () => {
      const { container } = render(<Trail />);

      const root = container.querySelector('nav.tk-breadcrumb');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const list = container.querySelector('ol.tk-breadcrumb-list');
      expect(list).toHaveAttribute('data-slot', 'root');
      expect(list?.parentElement).toBe(root);

      const items = container.querySelectorAll('li.tk-breadcrumb-item');
      expect(items).toHaveLength(3);
      items.forEach(item => {
        expect(item).toHaveAttribute('data-slot', 'root');
        expect(item.parentElement).toBe(list);
      });

      const separators = container.querySelectorAll('li.tk-breadcrumb-separator');
      expect(separators).toHaveLength(2);
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('data-slot', 'root');
        expect(separator.parentElement).toBe(list);
      });

      const links = container.querySelectorAll('a.tk-breadcrumb-link');
      expect(links).toHaveLength(2);
      links.forEach(link => expect(link).toHaveAttribute('data-slot', 'root'));
      expect(links[0]?.parentElement).toBe(items[0]);
      expect(links[1]?.parentElement).toBe(items[1]);

      const page = container.querySelector('span.tk-breadcrumb-page');
      expect(page).toHaveAttribute('data-slot', 'root');
      expect(page?.parentElement).toBe(items[2]);
    });

    it('exposes a navigation landmark labelled "Breadcrumb" wrapping an ordered list of crumbs', () => {
      render(<Trail />);

      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      const list = within(nav).getByRole('list');
      expect(list.tagName).toBe('OL');
      // Separators are aria-hidden, so only the three crumbs are announced as list items.
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    });

    it('emits the default size and type data attributes on the root', () => {
      const { container } = render(<Trail />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-type', 'basic');
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('aria-disabled');
    });

    it('reflects non-default size and type into data attributes', () => {
      const { container } = render(<Trail size="large" type="outlined" />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-type', 'outlined');
    });

    it('localizes the landmark label through aria-label', () => {
      render(<Trail aria-label="Konum" />);

      expect(screen.getByRole('navigation', { name: 'Konum' })).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
    });

    it('renders every part as a custom element through the as prop', () => {
      const { container } = render(
        <Breadcrumb as="div">
          <Breadcrumb.List as="div">
            <Breadcrumb.Item as="span">
              <Breadcrumb.Link as="button" type="button">
                Home
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator as="span" />
            <Breadcrumb.Item as="span">
              <Breadcrumb.Page as="strong">Account</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      expect(getRoot(container).tagName).toBe('DIV');
      expect(container.querySelector('.tk-breadcrumb-list')?.tagName).toBe('DIV');
      expect(container.querySelector('.tk-breadcrumb-item')?.tagName).toBe('SPAN');
      expect(container.querySelector('.tk-breadcrumb-link')?.tagName).toBe('BUTTON');
      expect(container.querySelector('.tk-breadcrumb-separator')?.tagName).toBe('SPAN');
      expect(container.querySelector('.tk-breadcrumb-page')?.tagName).toBe('STRONG');
    });

    it('forwards refs to the rendered DOM node of every part', () => {
      const rootRef = createRef<HTMLElement>();
      const listRef = createRef<HTMLOListElement>();
      const itemRef = createRef<HTMLLIElement>();
      const linkRef = createRef<HTMLAnchorElement>();
      const separatorRef = createRef<HTMLLIElement>();
      const pageRef = createRef<HTMLSpanElement>();

      const { container } = render(
        <Breadcrumb ref={rootRef}>
          <Breadcrumb.List ref={listRef}>
            <Breadcrumb.Item ref={itemRef}>
              <Breadcrumb.Link ref={linkRef} href="#home">
                Home
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator ref={separatorRef} />
            <Breadcrumb.Item>
              <Breadcrumb.Page ref={pageRef}>Account</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      expect(rootRef.current).toBe(getRoot(container));
      expect(listRef.current).toBe(container.querySelector('.tk-breadcrumb-list'));
      expect(itemRef.current).toBe(container.querySelector('.tk-breadcrumb-item'));
      expect(linkRef.current).toBe(screen.getByRole('link', { name: 'Home' }));
      expect(separatorRef.current).toBe(container.querySelector('.tk-breadcrumb-separator'));
      expect(pageRef.current).toBe(container.querySelector('.tk-breadcrumb-page'));
      // The consumer ref is merged with the list-registration ref, so position derivation survives.
      expect(itemRef.current).toHaveAttribute('data-position', 'first');
    });
  });

  describe('item position', () => {
    it('derives first/middle/last positions in DOM order and marks the last crumb current', () => {
      const { container } = render(<Trail />);
      const items = container.querySelectorAll('.tk-breadcrumb-item');

      expect(items[0]).toHaveAttribute('data-position', 'first');
      expect(items[1]).toHaveAttribute('data-position', 'middle');
      expect(items[2]).toHaveAttribute('data-position', 'last');
      expect(items[0]).not.toHaveAttribute('data-current');
      expect(items[1]).not.toHaveAttribute('data-current');
      expect(items[2]).toHaveAttribute('data-current', '');
    });

    it('recomputes positions when crumbs are expanded into the middle of the trail', () => {
      const CollapsibleTrail = ({ expanded }: { expanded: boolean }) => (
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            {expanded && (
              <>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#booking">Booking</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="#flights">Flights</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
              </>
            )}
            <Breadcrumb.Item>
              <Breadcrumb.Page>Passenger details</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      );

      const { container, rerender } = render(<CollapsibleTrail expanded={false} />);
      const positions = () => Array.from(container.querySelectorAll('.tk-breadcrumb-item')).map(item => item.getAttribute('data-position'));

      expect(positions()).toEqual(['first', 'last']);

      rerender(<CollapsibleTrail expanded />);

      expect(positions()).toEqual(['first', 'middle', 'middle', 'last']);
      expect(screen.getByRole('link', { name: 'Flights' }).closest('.tk-breadcrumb-item')).not.toHaveAttribute('data-current');
      expect(screen.getByText('Passenger details').closest('.tk-breadcrumb-item')).toHaveAttribute('data-current', '');
    });

    it('passes { position, isCurrent, isDisabled } to render-function children', () => {
      const renderHome = vi.fn<(state: BreadcrumbItemRenderProps) => ReactNode>(() => <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>);
      const renderPage = vi.fn<(state: BreadcrumbItemRenderProps) => ReactNode>(({ isCurrent }) => (
        <Breadcrumb.Page>{isCurrent ? 'Account (current)' : 'Account'}</Breadcrumb.Page>
      ));

      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>{renderHome}</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>{renderPage}</Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      expect(renderHome).toHaveBeenLastCalledWith({ position: 'first', isCurrent: false, isDisabled: false });
      expect(renderPage).toHaveBeenLastCalledWith({ position: 'last', isCurrent: true, isDisabled: false });
      expect(screen.getByText('Account (current)')).toBeInTheDocument();
    });

    it('reports the root disabled flag to render-function children through isDisabled', () => {
      const renderHome = vi.fn<(state: BreadcrumbItemRenderProps) => ReactNode>(({ isDisabled }) => (
        <Breadcrumb.Link href="#home">{isDisabled ? 'Home (unavailable)' : 'Home'}</Breadcrumb.Link>
      ));

      render(
        <Breadcrumb disabled>
          <Breadcrumb.List>
            <Breadcrumb.Item>{renderHome}</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Page>Account</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      expect(renderHome).toHaveBeenLastCalledWith({ position: 'first', isCurrent: false, isDisabled: true });
      expect(screen.getByText('Home (unavailable)')).toBeInTheDocument();
    });

    it('moves the last position and current marker to the previous crumb when the trailing crumb unmounts', () => {
      const ShrinkingTrail = ({ showPage }: { showPage: boolean }) => (
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#flights">Flights</Breadcrumb.Link>
            </Breadcrumb.Item>
            {showPage && (
              <>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>Istanbul → London</Breadcrumb.Page>
                </Breadcrumb.Item>
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      );

      const { container, rerender } = render(<ShrinkingTrail showPage />);
      const positions = () => Array.from(container.querySelectorAll('.tk-breadcrumb-item')).map(item => item.getAttribute('data-position'));
      const flightsItem = () => screen.getByRole('link', { name: 'Flights' }).closest('.tk-breadcrumb-item');

      expect(positions()).toEqual(['first', 'middle', 'last']);
      expect(flightsItem()).not.toHaveAttribute('data-current');

      rerender(<ShrinkingTrail showPage={false} />);

      expect(positions()).toEqual(['first', 'last']);
      expect(flightsItem()).toHaveAttribute('data-position', 'last');
      expect(flightsItem()).toHaveAttribute('data-current', '');
      expect(container.querySelectorAll('[data-current]')).toHaveLength(1);
    });
  });

  describe('link', () => {
    it('renders a plain anchor to the destination without external or disabled treatment', () => {
      render(<Trail />);
      const link = screen.getByRole('link', { name: 'Flights' });

      expect(link).toHaveAttribute('href', '#flights');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
      expect(link).not.toHaveAttribute('data-external');
      expect(link).not.toHaveAttribute('data-disabled');
      expect(link).not.toHaveAttribute('aria-disabled');
      expect(link).not.toHaveAttribute('tabindex');
    });

    it('applies the external treatment with safe target and rel defaults', () => {
      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="https://help.example.com" isExternal>
                Help center
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const link = screen.getByRole('link', { name: 'Help center' });

      expect(link).toHaveAttribute('href', 'https://help.example.com');
      expect(link).toHaveAttribute('data-external', '');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('keeps consumer-provided target and rel on an external link', () => {
      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="https://help.example.com" isExternal target="help-window" rel="noopener">
                Help center
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const link = screen.getByRole('link', { name: 'Help center' });

      expect(link).toHaveAttribute('target', 'help-window');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('disables a single link without affecting its siblings', () => {
      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#checkout" disabled>
                Checkout
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const disabledLink = screen.getByText('Checkout');

      expect(disabledLink).toHaveClass('tk-breadcrumb-link');
      expect(disabledLink).not.toHaveAttribute('href');
      expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
      expect(disabledLink).toHaveAttribute('data-disabled', '');
      expect(disabledLink).toHaveAttribute('tabindex', '-1');

      const enabledLink = screen.getByRole('link', { name: 'Home' });
      expect(enabledLink).toHaveAttribute('href', '#home');
      expect(enabledLink).not.toHaveAttribute('data-disabled');
    });

    it('blocks root onNavigate and native click on a per-link disabled crumb while its siblings keep routing', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onClick = vi.fn();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#checkout" disabled onClick={onClick}>
                Checkout
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const disabledLink = screen.getByText('Checkout');

      await user.click(disabledLink);
      // Pointer focus lands on the disabled crumb, so the activation keys below really reach it.
      expect(disabledLink).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onNavigate).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();

      await user.click(screen.getByRole('link', { name: 'Home' }));

      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('#home', expect.objectContaining({ type: 'click' }));
    });
  });

  describe('page', () => {
    it('marks the current location with aria-current="page" and data-current', () => {
      render(<Trail />);
      const page = screen.getByText('Istanbul → London');

      expect(page).toHaveClass('tk-breadcrumb-page');
      expect(page).toHaveAttribute('aria-current', 'page');
      expect(page).toHaveAttribute('data-current', '');
    });
  });

  describe('separator', () => {
    it('renders the default chevron inside an aria-hidden list item', () => {
      const { container } = render(<Trail />);
      const separator = container.querySelector('.tk-breadcrumb-separator') as HTMLElement;
      const chevron = separator.querySelector('svg');

      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(chevron).not.toBeNull();
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
      expect(chevron).toHaveAttribute('focusable', 'false');
    });

    it('replaces the default chevron with custom children on the same owner node', () => {
      const { container } = render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>/</Breadcrumb.Separator>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Account</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const separator = container.querySelector('li.tk-breadcrumb-separator') as HTMLElement;

      expect(separator).toHaveTextContent('/');
      expect(separator.querySelector('svg')).toBeNull();
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('data-slot', 'root');
    });
  });

  describe('navigation callbacks', () => {
    it('calls onNavigate once with the href and the click event, preventing native navigation', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      render(<Trail onNavigate={onNavigate} />);

      await user.click(screen.getByRole('link', { name: 'Flights' }));

      expect(onNavigate).toHaveBeenCalledTimes(1);
      const [href, event] = onNavigate.mock.calls[0] ?? [];
      expect(href).toBe('#flights');
      expect(event?.type).toBe('click');
      expect(event?.isDefaultPrevented()).toBe(true);
    });

    it('activates onNavigate from the keyboard with Enter and Space', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      render(<Trail onNavigate={onNavigate} />);

      await user.tab();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onNavigate).toHaveBeenCalledTimes(2);
      expect(onNavigate).toHaveBeenNthCalledWith(1, '#home', expect.objectContaining({ type: 'keydown', key: 'Enter' }));
      expect(onNavigate).toHaveBeenNthCalledWith(2, '#home', expect.objectContaining({ type: 'keydown', key: ' ' }));
    });

    it('gives a link-level onPress priority over onNavigate for clicks and activation keys', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#booking" onPress={onPress}>
                Booking
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      await user.click(screen.getByRole('link', { name: 'Booking' }));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'click' }));

      await user.keyboard('{Enter}');
      expect(onPress).toHaveBeenCalledTimes(2);
      expect(onPress).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'keydown', key: 'Enter' }));

      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('composes a consumer onClick and onKeyDown with onPress, running the consumer first', async () => {
      const user = userEvent.setup();
      const calls: string[] = [];
      const onClick = vi.fn(() => calls.push('click'));
      const onKeyDown = vi.fn(() => calls.push('keydown'));
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>(() => calls.push('press'));
      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#booking" onClick={onClick} onKeyDown={onKeyDown} onPress={onPress}>
                Booking
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      await user.click(screen.getByRole('link', { name: 'Booking' }));
      expect(calls).toEqual(['click', 'press']);

      await user.keyboard('{Enter}');
      expect(calls).toEqual(['click', 'press', 'keydown', 'press']);
      expect(onPress).toHaveBeenCalledTimes(2);
    });

    it('skips onPress and onNavigate when the consumer onClick or onKeyDown prevents default', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home" onClick={event => event.preventDefault()} onKeyDown={event => event.preventDefault()}>
                Home
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#booking" onPress={onPress} onClick={event => event.preventDefault()}>
                Booking
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      await user.click(screen.getByRole('link', { name: 'Home' }));
      await user.keyboard('{Enter}');
      expect(onNavigate).not.toHaveBeenCalled();

      await user.click(screen.getByRole('link', { name: 'Booking' }));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('blocks only Enter and Space on a disabled link while other keys still reach the consumer onKeyDown', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onKeyDown = vi.fn();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#checkout" disabled onKeyDown={onKeyDown}>
                Checkout
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const disabledLink = screen.getByText('Checkout');

      await user.click(disabledLink);
      expect(disabledLink).toHaveFocus();

      // The activation keys are swallowed (prevented, never forwarded)...
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onNavigate).not.toHaveBeenCalled();
      expect(onKeyDown).not.toHaveBeenCalled();

      // ...while every other key still reaches the consumer handler.
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Escape}');
      expect(onKeyDown.mock.calls.map(([event]) => [event.key, event.defaultPrevented])).toEqual([
        ['ArrowRight', false],
        ['Escape', false],
      ]);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('drives a crumb rendered as a button through onPress', async () => {
      const user = userEvent.setup();
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>();
      render(
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link as="button" type="button" aria-label="Show 3 hidden crumbs" onPress={onPress}>
                …
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      await user.click(screen.getByRole('button', { name: 'Show 3 hidden crumbs' }));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('falls through to native onClick and onKeyDown when no routing handler takes the event', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      const onKeyDown = vi.fn();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      render(
        <>
          <Breadcrumb aria-label="Plain">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home" onClick={onClick}>
                  Home
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Breadcrumb aria-label="Routed" onNavigate={onNavigate}>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#booking" onKeyDown={onKeyDown}>
                  Booking
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </>,
      );

      await user.click(screen.getByRole('link', { name: 'Home' }));
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('link', { name: 'Booking' }));
      expect(onNavigate).toHaveBeenCalledTimes(1);

      // Non-activation keys are not routing gestures, so they reach the consumer handler.
      await user.keyboard('{ArrowRight}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'ArrowRight' }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('prevents the native default for Enter and Space activations handled by onNavigate or onPress', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#booking" onPress={onPress}>
                Booking
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      await user.tab();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      await user.tab();
      expect(screen.getByRole('link', { name: 'Booking' })).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      // A non-prevented Enter on an anchor would also synthesize a click, adding a third call.
      expect(onNavigate.mock.calls.map(([href, event]) => [href, event.type, 'key' in event ? event.key : undefined, event.isDefaultPrevented()])).toEqual([
        ['#home', 'keydown', 'Enter', true],
        ['#home', 'keydown', ' ', true],
      ]);
      expect(onPress.mock.calls.map(([event]) => [event.type, 'key' in event ? event.key : undefined, event.isDefaultPrevented()])).toEqual([
        ['keydown', 'Enter', true],
        ['keydown', ' ', true],
      ]);
    });

    it('routes only crumbs with an href through onNavigate and lets href-less crumbs reach native handlers', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      render(
        <Breadcrumb onNavigate={onNavigate}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link as="button" type="button" onClick={onClick} onKeyDown={onKeyDown}>
                Show hidden crumbs
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const trigger = screen.getByRole('button', { name: 'Show hidden crumbs' });

      await user.click(trigger);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));

      await user.keyboard('{Enter}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
      // The keydown is not prevented, so native button activation still turns Enter into a click.
      expect(onClick).toHaveBeenCalledTimes(2);

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('marks the nav landmark with aria-disabled and data-disabled', () => {
      const { container } = render(<Trail disabled />);
      const root = getRoot(container);

      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('data-disabled', '');
    });

    it('cascades to every link: drops href, sets aria-disabled/data-disabled and tabindex=-1', () => {
      const { container } = render(<Trail disabled />);
      const links = container.querySelectorAll('.tk-breadcrumb-link');

      expect(links).toHaveLength(2);
      links.forEach(link => {
        expect(link).not.toHaveAttribute('href');
        expect(link).toHaveAttribute('aria-disabled', 'true');
        expect(link).toHaveAttribute('data-disabled', '');
        expect(link).toHaveAttribute('tabindex', '-1');
      });
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('removes disabled links from the sequential tab order', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Trail />);

      await user.tab();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
      unmount();

      render(<Trail disabled />);
      await user.tab();
      expect(document.body).toHaveFocus();
    });

    it('blocks onNavigate and onPress activation on disabled links', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn<BreadcrumbNavigationHandler>();
      const onPress = vi.fn<(event: BreadcrumbPressEvent) => void>();
      render(
        <>
          <Trail disabled onNavigate={onNavigate} />
          <Breadcrumb aria-label="Checkout steps">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#payment" disabled onPress={onPress}>
                  Payment
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </>,
      );

      await user.click(screen.getByText('Flights'));
      // Guard against a vacuous keyboard check: the activation keys must reach the disabled link.
      expect(screen.getByText('Flights')).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onNavigate).not.toHaveBeenCalled();

      await user.click(screen.getByText('Payment'));
      expect(screen.getByText('Payment')).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto every part owner node', () => {
      const { container } = render(
        <Breadcrumb className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'root-title' } }}>
          <Breadcrumb.List className="list-extra" classNames={{ root: 'list-slot' }} slotProps={{ root: { title: 'list-title' } }}>
            <Breadcrumb.Item className="item-extra" classNames={{ root: 'item-slot' }} slotProps={{ root: { title: 'item-title' } }}>
              <Breadcrumb.Link href="#home" className="link-extra" classNames={{ root: 'link-slot' }} slotProps={{ root: { title: 'link-title' } }}>
                Home
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator className="separator-extra" classNames={{ root: 'separator-slot' }} slotProps={{ root: { title: 'separator-title' } }} />
            <Breadcrumb.Item>
              <Breadcrumb.Page className="page-extra" classNames={{ root: 'page-slot' }} slotProps={{ root: { title: 'page-title' } }}>
                Account
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );

      const owners = [
        ['tk-breadcrumb', 'root'],
        ['tk-breadcrumb-list', 'list'],
        ['tk-breadcrumb-item', 'item'],
        ['tk-breadcrumb-link', 'link'],
        ['tk-breadcrumb-separator', 'separator'],
        ['tk-breadcrumb-page', 'page'],
      ] as const;

      for (const [canonicalClass, prefix] of owners) {
        const node = container.querySelector(`.${canonicalClass}`);
        expect(node).toHaveClass(canonicalClass, `${prefix}-extra`, `${prefix}-slot`);
        expect(node).toHaveAttribute('title', `${prefix}-title`);
        expect(node).toHaveAttribute('data-slot', 'root');
      }
    });

    it('keeps the canonical data-slot and variant hooks when slotProps try to override them', () => {
      const { container } = render(
        <Breadcrumb size="large" slotProps={{ root: { 'data-slot': 'hijacked', 'data-size': 'base', 'data-type': 'outlined' } as never }}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Page slotProps={{ root: { 'data-slot': 'hijacked' } as never }}>Account</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-type', 'basic');
      expect(container.querySelector('.tk-breadcrumb-page')).toHaveAttribute('data-slot', 'root');
    });

    it('applies provider theme defaultProps, classes and slotProps to every part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Breadcrumb: { defaultProps: { size: 'large', type: 'outlined' }, className: 'theme-root', slotProps: { root: { title: 'theme-title' } } },
            BreadcrumbList: { classNames: { root: 'theme-list' } },
            BreadcrumbItem: { className: 'theme-item' },
            BreadcrumbLink: { className: 'theme-link' },
            BreadcrumbPage: { className: 'theme-page' },
            BreadcrumbSeparator: { className: 'theme-separator' },
          }}
        >
          <Trail />
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).toHaveClass('tk-breadcrumb', 'theme-root');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-type', 'outlined');
      expect(root).toHaveAttribute('title', 'theme-title');
      expect(container.querySelector('.tk-breadcrumb-list')).toHaveClass('theme-list');
      expect(container.querySelector('.tk-breadcrumb-item')).toHaveClass('theme-item');
      expect(container.querySelector('.tk-breadcrumb-link')).toHaveClass('theme-link');
      expect(container.querySelector('.tk-breadcrumb-page')).toHaveClass('theme-page');
      expect(container.querySelector('.tk-breadcrumb-separator')).toHaveClass('theme-separator');
    });

    it('lets instance props, classes and slotProps win over provider theme layers', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Breadcrumb: { defaultProps: { size: 'large' }, className: 'theme-root', slotProps: { root: { title: 'theme-title' } } },
          }}
        >
          <Trail size="base" className="instance-root" slotProps={{ root: { title: 'instance-title' } }} />
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveClass('tk-breadcrumb', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('title', 'instance-title');
    });

    it('concatenates theme classNames with instance classes and shallow-merges theme and instance slotProps on a sub-part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            BreadcrumbLink: { classNames: { root: 'theme-slot' }, slotProps: { root: { title: 'theme-title', lang: 'tr' } } },
          }}
        >
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home" className="instance-extra" classNames={{ root: 'instance-slot' }} slotProps={{ root: { title: 'instance-title' } }}>
                  Home
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </TakeoffSparProvider>,
      );
      const link = screen.getByRole('link', { name: 'Home' });

      expect(link).toHaveClass('tk-breadcrumb-link', 'theme-slot', 'instance-extra', 'instance-slot');
      expect(link).toHaveAttribute('title', 'instance-title');
      expect(link).toHaveAttribute('lang', 'tr');
      expect(link).toHaveAttribute('data-slot', 'root');
      // Link-level theme layers stay on the link and do not leak to the root.
      expect(getRoot(container)).not.toHaveClass('theme-slot');
      expect(getRoot(container)).not.toHaveAttribute('lang');
    });

    it('forwards provider theme defaultProps for Spar behaviour props to the root, links and separators', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Breadcrumb: { defaultProps: { 'aria-label': 'Konum', 'disabled': true } },
            BreadcrumbLink: { defaultProps: { isExternal: true } },
            BreadcrumbSeparator: { defaultProps: { children: '/' } },
          }}
        >
          <Trail />
        </TakeoffSparProvider>,
      );

      const nav = screen.getByRole('navigation', { name: 'Konum' });
      expect(nav).toHaveAttribute('aria-disabled', 'true');
      expect(nav).toHaveAttribute('data-disabled', '');

      const links = container.querySelectorAll('.tk-breadcrumb-link');
      expect(links).toHaveLength(2);
      links.forEach(link => {
        expect(link).not.toHaveAttribute('href');
        expect(link).toHaveAttribute('aria-disabled', 'true');
        expect(link).toHaveAttribute('data-external', '');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      const separators = container.querySelectorAll('.tk-breadcrumb-separator');
      expect(separators).toHaveLength(2);
      separators.forEach(separator => {
        expect(separator).toHaveTextContent('/');
        expect(separator.querySelector('svg')).toBeNull();
      });
    });

    it('lets instance behaviour props override provider theme defaultProps', () => {
      render(
        <TakeoffSparProvider components={{ Breadcrumb: { defaultProps: { 'aria-label': 'Konum', 'disabled': true } } }}>
          <Trail aria-label="Booking trail" disabled={false} />
        </TakeoffSparProvider>,
      );

      const nav = screen.getByRole('navigation', { name: 'Booking trail' });
      expect(nav).not.toHaveAttribute('data-disabled');
      expect(nav).not.toHaveAttribute('aria-disabled');
      expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
      expect(within(nav).getByRole('link', { name: 'Flights' })).not.toHaveAttribute('tabindex');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for the default trail', async () => {
      const { container } = render(<Trail />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for outlined, external and custom-separator trails', async () => {
      const { container } = render(
        <>
          <Trail aria-label="Primary trail" size="large" type="outlined" />
          <Breadcrumb aria-label="Help trail">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="https://help.example.com" isExternal>
                  Help center
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>/</Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.Page>Refunds</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for a disabled trail', async () => {
      const { container } = render(<Trail disabled />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('context boundaries', () => {
    it.each([
      ['Breadcrumb.List', () => <Breadcrumb.List>{null}</Breadcrumb.List>],
      ['Breadcrumb.Item', () => <Breadcrumb.Item>Home</Breadcrumb.Item>],
      ['Breadcrumb.Link', () => <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>],
      ['Breadcrumb.Page', () => <Breadcrumb.Page>Home</Breadcrumb.Page>],
      ['Breadcrumb.Separator', () => <Breadcrumb.Separator />],
    ])('throws the Breadcrumb safe-context error naming %s when it renders outside the root', (name, renderLoose) => {
      expect(() => render(renderLoose())).toThrow(`${name} must be used within BreadcrumbProvider`);
    });

    it('throws a descriptive error when Breadcrumb.Item renders outside Breadcrumb.List', () => {
      expect(() =>
        render(
          <Breadcrumb>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
          </Breadcrumb>,
        ),
      ).toThrow(/BreadcrumbItem must be used within a BreadcrumbList/);
    });
  });
});
