import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { BadgeBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { BadgeProps, BadgeSlot } from './types';

export const Badge = (props: BadgeProps) => {
  const theme = useComponentTheme('Badge');

  const { rootAttrs, rest } = composeRootAttrs<BadgeProps, BadgeSlot>(BadgeBase, props, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, size = DEFAULT_SIZE, rounded, dot }) => ({
      'data-variant': variant,
      'data-type': appearance,
      'data-size': dot ? undefined : size,
      'data-rounded': rounded ? '' : undefined,
      'data-dot': dot ? '' : undefined,
    }),
  });

  const { variant: _variant, appearance: _appearance, size: _size, rounded: _rounded, dot = false, startContent, endContent, children, ref, ...nativeProps } = rest;

  const labelSlotAttrs = buildSlotAttrs(BadgeBase.getSlotProps('label'), 'label' as BadgeSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const iconSlotAttrs = buildSlotAttrs(BadgeBase.getSlotProps('icon'), 'icon' as BadgeSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  if (dot) {
    return <span {...nativeProps} {...rootAttrs} ref={ref} />;
  }

  return (
    <span {...nativeProps} {...rootAttrs} ref={ref}>
      {isRenderableNode(startContent) && <span {...iconSlotAttrs}>{startContent}</span>}
      {isRenderableNode(children) && <span {...labelSlotAttrs}>{children}</span>}
      {isRenderableNode(endContent) && <span {...iconSlotAttrs}>{endContent}</span>}
    </span>
  );
};

Badge.displayName = 'Badge';
