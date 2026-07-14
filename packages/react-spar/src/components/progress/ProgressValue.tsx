import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ProgressValueBase } from './base';
import { useProgressContext } from './context';
import type { ProgressValueProps } from './types';

export const ProgressValue = (props: ProgressValueProps) => {
  const theme = useComponentTheme('ProgressValue');
  const { appearance } = useProgressContext('Progress.Value');

  // Placement is the recipe's job, keyed off the part's own data-type (in
  // flow next to the linear track, centered overlay inside the circular
  // ring).
  const { rootAttrs, rest } = composeRootAttrs(ProgressValueBase, props, theme, {
    stateAttrs: () => ({ 'data-type': appearance }),
  });
  const { children, ref, ...nativeProps } = rest;

  // Decorative by design: the value is announced through the root's
  // aria-valuenow, so the visual value text stays hidden from assistive
  // tech. The aria-hidden is a design-system invariant — layered after the
  // spreads so instance props cannot override it.
  return (
    <span {...nativeProps} {...rootAttrs} aria-hidden="true" ref={ref}>
      {children}
    </span>
  );
};

ProgressValue.displayName = 'Progress.Value';
