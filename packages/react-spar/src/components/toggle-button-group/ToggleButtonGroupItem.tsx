import type { ElementType } from 'react';
import { ToggleGroupItem as SparToggleGroupItem, type ToggleGroupItemProps as SparToggleGroupItemProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { ToggleButtonGroupItemBase } from './base';
import { useToggleButtonGroupOwnContext } from './context';
import type { ToggleButtonGroupItemProps, ToggleButtonGroupItemSlot } from './types';

export const ToggleButtonGroupItem = <T extends ElementType = 'button'>(props: ToggleButtonGroupItemProps<T>) => {
  const theme = useComponentTheme('ToggleButtonGroupItem');
  const group = useToggleButtonGroupOwnContext('ToggleButtonGroup.Item');

  // The group's visual props are duplicated onto each item (Radio / Accordion
  // precedent) so the recipe styles an item without an ancestor lookup and a
  // per-item override wins.
  const { rootAttrs, rest } = composeRootAttrs<ToggleButtonGroupItemProps, ToggleButtonGroupItemSlot>(
    ToggleButtonGroupItemBase,
    props as ToggleButtonGroupItemProps<'button'>,
    theme,
    {
      stateAttrs: ({ size, variant, appearance, startContent, endContent, children }) => ({
        'data-size': size ?? group.size,
        'data-variant': variant ?? group.variant,
        'data-type': appearance ?? group.appearance,
        'data-icon-only': (isRenderableNode(startContent) || isRenderableNode(endContent)) && !isRenderableNode(children) ? '' : undefined,
      }),
    },
  );

  const { size: _size, variant: _variant, appearance: _appearance, startContent, endContent, children, ref, ...sparProps } = rest;

  const slotOptions = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };
  const contentSlotAttrs = buildSlotAttrs(ToggleButtonGroupItemBase.getSlotProps('content'), 'content' as ToggleButtonGroupItemSlot, slotOptions);
  const labelSlotAttrs = buildSlotAttrs(ToggleButtonGroupItemBase.getSlotProps('label'), 'label' as ToggleButtonGroupItemSlot, slotOptions);

  return (
    <SparToggleGroupItem {...(sparProps as unknown as SparToggleGroupItemProps)} {...rootAttrs} ref={ref}>
      {isRenderableNode(startContent) && <span {...contentSlotAttrs}>{startContent}</span>}
      {isRenderableNode(children) && <span {...labelSlotAttrs}>{children}</span>}
      {isRenderableNode(endContent) && <span {...contentSlotAttrs}>{endContent}</span>}
    </SparToggleGroupItem>
  );
};

ToggleButtonGroupItem.displayName = 'ToggleButtonGroup.Item';
