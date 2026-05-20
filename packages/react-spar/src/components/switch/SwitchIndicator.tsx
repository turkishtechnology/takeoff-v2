import { buildSlotAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { useSwitchOwnContext } from './context';
import type { SwitchIndicatorProps } from './types';

export const SwitchIndicator = (props: SwitchIndicatorProps) => {
  const theme = useComponentTheme('Switch');
  const { classNames, slotProps, checked, disabled, readOnly } = useSwitchOwnContext('Switch.Indicator');
  const { className, children, ref, ...rest } = props;

  const indicatorAttrs = buildSlotAttrs(SwitchBase.getSlotProps('indicator', { className }), 'indicator', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  // Sliding thumb glyph used to live in a separate `Switch.Thumb` compound.
  // It has been folded here to mirror Checkbox's `Indicator` shape: a single
  // `<Switch.Indicator />` renders the canonical track + thumb anatomy, and
  // consumers customize it via `slotProps.thumb` / `classNames.thumb`, or by
  // passing `children` (ReactNode or render-prop) which replaces the inner
  // slot entirely.
  const thumbAttrs = buildSlotAttrs(SwitchBase.getSlotProps('thumb'), 'thumb', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const resolvedChildren = typeof children === 'function' ? children({ checked, disabled, readOnly }) : (children ?? <span {...thumbAttrs} aria-hidden />);

  return (
    <span {...rest} {...indicatorAttrs} ref={ref}>
      {resolvedChildren}
    </span>
  );
};

SwitchIndicator.displayName = 'Switch.Indicator';
