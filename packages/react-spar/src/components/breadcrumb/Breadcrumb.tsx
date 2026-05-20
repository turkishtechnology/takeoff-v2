import type { ElementType } from 'react';
import { Breadcrumb as SparBreadcrumb } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { BreadcrumbBase } from './base';
import { BreadcrumbProvider } from './context';
import { DEFAULT_SIZE } from './defaults';
import type { BreadcrumbProps } from './types';

export const Breadcrumb = <T extends ElementType = 'nav'>(props: BreadcrumbProps<T>) => {
  const theme = useComponentTheme('Breadcrumb');

  const { rootAttrs, rest } = composeRootAttrs(BreadcrumbBase, props as BreadcrumbProps<'nav'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, disabled }) => ({
      'data-size': size,
      'data-disabled': disabled ? '' : undefined,
    }),
  });

  const { size = DEFAULT_SIZE, children, ref, ...sparProps } = rest;

  return (
    <BreadcrumbProvider value={{ size }}>
      <SparBreadcrumb {...sparProps} ref={ref} {...rootAttrs}>
        {children}
      </SparBreadcrumb>
    </BreadcrumbProvider>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
