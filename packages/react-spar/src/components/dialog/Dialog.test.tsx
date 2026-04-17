import type { ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render } from '@testing-library/react';
import { renderWithProvider, screen } from '../../test-utils';
import { SparReactProvider } from '../../provider';
import { Dialog } from './Dialog';

vi.mock('react-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-dom')>();

  return {
    ...actual,
    createPortal: (node: ReactNode) => node,
  };
});

afterEach(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

describe('Dialog', () => {
  it('renders the default dialog anatomy with slot classes', () => {
    renderWithProvider(
      <Dialog defaultVisible header="Cabin upgrade" subheader="Confirm the fare difference">
        Review the new fare before confirming the change.
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const mask = document.querySelector('.tk-dialog-mask');
    const header = document.querySelector('.tk-dialog-header');
    const content = document.querySelector('.tk-dialog-content');

    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('tk-dialog');
    expect(dialog).toHaveAttribute('data-variant', 'info');
    expect(mask).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Cabin upgrade')).toHaveClass('tk-dialog-title');
    expect(screen.getByText('Confirm the fare difference')).toHaveClass('tk-dialog-subtitle');
  });

  it('uses the custom header slot instead of the default header contract', () => {
    const { container } = renderWithProvider(
      <Dialog
        defaultVisible
        header="Ignored"
        headerSlot={
          <div data-testid="custom-header">
            <strong>Custom header</strong>
          </div>
        }
      >
        Content
      </Dialog>,
    );

    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
    expect(container.querySelector('.tk-dialog-header')).toBeNull();
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('prefers contentSlot over children and wraps footerActions with dialog footer classes', () => {
    renderWithProvider(
      <Dialog
        defaultVisible
        contentSlot={<p>Slot content</p>}
        footerActions={
          <>
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </>
        }
      >
        Children content
      </Dialog>,
    );

    expect(screen.getByText('Slot content')).toBeInTheDocument();
    expect(screen.queryByText('Children content')).not.toBeInTheDocument();
    expect(document.querySelector('.tk-dialog-footer')).toBeInTheDocument();
    expect(document.querySelector('.tk-dialog-footer-actions')).toBeInTheDocument();
  });

  it('emits close callbacks and closes in uncontrolled mode when the close button is pressed', async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    const onClose = vi.fn();

    renderWithProvider(
      <Dialog defaultVisible header="Close me" onClose={onClose} onVisibleChange={onVisibleChange}>
        Body
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('prevents outside dismissal when preventDismiss is enabled', async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    const { container } = renderWithProvider(
      <Dialog defaultVisible header="Protected dialog" onVisibleChange={onVisibleChange} preventDismiss>
        Body
      </Dialog>,
    );

    const mask = container.querySelector('.tk-dialog-mask');
    expect(mask).toBeInTheDocument();

    await user.click(mask as HTMLElement);

    expect(onVisibleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('applies mask modifier classes and skips body scroll lock when the backdrop is hidden', () => {
    renderWithProvider(
      <Dialog defaultVisible hideBackdrop isMaskBlur maskVariant="darkest">
        Body
      </Dialog>,
    );

    const mask = document.querySelector('.tk-dialog-mask') as HTMLElement;

    expect(mask).toHaveClass('tk-dialog-mask-hidden');
    expect(mask).toHaveClass('tk-dialog-mask-blur');
    expect(mask).toHaveClass('tk-dialog-mask-darkest');
    expect(document.body.style.overflow).toBe('');
  });

  it('locks body scroll while the dialog is open and restores it on unmount', () => {
    document.body.style.overflow = 'scroll';
    document.body.style.paddingRight = '4px';

    const { unmount } = renderWithProvider(
      <Dialog defaultVisible header="Scroll lock">
        Body
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).not.toBe('4px');

    unmount();

    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.paddingRight).toBe('4px');
  });

  it('has no obvious accessibility violations for the default dialog structure', async () => {
    const { container } = renderWithProvider(
      <Dialog defaultVisible header="Delete booking" subheader="This action cannot be undone">
        Review the consequences before you continue.
      </Dialog>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('classNames prop', () => {
    it('applies classNames.root to the dialog root', () => {
      renderWithProvider(
        <Dialog defaultVisible classNames={{ root: 'custom-root' }}>
          Body
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('custom-root');
      expect(dialog.className).toContain('tk-dialog');
    });

    it('applies classNames.content to the content slot', () => {
      renderWithProvider(
        <Dialog defaultVisible classNames={{ content: 'custom-content' }}>
          Body
        </Dialog>,
      );
      const content = document.querySelector('.tk-dialog-content');
      expect(content).toBeInTheDocument();
      expect(content!.className).toContain('custom-content');
    });

    it('applies classNames.header to the header slot', () => {
      renderWithProvider(
        <Dialog defaultVisible header="Title" classNames={{ header: 'custom-header' }}>
          Body
        </Dialog>,
      );
      const header = document.querySelector('.tk-dialog-header');
      expect(header!.className).toContain('custom-header');
    });

    it('applies classNames.footer to the footer slot', () => {
      renderWithProvider(
        <Dialog defaultVisible classNames={{ footer: 'custom-footer' }} footerActions={<button type="button">OK</button>}>
          Body
        </Dialog>,
      );
      const footer = document.querySelector('.tk-dialog-footer');
      expect(footer!.className).toContain('custom-footer');
    });
  });

  describe('slotProps prop', () => {
    it('forwards slotProps.content attributes to content slot', () => {
      renderWithProvider(
        <Dialog defaultVisible slotProps={{ content: { id: 'my-content' } }}>
          Body
        </Dialog>,
      );
      const content = document.querySelector('.tk-dialog-content');
      expect(content).toHaveAttribute('id', 'my-content');
    });
  });

  describe('render overrides', () => {
    it('uses renderCloseIcon to override close icon content while preserving structural button', () => {
      renderWithProvider(
        <Dialog defaultVisible header="Title" renderCloseIcon={() => <span data-testid="custom-x">X</span>}>
          Body
        </Dialog>,
      );
      const closeButton = screen.getByLabelText('Close dialog');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
      expect(closeButton.className).toContain('tk-dialog-header-close-button');
      expect(screen.getByTestId('custom-x')).toBeInTheDocument();
    });

    it('preserves dismiss behavior when renderCloseIcon is used', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProvider(
        <Dialog defaultVisible header="Title" onClose={onClose} renderCloseIcon={() => <span>X</span>}>
          Body
        </Dialog>,
      );

      await user.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('compound parts', () => {
    it('renders Dialog.Header with correct slot class', () => {
      renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Header>Custom Header</Dialog.Header>
              <Dialog.Content>Custom Content</Dialog.Content>
            </>
          }
        >
          Ignored children
        </Dialog>,
      );
      const header = document.querySelector('.tk-dialog-header');
      expect(header).toBeInTheDocument();
      expect(header!.textContent).toBe('Custom Header');
    });

    it('renders Dialog.Content with correct slot class', () => {
      renderWithProvider(
        <Dialog defaultVisible showHeader={false} containerSlot={<Dialog.Content>Compound Content</Dialog.Content>}>
          Ignored
        </Dialog>,
      );
      const content = document.querySelector('.tk-dialog-content');
      expect(content).toBeInTheDocument();
      expect(content!.textContent).toBe('Compound Content');
    });

    it('renders Dialog.Footer with correct slot class', () => {
      renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Content>Body</Dialog.Content>
              <Dialog.Footer>Footer Content</Dialog.Footer>
            </>
          }
        >
          Ignored
        </Dialog>,
      );
      const footer = document.querySelector('.tk-dialog-footer');
      expect(footer).toBeInTheDocument();
      expect(footer!.textContent).toBe('Footer Content');
    });

    it('renders Dialog.FooterActions with correct slot class', () => {
      renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Content>Body</Dialog.Content>
              <Dialog.Footer>
                <Dialog.FooterActions>Actions</Dialog.FooterActions>
              </Dialog.Footer>
            </>
          }
        >
          Ignored
        </Dialog>,
      );
      const actions = document.querySelector('.tk-dialog-footer-actions');
      expect(actions).toBeInTheDocument();
      expect(actions!.textContent).toBe('Actions');
    });

    it('applies custom className to compound parts', () => {
      renderWithProvider(
        <Dialog defaultVisible showHeader={false} containerSlot={<Dialog.Content className="my-content">Custom</Dialog.Content>}>
          Ignored
        </Dialog>,
      );
      const content = document.querySelector('.tk-dialog-content');
      expect(content!.className).toContain('my-content');
    });

    it('renders Dialog.Title with semantic ARIA wiring', () => {
      renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Title>Accessible Title</Dialog.Title>
              <Dialog.Content>Body</Dialog.Content>
            </>
          }
        >
          Ignored
        </Dialog>,
      );
      const title = screen.getByText('Accessible Title');
      expect(title).toBeInTheDocument();
      expect(title.className).toContain('tk-dialog-title');
    });

    it('renders Dialog.Description with semantic ARIA wiring', () => {
      renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Title>Title</Dialog.Title>
              <Dialog.Description>Helpful description</Dialog.Description>
              <Dialog.Content>Body</Dialog.Content>
            </>
          }
        >
          Ignored
        </Dialog>,
      );
      const desc = screen.getByText('Helpful description');
      expect(desc).toBeInTheDocument();
      expect(desc.className).toContain('tk-dialog-subtitle');
    });

    it('Dialog.Title provides accessible name via aria-labelledby', async () => {
      const { container } = renderWithProvider(
        <Dialog
          defaultVisible
          showHeader={false}
          containerSlot={
            <>
              <Dialog.Title>My Dialog Name</Dialog.Title>
              <Dialog.Content>Body</Dialog.Content>
            </>
          }
        >
          Ignored
        </Dialog>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      render(
        <SparReactProvider components={{ Dialog: { defaultProps: { variant: 'danger' } } }}>
          <Dialog defaultVisible header="Theme Test">
            Body
          </Dialog>
        </SparReactProvider>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-variant', 'danger');
    });

    it('allows instance props to override theme defaultProps', () => {
      render(
        <SparReactProvider components={{ Dialog: { defaultProps: { variant: 'danger' } } }}>
          <Dialog defaultVisible header="Override" variant="success">
            Body
          </Dialog>
        </SparReactProvider>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-variant', 'success');
    });
  });
});
