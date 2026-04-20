import { describe, expectTypeOf, it } from 'vitest';

import type { AccordionProps } from '../components/accordion/types';
import { useComponentTheme } from '../provider';

import type { ComponentCustomizationRegistry, ComponentName, ComponentThemeConfig, ComponentsThemeMap } from './contracts';

describe('ComponentCustomizationRegistry — type surface', () => {
  it('narrows ComponentName to the registered set', () => {
    expectTypeOf<ComponentName>().toEqualTypeOf<'Accordion' | 'AccordionItem' | 'AccordionHeader' | 'AccordionTrigger' | 'AccordionContent'>();
  });

  it('binds each registry entry to its component props', () => {
    expectTypeOf<ComponentCustomizationRegistry['Accordion']>().toEqualTypeOf<ComponentThemeConfig<AccordionProps>>();
  });

  it('exposes every registry entry as an optional slot on ComponentsThemeMap', () => {
    expectTypeOf<ComponentsThemeMap['Accordion']>().toEqualTypeOf<ComponentThemeConfig<AccordionProps> | undefined>();
  });

  it('narrows useComponentTheme return by the passed component key', () => {
    const accordionConfig = useComponentTheme('Accordion');
    expectTypeOf(accordionConfig).toEqualTypeOf<ComponentThemeConfig<AccordionProps> | undefined>();
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

  it('rejects unknown component keys passed to useComponentTheme', () => {
    // @ts-expect-error 'Unknown' is not a registered component name
    useComponentTheme('Unknown');
  });
});
