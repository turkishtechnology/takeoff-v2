import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { RemoveIconOutlinedRounded } from '@takeoff-icons/react/remove';

import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CheckboxBase } from './base';
import { useCheckboxOwnContext } from './context';
import type { CheckboxIndicatorProps } from './types';

export const CheckboxIndicator = (props: CheckboxIndicatorProps) => {
  const theme = useComponentTheme('Checkbox');
  const { classNames, slotProps, checked, indeterminate } = useCheckboxOwnContext('Checkbox.Indicator');
  const { className, children, ref, ...rest } = props;

  const indicatorAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('indicator', { className }), 'indicator', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  // The check / dash glyph used to live in a separate `Checkbox.Icon` compound.
  // It has been folded here to mirror Radio's `Indicator` shape: a single
  // `<Checkbox.Indicator />` renders the default glyph, and consumers customize
  // it via `slotProps.icon` / `classNames.icon`, or by passing `children`
  // (ReactNode or render-prop) which replaces the inner slot entirely.
  const iconAttrs = buildSlotAttrs(CheckboxBase.getSlotProps('icon'), 'icon', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const resolvedChildren =
    typeof children === 'function'
      ? children({ checked, indeterminate })
      : (children ?? (
          <span {...iconAttrs} aria-hidden>
            {indeterminate ? <RemoveIconOutlinedRounded /> : <CheckIconOutlinedRounded />}
          </span>
        ));

  return (
    <span {...rest} {...indicatorAttrs} ref={ref}>
      {resolvedChildren}
    </span>
  );
};

CheckboxIndicator.displayName = 'Checkbox.Indicator';
