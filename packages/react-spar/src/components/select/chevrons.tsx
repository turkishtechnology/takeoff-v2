import { type ReactNode } from 'react';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

// Default disclosure chevrons shared by the standalone `Select.Indicator` and
// the built-in `Select.Trigger` indicator so both entry points render an
// identical glyph. Sourced from the official Takeoff icon set
// (`@takeoff-icons/react`, outlined/rounded — the design system default
// variant). The icons size to `1em` and paint with `currentColor`, so the
// `tk-select-indicator` recipe controls their size and color. Mirrors the
// Accordion indicator.

/** Resolve the default chevron for the given open state. */
export const defaultIndicatorIcon = (isOpen: boolean): ReactNode => (isOpen ? <ChevronTopIconOutlinedRounded /> : <ChevronBottomIconOutlinedRounded />);
