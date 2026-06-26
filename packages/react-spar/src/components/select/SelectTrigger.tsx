import { type ElementType, type ReactNode } from 'react';
import { SelectTrigger as SparSelectTrigger, type SelectTriggerRenderProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs, DEFAULT_DISCLOSURE_COLLAPSE_ICON, DEFAULT_DISCLOSURE_EXPAND_ICON } from '../../core';
import { useComponentTheme } from '../../provider';

import { SelectTriggerBase } from './base';
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

  // A render-prop `children` means the consumer is taking over the trigger's
  // layout (the documented "full layout control" path — drop a standalone
  // `<Select.Indicator />` in yourself). Auto-wrapping it in `tk-select-value`
  // and appending our own chevron would nest the value span and double the
  // indicator, so we step back and forward the render-prop to Spar verbatim.
  const consumerOwnsLayout = typeof children === 'function';

  // No indicator, or the consumer owns the layout → forward children/placeholder
  // to Spar verbatim so the primitive keeps full control of the auto
  // value/placeholder rendering and we add nothing of our own.
  if (!showIndicator || consumerOwnsLayout) {
    return (
      <SparSelectTrigger {...spar} ref={ref} {...rootAttrs}>
        {children as ReactNode}
      </SparSelectTrigger>
    );
  }

  const resolveIndicatorNode = (state: SelectIndicatorRenderState): ReactNode => {
    if (indicator === undefined || indicator === true) return state.isOpen ? DEFAULT_DISCLOSURE_COLLAPSE_ICON : DEFAULT_DISCLOSURE_EXPAND_ICON;
    if (typeof indicator === 'function') return (indicator as (s: SelectIndicatorRenderState) => ReactNode)(state);
    return indicator as ReactNode;
  };

  const slotLayers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };
  const valueAttrs = buildSlotAttrs(SelectTriggerBase.getSlotProps('value'), 'value', slotLayers);
  const indicatorAttrs = buildSlotAttrs(SelectTriggerBase.getSlotProps('indicator'), 'indicator', slotLayers);

  // With an indicator we must compose the trigger content ourselves. Spar
  // renders `children` OR the auto label/placeholder, never both — so we drive
  // Spar's render-prop form to reconstruct the value region (`label ||
  // placeholder`, or the consumer's own children) and append the indicator as
  // a trailing sibling inside the button.
  return (
    <SparSelectTrigger {...spar} ref={ref} {...rootAttrs}>
      {(state: SelectTriggerRenderProps) => {
        // `children` here is a node (the render-prop form forwards verbatim
        // above). Reconstruct the value region: explicit children, else the
        // auto label, else the placeholder. `||` (not `??`) so an empty-string
        // label falls through to the placeholder — matching Spar's own auto
        // value behavior.
        const value: ReactNode = children ?? (state.label || spar.placeholder);

        return (
          <>
            {/* Truncating value region — keeps long selections from shoving the
                indicator out of the trigger (the `space-between` layout pins
                the indicator to the trailing edge). */}
            <span {...valueAttrs}>{value}</span>
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
