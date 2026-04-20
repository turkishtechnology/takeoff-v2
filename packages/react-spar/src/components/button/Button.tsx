import { Button as SparButton } from '@turkish-technology/spar';
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
import { ButtonBase, ButtonProvider, buttonIconSharedClassName, useButtonContext } from './ButtonBase';
import type { ButtonLabelProps, ButtonLeadingIconProps, ButtonMode, ButtonProps, ButtonSpinnerProps, ButtonTrailingIconProps } from './types';

const getButtonMode = ({ as, href, mode }: Pick<ButtonProps, 'as' | 'href' | 'mode'>): ButtonMode => {
  if (mode === 'link' || as === 'a' || href) {
    return 'link';
  }

  return mode ?? 'button';
};

const getNativeButtonType = ({ mode }: Pick<ButtonProps, 'mode'>): ButtonHTMLAttributes<HTMLButtonElement>['type'] => {
  if (mode === 'submit' || mode === 'reset') {
    return mode;
  }

  return 'button';
};

const resolveLinkRel = (target: AnchorHTMLAttributes<HTMLAnchorElement>['target'], rel: AnchorHTMLAttributes<HTMLAnchorElement>['rel']) => {
  if (target !== '_blank' || rel) {
    return rel;
  }

  return 'noopener noreferrer';
};

const DefaultSpinner = () => <span className="tk-button-default-spinner" data-slot="spinner-indicator" aria-hidden="true" />;

function Button({ ref, ...rawProps }: ButtonProps & { ref?: Ref<HTMLButtonElement | HTMLAnchorElement> }) {
  const themeConfig = useComponentTheme('Button');
  const {
    as,
    children,
    className,
    classNames: instanceClassNames,
    disabled,
    form,
    formAction,
    formEncType,
    formMethod,
    formNoValidate,
    formTarget,
    fullWidth,
    href,
    iconOnly,
    loading,
    mode,
    name,
    onClick,
    onKeyDown,
    rel,
    rounded,
    size,
    slotProps: instanceSlotProps,
    target,
    type: visualType,
    underline,
    value,
    variant,
    ...restProps
  } = ButtonBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));

  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);
  const resolvedMode = getButtonMode({ as, href, mode });
  const resolvedLoading = Boolean(loading);
  const disabledState = Boolean(disabled);
  const resolvedIconOnly = Boolean(iconOnly);
  const isRounded = Boolean(rounded) && resolvedIconOnly;

  const rootSlotClassName = resolvedSlotProps?.root?.className;
  const rootClassName = ButtonBase.cx('root', className, rootSlotClassName, resolvedClassNames?.root);
  const resolvedFormAction = typeof formAction === 'string' ? formAction : undefined;
  const { className: _rootSlotCls, ...rootSlotRest } = resolvedSlotProps?.root ?? {};

  const sharedProps = {
    ...restProps,
    ...rootSlotRest,
    'className': rootClassName,
    'aria-busy': resolvedLoading || undefined,
    'data-slot': 'root',
    'data-disabled': disabledState ? '' : undefined,
    'data-loading': resolvedLoading ? '' : undefined,
    'data-type': resolvedMode === 'link' ? undefined : visualType,
    'data-variant': variant,
    'data-size': size,
    'data-mode': resolvedMode,
    'data-full-width': fullWidth ? '' : undefined,
    'data-icon-only': resolvedIconOnly ? '' : undefined,
    'data-rounded': isRounded ? '' : undefined,
    'data-underline': underline ? '' : undefined,
  };

  const contextValue = {
    loading: resolvedLoading,
    disabled: disabledState,
    size: size ?? 'base',
    variant: variant ?? 'primary',
    type: visualType ?? 'filled',
    mode: resolvedMode,
    classNames: resolvedClassNames,
    slotProps: resolvedSlotProps,
  };

  if (resolvedMode === 'link') {
    return (
      <ButtonProvider value={contextValue}>
        <a
          {...(sharedProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as Ref<HTMLAnchorElement>}
          href={disabledState ? undefined : href}
          target={target}
          rel={resolveLinkRel(target, rel)}
          aria-disabled={disabledState || undefined}
          tabIndex={disabledState ? -1 : sharedProps.tabIndex}
          onClick={event => {
            if (disabledState) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }

            onClick?.(event as never);
          }}
          onKeyDown={event => {
            if (disabledState && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }

            onKeyDown?.(event as never);
          }}
        >
          {children}
        </a>
      </ButtonProvider>
    );
  }

  return (
    <ButtonProvider value={contextValue}>
      <SparButton
        {...(sharedProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        as="button"
        ref={ref as Ref<HTMLButtonElement>}
        disabled={disabledState}
        form={form}
        formAction={resolvedFormAction}
        formEncType={formEncType}
        formMethod={formMethod}
        formNoValidate={formNoValidate}
        formTarget={formTarget}
        isLoading={resolvedLoading}
        name={name}
        onClick={onClick}
        onKeyDown={onKeyDown}
        type={getNativeButtonType({ mode: resolvedMode })}
        value={value}
      >
        {children}
      </SparButton>
    </ButtonProvider>
  );
}

Button.displayName = 'Button';

function ButtonLabel({ children, className, ...rest }: ButtonLabelProps) {
  const context = useButtonContext('Button.Label');
  const attrs = buildSlotAttrs(ButtonBase.getSlotProps('label', { className }), context.slotProps, 'label', context.classNames?.label);
  return (
    <span {...attrs} {...rest}>
      {children}
    </span>
  );
}
ButtonLabel.displayName = 'Button.Label';

const renderIconNode = (icon: ReactNode) => renderIconSymbol(icon, 'tk-button-icon-symbol');

function ButtonLeadingIcon({ children, className, ...rest }: ButtonLeadingIconProps) {
  const context = useButtonContext('Button.LeadingIcon');
  const attrs = buildSlotAttrs(
    ButtonBase.getSlotProps('leadingIcon', { 'aria-hidden': 'true', 'className': [buttonIconSharedClassName, className].filter(Boolean).join(' ') || undefined }),
    context.slotProps,
    'leadingIcon',
    context.classNames?.leadingIcon,
  );
  attrs['data-slot'] = 'leading-icon';

  return (
    <span {...attrs} {...rest}>
      {renderIconNode(children)}
    </span>
  );
}
ButtonLeadingIcon.displayName = 'Button.LeadingIcon';

function ButtonTrailingIcon({ children, className, ...rest }: ButtonTrailingIconProps) {
  const context = useButtonContext('Button.TrailingIcon');
  const attrs = buildSlotAttrs(
    ButtonBase.getSlotProps('trailingIcon', { 'aria-hidden': 'true', 'className': [buttonIconSharedClassName, className].filter(Boolean).join(' ') || undefined }),
    context.slotProps,
    'trailingIcon',
    context.classNames?.trailingIcon,
  );
  attrs['data-slot'] = 'trailing-icon';

  return (
    <span {...attrs} {...rest}>
      {renderIconNode(children)}
    </span>
  );
}
ButtonTrailingIcon.displayName = 'Button.TrailingIcon';

function ButtonSpinner({ children, className, ...rest }: ButtonSpinnerProps) {
  const context = useButtonContext('Button.Spinner');
  if (!context.loading) {
    return null;
  }

  const attrs = buildSlotAttrs(ButtonBase.getSlotProps('spinner', { 'aria-hidden': 'true', className }), context.slotProps, 'spinner', context.classNames?.spinner);

  return (
    <span {...attrs} {...rest}>
      {children ?? <DefaultSpinner />}
    </span>
  );
}
ButtonSpinner.displayName = 'Button.Spinner';

const ButtonCompound = Object.assign(Button, {
  Label: ButtonLabel,
  LeadingIcon: ButtonLeadingIcon,
  TrailingIcon: ButtonTrailingIcon,
  Spinner: ButtonSpinner,
});

export { ButtonCompound as Button };
