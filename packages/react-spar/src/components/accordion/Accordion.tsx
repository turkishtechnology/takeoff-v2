import { Accordion as SparAccordion } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionProvider } from './context';
import { DEFAULT_ARROW_POSITION, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionProps } from './types';

export const Accordion = (props: AccordionProps) => {
  const theme = useComponentTheme('Accordion');

  // Single destructure: visual props (cascade via context), customization layers
  // (consumed by composeRootAttrs), Spar behavior props, composition. `sparProps`
  // is everything else (Spar behavior overflow + native HTML attrs targeting root).
  // Stripping `className`/`classNames`/`slotProps` here prevents them from
  // leaking onto `<SparAccordion>` as unknown DOM attributes.
  const {
    type = DEFAULT_TYPE,
    mode = DEFAULT_MODE,
    size = DEFAULT_SIZE,
    arrowPosition = DEFAULT_ARROW_POSITION,
    hideArrows = false,
    expandIcon,
    collapseIcon,
    className,
    classNames,
    slotProps,
    multiple = false,
    collapsible = true,
    disabled = false,
    children,
    ref,
    ...sparProps
  } = props;

  const { rootAttrs } = composeRootAttrs(AccordionBase, { className, classNames, slotProps }, theme, {
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
      <SparAccordion {...sparProps} multiple={multiple} collapsible={collapsible} disabled={disabled} ref={ref} {...rootAttrs}>
        {children}
      </SparAccordion>
    </AccordionProvider>
  );
};

Accordion.displayName = 'Accordion';
