import { SwitchRoot as SparSwitchRoot } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SwitchBase } from './base';
import { SwitchProvider } from './context';
import { DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { SwitchProps } from './types';

export const Switch = (props: SwitchProps) => {
  const theme = useComponentTheme('Switch');

  const { className, classNames, slotProps, size = DEFAULT_SIZE, variant = DEFAULT_VARIANT, invalid = false, children, ref, ...sparProps } = props;

  // `data-disabled` and `data-readonly` are intentionally NOT layered here:
  // Spar's SwitchRoot already emits them on the same element with the same
  // semantics. Wrapper owns the Takeoff visual hooks only.
  const { rootAttrs } = composeRootAttrs(SwitchBase, { className, classNames, slotProps }, theme, {
    stateAttrs: {
      'data-size': size,
      'data-variant': variant,
      'data-invalid': invalid ? '' : undefined,
    },
  });

  return (
    <SwitchProvider value={{ classNames, slotProps }}>
      <SparSwitchRoot {...sparProps} {...rootAttrs} ref={ref}>
        {children}
      </SparSwitchRoot>
    </SwitchProvider>
  );
};

Switch.displayName = 'Switch';
