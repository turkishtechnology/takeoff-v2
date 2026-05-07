import type { Ref } from 'react';

import { describe, expectTypeOf, it } from 'vitest';

import type {
  AccordionActiveIndex,
  AccordionActiveIndexChangeHandler,
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
} from './types';

describe('Accordion public type surface', () => {
  it('requires explicit itemKey on Accordion.Item', () => {
    expectTypeOf<AccordionItemProps['itemKey']>().toEqualTypeOf<string | number>();

    const valid: AccordionItemProps = { itemKey: 'faq' };
    void valid;

    // @ts-expect-error itemKey is required for React consumers.
    const missing: AccordionItemProps = {};
    void missing;
  });

  it('keeps Web Component shortcuts out of the React surface', () => {
    const itemProps: AccordionItemProps = { itemKey: 'faq' };
    const rootProps: AccordionProps = {};

    // @ts-expect-error item-level active state conflicts with root controlled state.
    itemProps.active = true;
    // @ts-expect-error React uses compound children instead of a header prop.
    itemProps.header = 'FAQ';
    // @ts-expect-error React uses onActiveIndexChange, not custom event names.
    rootProps.onTkActiveIndexChange = () => undefined;
  });

  it('exports the active-index change handler and narrows heading levels', () => {
    expectTypeOf<AccordionActiveIndexChangeHandler>().toEqualTypeOf<(next: AccordionActiveIndex) => void>();
    expectTypeOf<AccordionHeaderProps['level']>().toEqualTypeOf<1 | 2 | 3 | 4 | 5 | 6 | undefined>();
  });

  it('types refs to the canonical owner element on every public part', () => {
    expectTypeOf<AccordionProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>();
    expectTypeOf<AccordionItemProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>();
    expectTypeOf<AccordionHeaderProps['ref']>().toEqualTypeOf<Ref<HTMLHeadingElement> | undefined>();
    expectTypeOf<AccordionTriggerProps['ref']>().toEqualTypeOf<Ref<HTMLButtonElement> | undefined>();
    expectTypeOf<AccordionContentProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>();
  });
});
