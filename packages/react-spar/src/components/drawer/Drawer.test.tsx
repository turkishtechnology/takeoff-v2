import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type HTMLAttributes, type Ref } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import type { ClassNamesMap, ComponentsThemeMap, ComponentThemeConfig, SlotPropsMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Drawer } from './index';
import type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerPanelProps,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './types';

// Spar's modal scroll lock restores the page offset through `window.scrollTo`
// when the lock is released (close / unmount). jsdom does not implement it and
// would log "Not implemented" on every close.
let restoreScrollTo: () => void = () => undefined;

beforeAll(() => {
  const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  restoreScrollTo = () => scrollToSpy.mockRestore();
});

afterAll(() => {
  restoreScrollTo();
});

interface DrawerPartProps {
  Trigger?: DrawerTriggerProps;
  Overlay?: DrawerOverlayProps;
  Panel?: DrawerPanelProps;
  Header?: DrawerHeaderProps;
  Title?: DrawerTitleProps;
  Description?: DrawerDescriptionProps;
  Body?: DrawerBodyProps;
  Footer?: DrawerFooterProps;
  Close?: DrawerCloseProps;
}

type PartKey = keyof DrawerPartProps;

interface DrawerAnatomyProps extends Omit<DrawerProps, 'children'> {
  parts?: DrawerPartProps;
}

const TITLE = 'Flight details';
const DESCRIPTION = 'Review the selected flight before booking.';

/** The full documented anatomy; `parts` spreads extra props onto one part. */
const DrawerAnatomy = ({ parts = {}, ...rootProps }: DrawerAnatomyProps) => (
  <Drawer {...rootProps}>
    <Drawer.Trigger {...parts.Trigger}>Open drawer</Drawer.Trigger>
    <Drawer.Overlay {...parts.Overlay} />
    <Drawer.Panel {...parts.Panel}>
      <Drawer.Header {...parts.Header}>
        <Drawer.Title {...parts.Title}>{TITLE}</Drawer.Title>
        <Drawer.Close {...parts.Close} />
      </Drawer.Header>
      <Drawer.Body {...parts.Body}>
        <Drawer.Description {...parts.Description}>{DESCRIPTION}</Drawer.Description>
      </Drawer.Body>
      <Drawer.Footer {...parts.Footer}>
        <button type="button">Confirm</button>
      </Drawer.Footer>
    </Drawer.Panel>
  </Drawer>
);

const renderDrawer = (props: DrawerAnatomyProps = {}, components?: ComponentsThemeMap) =>
  render(
    <TakeoffSparProvider components={components}>
      <DrawerAnatomy {...props} />
    </TakeoffSparProvider>,
  );

const getTrigger = () => screen.getByRole('button', { name: 'Open drawer' });
const getCloseButton = () => screen.getByRole('button', { name: 'Close' });
const getConfirmButton = () => screen.getByRole('button', { name: 'Confirm' });
// The panel is force-mounted while closed and jsdom applies no stylesheet, so
// the role query resolves in both states; `data-state` tells them apart.
const getPanel = () => screen.getByRole('dialog');

// Overlay and panel are portaled to `document.body`, outside the RTL container.
const queryPart = (className: string) => document.body.querySelector<HTMLElement>(`.${className}`);
const getPart = (className: string) => {
  const node = queryPart(className);
  if (!node) throw new Error(`.${className} is not rendered`);
  return node;
};

interface PartStylingProps {
  className?: string;
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
  ref?: Ref<HTMLElement>;
}

const withPartProps = (key: PartKey, props: PartStylingProps) => ({ [key]: props }) as DrawerPartProps;
const withPartTheme = (theme: keyof ComponentsThemeMap, config: ComponentThemeConfig) => ({ [theme]: config }) as ComponentsThemeMap;

interface PartContract {
  key: PartKey;
  theme: keyof ComponentsThemeMap;
  className: string;
  tagName: string;
}

const PARTS = [
  { key: 'Trigger', theme: 'DrawerTrigger', className: 'tk-drawer-trigger', tagName: 'BUTTON' },
  { key: 'Overlay', theme: 'DrawerOverlay', className: 'tk-drawer-overlay', tagName: 'DIV' },
  { key: 'Panel', theme: 'DrawerPanel', className: 'tk-drawer-panel', tagName: 'DIV' },
  { key: 'Header', theme: 'DrawerHeader', className: 'tk-drawer-header', tagName: 'DIV' },
  { key: 'Title', theme: 'DrawerTitle', className: 'tk-drawer-title', tagName: 'H5' },
  { key: 'Description', theme: 'DrawerDescription', className: 'tk-drawer-description', tagName: 'P' },
  { key: 'Body', theme: 'DrawerBody', className: 'tk-drawer-body', tagName: 'DIV' },
  { key: 'Footer', theme: 'DrawerFooter', className: 'tk-drawer-footer', tagName: 'DIV' },
  { key: 'Close', theme: 'DrawerClose', className: 'tk-drawer-close', tagName: 'BUTTON' },
] as const satisfies readonly PartContract[];

describe('Drawer (compound)', () => {
  describe('rendering', () => {
    it('renders no DOM for the state-only root', () => {
      const { container } = render(
        <Drawer>
          <Drawer.Trigger>Open drawer</Drawer.Trigger>
        </Drawer>,
      );

      expect(container.childElementCount).toBe(1);
      expect(container.firstElementChild).toBe(getTrigger());
      expect(document.body.querySelector('.tk-drawer')).toBeNull();
    });

    it('composes the documented anatomy inside the panel', () => {
      renderDrawer({ defaultOpen: true });

      const panel = screen.getByRole('dialog', { name: TITLE });
      const header = getPart('tk-drawer-header');
      const body = getPart('tk-drawer-body');
      const footer = getPart('tk-drawer-footer');

      expect(header.parentElement).toBe(panel);
      expect(body.parentElement).toBe(panel);
      expect(footer.parentElement).toBe(panel);
      expect(within(header).getByRole('heading', { name: TITLE })).toHaveClass('tk-drawer-title');
      expect(within(header).getByRole('button', { name: 'Close' })).toHaveClass('tk-drawer-close');
      expect(within(body).getByText(DESCRIPTION)).toHaveClass('tk-drawer-description');
      expect(within(footer).getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('portals the overlay and panel to document.body by default', () => {
      const { container } = renderDrawer({ defaultOpen: true });

      const panel = getPanel();
      const overlay = getPart('tk-drawer-overlay');

      expect(container).not.toContainElement(panel);
      expect(panel.parentElement).toBe(document.body);
      expect(overlay.parentElement).toBe(document.body);
    });

    it('portals the overlay and panel into a custom container', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      renderDrawer({ defaultOpen: true, parts: { Overlay: { container: host }, Panel: { container: host } } });

      expect(host).toContainElement(getPanel());
      expect(host).toContainElement(getPart('tk-drawer-overlay'));

      host.remove();
    });
  });

  describe.each(PARTS)('$key slot contract', ({ key, theme, className, tagName }) => {
    it('renders its canonical element with the tk-* class and data-slot="root"', () => {
      renderDrawer({ defaultOpen: true });

      const node = getPart(className);
      expect(node.tagName).toBe(tagName);
      expect(node).toHaveAttribute('data-slot', 'root');
    });

    it('merges theme classNames with instance className and classNames without dropping the canonical class', () => {
      renderDrawer(
        { defaultOpen: true, parts: withPartProps(key, { className: 'instance-class', classNames: { root: 'instance-root-class' } }) },
        withPartTheme(theme, { classNames: { root: 'theme-root-class' } }),
      );

      expect(getPart(className)).toHaveClass(className, 'instance-class', 'instance-root-class', 'theme-root-class');
    });

    it('applies the provider className shortcut to its root', () => {
      renderDrawer({ defaultOpen: true }, withPartTheme(theme, { className: 'theme-shortcut-class' }));

      expect(getPart(className)).toHaveClass(className, 'theme-shortcut-class');
      expect(document.body.querySelectorAll('.theme-shortcut-class')).toHaveLength(1);
    });

    it('lands slotProps.root on this part only, with instance entries winning over theme entries', () => {
      renderDrawer(
        { defaultOpen: true, parts: withPartProps(key, { slotProps: { root: { title: 'instance-title' } } }) },
        withPartTheme(theme, { slotProps: { root: { title: 'theme-title', lang: 'tr' } } }),
      );

      const node = getPart(className);
      expect(node).toHaveAttribute('title', 'instance-title');
      expect(node).toHaveAttribute('lang', 'tr');
      expect(document.body.querySelectorAll('[title="instance-title"]')).toHaveLength(1);
      expect(document.body.querySelectorAll('[lang="tr"]')).toHaveLength(1);
    });

    it('keeps data-slot="root" when slotProps try to override it', () => {
      renderDrawer({
        defaultOpen: true,
        parts: withPartProps(key, { slotProps: { root: { 'data-slot': 'hijacked' } as HTMLAttributes<HTMLElement> } }),
      });

      expect(getPart(className)).toHaveAttribute('data-slot', 'root');
    });

    it('forwards ref to its root element', () => {
      const ref = createRef<HTMLElement>();

      renderDrawer({ defaultOpen: true, parts: withPartProps(key, { ref }) });

      expect(ref.current).toBe(getPart(className));
    });
  });

  describe('Drawer root', () => {
    it('defaults placement to "right" on the panel', () => {
      renderDrawer({ defaultOpen: true });

      expect(getPanel()).toHaveAttribute('data-placement', 'right');
    });

    it.each(['left', 'right', 'top', 'bottom'] as const)('reflects placement="%s" on the panel', placement => {
      renderDrawer({ defaultOpen: true, placement });

      expect(getPanel()).toHaveAttribute('data-placement', placement);
    });

    it('keeps the overlay and panel mounted across the closed state by default', async () => {
      const user = userEvent.setup();
      renderDrawer();

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-state', 'closed');
      expect(getPart('tk-drawer-panel')).toHaveAttribute('data-state', 'closed');

      await user.click(getTrigger());

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-state', 'open');
      expect(getPart('tk-drawer-panel')).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-state', 'closed');
      expect(getPart('tk-drawer-panel')).toHaveAttribute('data-state', 'closed');
    });

    it('unmounts the overlay and panel while closed when forceMount is false', async () => {
      const user = userEvent.setup();
      renderDrawer({ forceMount: false });

      expect(queryPart('tk-drawer-overlay')).toBeNull();
      expect(queryPart('tk-drawer-panel')).toBeNull();

      await user.click(getTrigger());

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(queryPart('tk-drawer-overlay')).toBeNull();
      expect(queryPart('tk-drawer-panel')).toBeNull();
    });

    it('is modal by default: aria-modal is set and page scroll is locked only while open', async () => {
      const user = userEvent.setup();
      renderDrawer();

      expect(document.body.style.overflow).toBe('');

      await user.click(getTrigger());

      expect(getPanel()).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');

      await user.click(getCloseButton());

      expect(document.body.style.overflow).toBe('');
    });

    it('leaves the page scrollable and focus untrapped when modal is false', async () => {
      const user = userEvent.setup();
      renderDrawer({ defaultOpen: true, modal: false });

      const panel = getPanel();
      expect(panel).toHaveAttribute('aria-modal', 'false');
      expect(document.body.style.overflow).toBe('');

      expect(getCloseButton()).toHaveFocus();
      await user.tab();
      expect(getConfirmButton()).toHaveFocus();
      await user.tab();

      expect(panel).not.toContainElement(document.activeElement as HTMLElement);
    });

    it('derives the ARIA relationship ids from the id prop', () => {
      renderDrawer({ defaultOpen: true, id: 'flight' });

      const panel = getPanel();
      expect(panel).toHaveAttribute('id', 'flight-content');
      expect(panel).toHaveAttribute('aria-labelledby', 'flight-title');
      expect(panel).toHaveAttribute('aria-describedby', 'flight-description');
      expect(screen.getByRole('heading', { name: TITLE })).toHaveAttribute('id', 'flight-title');
      expect(screen.getByText(DESCRIPTION)).toHaveAttribute('id', 'flight-description');
      expect(getTrigger()).toHaveAttribute('aria-controls', 'flight-content');
    });

    it('applies provider defaultProps and lets instance props win', () => {
      const components: ComponentsThemeMap = { Drawer: { defaultProps: { placement: 'left', defaultOpen: true } } };

      const { unmount } = renderDrawer({}, components);
      expect(getPanel()).toHaveAttribute('data-placement', 'left');
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      unmount();

      renderDrawer({ placement: 'bottom' }, components);
      expect(getPanel()).toHaveAttribute('data-placement', 'bottom');
    });

    it('applies a provider dismissible default', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ defaultOpen: true, onOpenChange }, { Drawer: { defaultProps: { dismissible: false } } });

      await user.click(getPart('tk-drawer-overlay'));

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('disables the trigger and never opens when disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ disabled: true, onOpenChange });

      const trigger = getTrigger();
      expect(trigger).toBeDisabled();

      await user.click(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('keeps the trigger enabled by default', () => {
      renderDrawer();

      expect(getTrigger()).toBeEnabled();
    });

    it('keeps a disabled trigger out of the tab order so the keyboard cannot open it', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<DrawerAnatomy disabled forceMount={false} onOpenChange={onOpenChange} />);

      await user.tab();
      expect(getTrigger()).not.toHaveFocus();

      await user.keyboard('{Enter}{ }');

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('applies a provider forceMount default', () => {
      renderDrawer({}, { Drawer: { defaultProps: { forceMount: false } } });

      expect(queryPart('tk-drawer-panel')).toBeNull();
      expect(queryPart('tk-drawer-overlay')).toBeNull();
    });

    it('lets an instance dismissible override a provider default', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ defaultOpen: true, dismissible: true, onOpenChange }, { Drawer: { defaultProps: { dismissible: false } } });

      await user.click(getPart('tk-drawer-overlay'));

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });
  });

  describe('uncontrolled open state', () => {
    it('opens from the trigger and closes from Drawer.Close, reporting each change once', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ onOpenChange });

      await user.click(getTrigger());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('opens from the keyboard on the focused trigger', async () => {
      const user = userEvent.setup();
      renderDrawer();

      await user.tab();
      expect(getTrigger()).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('starts open with defaultOpen without reporting a change', () => {
      const onOpenChange = vi.fn();
      renderDrawer({ defaultOpen: true, onOpenChange });

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled open state', () => {
    it('follows the open prop and only requests changes through onOpenChange', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(<DrawerAnatomy open={false} onOpenChange={onOpenChange} />);

      await user.click(getTrigger());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');

      rerender(<DrawerAnatomy open onOpenChange={onOpenChange} />);

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

      await user.click(getCloseButton());

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      rerender(<DrawerAnatomy open={false} onOpenChange={onOpenChange} />);

      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('round-trips open state through a stateful parent', async () => {
      const user = userEvent.setup();
      const ControlledDrawer = () => {
        const [open, setOpen] = useState(false);
        return <DrawerAnatomy open={open} onOpenChange={setOpen} />;
      };
      render(<ControlledDrawer />);

      await user.click(getTrigger());
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(getPart('tk-drawer-overlay'));
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('stays open when the parent ignores close requests from Escape and the overlay', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<DrawerAnatomy open onOpenChange={onOpenChange} />);

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(getPart('tk-drawer-overlay'));

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-state', 'open');
    });
  });

  describe('dismissal', () => {
    describe('when dismissible (default)', () => {
      it('closes on Escape from inside the panel', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, onOpenChange });

        await user.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('closes when the overlay is pressed', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, onOpenChange });

        await user.click(getPart('tk-drawer-overlay'));

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('does not close when pressing inside the panel', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, onOpenChange });

        await user.click(getPart('tk-drawer-body'));

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('hands the Escape KeyboardEvent to onEscapeKeyDown before closing', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const seen: string[] = [];
        const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
          seen.push(`${event.type}:${event.key}`);
        });
        renderDrawer({ defaultOpen: true, onOpenChange, parts: { Panel: { onEscapeKeyDown } } });

        await user.keyboard('{Escape}');

        expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
        expect(onEscapeKeyDown.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
        expect(seen).toEqual(['keydown:Escape']);
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('lets onEscapeKeyDown veto the close with preventDefault', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, onOpenChange, parts: { Panel: { onEscapeKeyDown: event => event.preventDefault() } } });

        await user.keyboard('{Escape}');

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('returns focus to the trigger after closing', async () => {
        const user = userEvent.setup();
        renderDrawer();

        await user.click(getTrigger());
        expect(getPanel()).toHaveAttribute('data-state', 'open');
        await user.keyboard('{Escape}');

        expect(getPanel()).toHaveAttribute('data-state', 'closed');
        expect(getTrigger()).toHaveFocus();
      });

      it('ignores keys other than Escape', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const onEscapeKeyDown = vi.fn();
        renderDrawer({ defaultOpen: true, onOpenChange, parts: { Panel: { onEscapeKeyDown } } });

        // Focus sits on Drawer.Close, so Enter/Space would activate it; use keys
        // that a button does not act on.
        await user.keyboard('a{ArrowDown}{Home}');

        expect(onEscapeKeyDown).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('hands outside presses to onPointerDownOutside and onInteractOutside, which can veto the close', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const overlayHandlersSeen: string[] = [];
        const onPointerDownOutside = vi.fn((event: PointerEvent) => {
          overlayHandlersSeen.push(`pointerDownOutside:${event.type}`);
        });
        const onInteractOutside = vi.fn((event: PointerEvent) => {
          overlayHandlersSeen.push(`interactOutside:${event.type}`);
          event.preventDefault();
        });
        renderDrawer({ defaultOpen: true, onOpenChange, parts: { Panel: { onPointerDownOutside, onInteractOutside } } });

        const overlay = getPart('tk-drawer-overlay');
        await user.click(overlay);

        expect(overlayHandlersSeen).toEqual(['pointerDownOutside:pointerdown', 'interactOutside:pointerdown']);
        expect(onPointerDownOutside).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: overlay }));
        expect(onInteractOutside).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: overlay }));
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });
    });

    describe('when dismissible={false}', () => {
      it('ignores Escape but still calls onEscapeKeyDown once with an already-prevented event', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const seen: Array<{ key: string; prevented: boolean }> = [];
        const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
          seen.push({ key: event.key, prevented: event.defaultPrevented });
        });
        renderDrawer({ defaultOpen: true, dismissible: false, onOpenChange, parts: { Panel: { onEscapeKeyDown } } });

        await user.keyboard('{Escape}');

        expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
        expect(seen).toEqual([{ key: 'Escape', prevented: true }]);
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('blocks Escape without a consumer handler', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, dismissible: false, onOpenChange });

        await user.keyboard('{Escape}');

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('ignores outside presses but still calls both outside handlers with an already-prevented event', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const seen: Array<{ handler: string; prevented: boolean }> = [];
        const onPointerDownOutside = vi.fn((event: PointerEvent) => {
          seen.push({ handler: 'pointerDownOutside', prevented: event.defaultPrevented });
        });
        const onInteractOutside = vi.fn((event: PointerEvent) => {
          seen.push({ handler: 'interactOutside', prevented: event.defaultPrevented });
        });
        renderDrawer({
          defaultOpen: true,
          dismissible: false,
          onOpenChange,
          parts: { Panel: { onPointerDownOutside, onInteractOutside } },
        });

        await user.click(getPart('tk-drawer-overlay'));

        expect(seen).toEqual([
          { handler: 'pointerDownOutside', prevented: true },
          { handler: 'interactOutside', prevented: true },
        ]);
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('blocks outside presses without consumer handlers', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, dismissible: false, onOpenChange });

        await user.click(getPart('tk-drawer-overlay'));
        await user.click(document.body);

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('still closes from Drawer.Close', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDrawer({ defaultOpen: true, dismissible: false, onOpenChange });

        await user.click(getCloseButton());

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });
    });
  });

  describe('Drawer.Trigger', () => {
    it('announces the dialog popup and tracks the open state', async () => {
      const user = userEvent.setup();
      renderDrawer();

      const trigger = getTrigger();
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-controls', getPanel().id);

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('passes open-state render props to function children', async () => {
      const user = userEvent.setup();
      const renderTrigger = vi.fn(({ isOpen }: { isOpen: boolean }) => (isOpen ? 'Hide details' : 'Show details'));
      render(
        <Drawer>
          <Drawer.Trigger>{renderTrigger}</Drawer.Trigger>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      expect(renderTrigger).toHaveBeenLastCalledWith({
        isOpen: false,
        disabled: false,
        open: expect.any(Function),
        close: expect.any(Function),
        toggle: expect.any(Function),
      });

      await user.click(screen.getByRole('button', { name: 'Show details' }));

      expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true');
      expect(renderTrigger).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: true }));
    });

    it('renders as a custom element through the as prop and still opens the drawer', async () => {
      const user = userEvent.setup();
      render(
        <Drawer>
          <Drawer.Trigger as="span">Open drawer</Drawer.Trigger>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      const trigger = getTrigger();
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveClass('tk-drawer-trigger');

      await user.click(trigger);

      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('opens with the Space key on the focused trigger', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ onOpenChange });

      getTrigger().focus();
      await user.keyboard(' ');

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('forwards clicks to onClick once with the click event', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderDrawer({ parts: { Trigger: { onClick } } });

      await user.click(getTrigger());

      expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click', target: getTrigger() }));
      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('does not call onClick while the root is disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderDrawer({ disabled: true, parts: { Trigger: { onClick } } });

      await user.click(getTrigger());

      expect(onClick).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('honours its own disabled prop even when the root is enabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ onOpenChange, parts: { Trigger: { disabled: true } } });

      const trigger = getTrigger();
      expect(trigger).toBeDisabled();

      await user.click(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('reports disabled: true to render-prop children while the root is disabled', () => {
      const renderTrigger = vi.fn(() => 'Open drawer');
      render(
        <Drawer disabled>
          <Drawer.Trigger>{renderTrigger}</Drawer.Trigger>
        </Drawer>,
      );

      expect(renderTrigger).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: false, disabled: true }));
      expect(getTrigger()).toBeDisabled();
    });

    it('wires the render-prop open, toggle and close helpers to the drawer state', () => {
      const onOpenChange = vi.fn();
      let helpers: { open: () => void; close: () => void; toggle: () => void } | undefined;
      render(
        <Drawer onOpenChange={onOpenChange}>
          <Drawer.Trigger>
            {({ open, close, toggle }) => {
              helpers = { open, close, toggle };
              return 'Open drawer';
            }}
          </Drawer.Trigger>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      act(() => helpers?.open());
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      act(() => helpers?.toggle());
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(onOpenChange).toHaveBeenLastCalledWith(false);

      act(() => helpers?.toggle());
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      act(() => helpers?.close());
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(onOpenChange).toHaveBeenCalledTimes(4);
      expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
    });

    it('closes an open non-modal drawer when pressed again, reporting the change once', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Drawer modal={false} onOpenChange={onOpenChange}>
          <Drawer.Trigger>Open drawer</Drawer.Trigger>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
            <Drawer.Close />
          </Drawer.Panel>
        </Drawer>,
      );

      await user.click(getTrigger());
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(getTrigger());

      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Drawer.Overlay', () => {
    it('renders as a custom element through the as prop and still dismisses', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Drawer defaultOpen onOpenChange={onOpenChange}>
          <Drawer.Overlay as="section" />
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      const overlay = getPart('tk-drawer-overlay');
      expect(overlay.tagName).toBe('SECTION');
      expect(overlay).toHaveAttribute('data-intensity', 'base');

      await user.click(overlay);

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('forwards clicks to onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderDrawer({ defaultOpen: true, parts: { Overlay: { onClick } } });

      const overlay = getPart('tk-drawer-overlay');
      await user.click(overlay);

      expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click', target: overlay }));
    });

    it('defaults to base intensity without the invisible or blur hooks', () => {
      renderDrawer({ defaultOpen: true });

      const overlay = getPart('tk-drawer-overlay');
      expect(overlay).toHaveAttribute('data-intensity', 'base');
      expect(overlay).not.toHaveAttribute('data-invisible');
      expect(overlay).not.toHaveAttribute('data-blur');
    });

    it.each(['lightest', 'light', 'base', 'dark', 'darkest'] as const)('reflects intensity="%s"', intensity => {
      renderDrawer({ defaultOpen: true, parts: { Overlay: { intensity } } });

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-intensity', intensity);
    });

    it('emits data-invisible and data-blur as presence flags when enabled', () => {
      renderDrawer({ defaultOpen: true, parts: { Overlay: { invisible: true, blur: true } } });

      const overlay = getPart('tk-drawer-overlay');
      expect(overlay).toHaveAttribute('data-invisible', '');
      expect(overlay).toHaveAttribute('data-blur', '');
    });

    it('keeps data-intensity locked against slotProps overrides', () => {
      renderDrawer({
        defaultOpen: true,
        parts: { Overlay: { slotProps: { root: { 'data-intensity': 'darkest' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-intensity', 'base');
    });

    it('applies a provider defaultProps intensity', () => {
      renderDrawer({ defaultOpen: true }, { DrawerOverlay: { defaultProps: { intensity: 'dark' } } });

      expect(getPart('tk-drawer-overlay')).toHaveAttribute('data-intensity', 'dark');
    });

    it('stays interactive when invisible: pressing it still dismisses', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDrawer({ defaultOpen: true, onOpenChange, parts: { Overlay: { invisible: true } } });

      await user.click(getPart('tk-drawer-overlay'));

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });
  });

  describe('Drawer.Panel', () => {
    it('renders role="dialog" named by the title and described by the description', () => {
      renderDrawer({ defaultOpen: true });

      const panel = screen.getByRole('dialog', { name: TITLE });
      expect(panel).toHaveClass('tk-drawer-panel');
      expect(panel).toHaveAccessibleDescription(DESCRIPTION);
    });

    it('accepts role="alertdialog"', () => {
      renderDrawer({ defaultOpen: true, parts: { Panel: { role: 'alertdialog' } } });

      expect(screen.getByRole('alertdialog', { name: TITLE })).toHaveClass('tk-drawer-panel');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('keeps data-placement locked against slotProps overrides', () => {
      renderDrawer({
        defaultOpen: true,
        placement: 'left',
        parts: { Panel: { slotProps: { root: { 'data-placement': 'top' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPanel()).toHaveAttribute('data-placement', 'left');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel as="section">
            <Drawer.Title>{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      const panel = screen.getByRole('dialog', { name: TITLE });
      expect(panel.tagName).toBe('SECTION');
      expect(panel).toHaveClass('tk-drawer-panel');
    });

    describe('focus management', () => {
      it('moves focus to the first focusable element when it opens', async () => {
        const user = userEvent.setup();
        renderDrawer();

        await user.click(getTrigger());

        expect(getCloseButton()).toHaveFocus();
      });

      it('focuses initialFocus instead and reports onOpenAutoFocus with the focus event', async () => {
        const user = userEvent.setup();
        const onOpenAutoFocus = vi.fn();
        renderDrawer({ parts: { Panel: { initialFocus: getConfirmButton, onOpenAutoFocus } } });

        await user.click(getTrigger());

        expect(getConfirmButton()).toHaveFocus();
        expect(onOpenAutoFocus).toHaveBeenCalledExactlyOnceWith(expect.any(Event));
      });

      it('lets onOpenAutoFocus veto the initial focus move', async () => {
        const user = userEvent.setup();
        const onOpenAutoFocus = vi.fn((event: Event) => event.preventDefault());
        renderDrawer({ parts: { Panel: { onOpenAutoFocus } } });

        await user.click(getTrigger());

        expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
        expect(getTrigger()).toHaveFocus();
      });

      it('keeps Tab and Shift+Tab cycling inside the open panel', async () => {
        const user = userEvent.setup();
        renderDrawer({ defaultOpen: true });

        expect(getCloseButton()).toHaveFocus();

        await user.tab();
        expect(getConfirmButton()).toHaveFocus();

        await user.tab();
        expect(getCloseButton()).toHaveFocus();

        await user.tab({ shift: true });
        expect(getConfirmButton()).toHaveFocus();
      });

      it('lets focus leave the panel when trapFocus is false', async () => {
        const user = userEvent.setup();
        renderDrawer({ defaultOpen: true, parts: { Panel: { trapFocus: false } } });

        await user.tab();
        expect(getConfirmButton()).toHaveFocus();

        await user.tab();
        expect(getPanel()).not.toContainElement(document.activeElement as HTMLElement);
      });

      it('sends focus to finalFocus on close and reports onCloseAutoFocus with the focus event', async () => {
        const user = userEvent.setup();
        const onCloseAutoFocus = vi.fn();
        const getElsewhere = () => screen.getByRole('button', { name: 'Elsewhere' });
        render(
          <>
            <button type="button">Elsewhere</button>
            <DrawerAnatomy defaultOpen parts={{ Panel: { finalFocus: getElsewhere, onCloseAutoFocus } }} />
          </>,
        );

        await user.click(getCloseButton());

        expect(getElsewhere()).toHaveFocus();
        expect(onCloseAutoFocus).toHaveBeenCalledExactlyOnceWith(expect.any(Event));
      });

      it('lets onCloseAutoFocus veto the finalFocus move', async () => {
        const user = userEvent.setup();
        const onCloseAutoFocus = vi.fn((event: Event) => event.preventDefault());
        const getElsewhere = () => screen.getByRole('button', { name: 'Elsewhere' });
        render(
          <>
            <button type="button">Elsewhere</button>
            <DrawerAnatomy defaultOpen parts={{ Panel: { finalFocus: getElsewhere, onCloseAutoFocus } }} />
          </>,
        );

        await user.click(getCloseButton());

        expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
        expect(onCloseAutoFocus.mock.calls[0]?.[0].defaultPrevented).toBe(true);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
        expect(getElsewhere()).not.toHaveFocus();
      });

      it('accepts initialFocus and finalFocus as element references', async () => {
        const user = userEvent.setup();
        const outside = document.createElement('button');
        outside.textContent = 'Outside';
        document.body.appendChild(outside);
        const target = document.createElement('input');
        target.setAttribute('aria-label', 'Search');

        render(
          <Drawer>
            <Drawer.Trigger>Open drawer</Drawer.Trigger>
            <Drawer.Panel initialFocus={target} finalFocus={outside}>
              <Drawer.Title>{TITLE}</Drawer.Title>
              <Drawer.Close />
              <div ref={node => void node?.appendChild(target)} />
            </Drawer.Panel>
          </Drawer>,
        );

        await user.click(getTrigger());
        expect(target).toHaveFocus();

        await user.keyboard('{Escape}');
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
        expect(outside).toHaveFocus();

        outside.remove();
      });
    });
  });

  describe('Drawer.Header', () => {
    it('defaults headerType to "basic"', () => {
      renderDrawer({ defaultOpen: true });

      expect(getPart('tk-drawer-header')).toHaveAttribute('data-header-type', 'basic');
    });

    it.each(['basic', 'divided', 'light', 'dark', 'primary'] as const)('reflects headerType="%s"', headerType => {
      renderDrawer({ defaultOpen: true, parts: { Header: { headerType } } });

      expect(getPart('tk-drawer-header')).toHaveAttribute('data-header-type', headerType);
    });

    it('keeps data-header-type locked against slotProps overrides', () => {
      renderDrawer({
        defaultOpen: true,
        parts: { Header: { headerType: 'dark', slotProps: { root: { 'data-header-type': 'primary' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-drawer-header')).toHaveAttribute('data-header-type', 'dark');
    });

    it('applies a provider defaultProps headerType', () => {
      renderDrawer({ defaultOpen: true }, { DrawerHeader: { defaultProps: { headerType: 'divided' } } });

      expect(getPart('tk-drawer-header')).toHaveAttribute('data-header-type', 'divided');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel>
            <Drawer.Header as="header">
              <Drawer.Title>{TITLE}</Drawer.Title>
            </Drawer.Header>
          </Drawer.Panel>
        </Drawer>,
      );

      const header = getPart('tk-drawer-header');
      expect(header.tagName).toBe('HEADER');
      expect(header).toHaveAttribute('data-header-type', 'basic');
    });
  });

  describe('Drawer.Title', () => {
    it('renders an h5 with data-level="5" by default', () => {
      renderDrawer({ defaultOpen: true });

      const title = screen.getByRole('heading', { name: TITLE, level: 5 });
      expect(title).toHaveAttribute('data-level', '5');
    });

    it('renders the matching heading tag and data-level for a custom level', () => {
      renderDrawer({ defaultOpen: true, parts: { Title: { level: 2 } } });

      const title = screen.getByRole('heading', { name: TITLE, level: 2 });
      expect(title.tagName).toBe('H2');
      expect(title).toHaveAttribute('data-level', '2');
    });

    it('applies a provider defaultProps level', () => {
      renderDrawer({ defaultOpen: true }, { DrawerTitle: { defaultProps: { level: 3 } } });

      expect(screen.getByRole('heading', { name: TITLE, level: 3 })).toHaveAttribute('data-level', '3');
    });

    it('lets an instance level win over a provider defaultProps level', () => {
      renderDrawer({ defaultOpen: true, parts: { Title: { level: 1 } } }, { DrawerTitle: { defaultProps: { level: 3 } } });

      expect(screen.getByRole('heading', { name: TITLE, level: 1 })).toHaveAttribute('data-level', '1');
      expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
    });

    it('keeps data-level and the panel label when rendered as a custom element', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel>
            <Drawer.Title as="div">{TITLE}</Drawer.Title>
          </Drawer.Panel>
        </Drawer>,
      );

      const title = getPart('tk-drawer-title');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveAttribute('data-level', '5');
      expect(screen.getByRole('dialog', { name: TITLE })).toBeInTheDocument();
    });
  });

  describe('Drawer.Description', () => {
    it('renders as a custom element through the as prop and still describes the panel', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
            <Drawer.Description as="div">{DESCRIPTION}</Drawer.Description>
          </Drawer.Panel>
        </Drawer>,
      );

      expect(getPart('tk-drawer-description').tagName).toBe('DIV');
      expect(getPanel()).toHaveAccessibleDescription(DESCRIPTION);
    });
  });

  describe('Drawer.Body', () => {
    it('renders as a custom element through the as prop', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
            <Drawer.Body as="section">Passenger list</Drawer.Body>
          </Drawer.Panel>
        </Drawer>,
      );

      const body = getPart('tk-drawer-body');
      expect(body.tagName).toBe('SECTION');
      expect(body).toHaveTextContent('Passenger list');
    });
  });

  describe('Drawer.Footer', () => {
    it('defaults footerType to "basic"', () => {
      renderDrawer({ defaultOpen: true });

      expect(getPart('tk-drawer-footer')).toHaveAttribute('data-footer-type', 'basic');
    });

    it.each(['basic', 'divided', 'light'] as const)('reflects footerType="%s"', footerType => {
      renderDrawer({ defaultOpen: true, parts: { Footer: { footerType } } });

      expect(getPart('tk-drawer-footer')).toHaveAttribute('data-footer-type', footerType);
    });

    it('keeps data-footer-type locked against slotProps overrides', () => {
      renderDrawer({
        defaultOpen: true,
        parts: { Footer: { footerType: 'light', slotProps: { root: { 'data-footer-type': 'divided' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-drawer-footer')).toHaveAttribute('data-footer-type', 'light');
    });

    it('applies a provider defaultProps footerType', () => {
      renderDrawer({ defaultOpen: true }, { DrawerFooter: { defaultProps: { footerType: 'divided' } } });

      expect(getPart('tk-drawer-footer')).toHaveAttribute('data-footer-type', 'divided');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Drawer defaultOpen>
          <Drawer.Panel>
            <Drawer.Title>{TITLE}</Drawer.Title>
            <Drawer.Footer as="footer">Actions</Drawer.Footer>
          </Drawer.Panel>
        </Drawer>,
      );

      const footer = getPart('tk-drawer-footer');
      expect(footer.tagName).toBe('FOOTER');
      expect(footer).toHaveAttribute('data-footer-type', 'basic');
    });
  });

  describe('Drawer.Close', () => {
    it('closes the drawer and forwards the click to onClick once', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onOpenChange = vi.fn();
      renderDrawer({ defaultOpen: true, onOpenChange, parts: { Close: { onClick } } });

      await user.click(getCloseButton());

      expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click' }));
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('passes close render props to function children and drops the default label', async () => {
      const user = userEvent.setup();
      const renderClose = vi.fn(({ isOpen }: { isOpen: boolean }) => (isOpen ? 'Dismiss' : 'Dismissed'));
      renderDrawer({ defaultOpen: true, parts: { Close: { children: renderClose } } });

      expect(renderClose).toHaveBeenLastCalledWith({ isOpen: true, close: expect.any(Function) });

      const button = screen.getByRole('button', { name: 'Dismiss' });
      expect(button).not.toHaveAttribute('aria-label');

      await user.click(button);

      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(screen.getByRole('button', { name: 'Dismissed' })).toBeInTheDocument();
    });

    it.each([
      ['false', false],
      ['an empty string', ''],
      ['null', null],
    ])('falls back to the icon-only control with the default name when children is %s', (_label, children) => {
      renderDrawer({ defaultOpen: true, parts: { Close: { children } } });

      const button = getCloseButton();
      expect(button).toHaveAttribute('aria-label', 'Close');
      expect(button.textContent).toBe('');
    });

    it('treats 0 as custom content without a default label', () => {
      renderDrawer({ defaultOpen: true, parts: { Close: { children: 0 } } });

      const button = screen.getByRole('button', { name: '0' });
      expect(button).toHaveClass('tk-drawer-close');
      expect(button).not.toHaveAttribute('aria-label');
    });
  });

  describe('context boundaries', () => {
    let consoleErrorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
      // React reports the thrown render error through console.error.
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('throws the Drawer safe-context error naming Drawer.Panel when it renders outside the root', () => {
      expect(() => render(<Drawer.Panel>Loose</Drawer.Panel>)).toThrow('Drawer.Panel must be used within DrawerProvider');
    });

    it.each([
      ['Drawer.Trigger', () => <Drawer.Trigger>Loose</Drawer.Trigger>],
      ['Drawer.Overlay', () => <Drawer.Overlay />],
      ['Drawer.Title', () => <Drawer.Title>Loose</Drawer.Title>],
      ['Drawer.Description', () => <Drawer.Description>Loose</Drawer.Description>],
      ['Drawer.Close', () => <Drawer.Close />],
    ])('throws the dialog safe-context error when %s renders outside the root', (_name, renderLoose) => {
      expect(() => render(renderLoose())).toThrow(/must be used within a Dialog/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the open anatomy', async () => {
      renderDrawer({ defaultOpen: true });

      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('has no axe violations for the closed, force-mounted anatomy', async () => {
      renderDrawer();

      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('has no axe violations for a non-dismissible alertdialog with styled header and footer', async () => {
      renderDrawer({
        defaultOpen: true,
        dismissible: false,
        placement: 'left',
        parts: {
          Panel: { role: 'alertdialog' },
          Overlay: { blur: true, intensity: 'darkest' },
          Header: { headerType: 'dark' },
          Footer: { footerType: 'divided' },
          Title: { level: 2 },
        },
      });

      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});
