import { Children, isValidElement, type ElementType } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { Avatar } from './Avatar';
import { AvatarFallback } from './AvatarFallback';
import { AvatarGroupBase } from './base';
import { AvatarGroupContext } from './context';
import { DEFAULT_OVERFLOW_ARIA_LABEL, DEFAULT_OVERFLOW_LABEL, DEFAULT_SIZE } from './defaults';
import type { AvatarGroupProps } from './types';

export const AvatarGroup = <T extends ElementType = 'div'>(props: AvatarGroupProps<T>) => {
  const theme = useComponentTheme('AvatarGroup');

  const { rootAttrs, rest } = composeRootAttrs(AvatarGroupBase, props as AvatarGroupProps<'div'>, theme, {
    stateAttrs: ({ size = DEFAULT_SIZE, compact }) => ({
      'data-size': size,
      'data-compact': compact ? '' : undefined,
    }),
  });

  const { size = DEFAULT_SIZE, rounded = false, compact = false, max, overflowLabel, overflowAriaLabel, children, as, ref, ...nativeProps } = rest;

  const avatars = Children.toArray(children).filter(isValidElement);
  const limit = max === undefined ? avatars.length : Math.max(0, Math.floor(max));
  const hidden = avatars.length - limit;
  const Component = as || 'div';

  const overflowAttrs = buildSlotAttrs(AvatarGroupBase.getSlotProps('overflow'), 'overflow', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });
  const { 'data-slot': _slot, ...overflowProps } = overflowAttrs;

  return (
    <AvatarGroupContext.Provider value={{ size, rounded, compact }}>
      <Component role="group" {...nativeProps} {...rootAttrs} ref={ref}>
        {hidden > 0 ? avatars.slice(0, limit) : children}
        {hidden > 0 && (
          <Avatar
            {...overflowProps}
            data-overflow=""
            variant="light"
            appearance="filledLight"
            name={formatLabel(overflowAriaLabel || DEFAULT_OVERFLOW_ARIA_LABEL, { count: hidden })}
          >
            <AvatarFallback>{formatLabel(overflowLabel || DEFAULT_OVERFLOW_LABEL, { count: hidden })}</AvatarFallback>
          </Avatar>
        )}
      </Component>
    </AvatarGroupContext.Provider>
  );
};

AvatarGroup.displayName = 'Avatar.Group';
