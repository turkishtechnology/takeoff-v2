import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Pagination, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from '../index';

expect.extend(toHaveNoViolations);

const Example = ({ disabled }: { disabled?: boolean }) => (
  <Pagination pageCount={10} defaultPage={6} disabled={disabled}>
    <PaginationPrevious aria-label="Previous page">‹</PaginationPrevious>
    <PaginationItem page={1} aria-label="Go to page 1" />
    <PaginationEllipsis />
    <PaginationItem page={6} aria-label="Page 6, current page" />
    <PaginationEllipsis />
    <PaginationItem page={10} aria-label="Go to page 10" />
    <PaginationNext aria-label="Next page">›</PaginationNext>
  </Pagination>
);

describe('Pagination Accessibility', () => {
  it('has no axe violations in default and disabled states', async () => {
    const { container, rerender } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Example disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
