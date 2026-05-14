import type { ElementType } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { RadioIndicatorBase } from './base';
import { useRadioItemOwnContext } from './context';
import type { RadioIndicatorProps } from './types';

export const RadioIndicator = <T extends ElementType = 'span'>(props: RadioIndicatorProps<T>) => {
  // Enforce the parent boundary — Radio.Indicator only makes sense inside a
  // Radio.Item (its visibility is driven by Spar's `data-state` on the item).
  useRadioItemOwnContext('Radio.Indicator');
  const theme = useComponentTheme('RadioIndicator');

  const { rootAttrs, rest } = composeRootAttrs(RadioIndicatorBase, props as RadioIndicatorProps<'span'>, theme);
  const { ref, as, ...spar } = rest;

  // Auto-render the internal `icon` decorative slot. CSS toggles its
  // visibility via Spar's `data-state="checked"` on the ancestor item.
  const iconAttrs = buildSlotAttrs(RadioIndicatorBase.getSlotProps('icon'), 'icon', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const Component = (as ?? 'span') as ElementType;

  return (
    <Component {...spar} {...rootAttrs} ref={ref} aria-hidden="true">
      <span {...iconAttrs} />
    </Component>
  );
};

RadioIndicator.displayName = 'Radio.Indicator';
