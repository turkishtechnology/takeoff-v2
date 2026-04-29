import type { HTMLAttributes } from 'react';
import { describe, expectTypeOf, it } from 'vitest';

import type { AccordionProps } from '../components/accordion/types';
import { useComponentTheme } from '../provider';

import type { ComponentName, ComponentThemeConfig, ComponentThemeRegistry, ComponentsThemeMap } from './theme';
import type { ClassNamesMap, SlotPropsMap } from './types';

describe('ComponentThemeRegistry — type surface', () => {
  it('narrows ComponentName to the registered set', () => {
    expectTypeOf<ComponentName>().toEqualTypeOf<'Accordion' | 'AccordionItem' | 'AccordionHeader' | 'AccordionTrigger' | 'AccordionContent'>();
  });

  it('binds each registry entry to its component props', () => {
    expectTypeOf<ComponentThemeRegistry['Accordion']>().toEqualTypeOf<ComponentThemeConfig<AccordionProps>>();
  });

  it('exposes every registry entry as an optional slot on ComponentsThemeMap', () => {
    expectTypeOf<ComponentsThemeMap['Accordion']>().toEqualTypeOf<ComponentThemeConfig<AccordionProps> | undefined>();
  });

  it('narrows useComponentTheme return by the passed component key', () => {
    const accordionConfig = useComponentTheme('Accordion');
    expectTypeOf(accordionConfig).toEqualTypeOf<ComponentThemeConfig<AccordionProps> | undefined>();
  });
});

describe('ComponentThemeConfig — extended surfaces', () => {
  it('defaults TSlot to "root" so single-slot entries get a 1-key classNames map', () => {
    expectTypeOf<NonNullable<ComponentThemeConfig<AccordionProps>['classNames']>>().toEqualTypeOf<ClassNamesMap<'root'>>();
  });

  it('defaults TSlotProps to a generic HTMLAttributes map keyed by the slot union', () => {
    expectTypeOf<NonNullable<ComponentThemeConfig<AccordionProps>['slotProps']>>().toEqualTypeOf<SlotPropsMap<'root', HTMLAttributes<HTMLElement>>>();
  });

  it('keeps the legacy `className` shortcut on every entry', () => {
    expectTypeOf<ComponentThemeConfig<AccordionProps>['className']>().toEqualTypeOf<string | undefined>();
  });

  it('allows multi-slot widening when a component opts in', () => {
    type MultiSlotConfig = ComponentThemeConfig<AccordionProps, 'root' | 'arrow'>;
    expectTypeOf<NonNullable<MultiSlotConfig['classNames']>>().toEqualTypeOf<ClassNamesMap<'root' | 'arrow'>>();
  });
});

describe('ComponentsThemeMap — compile-time rejection', () => {
  it('rejects unknown component keys on the map', () => {
    const theme: ComponentsThemeMap = {
      // @ts-expect-error 'FakeComponent' is not a registered component name
      FakeComponent: { className: 'x' },
    };
    void theme;
  });

  it('rejects non-string className on a registered component', () => {
    const theme: ComponentsThemeMap = {
      Accordion: {
        // @ts-expect-error className must be a string
        className: 1,
      },
    };
    void theme;
  });

  it('rejects unknown defaultProps fields on a registered component', () => {
    const theme: ComponentsThemeMap = {
      Accordion: {
        // @ts-expect-error 'bogusField' is not an AccordionProps field
        defaultProps: { bogusField: 1 },
      },
    };
    void theme;
  });

  it('rejects unknown slot keys on classNames', () => {
    const theme: ComponentsThemeMap = {
      Accordion: {
        classNames: {
          // @ts-expect-error 'header' is not a slot of single-slot Accordion entry
          header: 'x',
        },
      },
    };
    void theme;
  });

  it('rejects unknown slot keys on slotProps', () => {
    const theme: ComponentsThemeMap = {
      Accordion: {
        slotProps: {
          // @ts-expect-error 'header' is not a slot of single-slot Accordion entry
          header: { id: 'x' },
        },
      },
    };
    void theme;
  });

  it('rejects unknown component keys passed to useComponentTheme', () => {
    // @ts-expect-error 'Unknown' is not a registered component name
    useComponentTheme('Unknown');
  });
});
