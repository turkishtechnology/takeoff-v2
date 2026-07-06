import type { ReactNode } from 'react';

/**
 * Whether a slot value should render a wrapper element.
 *
 * Preserves renderable falsy primitives such as `0` (a valid label/content),
 * while excluding values that render nothing useful: `null`, `undefined`,
 * booleans (the `cond && node` idiom collapses to `false`), the empty
 * string `''` (a stray empty wrapper that would disturb `:empty` selectors and
 * flex `gap` spacing), and arrays with no renderable items (`items.map(...)`
 * over an empty list, or `[cond && a, cond && b]` with every branch false).
 * Used by slot-bearing wrappers so the "is there content?" rule stays
 * consistent across components.
 */
export const isRenderableNode = (node: ReactNode): boolean =>
  Array.isArray(node) ? node.some(isRenderableNode) : node !== null && node !== undefined && node !== '' && typeof node !== 'boolean';
