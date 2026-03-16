import { Button as SparButton } from '@turkish-technology/spar';
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ForwardedRef, type ReactNode } from 'react';

import { buttonClassNames } from './style';
import type { ButtonMode, ButtonProps } from './types';
import { joinClassNames } from '../../utils';

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

const hasContent = (value: ReactNode): boolean => {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

const resolveLinkRel = (target: AnchorHTMLAttributes<HTMLAnchorElement>['target'], rel: AnchorHTMLAttributes<HTMLAnchorElement>['rel']) => {
  if (target !== '_blank' || rel) {
    return rel;
  }

  return 'noopener noreferrer';
};

const renderIconNode = (icon: ReactNode) => {
  if (typeof icon === 'string') {
    return (
      <span className="tk-button-icon-symbol" data-icon-kind="symbol">
        {icon}
      </span>
    );
  }

  return icon;
};

const renderAdornment = (slot: 'leading-icon' | 'trailing-icon', icon: ReactNode) => {
  if (!hasContent(icon)) {
    return null;
  }

  const className =
    slot === 'leading-icon' ? joinClassNames(buttonClassNames.icon, buttonClassNames.leadingIcon) : joinClassNames(buttonClassNames.icon, buttonClassNames.trailingIcon);

  return (
    <span className={className} data-slot={slot} aria-hidden="true">
      {renderIconNode(icon)}
    </span>
  );
};

const renderSpinner = (spinner: ReactNode) => (
  <span className={buttonClassNames.spinner} data-slot="spinner" aria-hidden="true">
    {spinner}
  </span>
);

const ButtonBase = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  {
    as,
    children,
    className,
    disabled,
    form,
    formAction,
    formEncType,
    formMethod,
    formNoValidate,
    formTarget,
    fullWidth = false,
    href,
    icon,
    iconPosition = 'left',
    label,
    leadingIcon,
    loading,
    mode,
    name,
    onClick,
    onKeyDown,
    rel,
    rounded = false,
    size = 'base',
    spinner,
    target,
    trailingIcon,
    type: visualType = 'filled',
    underline = false,
    value,
    variant = 'primary',
    ...restProps
  },
  ref,
) {
  const resolvedMode = getButtonMode({ as, href, mode });
  const resolvedLoading = Boolean(loading);
  const disabledState = Boolean(disabled);
  const content = children ?? label;
  const hasLabel = hasContent(content);
  const resolvedLeadingIcon = hasContent(leadingIcon) ? leadingIcon : iconPosition === 'left' ? icon : null;
  const resolvedTrailingIcon = hasContent(trailingIcon) ? trailingIcon : iconPosition === 'right' ? icon : null;
  const renderedLeadingAdornment = resolvedLoading ? renderSpinner(spinner) : renderAdornment('leading-icon', resolvedLeadingIcon);
  const renderedTrailingAdornment = resolvedLoading ? null : renderAdornment('trailing-icon', resolvedTrailingIcon);
  const iconCount = Number(Boolean(renderedLeadingAdornment)) + Number(Boolean(renderedTrailingAdornment));
  const isIconOnly = !hasLabel && (Boolean(renderedLeadingAdornment) || Boolean(renderedTrailingAdornment));
  const isRounded = rounded && !hasLabel && iconCount === 1;
  const rootClassName = joinClassNames(buttonClassNames.root, className);
  const resolvedFormAction = typeof formAction === 'string' ? formAction : undefined;
  const sharedProps = {
    ...restProps,
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
    'data-icon-only': isIconOnly ? '' : undefined,
    'data-rounded': isRounded ? '' : undefined,
    'data-underline': underline ? '' : undefined,
  };

  if (resolvedMode === 'link') {
    return (
      <a
        {...(sharedProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
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
        {renderedLeadingAdornment}
        {hasLabel ? (
          <span className={buttonClassNames.label} data-slot="label">
            {content}
          </span>
        ) : null}
        {renderedTrailingAdornment}
      </a>
    );
  }

  return (
    <SparButton
      {...(sharedProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      as="button"
      ref={ref as ForwardedRef<HTMLButtonElement>}
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
      {renderedLeadingAdornment}
      {hasLabel ? (
        <span className={buttonClassNames.label} data-slot="label">
          {content}
        </span>
      ) : null}
      {renderedTrailingAdornment}
    </SparButton>
  );
});

ButtonBase.displayName = 'Button';

export const Button = ButtonBase;
