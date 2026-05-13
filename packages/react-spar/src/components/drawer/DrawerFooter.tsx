import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerFooterBase } from './base';
import { DEFAULT_FOOTER_TYPE } from './defaults';
import type { DrawerFooterProps } from './types';

export const DrawerFooter = (props: DrawerFooterProps) => {
  const theme = useComponentTheme('DrawerFooter');

  const { rootAttrs, rest } = composeRootAttrs(DrawerFooterBase, props, theme);

  const { footerType = DEFAULT_FOOTER_TYPE, children, ref, ...footerProps } = rest;

  const finalRootAttrs = {
    ...rootAttrs,
    'data-footer-type': footerType,
  };

  return (
    <div {...footerProps} ref={ref} {...finalRootAttrs}>
      {children}
    </div>
  );
};

DrawerFooter.displayName = 'DrawerFooter';
