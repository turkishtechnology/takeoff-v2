import type { ElementType, MouseEvent } from 'react';
import { Button as SparButton, type ButtonProps as SparButtonProps } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { ButtonBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { ButtonProps, ButtonSlot } from './types';

export const Button = <T extends ElementType = 'button'>(props: ButtonProps<T>) => {
  const theme = useComponentTheme('Button');

  const { rootAttrs, rest } = composeRootAttrs<ButtonProps, ButtonSlot>(ButtonBase, props as ButtonProps<'button'>, theme, {
    // `data-disabled` / `data-loading` are also emitted by Spar's Button, with
    // the same `''` / absent values. They are re-emitted here on purpose: the
    // Button docs list them as styling hooks, and only `stateAttrs` lands above
    // `slotProps.root` (Spar spreads consumer props after its own attrs), so
    // this is what stops a consumer from hijacking them. Keep the values
    // byte-identical to Spar's so the two sources can never disagree.
    stateAttrs: ({ variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, size = DEFAULT_SIZE, rounded, startContent, endContent, children, loading, disabled }) => {
      const hasIcon = isRenderableNode(startContent) || isRenderableNode(endContent);
      const isIconOnly = hasIcon && !isRenderableNode(children);
      return {
        'data-variant': variant,
        'data-type': appearance,
        'data-size': size,
        'data-rounded': rounded ? '' : undefined,
        'data-icon-only': isIconOnly ? '' : undefined,
        'data-loading': loading ? '' : undefined,
        'data-disabled': disabled ? '' : undefined,
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
    onClickCapture,
    ...sparProps
  } = rest;

  // Spar's Button only skips the `onClick` callback while disabled/loading; it
  // neither drops `href` nor cancels the click, so `<Button as="a" href>` would
  // still navigate. coding-standards.md requires an inert anchor to lose its
  // navigation, so the wrapper compensates here — `aria-disabled`, `tabIndex`
  // and Enter/Space blocking stay Spar-owned. The click is cancelled in the
  // capture phase because Spar never invokes a consumer `onClick` while inert,
  // so there is no bubbling handler the wrapper could hook into.
  const isInertAnchor = (sparProps as { as?: ElementType }).as === 'a' && (disabled || loading);
  const inertAnchorProps = isInertAnchor
    ? {
        href: undefined,
        onClickCapture: (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          onClickCapture?.(event);
        },
      }
    : { onClickCapture };

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
    <SparButton {...(sparProps as unknown as SparButtonProps)} {...inertAnchorProps} disabled={disabled} isLoading={loading} isPressed={pressed} ref={ref} {...rootAttrs}>
      {loading && <span {...spinnerSlotAttrs} />}
      {isRenderableNode(startContent) && !loading && <span {...contentSlotAttrs}>{startContent}</span>}
      {isRenderableNode(children) && <span {...labelSlotAttrs}>{children}</span>}
      {isRenderableNode(endContent) && !loading && <span {...contentSlotAttrs}>{endContent}</span>}
    </SparButton>
  );
};

Button.displayName = 'Button';
