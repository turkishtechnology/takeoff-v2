import type { SVGAttributes } from 'react';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { buildSlotAttrs } from './buildSlotAttrs';
import type { ComponentThemeConfig, StateOnlyComponentThemeConfig } from './theme';
import type { ClassNamesMap, SlotPropsMap } from './types';

interface DemoProps {
  label: string;
  size?: 'small' | 'large';
}

// The theme config is a type-only contract. The `expectTypeOf` and
// `@ts-expect-error` assertions below are enforced by `tsc --noEmit`; the
// runtime assertions pin how a config of that shape is consumed.
describe('theme config types', () => {
  it('scopes a ComponentThemeConfig to the root slot by default', () => {
    expectTypeOf<ComponentThemeConfig<DemoProps>['classNames']>().toEqualTypeOf<ClassNamesMap<'root'> | undefined>();
    expectTypeOf<ComponentThemeConfig<DemoProps>['slotProps']>().toEqualTypeOf<SlotPropsMap<'root'> | undefined>();

    const theme: ComponentThemeConfig<DemoProps> = { className: 'product-demo', slotProps: { root: { title: 'Themed' } } };
    const attrs = buildSlotAttrs({ className: 'tk-demo' }, 'root', {
      themeClassName: theme.className,
      themeSlotProps: theme.slotProps,
    });

    expect(attrs).toEqual({ className: 'tk-demo product-demo', title: 'Themed' });
  });

  it('makes every default prop optional, including props the component requires', () => {
    expectTypeOf<ComponentThemeConfig<DemoProps>['defaultProps']>().toEqualTypeOf<Partial<DemoProps> | undefined>();

    const theme: ComponentThemeConfig<DemoProps> = { defaultProps: { size: 'large' } };

    expect(theme.defaultProps).toEqual({ size: 'large' });
  });

  it('keys classNames and slotProps by the declared slot union', () => {
    const theme: ComponentThemeConfig<DemoProps, 'root' | 'icon'> = { classNames: { icon: 'themed-icon' }, slotProps: { icon: { title: 'Icon' } } };

    // @ts-expect-error — slot keys outside the declared union are rejected
    const _unknownSlot: ComponentThemeConfig<DemoProps, 'root' | 'icon'> = { classNames: { label: 'themed-label' } };

    expect(buildSlotAttrs({ className: 'tk-demo-icon' }, 'icon', { themeClassNames: theme.classNames, themeSlotProps: theme.slotProps })).toEqual({
      className: 'tk-demo-icon themed-icon',
      title: 'Icon',
    });
  });

  it('narrows per-slot attributes through the TSlotProps parameter', () => {
    type ArrowSlotProps = SlotPropsMap<'root' | 'arrow', SVGAttributes<SVGSVGElement>>;
    type ArrowTheme = ComponentThemeConfig<DemoProps, 'root' | 'arrow', ArrowSlotProps>;

    expectTypeOf<ArrowTheme['slotProps']>().toEqualTypeOf<ArrowSlotProps | undefined>();

    // @ts-expect-error — the default HTML attribute map does not accept SVG-only attributes
    const _htmlOnly: ComponentThemeConfig<DemoProps, 'arrow'> = { slotProps: { arrow: { strokeWidth: 2 } } };

    const theme: ArrowTheme = { slotProps: { arrow: { strokeWidth: 2 } } };
    const attrs = buildSlotAttrs({ className: 'tk-demo-arrow' }, 'arrow', { themeSlotProps: theme.slotProps as SlotPropsMap<'root' | 'arrow'> });

    expect(attrs).toEqual({ className: 'tk-demo-arrow', strokeWidth: 2 });
  });

  it('exposes only defaultProps on a state-only root config', () => {
    expectTypeOf<keyof StateOnlyComponentThemeConfig<DemoProps>>().toEqualTypeOf<'defaultProps'>();

    // @ts-expect-error — state-only roots render no DOM, so styling layers are not accepted
    const _styled: StateOnlyComponentThemeConfig<DemoProps> = { className: 'product-demo' };

    const theme: StateOnlyComponentThemeConfig<DemoProps> = { defaultProps: { size: 'small' } };
    expect(Object.keys(theme)).toEqual(['defaultProps']);
  });
});
