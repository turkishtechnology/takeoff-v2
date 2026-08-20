import { describe, expect, it } from 'vitest';

import { render, screen } from '../../test-utils';
import { Alert } from '../alert';
import { Drawer } from '../drawer';
import { Popover } from '../popover';

import { Dialog } from './index';

/**
 * Every close affordance in the library renders the same official glyph and
 * carries an accessible name when it has no text of its own. These parts have
 * no other test coverage, so the contract is pinned here for all four.
 */
describe('close parts', () => {
  const cases = [
    {
      name: 'Dialog.Close',
      render: (node: React.ReactNode) => (
        <Dialog defaultOpen>
          <Dialog.Panel>{node}</Dialog.Panel>
        </Dialog>
      ),
    },
    {
      name: 'Drawer.Close',
      render: (node: React.ReactNode) => (
        <Drawer defaultOpen>
          <Drawer.Panel>{node}</Drawer.Panel>
        </Drawer>
      ),
    },
    {
      name: 'Popover.Close',
      render: (node: React.ReactNode) => (
        <Popover defaultOpen>
          <Popover.Content>{node}</Popover.Content>
        </Popover>
      ),
    },
  ] as const;

  const closePart = {
    'Dialog.Close': Dialog.Close,
    'Drawer.Close': Drawer.Close,
    'Popover.Close': Popover.Close,
  } as const;

  for (const { name, render: wrap } of cases) {
    const Close = closePart[name];

    describe(name, () => {
      it('renders the official close glyph and a default accessible name', () => {
        render(wrap(<Close />));

        const button = screen.getByRole('button', { name: 'Close' });

        expect(button.querySelector('svg')).not.toBeNull();
      });

      it('lets children replace the glyph and drops the default name', () => {
        render(wrap(<Close>Done</Close>));

        const button = screen.getByRole('button', { name: 'Done' });

        expect(button.querySelector('svg')).toBeNull();
        expect(button).not.toHaveAttribute('aria-label');
      });

      it('keeps an explicit aria-label', () => {
        render(wrap(<Close aria-label="Kapat" />));

        expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
      });

      // `rootAttrs` is layered last, so a consumer's slotProps must still win —
      // the default label must never clobber it.
      it('keeps an aria-label supplied through slotProps.root', () => {
        render(wrap(<Close slotProps={{ root: { 'aria-label': 'Vazgeç' } }} />));

        expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeInTheDocument();
      });
    });
  }

  it('Alert.Close keeps rendering the same glyph', () => {
    render(
      <Alert>
        <Alert.Close />
      </Alert>,
    );

    const button = screen.getByRole('button', { name: 'Close' });

    expect(button.querySelector('svg')).not.toBeNull();
  });
});
