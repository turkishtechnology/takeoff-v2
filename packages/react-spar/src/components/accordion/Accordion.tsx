import { Accordion as SparAccordion, type AccordionProps as SparAccordionProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../core';
import { useDeprecationWarning } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { AccordionBase } from './base';
import { AccordionVariantProvider } from './context';
import { DEFAULT_ARROW_POSITION, DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionMode, AccordionProps, AccordionType } from './types';

const LEGACY_COMPACT_TYPE_MESSAGE =
  '[react-spar] Accordion `type="compact"` is deprecated. Use `mode="compact"` instead. The legacy value will be removed in the next major release.';

// Map the deprecated `type='compact'` shorthand to its canonical
// `(type='grouped', mode='compact')` pair. An explicit `mode` always wins.
const normalizeTypeAndMode = (type: AccordionType, mode: AccordionMode | undefined): { type: Exclude<AccordionType, 'compact'>; mode: AccordionMode } => {
  if (type === 'compact') {
    return { type: 'grouped', mode: mode ?? 'compact' };
  }
  return { type, mode: mode ?? DEFAULT_MODE };
};

export const Accordion = (props: AccordionProps) => {
  const theme = useComponentTheme('Accordion');
  const merged = AccordionBase.resolveProps(props, theme?.defaultProps);
  const {
    type = DEFAULT_TYPE,
    mode,
    size = DEFAULT_SIZE,
    arrowPosition = DEFAULT_ARROW_POSITION,
    hideArrows = false,
    expandIcon,
    collapseIcon,
    classNames,
    slotProps,
    className,
    children,
    ...behavior
  } = merged;

  useDeprecationWarning(type === 'compact', LEGACY_COMPACT_TYPE_MESSAGE);

  const { type: effectiveType, mode: effectiveMode } = normalizeTypeAndMode(type, mode);

  const rootAttrs = buildSlotAttrs(AccordionBase.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <AccordionVariantProvider
      value={{
        type: effectiveType,
        mode: effectiveMode,
        size,
        arrowPosition,
        hideArrows,
        expandIcon,
        collapseIcon,
      }}
    >
      <SparAccordion {...(behavior as SparAccordionProps)} {...rootAttrs} data-mode={effectiveMode} data-size={size} data-arrow-position={arrowPosition}>
        {children}
      </SparAccordion>
    </AccordionVariantProvider>
  );
};

Accordion.displayName = 'Accordion';
