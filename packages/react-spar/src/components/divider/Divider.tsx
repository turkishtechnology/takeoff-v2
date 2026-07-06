import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { DividerBase } from './base';
import { DEFAULT_ALIGN, DEFAULT_APPEARANCE, DEFAULT_ORIENTATION } from './defaults';
import type { DividerProps, DividerSlot } from './types';

export const Divider = (props: DividerProps) => {
  const theme = useComponentTheme('Divider');

  const { rootAttrs, rest } = composeRootAttrs<DividerProps, DividerSlot>(DividerBase, props, theme, {
    // role/aria-orientation live here alongside the data-* hooks so consumer
    // slotProps cannot silently strip the separator semantics.
    stateAttrs: ({ orientation = DEFAULT_ORIENTATION, appearance = DEFAULT_APPEARANCE, align = DEFAULT_ALIGN, decorative = false }) => ({
      'role': decorative ? 'none' : 'separator',
      'aria-orientation': decorative ? undefined : orientation,
      'data-orientation': orientation,
      'data-type': appearance,
      'data-align': align,
    }),
  });

  const { orientation: _orientation, appearance: _appearance, align: _align, decorative: _decorative, children, ref, ...nativeProps } = rest;

  const labelSlotAttrs = buildSlotAttrs(DividerBase.getSlotProps('label'), 'label' as DividerSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <div {...nativeProps} {...rootAttrs} ref={ref}>
      {isRenderableNode(children) && <span {...labelSlotAttrs}>{children}</span>}
    </div>
  );
};

Divider.displayName = 'Divider';
