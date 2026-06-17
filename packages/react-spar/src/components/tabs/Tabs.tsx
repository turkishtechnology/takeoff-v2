import type { ElementType } from 'react';
import { Tabs as SparTabs } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TabsBase } from './base';
import { TabsOwnProvider } from './context';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { TabsProps } from './types';

export const Tabs = <T extends ElementType = 'div'>(props: TabsProps<T>) => {
  const theme = useComponentTheme('Tabs');

  const { rootAttrs, rest } = composeRootAttrs(TabsBase, props as TabsProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE }) => ({
      'data-size': size,
      'data-variant': variant,
      'data-type': appearance,
    }),
  });

  const { size = DEFAULT_SIZE, variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, children, ref, ...sparProps } = rest;

  return (
    <TabsOwnProvider value={{ size, variant, appearance }}>
      <SparTabs {...sparProps} {...rootAttrs} ref={ref}>
        {children}
      </SparTabs>
    </TabsOwnProvider>
  );
};

Tabs.displayName = 'Tabs';
