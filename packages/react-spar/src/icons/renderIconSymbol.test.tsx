import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderIconSymbol } from './renderIconSymbol';

describe('renderIconSymbol', () => {
  it('should wrap string icon in a span with symbol class and data-icon-kind', () => {
    render(<>{renderIconSymbol('home', 'my-icon-class')}</>);
    const span = screen.getByText('home');
    expect(span.tagName).toBe('SPAN');
    expect(span.className).toBe('my-icon-class');
    expect(span).toHaveAttribute('data-icon-kind', 'symbol');
  });

  it('should return ReactNode icon as-is', () => {
    render(<>{renderIconSymbol(<span data-testid="custom">Custom</span>, 'my-icon-class')}</>);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByText('my-icon-class')).not.toBeInTheDocument();
  });

  it('should return null/undefined as-is', () => {
    const { container } = render(<>{renderIconSymbol(null, 'my-icon-class')}</>);
    expect(container.innerHTML).toBe('');
  });
});
