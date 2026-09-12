import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../test-utils';

import { isRenderableNode } from './isRenderableNode';

const LabelSlot = ({ children }: { children?: ReactNode }) => <div data-testid="host">{isRenderableNode(children) && <span data-slot="label">{children}</span>}</div>;

describe('isRenderableNode', () => {
  it.each<[string, ReactNode]>([
    ['null', null],
    ['undefined', undefined],
    ['true', true],
    ['false (the collapsed `cond && node` idiom)', false],
    ['an empty string', ''],
  ])('treats %s as nothing to render', (_label, node) => {
    expect(isRenderableNode(node)).toBe(false);
  });

  it.each<[string, ReactNode]>([
    ['the number 0', 0],
    ['a non-zero number', 42],
    ['a non-empty string', 'Label'],
    ['a React element', <span key="icon">Icon</span>],
  ])('treats %s as renderable content', (_label, node) => {
    expect(isRenderableNode(node)).toBe(true);
  });

  it('lets a slot-bearing wrapper render 0 as content but skip the wrapper for empty content', () => {
    const { rerender } = render(<LabelSlot>{0}</LabelSlot>);
    const host = screen.getByTestId('host');

    expect(host.querySelector('[data-slot="label"]')).toHaveTextContent('0');

    rerender(<LabelSlot>{''}</LabelSlot>);
    expect(host).toBeEmptyDOMElement();

    rerender(<LabelSlot>{false}</LabelSlot>);
    expect(host).toBeEmptyDOMElement();

    rerender(<LabelSlot />);
    expect(host).toBeEmptyDOMElement();
  });
});
