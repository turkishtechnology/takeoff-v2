import { type ElementType, type ReactNode } from 'react';
import { SelectTrigger as SparSelectTrigger, type SelectTriggerRenderProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectTriggerBase } from './base';
import { defaultIndicatorIcon } from './chevrons';
import { useSelectOwnContext } from './context';
import type { SelectIndicatorRenderState, SelectTriggerProps } from './types';

export const SelectTrigger = <T extends ElementType = 'button'>(props: SelectTriggerProps<T>) => {
  const theme = useComponentTheme('SelectTrigger');
  const { size, invalid } = useSelectOwnContext('Select.Trigger');

  // The trigger is what consumers visually see — mirror the root's size and
  // invalid state here so styling can hook off the interactive element
  // directly without crawling up to the (often headless) root.
  const { rootAttrs, rest } = composeRootAttrs(SelectTriggerBase, props as SelectTriggerProps<'button'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
      'data-invalid': invalid ? '' : undefined,
    }),
  });

  const { children, indicator, ref, ...spar } = rest;

  // `false` / `null` opt out entirely; anything else (incl. `undefined`/`true`)
  // shows an indicator. The default is the open-state-aware chevron, matching
  // `Accordion.Indicator`.
  const showIndicator = indicator !== false && indicator !== null;

  // No indicator → forward children/placeholder to Spar verbatim so the
  // primitive keeps full control of the auto value/placeholder rendering.
  if (!showIndicator) {
    return (
      <SparSelectTrigger {...spar} ref={ref} {...rootAttrs}>
        {children as ReactNode}
      </SparSelectTrigger>
    );
  }

  const resolveIndicatorNode = (state: SelectIndicatorRenderState): ReactNode => {
    if (indicator === undefined || indicator === true) return defaultIndicatorIcon(state.isOpen);
    if (typeof indicator === 'function') return (indicator as (s: SelectIndicatorRenderState) => ReactNode)(state);
    return indicator as ReactNode;
  };

  const indicatorAttrs = buildSlotAttrs(SelectTriggerBase.getSlotProps('indicator'), 'indicator', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // With an indicator we must compose the trigger content ourselves. Spar
  // renders `children` OR the auto label/placeholder, never both — so we drive
  // Spar's render-prop form to reconstruct the value region (`label ??
  // placeholder`, or the consumer's own children) and append the indicator as
  // a trailing sibling inside the button.
  return (
    <SparSelectTrigger {...spar} ref={ref} {...rootAttrs}>
      {(state: SelectTriggerRenderProps) => {
        const value: ReactNode = typeof children === 'function' ? children(state) : (children ?? state.label ?? spar.placeholder);

        return (
          <>
            {/* Truncating value region — keeps long selections from shoving the
                indicator out of the trigger (the `space-between` layout pins
                the indicator to the trailing edge). */}
            <span className="tk-select-value">{value}</span>
            <span {...indicatorAttrs} aria-hidden="true">
              {resolveIndicatorNode({ isOpen: state.isOpen })}
            </span>
          </>
        );
      }}
    </SparSelectTrigger>
  );
};

SelectTrigger.displayName = 'Select.Trigger';
