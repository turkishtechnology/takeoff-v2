import { useMemo, type ElementType } from 'react';
import { Breadcrumb as SparBreadcrumb } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbBase } from './base';
import { BreadcrumbProvider } from './context';
import { DEFAULT_SIZE, DEFAULT_TYPE } from './defaults';
import type { BreadcrumbProps } from './types';

export const Breadcrumb = <T extends ElementType = 'nav'>(props: BreadcrumbProps<T>) => {
  const theme = useComponentTheme('Breadcrumb');

  // `disabled` stays in sparProps so Spar's <nav> owns both `data-disabled` and
  // `aria-disabled` (and cascades disable to the links). The wrapper owns only
  // the visual `data-size` / `data-type` variants.
  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbBase, props as BreadcrumbProps<'nav'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, type = DEFAULT_TYPE }) => ({
      'data-size': size,
      'data-type': type,
    }),
  });

  const { size = DEFAULT_SIZE, type = DEFAULT_TYPE, children, ref, ...sparProps } = rest;

  const contextValue = useMemo(() => ({ size, type }), [size, type]);

  return (
    <BreadcrumbProvider value={contextValue}>
      <SparBreadcrumb {...sparProps} ref={ref} {...rootAttrs}>
        {children}
      </SparBreadcrumb>
    </BreadcrumbProvider>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
