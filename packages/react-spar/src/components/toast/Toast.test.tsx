import { describe, expect, it } from 'vitest';

import { render, screen } from '../../test-utils';

import { createToaster, Toaster } from './index';

describe('Toast', () => {
  it('renders toasts with Takeoff Alert anatomy', () => {
    const toaster = createToaster({ duration: 10000 });
    toaster.success({
      title: 'Saved',
      description: 'Changes updated.',
      action: { label: 'Undo', altText: 'Undo save' },
    });

    render(<Toaster toaster={toaster} />);

    expect(screen.getByRole('region', { name: 'Notifications (F8)' })).toHaveClass('tk-toaster');
    expect(screen.getByRole('alert')).toHaveClass('tk-toast');
    expect(screen.getByText('Saved')).toHaveClass('tk-alert-title');
    expect(screen.getByText('Changes updated.')).toHaveClass('tk-alert-description');
    expect(screen.getByRole('button', { name: 'Undo save' })).toHaveClass('tk-button');
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toHaveClass('tk-alert-close');
  });

  it('allows custom toast rendering while keeping the styled viewport', () => {
    const toaster = createToaster();
    toaster.info({ title: 'Boarding' });

    render(<Toaster toaster={toaster}>{toast => <div data-testid="custom-toast">{toast.title}</div>}</Toaster>);

    expect(screen.getByRole('region')).toHaveClass('tk-toaster');
    expect(screen.getByTestId('custom-toast')).toHaveTextContent('Boarding');
  });
});
