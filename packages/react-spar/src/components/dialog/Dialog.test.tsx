import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type Ref } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import type { ClassNamesMap, ComponentsThemeMap, ComponentThemeConfig, SlotPropsMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Button } from '../button';

import {
  Dialog,
  type DialogBodyProps,
  type DialogCloseProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogHeaderProps,
  type DialogOverlayProps,
  type DialogPanelProps,
  type DialogProps,
  type DialogTitleProps,
  type DialogTriggerProps,
} from './index';

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

interface DialogPartProps {
  Trigger?: DialogTriggerProps;
  Overlay?: DialogOverlayProps;
  Panel?: DialogPanelProps;
  Header?: DialogHeaderProps;
  Title?: DialogTitleProps;
  Description?: DialogDescriptionProps;
  Body?: DialogBodyProps;
  Footer?: DialogFooterProps;
  Close?: DialogCloseProps;
}

type PartKey = keyof DialogPartProps;

type User = ReturnType<typeof userEvent.setup>;

interface TriggerRenderProps {
  isOpen: boolean;
  disabled: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface CloseRenderProps {
  isOpen: boolean;
  close: () => void;
}

interface DialogAnatomyProps extends Omit<DialogProps, 'children'> {
  parts?: DialogPartProps;
}

const TITLE = 'Flight details';
const DESCRIPTION = 'Review your selected flight information before continuing.';

/** The full documented anatomy; `parts` spreads extra props onto one part. */
const DialogAnatomy = ({ parts = {}, ...rootProps }: DialogAnatomyProps) => (
  <Dialog {...rootProps}>
    <Dialog.Trigger {...parts.Trigger}>Open dialog</Dialog.Trigger>
    <Dialog.Overlay {...parts.Overlay} />
    <Dialog.Panel {...parts.Panel}>
      <Dialog.Header {...parts.Header}>
        <Dialog.Title {...parts.Title}>{TITLE}</Dialog.Title>
        <Dialog.Close {...parts.Close} />
      </Dialog.Header>
      <Dialog.Body {...parts.Body}>
        <Dialog.Description {...parts.Description}>{DESCRIPTION}</Dialog.Description>
      </Dialog.Body>
      <Dialog.Footer {...parts.Footer}>
        <button type="button">Confirm</button>
      </Dialog.Footer>
    </Dialog.Panel>
  </Dialog>
);

const renderDialog = (props: DialogAnatomyProps = {}, components?: ComponentsThemeMap) =>
  render(
    <TakeoffSparProvider components={components}>
      <DialogAnatomy {...props} />
    </TakeoffSparProvider>,
  );

const getTrigger = () => screen.getByRole('button', { name: 'Open dialog' });
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

const withPartProps = (key: PartKey, props: PartStylingProps) => ({ [key]: props }) as DialogPartProps;
const withPartTheme = (theme: keyof ComponentsThemeMap, config: ComponentThemeConfig) => ({ [theme]: config }) as ComponentsThemeMap;

interface PartContract {
  key: PartKey;
  theme: keyof ComponentsThemeMap;
  className: string;
  tagName: string;
}

const PARTS = [
  { key: 'Trigger', theme: 'DialogTrigger', className: 'tk-dialog-trigger', tagName: 'BUTTON' },
  { key: 'Overlay', theme: 'DialogOverlay', className: 'tk-dialog-overlay', tagName: 'DIV' },
  { key: 'Panel', theme: 'DialogPanel', className: 'tk-dialog-panel', tagName: 'DIV' },
  { key: 'Header', theme: 'DialogHeader', className: 'tk-dialog-header', tagName: 'DIV' },
  { key: 'Title', theme: 'DialogTitle', className: 'tk-dialog-title', tagName: 'H5' },
  { key: 'Description', theme: 'DialogDescription', className: 'tk-dialog-description', tagName: 'P' },
  { key: 'Body', theme: 'DialogBody', className: 'tk-dialog-body', tagName: 'DIV' },
  { key: 'Footer', theme: 'DialogFooter', className: 'tk-dialog-footer', tagName: 'DIV' },
  { key: 'Close', theme: 'DialogClose', className: 'tk-dialog-close', tagName: 'BUTTON' },
] as const satisfies readonly PartContract[];

describe('Dialog (compound)', () => {
  describe('rendering', () => {
    it('renders no DOM for the state-only root', () => {
      const { container } = render(
        <Dialog>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
        </Dialog>,
      );

      expect(container.childElementCount).toBe(1);
      expect(container.firstElementChild).toBe(getTrigger());
      expect(document.body.querySelector('.tk-dialog')).toBeNull();
    });

    it('composes the documented anatomy inside the panel', () => {
      renderDialog({ defaultOpen: true });

      const panel = screen.getByRole('dialog', { name: TITLE });
      const header = getPart('tk-dialog-header');
      const body = getPart('tk-dialog-body');
      const footer = getPart('tk-dialog-footer');

      expect(panel).toHaveClass('tk-dialog-panel');
      expect(header.parentElement).toBe(panel);
      expect(body.parentElement).toBe(panel);
      expect(footer.parentElement).toBe(panel);
      expect(within(header).getByRole('heading', { name: TITLE })).toHaveClass('tk-dialog-title');
      expect(within(header).getByRole('button', { name: 'Close' })).toHaveClass('tk-dialog-close');
      expect(within(body).getByText(DESCRIPTION)).toHaveClass('tk-dialog-description');
      expect(within(footer).getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('portals the overlay and panel to document.body by default', () => {
      const { container } = renderDialog({ defaultOpen: true });

      const panel = getPanel();
      const overlay = getPart('tk-dialog-overlay');

      expect(container).not.toContainElement(panel);
      expect(container).not.toContainElement(overlay);
      expect(panel.parentElement).toBe(document.body);
      expect(overlay.parentElement).toBe(document.body);
    });

    it('portals the overlay and panel into a custom container', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      try {
        renderDialog({ defaultOpen: true, parts: { Overlay: { container: host }, Panel: { container: host } } });

        expect(getPanel().parentElement).toBe(host);
        expect(getPart('tk-dialog-overlay').parentElement).toBe(host);
        expect(document.body.querySelectorAll('body > .tk-dialog-panel, body > .tk-dialog-overlay')).toHaveLength(0);
      } finally {
        // Remove the host even when an assertion fails so later tests start clean.
        host.remove();
      }
    });
  });

  describe.each(PARTS)('$key slot contract', ({ key, theme, className, tagName }) => {
    it('renders its canonical element with the tk-* class and data-slot="root"', () => {
      renderDialog({ defaultOpen: true });

      const node = getPart(className);
      expect(node.tagName).toBe(tagName);
      expect(node).toHaveAttribute('data-slot', 'root');
    });

    it('merges theme classNames with instance className and classNames without dropping the canonical class', () => {
      renderDialog(
        { defaultOpen: true, parts: withPartProps(key, { className: 'instance-class', classNames: { root: 'instance-root-class' } }) },
        withPartTheme(theme, { classNames: { root: 'theme-root-class' } }),
      );

      expect(getPart(className)).toHaveClass(className, 'instance-class', 'instance-root-class', 'theme-root-class');
      expect(document.body.querySelectorAll('.instance-class')).toHaveLength(1);
      expect(document.body.querySelectorAll('.theme-root-class')).toHaveLength(1);
    });

    it('applies the provider className shortcut to its root', () => {
      renderDialog({ defaultOpen: true }, withPartTheme(theme, { className: 'theme-shortcut-class' }));

      expect(getPart(className)).toHaveClass(className, 'theme-shortcut-class');
      expect(document.body.querySelectorAll('.theme-shortcut-class')).toHaveLength(1);
    });

    it('lands slotProps.root on this part only, with instance entries winning over theme entries', () => {
      renderDialog(
        { defaultOpen: true, parts: withPartProps(key, { slotProps: { root: { title: 'instance-title' } } }) },
        withPartTheme(theme, { slotProps: { root: { title: 'theme-title', lang: 'tr' } } }),
      );

      const node = getPart(className);
      expect(node).toHaveAttribute('title', 'instance-title');
      expect(node).toHaveAttribute('lang', 'tr');
      expect(document.body.querySelectorAll('[title="instance-title"]')).toHaveLength(1);
      expect(document.body.querySelectorAll('[lang="tr"]')).toHaveLength(1);
      expect(document.body.querySelector('[title="theme-title"]')).toBeNull();
    });

    it('keeps data-slot="root" when slotProps try to override it', () => {
      renderDialog({
        defaultOpen: true,
        parts: withPartProps(key, { slotProps: { root: { 'data-slot': 'hijacked' } as HTMLAttributes<HTMLElement> } }),
      });

      expect(getPart(className)).toHaveAttribute('data-slot', 'root');
      expect(document.body.querySelector('[data-slot="hijacked"]')).toBeNull();
    });

    it('forwards ref to its root element', () => {
      const ref = createRef<HTMLElement>();

      renderDialog({ defaultOpen: true, parts: withPartProps(key, { ref }) });

      expect(ref.current).toBe(getPart(className));
    });
  });

  describe('Dialog root', () => {
    it('keeps the overlay and panel mounted across the closed state by default', async () => {
      const user = userEvent.setup();
      renderDialog();

      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-state', 'closed');
      expect(getPart('tk-dialog-panel')).toHaveAttribute('data-state', 'closed');

      await user.click(getTrigger());

      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-state', 'open');
      expect(getPart('tk-dialog-panel')).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-state', 'closed');
      expect(getPart('tk-dialog-panel')).toHaveAttribute('data-state', 'closed');
    });

    it('unmounts the overlay and panel while closed when forceMount is false', async () => {
      const user = userEvent.setup();
      renderDialog({ forceMount: false });

      expect(queryPart('tk-dialog-overlay')).toBeNull();
      expect(queryPart('tk-dialog-panel')).toBeNull();

      await user.click(getTrigger());

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(queryPart('tk-dialog-overlay')).toBeNull();
      expect(queryPart('tk-dialog-panel')).toBeNull();
    });

    it('is modal by default: aria-modal and data-modal are set and page scroll is locked only while open', async () => {
      const user = userEvent.setup();
      renderDialog();

      expect(document.body.style.overflow).toBe('');

      await user.click(getTrigger());

      const panel = getPanel();
      expect(panel).toHaveAttribute('aria-modal', 'true');
      expect(panel).toHaveAttribute('data-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');

      await user.click(getCloseButton());

      expect(document.body.style.overflow).toBe('');
    });

    it('leaves the page scrollable and focus untrapped when modal is false', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true, modal: false });

      const panel = getPanel();
      expect(panel).toHaveAttribute('aria-modal', 'false');
      expect(panel).toHaveAttribute('data-modal', 'false');
      expect(document.body.style.overflow).toBe('');

      expect(getCloseButton()).toHaveFocus();
      await user.tab();
      expect(getConfirmButton()).toHaveFocus();
      await user.tab();

      expect(panel).not.toContainElement(document.activeElement as HTMLElement);
    });

    it('derives the ARIA relationship ids from the id prop', () => {
      renderDialog({ defaultOpen: true, id: 'flight' });

      const panel = getPanel();
      expect(panel).toHaveAttribute('id', 'flight-content');
      expect(panel).toHaveAttribute('aria-labelledby', 'flight-title');
      expect(panel).toHaveAttribute('aria-describedby', 'flight-description');
      expect(screen.getByRole('heading', { name: TITLE })).toHaveAttribute('id', 'flight-title');
      expect(screen.getByText(DESCRIPTION)).toHaveAttribute('id', 'flight-description');
      expect(getTrigger()).toHaveAttribute('aria-controls', 'flight-content');
    });

    it('applies provider defaultProps to the state-only root', () => {
      renderDialog({}, { Dialog: { defaultProps: { defaultOpen: true, modal: false } } });

      const panel = getPanel();
      expect(panel).toHaveAttribute('data-state', 'open');
      expect(panel).toHaveAttribute('data-modal', 'false');
    });

    it('lets instance props win over provider defaultProps', () => {
      renderDialog({ defaultOpen: false, modal: true }, { Dialog: { defaultProps: { defaultOpen: true, modal: false } } });

      const panel = getPanel();
      expect(panel).toHaveAttribute('data-state', 'closed');
      expect(panel).toHaveAttribute('data-modal', 'true');
    });

    it('honours a provider forceMount opt-out unless the instance re-enables it', () => {
      const components: ComponentsThemeMap = { Dialog: { defaultProps: { forceMount: false } } };

      const { unmount } = renderDialog({}, components);
      expect(queryPart('tk-dialog-panel')).toBeNull();
      expect(queryPart('tk-dialog-overlay')).toBeNull();
      unmount();

      renderDialog({ forceMount: true }, components);
      expect(getPart('tk-dialog-panel')).toHaveAttribute('data-state', 'closed');
    });

    it('applies a provider dismissible default and lets the instance re-enable dismissal', async () => {
      const user = userEvent.setup();
      const components: ComponentsThemeMap = { Dialog: { defaultProps: { dismissible: false } } };
      const blocked = vi.fn();

      const { unmount } = renderDialog({ defaultOpen: true, onOpenChange: blocked }, components);
      await user.click(getPart('tk-dialog-overlay'));

      expect(blocked).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      unmount();

      const allowed = vi.fn();
      renderDialog({ defaultOpen: true, dismissible: true, onOpenChange: allowed }, components);
      await user.click(getPart('tk-dialog-overlay'));

      expect(allowed).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('disables the trigger and never opens when disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ disabled: true, onOpenChange });

      const trigger = getTrigger();
      expect(trigger).toBeDisabled();

      await user.click(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps the trigger enabled by default', () => {
      renderDialog();

      expect(getTrigger()).toBeEnabled();
    });

    it('blocks keyboard opening when disabled: Tab skips the trigger and Enter or Space do nothing', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <>
          <button type="button">Before</button>
          <Dialog disabled onOpenChange={onOpenChange}>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Panel>
              <Dialog.Title>{TITLE}</Dialog.Title>
            </Dialog.Panel>
          </Dialog>
        </>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

      await user.tab();
      expect(getTrigger()).not.toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps every styling hook on the force-mounted overlay and panel while closed', () => {
      renderDialog({ parts: { Overlay: { intensity: 'dark', blur: true }, Panel: { role: 'alertdialog' } } });

      const overlay = getPart('tk-dialog-overlay');
      expect(overlay).toHaveAttribute('data-slot', 'root');
      expect(overlay).toHaveAttribute('data-state', 'closed');
      expect(overlay).toHaveAttribute('data-intensity', 'dark');
      expect(overlay).toHaveAttribute('data-blur', '');

      const panel = getPart('tk-dialog-panel');
      expect(panel).toHaveAttribute('data-slot', 'root');
      expect(panel).toHaveAttribute('data-state', 'closed');
      expect(panel).toHaveAttribute('data-modal', 'true');
      expect(panel).toHaveAttribute('data-role', 'alertdialog');
      // A closed modal must not hold the page scroll lock.
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('uncontrolled open state', () => {
    it('opens from the trigger and closes from Dialog.Close, reporting each change once', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ onOpenChange });

      await user.click(getTrigger());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(getCloseButton());

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('opens from the keyboard with %s on the focused trigger', async (_key, keys) => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ onOpenChange });

      await user.tab();
      expect(getTrigger()).toHaveFocus();

      await user.keyboard(keys);

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('starts open with defaultOpen without reporting a change', () => {
      const onOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange });

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled open state', () => {
    it('follows the open prop and only requests changes through onOpenChange', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(<DialogAnatomy open={false} onOpenChange={onOpenChange} />);

      await user.click(getTrigger());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');

      rerender(<DialogAnatomy open onOpenChange={onOpenChange} />);

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

      await user.click(getCloseButton());

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      rerender(<DialogAnatomy open={false} onOpenChange={onOpenChange} />);

      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('round-trips open state through a stateful parent opened from outside the dialog', async () => {
      const user = userEvent.setup();
      const ControlledDialog = () => {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open externally
            </button>
            <p>State: {open ? 'open' : 'closed'}</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <Dialog.Overlay />
              <Dialog.Panel>
                <Dialog.Title>{TITLE}</Dialog.Title>
                <Dialog.Footer>
                  <Dialog.Close as={Button}>Done</Dialog.Close>
                </Dialog.Footer>
              </Dialog.Panel>
            </Dialog>
          </>
        );
      };
      render(<ControlledDialog />);

      await user.click(screen.getByRole('button', { name: 'Open externally' }));

      expect(screen.getByText('State: open')).toBeInTheDocument();
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      await user.click(screen.getByRole('button', { name: 'Done' }));

      expect(screen.getByText('State: closed')).toBeInTheDocument();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });
  });

  describe('controlled dismissal requests', () => {
    it.each([
      ['Escape', (user: User) => user.keyboard('{Escape}')],
      ['an overlay press', (user: User) => user.click(getPart('tk-dialog-overlay'))],
      ['Dialog.Close', (user: User) => user.click(getCloseButton())],
    ])('only requests a close on %s while the open prop keeps the dialog open', async (_name, dismiss) => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<DialogAnatomy open onOpenChange={onOpenChange} />);

      await dismiss(user);

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('dismissal', () => {
    describe('when dismissible (default)', () => {
      it('closes on Escape from inside the panel', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDialog({ defaultOpen: true, onOpenChange });

        await user.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('closes when the overlay is pressed', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDialog({ defaultOpen: true, onOpenChange });

        await user.click(getPart('tk-dialog-overlay'));

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('closes on a press outside the panel when no overlay is rendered', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(
          <>
            <button type="button">Elsewhere</button>
            <Dialog defaultOpen onOpenChange={onOpenChange}>
              <Dialog.Panel>
                <Dialog.Title>{TITLE}</Dialog.Title>
              </Dialog.Panel>
            </Dialog>
          </>,
        );

        await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });

      it('does not close when pressing inside the panel', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDialog({ defaultOpen: true, onOpenChange });

        await user.click(getPart('tk-dialog-body'));
        await user.click(getConfirmButton());

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('hands the Escape KeyboardEvent to onEscapeKeyDown while the dialog is still open', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const seen: Array<{ type: string; key: string; state: string | null }> = [];
        const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
          seen.push({ type: event.type, key: event.key, state: getPanel().getAttribute('data-state') });
        });
        renderDialog({ defaultOpen: true, onOpenChange, parts: { Panel: { onEscapeKeyDown } } });

        await user.keyboard('{Escape}');

        expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
        expect(onEscapeKeyDown.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
        expect(seen).toEqual([{ type: 'keydown', key: 'Escape', state: 'open' }]);
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      });

      it('does not call onEscapeKeyDown for other keys', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const onEscapeKeyDown = vi.fn();
        renderDialog({ defaultOpen: true, onOpenChange, parts: { Panel: { onEscapeKeyDown } } });

        await user.keyboard('a');

        expect(onEscapeKeyDown).not.toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('hands outside presses to onPointerDownOutside and onInteractOutside, which can veto the close', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const seen: string[] = [];
        const onPointerDownOutside = vi.fn((event: PointerEvent) => {
          seen.push(`pointerDownOutside:${event.type}`);
        });
        const onInteractOutside = vi.fn((event: PointerEvent) => {
          seen.push(`interactOutside:${event.type}`);
          event.preventDefault();
        });
        renderDialog({ defaultOpen: true, onOpenChange, parts: { Panel: { onPointerDownOutside, onInteractOutside } } });

        const overlay = getPart('tk-dialog-overlay');
        await user.click(overlay);

        expect(seen).toEqual(['pointerDownOutside:pointerdown', 'interactOutside:pointerdown']);
        expect(onPointerDownOutside.mock.calls[0]?.[0].target).toBe(overlay);
        expect(onInteractOutside.mock.calls[0]?.[0].target).toBe(overlay);
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });
    });

    describe('when dismissible={false}', () => {
      // The wrapper's half of the contract: the consumer handler is preserved and
      // receives an event that is already prevented. Whether Escape then stays
      // blocked depends on Spar honouring that veto, which it does not yet
      // (reported as a suspected bug), so the resulting open state is unasserted.
      it('still calls onEscapeKeyDown once with an already-prevented event', async () => {
        const user = userEvent.setup();
        const seen: Array<{ key: string; prevented: boolean }> = [];
        const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
          seen.push({ key: event.key, prevented: event.defaultPrevented });
        });
        renderDialog({ defaultOpen: true, dismissible: false, parts: { Panel: { onEscapeKeyDown } } });

        await user.keyboard('{Escape}');

        expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
        expect(seen).toEqual([{ key: 'Escape', prevented: true }]);
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
        renderDialog({
          defaultOpen: true,
          dismissible: false,
          onOpenChange,
          parts: { Panel: { onPointerDownOutside, onInteractOutside } },
        });

        await user.click(getPart('tk-dialog-overlay'));

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
        renderDialog({ defaultOpen: true, dismissible: false, onOpenChange });

        await user.click(getPart('tk-dialog-overlay'));
        await user.click(document.body);

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(getPanel()).toHaveAttribute('data-state', 'open');
      });

      it('still closes from Dialog.Close', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDialog({ defaultOpen: true, dismissible: false, onOpenChange });

        await user.click(getCloseButton());

        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
      });
    });
  });

  describe('Dialog.Trigger', () => {
    it('announces the dialog popup and tracks the open state', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = getTrigger();
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-controls', getPanel().id);

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('forwards onClick with the click event when it opens the dialog', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderDialog({ parts: { Trigger: { onClick } } });

      await user.click(getTrigger());

      expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click' }));
      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('passes open-state render props to function children', async () => {
      const user = userEvent.setup();
      const renderTrigger = vi.fn(({ isOpen }: { isOpen: boolean }) => (isOpen ? 'Hide details' : 'Show details'));
      render(
        <Dialog modal={false}>
          <Dialog.Trigger>{renderTrigger}</Dialog.Trigger>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
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

    it('reports disabled through the render props when the root is disabled', () => {
      const renderTrigger = vi.fn(({ disabled }: { disabled: boolean }) => (disabled ? 'Unavailable' : 'Available'));
      render(
        <Dialog disabled>
          <Dialog.Trigger>{renderTrigger}</Dialog.Trigger>
        </Dialog>,
      );

      expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
      expect(renderTrigger).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true, isOpen: false }));
    });

    it('honours a disabled prop on the trigger itself, blocking pointer and keyboard opening', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onClick = vi.fn();
      render(
        <Dialog onOpenChange={onOpenChange}>
          <Dialog.Trigger disabled onClick={onClick}>
            Open dialog
          </Dialog.Trigger>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const trigger = getTrigger();
      expect(trigger).toBeDisabled();

      await user.click(trigger);
      await user.tab();
      expect(trigger).not.toHaveFocus();
      await user.keyboard('{Enter}');

      expect(onClick).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes an open non-modal dialog when pressed again without treating the press as outside', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onPointerDownOutside = vi.fn();
      render(
        <Dialog defaultOpen modal={false} onOpenChange={onOpenChange}>
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
          <Dialog.Panel onPointerDownOutside={onPointerDownOutside}>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      await user.click(getTrigger());

      expect(onPointerDownOutside).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('drives the open state through the open, close and toggle render props', () => {
      const onOpenChange = vi.fn();
      const renderTrigger = vi.fn((_props: TriggerRenderProps) => 'Open dialog');
      render(
        <Dialog modal={false} onOpenChange={onOpenChange}>
          <Dialog.Trigger>{renderTrigger}</Dialog.Trigger>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );
      const latest = () => {
        const props = renderTrigger.mock.lastCall?.[0];
        if (!props) throw new Error('trigger render prop was never called');
        return props;
      };

      act(() => latest().open());
      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(latest().isOpen).toBe(true);

      act(() => latest().toggle());
      expect(getPanel()).toHaveAttribute('data-state', 'closed');

      act(() => latest().toggle());
      expect(getPanel()).toHaveAttribute('data-state', 'open');

      act(() => latest().close());
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(latest().isOpen).toBe(false);

      expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
    });

    it('renders as a custom element through the as prop and still opens the dialog', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <Dialog.Trigger as="span">Open dialog</Dialog.Trigger>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const trigger = getTrigger();
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveClass('tk-dialog-trigger');

      await user.click(trigger);

      expect(getPanel()).toHaveAttribute('data-state', 'open');
    });

    it('renders through a Takeoff Button with as={Button} and still opens the dialog', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <Dialog.Trigger as={Button}>Open dialog</Dialog.Trigger>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const trigger = getTrigger();
      expect(trigger).toHaveClass('tk-button', 'tk-dialog-trigger');

      await user.click(trigger);

      expect(getPanel()).toHaveAttribute('data-state', 'open');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Dialog.Overlay', () => {
    it('defaults to base intensity without the invisible or blur hooks', () => {
      renderDialog({ defaultOpen: true });

      const overlay = getPart('tk-dialog-overlay');
      expect(overlay).toHaveAttribute('data-intensity', 'base');
      expect(overlay).not.toHaveAttribute('data-invisible');
      expect(overlay).not.toHaveAttribute('data-blur');
    });

    it.each(['lightest', 'light', 'base', 'dark', 'darkest'] as const)('reflects intensity="%s"', intensity => {
      renderDialog({ defaultOpen: true, parts: { Overlay: { intensity } } });

      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-intensity', intensity);
    });

    it('emits data-invisible and data-blur as presence flags when enabled', () => {
      renderDialog({ defaultOpen: true, parts: { Overlay: { invisible: true, blur: true } } });

      const overlay = getPart('tk-dialog-overlay');
      expect(overlay).toHaveAttribute('data-invisible', '');
      expect(overlay).toHaveAttribute('data-blur', '');
    });

    it.each([
      { overlay: { invisible: true }, emitted: 'data-invisible', omitted: 'data-blur' },
      { overlay: { blur: true }, emitted: 'data-blur', omitted: 'data-invisible' },
    ] satisfies { overlay: DialogOverlayProps; emitted: string; omitted: string }[])(
      'emits only $emitted when that flag is enabled on its own',
      ({ overlay, emitted, omitted }) => {
        renderDialog({ defaultOpen: true, parts: { Overlay: overlay } });

        const node = getPart('tk-dialog-overlay');
        expect(node).toHaveAttribute(emitted, '');
        expect(node).not.toHaveAttribute(omitted);
      },
    );

    it('omits data-invisible and data-blur when explicitly false', () => {
      renderDialog({ defaultOpen: true, parts: { Overlay: { invisible: false, blur: false } } });

      const overlay = getPart('tk-dialog-overlay');
      expect(overlay).not.toHaveAttribute('data-invisible');
      expect(overlay).not.toHaveAttribute('data-blur');
    });

    it('keeps data-intensity locked against slotProps overrides', () => {
      renderDialog({
        defaultOpen: true,
        parts: { Overlay: { slotProps: { root: { 'data-intensity': 'darkest' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-intensity', 'base');
    });

    it('applies a provider defaultProps intensity and lets the instance win', () => {
      const components: ComponentsThemeMap = { DialogOverlay: { defaultProps: { intensity: 'dark', blur: true } } };

      const { unmount } = renderDialog({ defaultOpen: true }, components);
      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-intensity', 'dark');
      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-blur', '');
      unmount();

      renderDialog({ defaultOpen: true, parts: { Overlay: { intensity: 'lightest' } } }, components);
      expect(getPart('tk-dialog-overlay')).toHaveAttribute('data-intensity', 'lightest');
    });

    it('stays interactive when invisible: pressing it still dismisses', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange, parts: { Overlay: { invisible: true } } });

      await user.click(getPart('tk-dialog-overlay'));

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Overlay as="section" intensity="light" />
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const overlay = getPart('tk-dialog-overlay');
      expect(overlay.tagName).toBe('SECTION');
      expect(overlay).toHaveAttribute('data-intensity', 'light');
      expect(overlay).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Dialog.Panel', () => {
    it('renders role="dialog" named by the title and described by the description', () => {
      renderDialog({ defaultOpen: true });

      const panel = screen.getByRole('dialog', { name: TITLE });
      expect(panel).toHaveClass('tk-dialog-panel');
      expect(panel).toHaveAccessibleDescription(DESCRIPTION);
      expect(panel).toHaveAttribute('data-role', 'dialog');
    });

    it('accepts role="alertdialog" and reflects it on data-role', () => {
      renderDialog({ defaultOpen: true, parts: { Panel: { role: 'alertdialog' } } });

      const panel = screen.getByRole('alertdialog', { name: TITLE });
      expect(panel).toHaveClass('tk-dialog-panel');
      expect(panel).toHaveAttribute('data-role', 'alertdialog');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel as="section">
            <Dialog.Title>{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const panel = screen.getByRole('dialog', { name: TITLE });
      expect(panel.tagName).toBe('SECTION');
      expect(panel).toHaveClass('tk-dialog-panel');
    });

    it('forwards a consumer onKeyDown for every key while Escape still closes the dialog', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const seen: Array<{ key: string; owner: EventTarget | null }> = [];
      const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLDivElement>) => {
        // React clears currentTarget after dispatch, so capture it in the handler.
        seen.push({ key: event.key, owner: event.currentTarget });
      });
      renderDialog({ defaultOpen: true, onOpenChange, parts: { Panel: { onKeyDown } } });

      await user.keyboard('a');
      expect(onOpenChange).not.toHaveBeenCalled();

      await user.keyboard('{Escape}');

      const panel = getPanel();
      expect(onKeyDown).toHaveBeenCalledTimes(2);
      expect(seen).toEqual([
        { key: 'a', owner: panel },
        { key: 'Escape', owner: panel },
      ]);
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    describe('focus management', () => {
      it('moves focus to the first focusable element when it opens', async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(getTrigger());

        expect(getCloseButton()).toHaveFocus();
      });

      it('focuses initialFocus instead and reports onOpenAutoFocus with a cancelable focus event', async () => {
        const user = userEvent.setup();
        const onOpenAutoFocus = vi.fn<(event: Event) => void>();
        renderDialog({ parts: { Panel: { initialFocus: getConfirmButton, onOpenAutoFocus } } });

        await user.click(getTrigger());

        expect(getConfirmButton()).toHaveFocus();
        expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
        const event = onOpenAutoFocus.mock.calls[0]?.[0];
        expect(event).toBeInstanceOf(Event);
        expect(event?.type).toBe('focus');
        expect(event?.cancelable).toBe(true);
      });

      it('lets onOpenAutoFocus veto the initial focus move', async () => {
        const user = userEvent.setup();
        const onOpenAutoFocus = vi.fn((event: Event) => event.preventDefault());
        renderDialog({ parts: { Panel: { onOpenAutoFocus } } });

        await user.click(getTrigger());

        expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
        expect(getTrigger()).toHaveFocus();
      });

      it('keeps Tab and Shift+Tab cycling inside the open panel', async () => {
        const user = userEvent.setup();
        renderDialog({ defaultOpen: true });

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
        renderDialog({ defaultOpen: true, parts: { Panel: { trapFocus: false } } });

        await user.tab();
        expect(getConfirmButton()).toHaveFocus();

        await user.tab();
        expect(getPanel()).not.toContainElement(document.activeElement as HTMLElement);
      });

      it('sends focus to finalFocus on close and reports onCloseAutoFocus with the focus event', async () => {
        const user = userEvent.setup();
        const onCloseAutoFocus = vi.fn<(event: Event) => void>();
        const getElsewhere = () => screen.getByRole('button', { name: 'Elsewhere' });
        render(
          <>
            <button type="button">Elsewhere</button>
            <DialogAnatomy defaultOpen parts={{ Panel: { finalFocus: getElsewhere, onCloseAutoFocus } }} />
          </>,
        );

        await user.click(getCloseButton());

        expect(getElsewhere()).toHaveFocus();
        expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
        expect(onCloseAutoFocus.mock.calls[0]?.[0]).toBeInstanceOf(Event);
      });

      it('lets onCloseAutoFocus veto the move to finalFocus', async () => {
        const user = userEvent.setup();
        const onCloseAutoFocus = vi.fn((event: Event) => event.preventDefault());
        const getElsewhere = () => screen.getByRole('button', { name: 'Elsewhere' });
        render(
          <>
            <button type="button">Elsewhere</button>
            <DialogAnatomy defaultOpen parts={{ Panel: { finalFocus: getElsewhere, onCloseAutoFocus } }} />
          </>,
        );

        await user.keyboard('{Escape}');

        expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
        expect(getPanel()).toHaveAttribute('data-state', 'closed');
        expect(getElsewhere()).not.toHaveFocus();
      });
    });
  });

  describe('Dialog.Header', () => {
    it('defaults headerType to "basic"', () => {
      renderDialog({ defaultOpen: true });

      expect(getPart('tk-dialog-header')).toHaveAttribute('data-header-type', 'basic');
    });

    it.each(['basic', 'divided', 'light', 'dark', 'primary'] as const)('reflects headerType="%s"', headerType => {
      renderDialog({ defaultOpen: true, parts: { Header: { headerType } } });

      expect(getPart('tk-dialog-header')).toHaveAttribute('data-header-type', headerType);
    });

    it('keeps data-header-type locked against slotProps overrides', () => {
      renderDialog({
        defaultOpen: true,
        parts: { Header: { headerType: 'dark', slotProps: { root: { 'data-header-type': 'primary' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-dialog-header')).toHaveAttribute('data-header-type', 'dark');
    });

    it('applies a provider defaultProps headerType and lets the instance win', () => {
      const components: ComponentsThemeMap = { DialogHeader: { defaultProps: { headerType: 'divided' } } };

      const { unmount } = renderDialog({ defaultOpen: true }, components);
      expect(getPart('tk-dialog-header')).toHaveAttribute('data-header-type', 'divided');
      unmount();

      renderDialog({ defaultOpen: true, parts: { Header: { headerType: 'primary' } } }, components);
      expect(getPart('tk-dialog-header')).toHaveAttribute('data-header-type', 'primary');
    });

    it('renders as a custom element through the as prop and forwards native attributes', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel>
            <Dialog.Header as="header" data-testid="dialog-header">
              <Dialog.Title>{TITLE}</Dialog.Title>
            </Dialog.Header>
          </Dialog.Panel>
        </Dialog>,
      );

      const header = screen.getByTestId('dialog-header');
      expect(header.tagName).toBe('HEADER');
      expect(header).toHaveClass('tk-dialog-header');
      expect(header).toHaveAttribute('data-header-type', 'basic');
      expect(header).not.toHaveAttribute('headerType');
    });
  });

  describe('Dialog.Title', () => {
    it('renders a level-5 heading by default', () => {
      renderDialog({ defaultOpen: true });

      const title = screen.getByRole('heading', { name: TITLE, level: 5 });
      expect(title.tagName).toBe('H5');
    });

    it('renders the matching heading tag for a custom level', () => {
      renderDialog({ defaultOpen: true, parts: { Title: { level: 2 } } });

      const title = screen.getByRole('heading', { name: TITLE, level: 2 });
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('tk-dialog-title');
    });

    it('applies a provider defaultProps level', () => {
      renderDialog({ defaultOpen: true }, { DialogTitle: { defaultProps: { level: 3 } } });

      expect(screen.getByRole('heading', { name: TITLE, level: 3 }).tagName).toBe('H3');
    });

    it('keeps labelling the panel when rendered as a custom element', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel>
            <Dialog.Title as="div">{TITLE}</Dialog.Title>
          </Dialog.Panel>
        </Dialog>,
      );

      const title = getPart('tk-dialog-title');
      expect(title.tagName).toBe('DIV');
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.getByRole('dialog', { name: TITLE })).toBeInTheDocument();
    });
  });

  describe('Dialog.Description', () => {
    it('renders as a custom element through the as prop and still describes the panel', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
            <Dialog.Description as="div">{DESCRIPTION}</Dialog.Description>
          </Dialog.Panel>
        </Dialog>,
      );

      expect(getPart('tk-dialog-description').tagName).toBe('DIV');
      expect(getPanel()).toHaveAccessibleDescription(DESCRIPTION);
    });
  });

  describe('Dialog.Body', () => {
    it('renders as a custom element through the as prop', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
            <Dialog.Body as="section">Passenger list</Dialog.Body>
          </Dialog.Panel>
        </Dialog>,
      );

      const body = getPart('tk-dialog-body');
      expect(body.tagName).toBe('SECTION');
      expect(body).toHaveTextContent('Passenger list');
    });
  });

  describe('Dialog.Footer', () => {
    it('defaults footerType to "basic"', () => {
      renderDialog({ defaultOpen: true });

      expect(getPart('tk-dialog-footer')).toHaveAttribute('data-footer-type', 'basic');
    });

    it.each(['basic', 'divided', 'light'] as const)('reflects footerType="%s"', footerType => {
      renderDialog({ defaultOpen: true, parts: { Footer: { footerType } } });

      expect(getPart('tk-dialog-footer')).toHaveAttribute('data-footer-type', footerType);
    });

    it('keeps data-footer-type locked against slotProps overrides', () => {
      renderDialog({
        defaultOpen: true,
        parts: { Footer: { footerType: 'light', slotProps: { root: { 'data-footer-type': 'divided' } as HTMLAttributes<HTMLElement> } } },
      });

      expect(getPart('tk-dialog-footer')).toHaveAttribute('data-footer-type', 'light');
    });

    it('applies a provider defaultProps footerType and lets the instance win', () => {
      const components: ComponentsThemeMap = { DialogFooter: { defaultProps: { footerType: 'divided' } } };

      const { unmount } = renderDialog({ defaultOpen: true }, components);
      expect(getPart('tk-dialog-footer')).toHaveAttribute('data-footer-type', 'divided');
      unmount();

      renderDialog({ defaultOpen: true, parts: { Footer: { footerType: 'light' } } }, components);
      expect(getPart('tk-dialog-footer')).toHaveAttribute('data-footer-type', 'light');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Dialog defaultOpen>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
            <Dialog.Footer as="footer">Actions</Dialog.Footer>
          </Dialog.Panel>
        </Dialog>,
      );

      const footer = getPart('tk-dialog-footer');
      expect(footer.tagName).toBe('FOOTER');
      expect(footer).toHaveAttribute('data-footer-type', 'basic');
      expect(footer).not.toHaveAttribute('footerType');
    });
  });

  describe('Dialog.Close', () => {
    it('closes the dialog and forwards the click to onClick once', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange, parts: { Close: { onClick } } });

      await user.click(getCloseButton());

      expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click' }));
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('closes from the keyboard', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange });

      expect(getCloseButton()).toHaveFocus();
      await user.keyboard('{Enter}');

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('closes from the keyboard with Space', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ defaultOpen: true, onOpenChange });

      expect(getCloseButton()).toHaveFocus();
      await user.keyboard(' ');

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
    });

    it('closes the dialog when the close render prop is invoked', () => {
      const onOpenChange = vi.fn();
      const renderClose = vi.fn((_props: CloseRenderProps) => 'Dismiss');
      renderDialog({ defaultOpen: true, onOpenChange, parts: { Close: { children: renderClose } } });

      const props = renderClose.mock.lastCall?.[0];
      expect(props?.isOpen).toBe(true);

      act(() => props?.close());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(renderClose.mock.lastCall?.[0].isOpen).toBe(false);
    });

    it('passes close render props to function children and drops the default label', async () => {
      const user = userEvent.setup();
      const renderClose = vi.fn(({ isOpen }: { isOpen: boolean }) => (isOpen ? 'Dismiss' : 'Dismissed'));
      renderDialog({ defaultOpen: true, parts: { Close: { children: renderClose } } });

      expect(renderClose).toHaveBeenLastCalledWith({ isOpen: true, close: expect.any(Function) });

      const button = screen.getByRole('button', { name: 'Dismiss' });
      expect(button).not.toHaveAttribute('aria-label');
      expect(button.querySelector('svg')).toBeNull();

      await user.click(button);

      expect(getPanel()).toHaveAttribute('data-state', 'closed');
      expect(screen.getByRole('button', { name: 'Dismissed' })).toBeInTheDocument();
    });

    it.each([
      ['false', false],
      ['an empty string', ''],
      ['null', null],
    ])('falls back to the icon-only control with the default name when children is %s', (_label, children) => {
      renderDialog({ defaultOpen: true, parts: { Close: { children } } });

      const button = getCloseButton();
      expect(button).toHaveAttribute('aria-label', 'Close');
      expect(button.querySelector('svg')).not.toBeNull();
    });

    it('treats 0 as custom content without a default label', () => {
      renderDialog({ defaultOpen: true, parts: { Close: { children: 0 } } });

      const button = screen.getByRole('button', { name: '0' });
      expect(button).toHaveClass('tk-dialog-close');
      expect(button).not.toHaveAttribute('aria-label');
      expect(button.querySelector('svg')).toBeNull();
    });

    it('renders through a Takeoff Button with as={Button} and still closes the dialog', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <Dialog.Panel>
            <Dialog.Title>{TITLE}</Dialog.Title>
            <Dialog.Footer>
              <Dialog.Close as={Button}>Done</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Panel>
        </Dialog>,
      );

      const done = screen.getByRole('button', { name: 'Done' });
      expect(done).toHaveClass('tk-button', 'tk-dialog-close');

      await user.click(done);

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getPanel()).toHaveAttribute('data-state', 'closed');
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

    it('throws the Dialog safe-context error when Dialog.Panel renders outside the root', () => {
      expect(() => render(<Dialog.Panel>Loose</Dialog.Panel>)).toThrow(/must be used within DialogProvider/);
    });

    it.each([
      ['Dialog.Trigger', () => <Dialog.Trigger>Loose</Dialog.Trigger>],
      ['Dialog.Overlay', () => <Dialog.Overlay />],
      ['Dialog.Title', () => <Dialog.Title>Loose</Dialog.Title>],
      ['Dialog.Description', () => <Dialog.Description>Loose</Dialog.Description>],
      ['Dialog.Close', () => <Dialog.Close />],
    ])('throws the dialog safe-context error when %s renders outside the root', (_name, renderLoose) => {
      expect(() => render(renderLoose())).toThrow(/must be used within a Dialog/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the open anatomy', async () => {
      renderDialog({ defaultOpen: true });

      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('has no axe violations for the closed, force-mounted anatomy', async () => {
      renderDialog();

      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('has no axe violations for a non-dismissible alertdialog with styled overlay, header and footer', async () => {
      renderDialog({
        defaultOpen: true,
        dismissible: false,
        parts: {
          Panel: { role: 'alertdialog' },
          Overlay: { blur: true, intensity: 'darkest' },
          Header: { headerType: 'primary' },
          Title: { level: 2 },
          Footer: { footerType: 'divided' },
        },
      });

      expect(screen.getByRole('alertdialog', { name: TITLE })).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('has no axe violations for a non-modal dialog', async () => {
      renderDialog({ defaultOpen: true, modal: false });

      expect(getPanel()).toHaveAttribute('aria-modal', 'false');
      expect(await axe(document.body)).toHaveNoViolations();
    });
  });
});
