import { Button as SparButton } from '@turkish-technology/spar';
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
import { ButtonBase, type ButtonSlot } from './ButtonBase';
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
    renderIcon,
    renderSpinner: renderSpinnerOverride,
    rounded,
    size,
    slotProps: instanceSlotProps,
    spinner,
    target,
    trailingIcon,
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
  const content = children ?? label;
  const hasLabel = hasContent(content);
  const resolvedLeadingIcon = hasContent(leadingIcon) ? leadingIcon : iconPosition === 'left' ? icon : null;
  const resolvedTrailingIcon = hasContent(trailingIcon) ? trailingIcon : iconPosition === 'right' ? icon : null;

  const buildAdornment = (slot: 'leading-icon' | 'trailing-icon', iconNode: ReactNode) => {
    if (!hasContent(iconNode)) {
      return null;
    }

    const slotKey: ButtonSlot = slot === 'leading-icon' ? 'leadingIcon' : 'trailingIcon';
    const iconClassExtra =
      slot === 'leading-icon'
        ? [ButtonBase.classes.icon, resolvedClassNames?.leadingIcon, resolvedClassNames?.icon].filter(Boolean).join(' ')
        : [ButtonBase.classes.icon, resolvedClassNames?.trailingIcon, resolvedClassNames?.icon].filter(Boolean).join(' ');
    const baseGetSlot = ButtonBase.getSlotProps(slotKey, { 'aria-hidden': 'true' });
    const attrs = buildSlotAttrs(baseGetSlot, resolvedSlotProps, slotKey, iconClassExtra);
    // Override data-slot to use kebab form matching the DOM contract
    attrs['data-slot'] = slot;

    const defaultNode = renderIconNode(iconNode);
    const renderedContent = renderIcon ? renderIcon(defaultNode) : defaultNode;

    return <span {...attrs}>{renderedContent}</span>;
  };

  const buildSpinner = (spinnerNode: ReactNode) => {
    const attrs = buildSlotAttrs(ButtonBase.getSlotProps('spinner', { 'aria-hidden': 'true' }), resolvedSlotProps, 'spinner', resolvedClassNames?.spinner);
    const defaultNode = hasContent(spinnerNode) ? spinnerNode : <DefaultSpinner />;
    const renderedContent = renderSpinnerOverride ? renderSpinnerOverride(defaultNode) : defaultNode;

    return <span {...attrs}>{renderedContent}</span>;
  };

  const renderedLeadingAdornment = resolvedLoading ? buildSpinner(spinner) : buildAdornment('leading-icon', resolvedLeadingIcon);
  const renderedTrailingAdornment = resolvedLoading ? null : buildAdornment('trailing-icon', resolvedTrailingIcon);
  const iconCount = Number(Boolean(renderedLeadingAdornment)) + Number(Boolean(renderedTrailingAdornment));
  const isIconOnly = !hasLabel && (Boolean(renderedLeadingAdornment) || Boolean(renderedTrailingAdornment));
  const isRounded = rounded && !hasLabel && iconCount === 1;
  const rootSlotClassName = resolvedSlotProps?.root?.className;
  const rootClassName = ButtonBase.cx('root', className, rootSlotClassName, resolvedClassNames?.root);
  const labelSlotClassName = resolvedSlotProps?.label?.className;
  const labelClassName = ButtonBase.cx('label', labelSlotClassName, resolvedClassNames?.label);
  const resolvedFormAction = typeof formAction === 'string' ? formAction : undefined;
  const { className: _rootSlotCls, ...rootSlotRest } = resolvedSlotProps?.root ?? {};
  const { className: _labelSlotCls, ...labelSlotRest } = resolvedSlotProps?.label ?? {};
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
        {hasLabel ? (
          <span {...labelSlotRest} className={labelClassName} data-slot="label">
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
        <span {...labelSlotRest} className={labelClassName} data-slot="label">
          {content}
        </span>
      ) : null}
      {renderedTrailingAdornment}
    </SparButton>
  );
}

Button.displayName = 'Button';

export { Button };
