import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Pagination, type PaginationProps } from './index';

// The page-size Select observes its trigger; jsdom lacks ResizeObserver.
const originalResizeObserver = globalThis.ResizeObserver;
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

const pageLabels = (container: HTMLElement) => Array.from(container.querySelectorAll('.tk-pagination-pages > *')).map(node => (node.tagName === 'BUTTON' ? node.textContent : '…'));

const pageInput = () => screen.getByRole('textbox', { name: 'Go to page' });

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders the default anatomy as a labelled landmark', () => {
      const { container } = render(<Pagination totalItems={240} />);
      const nav = screen.getByRole('navigation', { name: 'Pagination' });
      expect(nav).toHaveClass('tk-pagination');
      expect(nav).toHaveAttribute('data-slot', 'root');
      expect(nav).toHaveAttribute('data-type', 'outlined');
      expect(nav).toHaveAttribute('data-mode', 'default');
      expect(nav).not.toHaveAttribute('data-rounded');

      for (const [className, slot] of [
        ['tk-pagination-info', 'root'],
        ['tk-pagination-page-report', 'root'],
        ['tk-pagination-items-report', 'root'],
        ['tk-pagination-controls', 'root'],
        ['tk-pagination-first', 'root'],
        ['tk-pagination-previous', 'root'],
        ['tk-pagination-pages', 'root'],
        ['tk-pagination-page', 'page'],
        ['tk-pagination-ellipsis', 'ellipsis'],
        ['tk-pagination-next', 'root'],
        ['tk-pagination-last', 'root'],
        ['tk-pagination-actions', 'root'],
        ['tk-pagination-page-size', 'root'],
        ['tk-pagination-page-jump', 'root'],
      ]) {
        expect(container.querySelector(`.${className}`), className).toHaveAttribute('data-slot', slot);
      }

      expect(screen.getByText('Page 1 of 24')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Items 1-10 of 240')).toBeInTheDocument();
      expect(pageLabels(container)).toEqual(['1', '2', '3', '4', '5', '…', '24']);
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveTextContent('10');
      expect(pageInput()).toHaveValue('1');
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    });

    it('emits the visual variants on the root', () => {
      render(<Pagination totalItems={50} type="grouped" mode="compact" rounded />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-type', 'grouped');
      expect(nav).toHaveAttribute('data-mode', 'compact');
      expect(nav).toHaveAttribute('data-rounded', '');
    });

    it('renders the compact anatomy', () => {
      const { container } = render(<Pagination totalItems={50} mode="compact" />);
      expect(container.querySelector('.tk-pagination-info')).toBeNull();
      expect(container.querySelector('.tk-pagination-pages')).toBeNull();
      expect(screen.queryByRole('button', { name: 'First page' })).toBeNull();
      const controls = container.querySelector('.tk-pagination-controls') as HTMLElement;
      expect(within(controls).getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
      expect(within(controls).getByRole('textbox', { name: 'Go to page' })).toBeInTheDocument();
      expect(within(controls).getByText('Page 1 of 5')).toBeInTheDocument();
      expect(within(controls).getByRole('button', { name: 'Next page' })).toBeInTheDocument();
      // Compact applies on Enter/blur only; there is no submit and no second input.
      expect(screen.queryByRole('button', { name: 'Go' })).toBeNull();
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument();
    });

    it('lets consumers compose the parts', () => {
      const { container } = render(
        <Pagination totalItems={100}>
          <Pagination.Info>
            <Pagination.ItemsReport />
          </Pagination.Info>
          <Pagination.Controls>
            <Pagination.Previous />
            <Pagination.Pages />
            <Pagination.Next />
          </Pagination.Controls>
        </Pagination>,
      );
      expect(screen.queryByText('Page 1 of 10')).toBeNull();
      expect(screen.getByText('Items 1-10 of 100')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'First page' })).toBeNull();
      expect(container.querySelector('.tk-pagination-actions')).toBeNull();
    });

    it('uses default children for empty Controls and Actions', () => {
      render(
        <Pagination totalItems={30} mode="compact">
          <Pagination.Actions />
        </Pagination>,
      );
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('lets children replace the report text and the glyphs', () => {
      render(
        <Pagination totalItems={30}>
          <Pagination.PageReport>custom page</Pagination.PageReport>
          <Pagination.ItemsReport>custom items</Pagination.ItemsReport>
          <Pagination.Next>›</Pagination.Next>
        </Pagination>,
      );
      expect(screen.getByText('custom page')).toBeInTheDocument();
      expect(screen.getByText('custom items')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveTextContent('›');
    });

    it('renders parts as other elements', () => {
      render(
        <Pagination totalItems={30} as="div" role="navigation">
          <Pagination.Info as="section" aria-label="Report">
            <Pagination.PageReport as="p" />
          </Pagination.Info>
        </Pagination>,
      );
      expect(screen.getByRole('navigation').tagName).toBe('DIV');
      expect(screen.getByRole('region', { name: 'Report' }).tagName).toBe('SECTION');
      expect(screen.getByText('Page 1 of 3').tagName).toBe('P');
    });
  });

  describe('paging', () => {
    it('pages uncontrolled through every control', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { container } = render(<Pagination totalItems={240} onPageChange={onPageChange} />);

      expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Page 1, current page' })).toHaveAttribute('aria-current', 'page');

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onPageChange).toHaveBeenLastCalledWith(2);
      expect(screen.getByText('Page 2 of 24')).toBeInTheDocument();
      expect(screen.getByText('Items 11-20 of 240')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Last page' }));
      expect(onPageChange).toHaveBeenLastCalledWith(24);
      expect(screen.getByText('Items 231-240 of 240')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
      expect(pageLabels(container)).toEqual(['1', '…', '20', '21', '22', '23', '24']);

      await user.click(screen.getByRole('button', { name: 'Go to page 22' }));
      expect(onPageChange).toHaveBeenLastCalledWith(22);

      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(onPageChange).toHaveBeenLastCalledWith(21);

      await user.click(screen.getByRole('button', { name: 'First page' }));
      expect(onPageChange).toHaveBeenLastCalledWith(1);
      expect(onPageChange).toHaveBeenCalledTimes(5);
    });

    it('follows a controlled page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { rerender } = render(<Pagination totalItems={100} page={3} onPageChange={onPageChange} />);
      expect(screen.getByRole('button', { name: 'Page 3, current page' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onPageChange).toHaveBeenCalledWith(4);
      // Still 3 until the parent accepts it.
      expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();

      rerender(<Pagination totalItems={100} page={4} onPageChange={onPageChange} />);
      expect(screen.getByText('Page 4 of 10')).toBeInTheDocument();
    });

    it('starts from defaultPage and widens the window with siblingCount', () => {
      const { container } = render(<Pagination totalItems={200} defaultPage={10} siblingCount={2} />);
      expect(pageLabels(container)).toEqual(['1', '…', '8', '9', '10', '11', '12', '…', '20']);
    });

    it('clamps a page beyond the page count', () => {
      render(<Pagination totalItems={30} page={9} />);
      expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
      expect(screen.getByText('Items 21-30 of 30')).toBeInTheDocument();
    });

    it('handles zero items', () => {
      render(<Pagination totalItems={0} />);
      expect(screen.getByText('Page 0 of 0')).toBeInTheDocument();
      expect(screen.getByText('0 items')).toBeInTheDocument();
      for (const name of ['First page', 'Previous page', 'Next page', 'Last page', 'Go']) {
        expect(screen.getByRole('button', { name })).toBeDisabled();
      }
      expect(pageInput()).toBeDisabled();
      expect(pageInput()).toHaveValue('');
    });

    it('treats an invalid totalItems as zero', () => {
      render(<Pagination totalItems={Number.NaN} />);
      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('disables every control when disabled', () => {
      render(<Pagination totalItems={100} defaultPage={5} disabled />);
      expect(screen.getByRole('navigation')).toHaveAttribute('data-disabled', '');
      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
      expect(pageInput()).toBeDisabled();
    });
  });

  describe('page size', () => {
    it('changes the page size uncontrolled and keeps the first visible item', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      render(<Pagination totalItems={240} defaultPage={3} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);

      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['5', '10', '20', '50']);
      await user.click(screen.getByRole('option', { name: '50' }));

      // Item 21 was first on page 3 of 10; with 50 per page it is on page 1.
      expect(onPageChange).toHaveBeenCalledWith(1);
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      expect(screen.getByText('Items 1-50 of 240')).toBeInTheDocument();
    });

    it('does not move the page when the first item stays on it', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination totalItems={240} onPageChange={onPageChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      await user.click(screen.getByRole('option', { name: '20' }));
      expect(onPageChange).not.toHaveBeenCalled();
      expect(screen.getByText('Page 1 of 12')).toBeInTheDocument();
    });

    it('ignores picking the current size', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      render(<Pagination totalItems={240} onPageSizeChange={onPageSizeChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      await user.click(screen.getByRole('option', { name: '10' }));
      expect(onPageSizeChange).not.toHaveBeenCalled();
    });

    it('follows a controlled page size and folds it into the options', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      render(
        <Pagination totalItems={100} pageSize={25} onPageSizeChange={onPageSizeChange}>
          <Pagination.PageReport />
          <Pagination.PageSize options={[10, 50]} />
        </Pagination>,
      );
      expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['10', '25', '50']);
      await user.click(screen.getByRole('option', { name: '50' }));
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
    });

    it('falls back to the default size for an invalid pageSize', () => {
      render(<Pagination totalItems={100} pageSize={0} />);
      expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
    });

    it('works with controlled state', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [page, setPage] = useState(4);
        const [pageSize, setPageSize] = useState(10);
        return <Pagination totalItems={100} page={page} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />;
      };
      render(<Controlled />);
      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      await user.click(screen.getByRole('option', { name: '20' }));
      // Item 31 moves to page 2 of 5.
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });
  });

  describe('page jump', () => {
    it('applies a typed page on Enter and keeps digits only', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination totalItems={240} onPageChange={onPageChange} />);
      await user.clear(pageInput());
      await user.type(pageInput(), '1a-2');
      expect(pageInput()).toHaveValue('12');
      await user.keyboard('{Enter}');
      expect(onPageChange).toHaveBeenCalledWith(12);
      expect(pageInput()).toHaveValue('12');
    });

    it('rejects an out-of-range page and restores the current one', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination totalItems={30} onPageChange={onPageChange} />);
      await user.clear(pageInput());
      await user.type(pageInput(), '7{Enter}');
      expect(onPageChange).not.toHaveBeenCalled();
      expect(pageInput()).toHaveValue('1');
    });

    it('restores the current page when cleared', async () => {
      const user = userEvent.setup();
      render(<Pagination totalItems={30} />);
      await user.clear(pageInput());
      await user.keyboard('{Enter}');
      expect(pageInput()).toHaveValue('1');
    });

    it('applies the page from the submit button without losing focus first', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination totalItems={240} onPageChange={onPageChange} />);
      await user.clear(pageInput());
      await user.type(pageInput(), '5');
      await user.click(screen.getByRole('button', { name: 'Go' }));
      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('applies on blur by default', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination totalItems={240} onPageChange={onPageChange} />);
      await user.clear(pageInput());
      await user.type(pageInput(), '3');
      await user.tab();
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('restores on blur when applyOnBlur is false', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(
        <Pagination totalItems={240} onPageChange={onPageChange}>
          <Pagination.PageJump applyOnBlur={false} />
        </Pagination>,
      );
      await user.clear(pageInput());
      await user.type(pageInput(), '3');
      await user.tab();
      expect(onPageChange).not.toHaveBeenCalled();
      expect(pageInput()).toHaveValue('1');
    });

    it('sizes the field to the page count', () => {
      const { container } = render(<Pagination totalItems={12000} />);
      expect((container.querySelector('.tk-pagination-page-jump') as HTMLElement).style.getPropertyValue('--tk-pagination-digits')).toBe('4');
    });
  });

  describe('labels', () => {
    it('localizes every string through labels', () => {
      render(
        <Pagination
          totalItems={240}
          defaultPage={2}
          labels={{
            landmark: 'Sayfalama',
            pageStatus: 'Sayfa {page} / {pageCount}',
            itemsRange: '{start}-{end} / {total} kayıt',
            firstPage: 'İlk sayfa',
            previousPage: 'Önceki sayfa',
            nextPage: 'Sonraki sayfa',
            lastPage: 'Son sayfa',
            pageButton: '{page}. sayfaya git',
            currentPageButton: '{page}. sayfa, geçerli',
            rowsPerPage: 'Sayfa başına satır',
            pageJumpInput: 'Sayfaya git',
            pageJumpSubmit: 'Git',
          }}
        />,
      );
      expect(screen.getByRole('navigation', { name: 'Sayfalama' })).toBeInTheDocument();
      expect(screen.getByText('Sayfa 2 / 24')).toBeInTheDocument();
      expect(screen.getByText('11-20 / 240 kayıt')).toBeInTheDocument();
      for (const name of ['İlk sayfa', 'Önceki sayfa', 'Sonraki sayfa', 'Son sayfa', '1. sayfaya git', '2. sayfa, geçerli', 'Git']) {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      }
      expect(screen.getByRole('combobox', { name: 'Sayfa başına satır' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Sayfaya git' })).toBeInTheDocument();
    });

    it('localizes the empty item report and falls back on blank overrides', () => {
      render(<Pagination totalItems={0} labels={{ noItems: '{total} kayıt', landmark: '  ' }} />);
      expect(screen.getByText('0 kayıt')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('merges provider labels with instance labels per key', () => {
      render(
        <TakeoffSparProvider components={{ Pagination: { defaultProps: { labels: { nextPage: 'Sonraki', previousPage: 'Önceki' } } } }}>
          <Pagination totalItems={50} labels={{ nextPage: 'İleri' }} />
        </TakeoffSparProvider>,
      );
      expect(screen.getByRole('button', { name: 'İleri' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Önceki' })).toBeInTheDocument();
    });

    it('lets an explicit aria-label win on the root and edge buttons', () => {
      render(
        <Pagination totalItems={50} aria-label="Results pages">
          <Pagination.Next aria-label="Forward" />
        </Pagination>,
      );
      expect(screen.getByRole('navigation', { name: 'Results pages' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
    });
  });

  describe('customization', () => {
    it('lands classNames and slotProps on the owner nodes', () => {
      const { container } = render(
        <Pagination totalItems={100} classNames={{ root: 'custom-root' }} slotProps={{ root: { id: 'pager' } }}>
          <Pagination.Pages classNames={{ root: 'custom-pages', page: 'custom-page', ellipsis: 'custom-gap' }} slotProps={{ page: { title: 'page' } }} />
          <Pagination.PageJump classNames={{ root: 'custom-jump', submit: 'custom-submit' }} />
        </Pagination>,
      );
      expect(screen.getByRole('navigation')).toHaveClass('tk-pagination', 'custom-root');
      expect(screen.getByRole('navigation')).toHaveAttribute('id', 'pager');
      expect(container.querySelector('.tk-pagination-pages')).toHaveClass('custom-pages');
      expect(container.querySelectorAll('.custom-page')).toHaveLength(6);
      expect(container.querySelector('.tk-pagination-page')).toHaveAttribute('title', 'page');
      expect(container.querySelector('.tk-pagination-ellipsis')).toHaveClass('custom-gap');
      expect(container.querySelector('.tk-pagination-page-jump')).toHaveClass('custom-jump');
      expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('tk-pagination-page-jump-submit', 'custom-submit', 'tk-input-action');
    });

    it('applies provider defaultProps and part classNames', () => {
      render(
        <TakeoffSparProvider components={{ Pagination: { defaultProps: { type: 'text', rounded: true } }, PaginationNext: { classNames: { root: 'theme-next' } } }}>
          <Pagination totalItems={50} />
        </TakeoffSparProvider>,
      );
      expect(screen.getByRole('navigation')).toHaveAttribute('data-type', 'text');
      expect(screen.getByRole('navigation')).toHaveAttribute('data-rounded', '');
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass('tk-pagination-next', 'theme-next');
    });

    it('throws when a part is used outside the root', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Pagination.Controls />)).toThrow();
      expect(() => render(<Pagination.Info />)).toThrow();
      vi.restoreAllMocks();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every type and mode', async () => {
      const variants: Partial<PaginationProps>[] = [{}, { type: 'text' }, { type: 'grouped', rounded: true }, { mode: 'compact' }, { disabled: true }, { totalItems: 0 }];
      for (const variant of variants) {
        const { container, unmount } = render(<Pagination totalItems={240} defaultPage={6} {...variant} />);
        expect(await axe(container)).toHaveNoViolations();
        unmount();
      }
    });
  });
});
