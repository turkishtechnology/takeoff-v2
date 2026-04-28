import type { ElementType } from 'react';

import { Accordion as SparAccordion, type AccordionProps as SparAccordionProps } from '@turkish-technology/spar';

import { buildSlotAttrs } from '../../customization';
import { useComponentTheme } from '../../provider';
import { useDeprecationWarning } from '../../utils';

import { AccordionBase } from './base';
import { AccordionVariantProvider } from './context';
import { DEFAULT_MODE, DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { AccordionMode, AccordionProps, AccordionType } from './types';

const LEGACY_COMPACT_TYPE_MESSAGE =
  '[react-spar] Accordion `type="compact"` is deprecated. Use `mode="compact"` instead. The legacy value will be removed in the next major release.';

/**
 * Map a legacy `type='compact'` to the canonical `(type='grouped', mode='compact')`
 * pair. When the explicit `mode` prop is also passed it wins, so consumers can
 * opt into the new vocabulary without losing the deprecation signal.
 */
const normalizeTypeAndMode = (type: AccordionType, mode: AccordionMode | undefined): { type: Exclude<AccordionType, 'compact'>; mode: AccordionMode } => {
  if (type === 'compact') {
    return { type: 'grouped', mode: mode ?? 'compact' };
  }
  return { type, mode: mode ?? DEFAULT_MODE };
};

export const Accordion = <T extends ElementType = 'div'>(props: AccordionProps<T>) => {
  const theme = useComponentTheme('Accordion');
  const merged = AccordionBase.resolveProps(props as AccordionProps, theme?.defaultProps) as AccordionProps<T>;
  const { type = DEFAULT_TYPE, mode, size = DEFAULT_SIZE, className, children, ...rest } = merged;

  useDeprecationWarning(type === 'compact', LEGACY_COMPACT_TYPE_MESSAGE);

  const { type: effectiveType, mode: effectiveMode } = normalizeTypeAndMode(type, mode);

  const rootAttrs = buildSlotAttrs(AccordionBase.getSlotProps('root', { className }), theme?.slotProps, 'root', theme?.classNames?.root ?? theme?.className);

  return (
    <AccordionVariantProvider value={{ type: effectiveType, mode: effectiveMode, size }}>
      {/*
        Spar owns `data-type` on the root for its `single`/`multiple` state
        discriminator (see component-api-audit row 13 + ADR-0003). The wrapper's
        `type` styling hook lives on `Accordion.Item` instead. `data-mode` and
        `data-size` are wrapper-only and safe to emit on the root.
      */}
      <SparAccordion {...(rest as SparAccordionProps<T>)} {...rootAttrs} data-mode={effectiveMode} data-size={size}>
        {children}
      </SparAccordion>
    </AccordionVariantProvider>
  );
};

Accordion.displayName = 'Accordion';
