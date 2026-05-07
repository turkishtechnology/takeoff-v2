import { AccordionHeader as SparAccordionHeader } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionHeaderBase } from './base';
import type { AccordionHeadingLevel, AccordionHeaderProps } from './types';

const DEFAULT_HEADING_LEVEL: AccordionHeadingLevel = 3;

const isHeadingLevel = (level: unknown): level is AccordionHeadingLevel => typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 6;

const normalizeHeadingLevel = (level: AccordionHeaderProps['level']): AccordionHeadingLevel => (isHeadingLevel(level) ? level : DEFAULT_HEADING_LEVEL);

export const AccordionHeader = (props: AccordionHeaderProps) => {
  const theme = useComponentTheme('AccordionHeader');
  const { rootAttrs, rest } = composeRootAttrs(AccordionHeaderBase, props, theme);
  const { children, level, ref, ...spar } = rest;
  const safeLevel = normalizeHeadingLevel(level);

  return (
    <SparAccordionHeader {...spar} level={safeLevel} {...rootAttrs} ref={ref}>
      {children}
    </SparAccordionHeader>
  );
};

AccordionHeader.displayName = 'Accordion.Header';
