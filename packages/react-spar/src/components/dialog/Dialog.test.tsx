import type { ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { fireEvent, render } from '@testing-library/react';
import { renderWithProvider, screen } from '../../test-utils';
import { SparReactProvider } from '../../provider';
import { Dialog } from './Dialog';
import { Button } from '../button/Button';

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

const renderDefaultDialog = (props: Partial<React.ComponentProps<typeof Dialog>> = {}) =>
  renderWithProvider(
    <Dialog defaultVisible {...props}>
      <Dialog.Mask />
      <Dialog.Panel>
        <Dialog.Header>
          <Dialog.SignIcon />
          <Dialog.TitleGroup>
            <Dialog.Description>Confirm the fare difference</Dialog.Description>
            <Dialog.Title>Cabin upgrade</Dialog.Title>
          </Dialog.TitleGroup>
          <Dialog.CloseButton />
        </Dialog.Header>
        <Dialog.Body>Review the new fare before confirming the change.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.FooterActions>
            <Button>
              <Button.Label>Confirm</Button.Label>
            </Button>
          </Dialog.FooterActions>
        </Dialog.Footer>
      </Dialog.Panel>
    </Dialog>,
  );

describe('Dialog (compound)', () => {
  it('renders the compound dialog anatomy with canonical slot classes', () => {
    renderDefaultDialog();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('tk-dialog');
    expect(dialog).toHaveAttribute('data-variant', 'info');
    expect(document.querySelector('.tk-dialog-mask')).toBeInTheDocument();
    expect(document.querySelector('.tk-dialog-header')).toBeInTheDocument();
    expect(document.querySelector('.tk-dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Cabin upgrade').className).toContain('tk-dialog-title');
    expect(screen.getByText('Confirm the fare difference').className).toContain('tk-dialog-subtitle');
  });

  it('hides Dialog.Mask when not visible', () => {
    renderWithProvider(
      <Dialog>
        <Dialog.Mask />
        <Dialog.Panel>
          <Dialog.Body>hidden</Dialog.Body>
        </Dialog.Panel>
      </Dialog>,
    );
    expect(document.querySelector('.tk-dialog-mask')).toBeNull();
  });

  it('dismisses when Dialog.CloseButton is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProvider(
      <Dialog defaultVisible onClose={onClose}>
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.Title>hi</Dialog.Title>
            <Dialog.CloseButton />
          </Dialog.Header>
        </Dialog.Panel>
      </Dialog>,
    );
    await user.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('forwards data-variant from the root prop to the panel', () => {
    renderDefaultDialog({ variant: 'danger' });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-variant', 'danger');
  });

  it('supports controlled visibility via visible + onVisibleChange', async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    const { rerender } = renderWithProvider(
      <Dialog visible onVisibleChange={onVisibleChange}>
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.CloseButton />
          </Dialog.Header>
          <Dialog.Body>content</Dialog.Body>
        </Dialog.Panel>
      </Dialog>,
    );
    await user.click(screen.getByLabelText('Close dialog'));
    expect(onVisibleChange).toHaveBeenCalledWith(false);

    rerender(
      <SparReactProvider>
        <Dialog visible={false} onVisibleChange={onVisibleChange}>
          <Dialog.Panel>
            <Dialog.Body>content</Dialog.Body>
          </Dialog.Panel>
        </Dialog>
      </SparReactProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('merges instance classNames with canonical slot classes', () => {
    renderWithProvider(
      <Dialog defaultVisible classNames={{ root: 'panel-instance', title: 'title-instance' }}>
        <Dialog.Panel>
          <Dialog.Header>
            <Dialog.Title>hi</Dialog.Title>
          </Dialog.Header>
        </Dialog.Panel>
      </Dialog>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('panel-instance');
    const title = screen.getByText('hi');
    expect(title.className).toContain('tk-dialog-title');
    expect(title.className).toContain('title-instance');
  });

  it('applies theme-level defaultProps and merges slotProps', () => {
    render(
      <SparReactProvider
        components={{
          Dialog: {
            defaultProps: { maskVariant: 'dark' },
            slotProps: { root: { 'data-theme-probe': 'merged' } as React.HTMLAttributes<HTMLDivElement> },
          },
        }}
      >
        <Dialog defaultVisible>
          <Dialog.Mask />
          <Dialog.Panel aria-label="x">
            <Dialog.Body>content</Dialog.Body>
          </Dialog.Panel>
        </Dialog>
      </SparReactProvider>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-mask-variant', 'dark');
    expect(dialog).toHaveAttribute('data-theme-probe', 'merged');
  });

  it('has no a11y violations for a default compound dialog', async () => {
    const { container } = renderDefaultDialog();
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('preventDismiss', () => {
    it('blocks Escape-key dismiss when set', () => {
      const onVisibleChange = vi.fn();
      renderWithProvider(
        <Dialog defaultVisible preventDismiss onVisibleChange={onVisibleChange}>
          <Dialog.Panel>
            <Dialog.Body>locked</Dialog.Body>
          </Dialog.Panel>
        </Dialog>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onVisibleChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    it('blocks outside pointer-down dismiss when set', () => {
      const onVisibleChange = vi.fn();
      renderWithProvider(
        <Dialog defaultVisible preventDismiss onVisibleChange={onVisibleChange}>
          <Dialog.Panel>
            <Dialog.Body>locked</Dialog.Body>
          </Dialog.Panel>
        </Dialog>,
      );
      fireEvent.pointerDown(document.body);
      expect(onVisibleChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    it('still dismisses on Escape when preventDismiss is off (control)', () => {
      const onVisibleChange = vi.fn();
      renderWithProvider(
        <Dialog defaultVisible onVisibleChange={onVisibleChange}>
          <Dialog.Panel>
            <Dialog.Body>open</Dialog.Body>
          </Dialog.Panel>
        </Dialog>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onVisibleChange).toHaveBeenCalledWith(false);
    });
  });
});
