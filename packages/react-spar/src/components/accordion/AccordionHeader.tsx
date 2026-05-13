import type { ElementType } from 'react';
import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeadingLevel, AccordionHeaderProps } from './types';

const DEFAULT_HEADING_LEVEL: AccordionHeadingLevel = 3;

// Runtime guard at the public library boundary: JS callers (or `as any` casts)
// can bypass the `AccordionHeadingLevel = 1..6` type and pass invalid values
// like `0`, `7`, or a string. Clamp to the default so we never render `<h7>`
// or hand Spar a non-integer level.
const isHeadingLevel = (level: unknown): level is AccordionHeadingLevel => typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 6;

const normalizeHeadingLevel = (level: AccordionHeaderProps['level']): AccordionHeadingLevel => (isHeadingLevel(level) ? level : DEFAULT_HEADING_LEVEL);

export const AccordionHeader = <T extends ElementType = 'h3'>(props: AccordionHeaderProps<T>) => {
  const theme = useComponentTheme('AccordionHeader');
  const { rootAttrs, rest } = composeRootAttrs(AccordionHeaderBase, props as AccordionHeaderProps<'h3'>, theme);
  const { children, level, ref, ...spar } = rest;
  const safeLevel = normalizeHeadingLevel(level);

  return (
    <SparAccordionHeader {...spar} level={safeLevel} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
