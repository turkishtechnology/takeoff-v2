import { Button as SparButton } from '@turkish-technology/spar';
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';

import { renderIconSymbol } from '../../utils';
import { ButtonBase } from './ButtonBase';
import type { ButtonMode, ButtonProps } from './types';

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

const renderIconNode = (icon: ReactNode) => renderIconSymbol(icon, 'tk-button-icon-symbol');

const renderAdornment = (slot: 'leading-icon' | 'trailing-icon', icon: ReactNode) => {
  if (!hasContent(icon)) {
    return null;
  }

  const className = slot === 'leading-icon' ? ButtonBase.cx('leadingIcon', ButtonBase.classes.icon) : ButtonBase.cx('trailingIcon', ButtonBase.classes.icon);

  return (
    <span className={className} data-slot={slot} aria-hidden="true">
      {renderIconNode(icon)}
    </span>
  );
};

const renderSpinner = (spinner: ReactNode) => <span {...ButtonBase.getSlotProps('spinner', { 'aria-hidden': 'true' })}>{spinner}</span>;

function Button({ ref, ...rawProps }: ButtonProps & { ref?: Ref<HTMLButtonElement | HTMLAnchorElement> }) {
  const {
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
    fullWidth,
    href,
    icon,
    iconPosition,
    label,
    leadingIcon,
    loading,
    mode,
    name,
    onClick,
    onKeyDown,
    rel,
    rounded,
    size,
    spinner,
    target,
    trailingIcon,
    type: visualType,
    underline,
    value,
    variant,
    ...restProps
  } = ButtonBase.resolveProps(rawProps);
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
  const rootClassName = ButtonBase.cx('root', className);
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
        {renderedLeadingAdornment}
        {hasLabel ? <span {...ButtonBase.getSlotProps('label')}>{content}</span> : null}
        {renderedTrailingAdornment}
      </a>
    );
  }

  return (
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
      {renderedLeadingAdornment}
      {hasLabel ? (
        <span className={ButtonBase.cx('label')} data-slot="label">
          {content}
        </span>
      ) : null}
      {renderedTrailingAdornment}
    </SparButton>
  );
}

Button.displayName = 'Button';

export { Button };
