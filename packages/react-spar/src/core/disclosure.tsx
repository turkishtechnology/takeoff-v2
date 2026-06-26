import type { ReactNode } from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

/**
 * Shared disclosure-indicator primitives for the open/closed chevron used by
 * `Select` (trigger + standalone `Select.Indicator`) and `Accordion.Indicator`.
 *
 * The glyphs come from the official Takeoff icon set (`@takeoff-icons/react`,
 * outlined/rounded — the design-system default variant). They size to `1em` and
 * paint with `currentColor`, so each component's recipe (`tk-select-indicator`,
 * `tk-accordion-item-indicator`) drives their size and color. Keeping the
 * constants here is the single source of truth; the previous copies in three
 * files drifted independently.
 */
export const DEFAULT_DISCLOSURE_EXPAND_ICON = <ChevronBottomIconOutlinedRounded />;
export const DEFAULT_DISCLOSURE_COLLAPSE_ICON = <ChevronTopIconOutlinedRounded />;

/** Render state handed to a disclosure indicator's render-prop `children`. */
export interface DisclosureIndicatorRenderState {
  isOpen: boolean;
}

/**
 * Resolve a disclosure indicator's content: a render-function `children` is
 * called with `{ isOpen }`, an explicit node is used verbatim, and otherwise the
 * open-state default chevron is shown. Mirrors the (formerly duplicated) logic
 * in `Select.Indicator` and `Accordion.Indicator`.
 */
export const resolveDisclosureIndicator = (children: ReactNode | ((state: DisclosureIndicatorRenderState) => ReactNode) | undefined, isOpen: boolean): ReactNode => {
  if (typeof children === 'function') return children({ isOpen });
  return children ?? (isOpen ? DEFAULT_DISCLOSURE_COLLAPSE_ICON : DEFAULT_DISCLOSURE_EXPAND_ICON);
};
