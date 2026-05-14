import type { ElementType } from 'react';
import { Accordion as SparAccordion } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionProvider } from './context';
import { DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');

  // `stateAttrs` runs against post-merge values, so theme.defaultProps for
  // visual props (type, mode, size) flow through into the rendered `data-*`
  // hooks.
  //
  // Note on `data-type`: takeoff-spar's `data-type="grouped"|"divided"` lives
  // on `AccordionItem`, not the root, because Spar's Accordion already emits
  // `data-type="multiple"|"single"` on its own root for behavior mode. Mixing
  // the two vocabularies on the same element would be ambiguous.
  const { rootAttrs, rest } = composeRootAttrs(AccordionBase, props as AccordionProps<'div'>, theme, {
    stateAttrs: ({ mode = DEFAULT_MODE, size = DEFAULT_SIZE, disabled }) => ({
      'data-mode': mode,
      'data-size': size,
      'data-disabled': disabled ? '' : undefined,
    }),
  });

  const {
    type = DEFAULT_TYPE,
    mode = DEFAULT_MODE,
    size = DEFAULT_SIZE,
    multiple = false,
    collapsible = true,
    disabled = false,
    children,
    ref,
    ...sparProps
  } = rest;

  return (
    <AccordionProvider
      value={{
        type,
        mode,
        size,
      }}
    >
      <SparAccordion {...sparProps} multiple={multiple} collapsible={collapsible} disabled={disabled} ref={ref} {...rootAttrs}>
        {children}
      </SparAccordion>
    </AccordionProvider>
  );
};

Accordion.displayName = 'Accordion';
