import { Accordion as SparAccordion, type AccordionProps as SparAccordionProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionProvider } from './context';
import { DEFAULT_ARROW_POSITION, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = (props: AccordionProps) => {
  const theme = useComponentTheme('Accordion');
  const { rootAttrs, rest } = composeRootAttrs(AccordionBase, props, theme);

  const {
    type = DEFAULT_TYPE,
    mode = DEFAULT_MODE,
    size = DEFAULT_SIZE,
    arrowPosition = DEFAULT_ARROW_POSITION,
    hideArrows = false,
    expandIcon,
    collapseIcon,
    disabled = false,
    children,
    ...behavior
  } = rest;

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
      <SparAccordion
        {...(behavior as SparAccordionProps)}
        disabled={disabled}
        {...rootAttrs}
        data-mode={mode}
        data-size={size}
        data-arrow-position={arrowPosition}
        data-disabled={disabled ? '' : undefined}
      >
        {children}
      </SparAccordion>
    </AccordionProvider>
  );
};

Accordion.displayName = 'Accordion';
