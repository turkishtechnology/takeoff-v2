import { Accordion as SparAccordion, type AccordionProps as SparAccordionProps } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionProvider } from './context';
import { DEFAULT_ARROW_POSITION, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = (props: AccordionProps) => {
  const theme = useComponentTheme('Accordion');

  const {
    type = DEFAULT_TYPE,
    mode = DEFAULT_MODE,
    size = DEFAULT_SIZE,
    arrowPosition = DEFAULT_ARROW_POSITION,
    hideArrows = false,
    expandIcon,
    collapseIcon,
    multiple = false,
    collapsible = false,
    disabled = false,
    children,
    ...behavior
  } = props;

  const { rootAttrs, rest } = composeRootAttrs(AccordionBase, behavior as AccordionProps, theme, {
    stateAttrs: {
      'data-mode': mode,
      'data-size': size,
      'data-arrow-position': arrowPosition,
      'data-disabled': disabled ? '' : undefined,
    },
  });

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
        {...(rest as SparAccordionProps)}
        selectionMode={multiple ? 'multiple' : 'single'}
        isCollapsible={collapsible}
        disabled={disabled}
        {...rootAttrs}
      >
        {children}
      </SparAccordion>
    </AccordionProvider>
  );
};

Accordion.displayName = 'Accordion';
