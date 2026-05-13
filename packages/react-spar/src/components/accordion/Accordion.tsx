import type { ElementType } from 'react';
import { Accordion as SparAccordion } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionProvider } from './context';
import { DEFAULT_ARROW_POSITION, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');

  // Resolve `(author defaults → theme defaults → instance props)` in
  // composeRootAttrs, then destructure from `rest` so theme.defaultProps for
  // visual props (type, mode, size, arrowPosition, hideArrows) actually
  // applies. Destructuring from `props` directly bypasses the theme layer.
  const { rootAttrs: baseRootAttrs, rest } = composeRootAttrs(AccordionBase, props as AccordionProps<'div'>, theme);

  const {
    type = DEFAULT_TYPE,
    mode = DEFAULT_MODE,
    size = DEFAULT_SIZE,
    arrowPosition = DEFAULT_ARROW_POSITION,
    hideArrows = false,
    expandIcon,
    collapseIcon,
    multiple = false,
    collapsible = true,
    disabled = false,
    children,
    ref,
    ...sparProps
  } = rest;

  // Layer canonical state-driven `data-*` after the theme-merged values are
  // known. Canonical attrs still win over any `slotProps.root` override
  // because they spread last on the SparAccordion element.
  //
  // Note on `data-type`: takeoff-spar's `data-type="grouped"|"divided"` lives
  // on `AccordionItem`, not the root, because Spar's Accordion already emits
  // `data-type="multiple"|"single"` on its own root for behavior mode. Mixing
  // the two vocabularies on the same element would be ambiguous.
  const rootAttrs = {
    ...baseRootAttrs,
    'data-mode': mode,
    'data-size': size,
    'data-arrow-position': arrowPosition,
    'data-disabled': disabled ? '' : undefined,
    'data-hide-arrows': hideArrows ? '' : undefined,
  };

  return (
    <AccordionProvider
      value={{
        type,
        mode,
        size,
        arrowPosition,
        hideArrows,
        expandIcon,
        collapseIcon,
      }}
    >
      <SparAccordion {...sparProps} multiple={multiple} collapsible={collapsible} disabled={disabled} ref={ref} {...rootAttrs}>
        {children}
      </SparAccordion>
    </AccordionProvider>
  );
};

Accordion.displayName = 'Accordion';
