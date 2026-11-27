import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  getPaginationItems,
  usePaginationContext,
  type PaginationProps,
} from '../index';

const Items = () => {
  const { items } = usePaginationContext();
  return <>{items.map(item => (typeof item === 'number' ? <PaginationItem key={item} page={item} /> : <PaginationEllipsis key={item} data-testid={item} />))}</>;
};

const Example = (props: Partial<PaginationProps>) => (
  <Pagination pageCount={10} {...props}>
    <PaginationFirst>First</PaginationFirst>
    <PaginationPrevious>Previous</PaginationPrevious>
    <Items />
    <PaginationNext>Next</PaginationNext>
    <PaginationLast>Last</PaginationLast>
  </Pagination>
);

const pageLabels = () => screen.getAllByRole('button').map(button => button.textContent);

describe('getPaginationItems', () => {
  it('lists every page when they fit in the window', () => {
    expect(getPaginationItems({ page: 1, pageCount: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPaginationItems({ page: 2, pageCount: 3 })).toEqual([1, 2, 3]);
    expect(getPaginationItems({ page: 1, pageCount: 1 })).toEqual([1]);
  });

  it('returns an empty range without pages', () => {
    expect(getPaginationItems({ page: 1, pageCount: 0 })).toEqual([]);
    expect(getPaginationItems({ page: 1, pageCount: Number.NaN })).toEqual([]);
  });

  it('keeps seven items around the current page', () => {
    expect(getPaginationItems({ page: 1, pageCount: 10 })).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
    expect(getPaginationItems({ page: 4, pageCount: 10 })).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
    expect(getPaginationItems({ page: 6, pageCount: 10 })).toEqual([1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 10]);
    expect(getPaginationItems({ page: 9, pageCount: 10 })).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('widens the window with siblingCount and boundaryCount', () => {
    expect(getPaginationItems({ page: 10, pageCount: 20, siblingCount: 2 })).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 20]);
    expect(getPaginationItems({ page: 10, pageCount: 20, boundaryCount: 2 })).toEqual([1, 2, 'start-ellipsis', 9, 10, 11, 'end-ellipsis', 19, 20]);
    expect(getPaginationItems({ page: 5, pageCount: 9, siblingCount: 0, boundaryCount: 0 })).toEqual(['start-ellipsis', 5, 'end-ellipsis']);
  });

  it('clamps an out-of-range page', () => {
    expect(getPaginationItems({ page: 99, pageCount: 10 })).toEqual(getPaginationItems({ page: 10, pageCount: 10 }));
    expect(getPaginationItems({ page: -3, pageCount: 10 })).toEqual(getPaginationItems({ page: 1, pageCount: 10 }));
    expect(getPaginationItems({ page: Number.NaN, pageCount: 10 })).toEqual(getPaginationItems({ page: 1, pageCount: 10 }));
  });
});

describe('Pagination', () => {
  it('renders a labelled navigation landmark', () => {
    render(<Example />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('accepts a custom label and element', () => {
    render(<Example as="div" role="navigation" aria-label="Results" />);
    expect(screen.getByRole('navigation', { name: 'Results' }).tagName).toBe('DIV');
  });

  it('marks the current page and disables the edges on the first page', () => {
    render(<Example />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('data-current', '');
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'First' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByTestId('end-ellipsis')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('end-ellipsis')).toHaveTextContent('…');
  });

  it('pages uncontrolled and fires onPageChange once per change', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Example defaultPage={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    expect(screen.getByRole('button', { name: '6' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);

    await user.click(screen.getByRole('button', { name: 'Last' }));
    expect(onPageChange).toHaveBeenLastCalledWith(10);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'First' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(onPageChange).toHaveBeenCalledTimes(5);
  });

  it('does not fire when the current page is pressed', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Example onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: '1' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('follows a controlled page and only requests changes', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const { rerender } = render(<Example page={2} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

    rerender(<Example page={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
  });

  it('works as a controlled component with state', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [page, setPage] = useState(1);
      return <Example page={page} onPageChange={setPage} />;
    };
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('clamps an out-of-range page into the page count', () => {
    render(<Example page={42} />);
    expect(screen.getByRole('button', { name: '10' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables every control without pages', () => {
    render(<Example pageCount={0} />);
    expect(pageLabels()).toEqual(['First', 'Previous', 'Next', 'Last']);
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });

  it('offers only backward moves while the page count is unknown', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Example pageCount={0} page={4} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'First' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('disables every control when disabled', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Example disabled defaultPage={5} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-disabled', '');
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('data-disabled', '');
    await user.click(screen.getByRole('button', { name: '6' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('lets a consumer onClick veto the page change', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(
      <Pagination pageCount={3} onPageChange={onPageChange}>
        <PaginationItem page={2} onClick={event => event.preventDefault()} />
        <PaginationNext onClick={event => event.preventDefault()}>Next</PaginationNext>
      </Pagination>,
    );
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('runs a consumer onClick before paging', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const onPageChange = jest.fn();
    render(
      <Pagination pageCount={3} onPageChange={onPageChange}>
        <PaginationItem page={2} onClick={onClick}>
          Two
        </PaginationItem>
      </Pagination>,
    );
    await user.click(screen.getByRole('button', { name: 'Two' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('ignores invalid setPage requests from the context', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const Jump = ({ to }: { to: number }) => {
      const { setPage } = usePaginationContext();
      return <button onClick={() => setPage(to)}>jump {to}</button>;
    };
    render(
      <Pagination pageCount={3} onPageChange={onPageChange}>
        <Jump to={0} />
        <Jump to={4} />
        <Jump to={Number.NaN} />
        <Jump to={2.7} />
      </Pagination>,
    );
    await user.click(screen.getByRole('button', { name: 'jump 0' }));
    await user.click(screen.getByRole('button', { name: 'jump 4' }));
    await user.click(screen.getByRole('button', { name: 'jump NaN' }));
    expect(onPageChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'jump 2.7' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders parts as other elements', () => {
    render(
      <Pagination pageCount={3}>
        <PaginationItem as="a" page={1} href="#1" />
        <PaginationEllipsis as="li">gap</PaginationEllipsis>
      </Pagination>,
    );
    expect(screen.getByText('1').tagName).toBe('A');
    expect(screen.getByText('gap').tagName).toBe('LI');
  });

  it('exposes the parts on the compound root', () => {
    expect(Pagination.Root).toBe(Pagination);
    expect(Pagination.Item).toBe(PaginationItem);
    expect(Pagination.First).toBe(PaginationFirst);
    expect(Pagination.Previous).toBe(PaginationPrevious);
    expect(Pagination.Next).toBe(PaginationNext);
    expect(Pagination.Last).toBe(PaginationLast);
    expect(Pagination.Ellipsis).toBe(PaginationEllipsis);
  });

  it('throws outside a Pagination', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<PaginationItem page={1} />)).toThrow('Pagination components must be used within a Pagination');
    spy.mockRestore();
  });
});
