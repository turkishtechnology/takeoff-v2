import { describe, expect, it } from 'vitest';

import { render, screen } from '../test-utils';

import { renderPointerArrow } from './pointerArrow';

const renderArrow = () => {
  render(
    <svg data-testid="arrow" viewBox="0 0 10 5" aria-hidden="true">
      {renderPointerArrow()}
    </svg>,
  );
  return screen.getByTestId('arrow');
};

describe('renderPointerArrow', () => {
  it('renders the border layer then the fill layer as direct children of the arrow svg', () => {
    const arrow = renderArrow();
    const layers = Array.from(arrow.children);

    expect(layers.map(layer => layer.tagName.toLowerCase())).toEqual(['polygon', 'polygon']);
    expect(layers[0]).toHaveClass('tk-arrow-border');
    expect(layers[1]).toHaveClass('tk-arrow-fill');
  });

  it('draws the border layer as the full triangle of the 10x5 viewBox', () => {
    const border = renderArrow().querySelector('.tk-arrow-border');

    expect(border).toHaveAttribute('points', '0,0 5,5 10,0');
  });

  it('insets the fill layer from the outer edges and extends it past the base to cover the bubble seam', () => {
    const fill = renderArrow().querySelector('.tk-arrow-fill');

    expect(fill).toHaveAttribute('points', '-0.086,-1.5 5,3.586 10.086,-1.5');
  });

  it('keeps the fill 1px inside both outer edges and lifts its top corners 1.5px past the base', () => {
    const points = (renderArrow().querySelector('.tk-arrow-fill')?.getAttribute('points') ?? '').split(' ').map(pair => {
      const [x = Number.NaN, y = Number.NaN] = pair.split(',').map(Number);
      return { x, y };
    });

    // Signed perpendicular distance to the outer edges (0,0)->(5,5) and (10,0)->(5,5), positive inside the triangle.
    const insetFromLeftEdge = points.map(({ x, y }) => (x - y) / Math.SQRT2);
    const insetFromRightEdge = points.map(({ x, y }) => (10 - x - y) / Math.SQRT2);

    expect(points).toHaveLength(3);
    expect(insetFromLeftEdge[0]).toBeCloseTo(1, 2);
    expect(insetFromLeftEdge[1]).toBeCloseTo(1, 2);
    expect(insetFromRightEdge[1]).toBeCloseTo(1, 2);
    expect(insetFromRightEdge[2]).toBeCloseTo(1, 2);
    expect(points.map(({ y }) => y)).toEqual([-1.5, expect.any(Number), -1.5]);
    expect(points[1]?.x).toBe(5);
  });

  it('renders structure only and leaves the colour of each layer to the recipe', () => {
    const layers = Array.from(renderArrow().children);

    expect(layers).toHaveLength(2);
    for (const layer of layers) {
      expect(layer).not.toHaveAttribute('fill');
      expect(layer).not.toHaveAttribute('stroke');
      expect(layer).not.toHaveAttribute('style');
    }
  });
});
