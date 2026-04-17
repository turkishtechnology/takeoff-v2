import { describe, expectTypeOf, it } from 'vitest';

import type { ButtonProps, ButtonSlotProps } from '../components/button/types';
import type { ButtonSlot } from '../components/button/ButtonBase';
import { useComponentTheme } from '../provider';

import type { ComponentCustomizationRegistry, ComponentName, ComponentThemeConfig, ComponentsThemeMap } from './contracts';

describe('ComponentCustomizationRegistry — type surface', () => {
  it('narrows ComponentName to the registered set', () => {
    expectTypeOf<ComponentName>().toEqualTypeOf<'Button' | 'Accordion' | 'AccordionItem' | 'Checkbox' | 'Dialog' | 'Input'>();
  });

  it('binds each registry entry to its component props + slot + slotProps', () => {
    expectTypeOf<ComponentCustomizationRegistry['Button']>().toEqualTypeOf<ComponentThemeConfig<ButtonProps, ButtonSlot, ButtonSlotProps>>();
  });

  it('exposes every registry entry as an optional slot on ComponentsThemeMap', () => {
    expectTypeOf<ComponentsThemeMap['Button']>().toEqualTypeOf<ComponentThemeConfig<ButtonProps, ButtonSlot, ButtonSlotProps> | undefined>();
  });

  it('narrows useComponentTheme return by the passed component key', () => {
    const buttonConfig = useComponentTheme('Button');
    expectTypeOf(buttonConfig).toEqualTypeOf<ComponentThemeConfig<ButtonProps, ButtonSlot, ButtonSlotProps> | undefined>();
  });
});

describe('ComponentsThemeMap — compile-time rejection', () => {
  it('rejects unknown component keys on the map', () => {
    const theme: ComponentsThemeMap = {
      // @ts-expect-error 'FakeComponent' is not a registered component name
      FakeComponent: { classNames: {} },
    };
    void theme;
  });

  it('rejects unknown classNames slot keys on a registered component', () => {
    const theme: ComponentsThemeMap = {
      Button: {
        // @ts-expect-error 'noSuchSlot' is not a ButtonSlot
        classNames: { noSuchSlot: 'x' },
      },
    };
    void theme;
  });

  it('rejects unknown defaultProps fields on a registered component', () => {
    const theme: ComponentsThemeMap = {
      Button: {
        // @ts-expect-error 'bogusField' is not a ButtonProps field
        defaultProps: { bogusField: 1 },
      },
    };
    void theme;
  });

  it('rejects unknown slotProps slot keys on a registered component', () => {
    const theme: ComponentsThemeMap = {
      Button: {
        // @ts-expect-error 'notASlot' is not a Button slot
        slotProps: { notASlot: {} },
      },
    };
    void theme;
  });

  it('rejects unknown component keys passed to useComponentTheme', () => {
    // @ts-expect-error 'Unknown' is not a registered component name
    useComponentTheme('Unknown');
  });
});
