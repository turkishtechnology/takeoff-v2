import type { ElementType } from 'react';
import { SelectSeparator as SparSelectSeparator } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectSeparatorBase } from './base';
import type { SelectSeparatorProps } from './types';

export const SelectSeparator = <T extends ElementType = 'div'>(props: SelectSeparatorProps<T>) => {
  const theme = useComponentTheme('SelectSeparator');

  const { rootAttrs, rest } = composeRootAttrs(SelectSeparatorBase, props as SelectSeparatorProps<'div'>, theme);

  const { children, ref, ...spar } = rest;

  // Spar renders `role="separator"`, but a `listbox` may only own `option` /
  // `group` children, so the documented anatomy (a separator inside
  // Select.Content / Select.Viewport) fails axe's aria-required-children rule.
  // The divider is purely visual: present it as a hidden presentational node
  // and drop Spar's `aria-orientation` (not allowed on a presentational role).
  // Spar spreads props after its own defaults, so these win — and a consumer
  // `role` / `aria-*` in `spar` still wins over them.
  return (
    <SparSelectSeparator role="presentation" aria-hidden="true" aria-orientation={undefined} {...spar} ref={ref} {...rootAttrs}>
      {children}
    </SparSelectSeparator>
  );
};

SelectSeparator.displayName = 'Select.Separator';
