import type { ElementType } from 'react';
import { Button as SparButton, type ButtonProps as SparButtonProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ButtonBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { ButtonProps, ButtonSlot } from './types';

export const Button = <T extends ElementType = 'button'>(props: ButtonProps<T>) => {
  const theme = useComponentTheme('Button');

  const { rootAttrs, rest } = composeRootAttrs<ButtonProps, ButtonSlot>(ButtonBase, props as ButtonProps<'button'>, theme, {
    // `data-disabled` and `data-loading` are intentionally NOT set here —
    // Spar's Button already emits them (see SparButton dataAttributes), so
    // setting them again would create two sources of truth that drift the
    // moment Spar renames or extends its vocabulary.
    stateAttrs: ({ variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, size = DEFAULT_SIZE, rounded, startContent, endContent, children }) => {
      const hasIcon = !!(startContent || endContent);
      const isIconOnly = hasIcon && !children;
      return {
        'data-variant': variant,
        'data-type': appearance,
        'data-size': size,
        'data-rounded': rounded ? '' : undefined,
        'data-icon-only': isIconOnly ? '' : undefined,
      };
    },
  });

  const {
    // Visual props are consumed by `stateAttrs` above; destructured here to
    // keep them off the underlying button DOM (otherwise they would leak via
    // `...sparProps` as raw HTML attributes).
    variant: _variant,
    appearance: _appearance,
    size: _size,
    rounded: _rounded,
    loading = false,
    pressed,
    startContent,
    endContent,
    disabled = false,
    children,
    ref,
    ...sparProps
  } = rest;

  const contentSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('content'), 'content' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const labelSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('label'), 'label' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const spinnerSlotAttrs = buildSlotAttrs(ButtonBase.getSlotProps('spinner'), 'spinner' as ButtonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <SparButton {...(sparProps as unknown as SparButtonProps)} disabled={disabled} isLoading={loading} isPressed={pressed} ref={ref} {...rootAttrs}>
      {loading && <span {...spinnerSlotAttrs} />}
      {startContent && !loading && <span {...contentSlotAttrs}>{startContent}</span>}
      {children && <span {...labelSlotAttrs}>{children}</span>}
      {endContent && !loading && <span {...contentSlotAttrs}>{endContent}</span>}
    </SparButton>
  );
};

Button.displayName = 'Button';
