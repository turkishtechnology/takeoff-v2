import type { ElementType } from 'react';
import { Button as SparButton, type ButtonProps as SparButtonProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ButtonBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { ButtonProps, ButtonSlot } from './types';

export const Button = <T extends ElementType = 'button'>(props: ButtonProps<T>) => {
  const theme = useComponentTheme('Button');

  const {
    variant = DEFAULT_VARIANT,
    appearance = DEFAULT_APPEARANCE,
    size = DEFAULT_SIZE,
    rounded = false,
    isLoading = false,
    startIcon,
    endIcon,
    disabled = false,
    className,
    classNames,
    slotProps,
    children,
    ref,
    ...sparProps
  } = props as ButtonProps<'button'>;

  const hasIcon = !!(startIcon || endIcon);
  const isIconOnly = hasIcon && !children;

  const { rootAttrs } = composeRootAttrs<ButtonProps, ButtonSlot>(ButtonBase, { className, classNames, slotProps }, theme, {
    stateAttrs: {
      'data-variant': variant,
      'data-type': appearance,
      'data-size': size,
      'data-rounded': rounded ? '' : undefined,
      'data-icon-only': isIconOnly ? '' : undefined,
      'data-loading': isLoading ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
    },
  });

  const iconSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('icon'), 'icon' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const labelSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('label'), 'label' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const spinnerSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('spinner'), 'spinner' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return (
    <SparButton {...(sparProps as unknown as SparButtonProps)} disabled={disabled} isLoading={isLoading} ref={ref} {...rootAttrs}>
      {isLoading && <span {...spinnerSlotAttrs} />}
      {startIcon && !isLoading && <span {...iconSlotAttrs}>{startIcon}</span>}
      {children && <span {...labelSlotAttrs}>{children}</span>}
      {endIcon && !isLoading && <span {...iconSlotAttrs}>{endIcon}</span>}
    </SparButton>
  );
};

Button.displayName = 'Button';
