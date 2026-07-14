import type { ReactNode } from 'react';

/**
 * Default content for the floating pointer arrow shared by `Tooltip.Arrow` and
 * `Popover.Arrow`. Spar renders the arrow as `<svg viewBox="0 0 10 5">` and uses
 * whatever children we pass (falling back to a single filled `<polygon>` when we
 * pass none). We supply two polygons so the arrow gains a border on its two outer
 * edges while staying seamless where it joins the bubble:
 *
 *   - Border layer (`.tk-arrow-border`) — the full triangle `0,0 5,5 10,0`.
 *   - Fill layer (`.tk-arrow-fill`) — inset ~1px perpendicular from the two outer
 *     edges (leaving a 1px border rim) and extended ~1.5px past the base into the
 *     content. The arrow is the content's last child, so it paints above the
 *     bubble's border; that overhang covers the bubble's own border across the
 *     neck, so the outline opens into the arrow instead of drawing a seam line.
 *
 * This helper renders structure only — no color. The recipe paints each layer per
 * variant off the `[data-variant]` cascade (fill via `currentColor`, border via
 * `.tk-arrow-border { fill }`), the same way the rest of the recipe colors slots.
 *
 * Geometry is fixed for the 10×5 viewBox. Outer edges are (0,0)->(5,5) and
 * (10,0)->(5,5); insetting each 1px inward gives the lines `y = x - √2` and
 * `x + y = 10 - √2`, which meet at the inset apex (5, 3.586). Extending those
 * lines up to `y = -1.5` gives the fill's top corners (-0.086, -1.5) and
 * (10.086, -1.5). `overflow: visible` on `.tk-*-arrow` (set in the recipe) keeps
 * the overhang and tip from being clipped at the viewBox edge.
 */
export const renderPointerArrow = (): ReactNode => (
  <>
    <polygon className="tk-arrow-border" points="0,0 5,5 10,0" />
    <polygon className="tk-arrow-fill" points="-0.086,-1.5 5,3.586 10.086,-1.5" />
  </>
);
