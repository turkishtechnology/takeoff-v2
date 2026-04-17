import { Dialog as SparDialog } from '@turkish-technology/spar';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Variant sign + close icons use Lucide-sourced SVG
// placeholders. Replace with the official Takeoff icon components (currently
// `check_circle` / `warning` / `error` / `info` / `close` in takeoff-ui)
// before the first public release.
import { PlaceholderClose, PlaceholderError, PlaceholderInfo, PlaceholderSuccess, PlaceholderWarning } from '../../utils/placeholderIcons';
import { DialogBase } from './DialogBase';
import type {
  DialogContentPartProps,
  DialogDescriptionPartProps,
  DialogFooterActionsPartProps,
  DialogFooterPartProps,
  DialogHeaderPartProps,
  DialogHeaderType,
  DialogMaskVariant,
  DialogProps,
  DialogTitlePartProps,
  DialogVariant,
} from './types';

let activeBodyScrollLocks = 0;
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';

const visuallyHiddenStyle: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const hasRenderableContent = (value: ReactNode): boolean => {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some(item => hasRenderableContent(item));
  }

  return true;
};

const getVariantIcon = (variant: DialogVariant): ReactNode => {
  switch (variant) {
    case 'success':
      return <PlaceholderSuccess />;
    case 'warning':
      return <PlaceholderWarning />;
    case 'danger':
      return <PlaceholderError />;
    default:
      return <PlaceholderInfo />;
  }
};

const dialogVariantClassNames: Record<DialogVariant, string> = {
  info: 'tk-dialog-info',
  success: 'tk-dialog-success',
  warning: 'tk-dialog-warning',
  danger: 'tk-dialog-danger',
};

const headerTypeClassNames: Record<DialogHeaderType, string> = {
  basic: 'tk-dialog-header-basic',
  divided: 'tk-dialog-header-divided',
  light: 'tk-dialog-header-light',
  dark: 'tk-dialog-header-dark',
  primary: 'tk-dialog-header-primary',
};

const maskVariantClassNames: Record<DialogMaskVariant, string> = {
  lightest: 'tk-dialog-mask-lightest',
  light: 'tk-dialog-mask-light',
  base: 'tk-dialog-mask-base',
  dark: 'tk-dialog-mask-dark',
  darkest: 'tk-dialog-mask-darkest',
};

const lockBodyScroll = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  if (activeBodyScrollLocks === 0) {
    previousBodyOverflow = document.body.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
  }

  activeBodyScrollLocks += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined' || activeBodyScrollLocks === 0) {
    return;
  }

  activeBodyScrollLocks -= 1;

  if (activeBodyScrollLocks === 0) {
    document.body.style.overflow = previousBodyOverflow;
    document.body.style.paddingRight = previousBodyPaddingRight;
  }
};

function Dialog(rawProps: DialogProps) {
  const themeConfig = useComponentTheme('Dialog');
  const {
    'id': baseId,
    className,
    'classNames': instanceClassNames,
    style,
    visible,
    defaultVisible = false,
    onVisibleChange,
    onOpen,
    onClose,
    header,
    headerType = 'basic',
    showCloseButton = true,
    showHeader = true,
    showVariantSign = true,
    subheader,
    variant = 'info',
    hideBackdrop = false,
    maskVariant = 'base',
    isMaskBlur = false,
    containerStyle = null,
    preventDismiss = false,
    portalContainer,
    containerSlot,
    headerSlot,
    contentSlot,
    footerSlot,
    footerActions,
    'slotProps': instanceSlotProps,
    renderCloseIcon,
    renderSignIcon,
    children,
    'aria-label': ariaLabel,
    ...restProps
  } = DialogBase.resolveProps(applyThemeDefaults(themeConfig?.defaultProps, rawProps));
  const resolvedClassNames = mergeClassNames(themeConfig?.classNames, instanceClassNames);
  const resolvedSlotProps = mergeSlotProps(themeConfig?.slotProps, instanceSlotProps);
  const [uncontrolledVisible, setUncontrolledVisible] = useState(Boolean(defaultVisible));
  const [mounted, setMounted] = useState(false);
  const isControlled = visible !== undefined;
  const currentVisible = visible ?? uncontrolledVisible;
  const previousVisibleRef = useRef(currentVisible);
  const skipNextCloseEffectRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousVisible = previousVisibleRef.current;

    if (previousVisible === currentVisible) {
      return;
    }

    previousVisibleRef.current = currentVisible;

    if (currentVisible) {
      onOpen?.();
      return;
    }

    if (skipNextCloseEffectRef.current) {
      skipNextCloseEffectRef.current = false;
      return;
    }

    onClose?.();
  }, [currentVisible, onClose, onOpen]);

  useEffect(() => {
    if (!currentVisible || hideBackdrop) {
      return;
    }

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [currentVisible, hideBackdrop]);

  const resolvedPortalContainer = portalContainer ?? (mounted ? document.body : null);
  const hasContainerSlot = hasRenderableContent(containerSlot);
  const hasHeaderSlot = hasRenderableContent(headerSlot);
  const hasContentSlot = hasRenderableContent(contentSlot);
  const hasChildren = hasRenderableContent(children);
  const hasFooterSlot = hasRenderableContent(footerSlot);
  const hasFooterActions = hasRenderableContent(footerActions);
  const resolvedAriaLabel = typeof ariaLabel === 'string' && ariaLabel.trim().length > 0 ? ariaLabel : null;
  const shouldRenderDefaultHeader = showHeader && !hasContainerSlot && !hasHeaderSlot;
  const shouldRenderVisibleTitle = shouldRenderDefaultHeader && hasRenderableContent(header);
  const shouldRenderVisibleSubtitle = shouldRenderDefaultHeader && hasRenderableContent(subheader);
  const hiddenTitle = shouldRenderVisibleTitle || hasContainerSlot || hasHeaderSlot ? resolvedAriaLabel : (resolvedAriaLabel ?? (showHeader ? null : header));
  const hiddenDescription = shouldRenderVisibleSubtitle || hasContainerSlot || hasHeaderSlot || showHeader ? null : subheader;

  const handleVisibleChange = (nextVisible: boolean) => {
    if (!isControlled) {
      setUncontrolledVisible(nextVisible);
    }

    onVisibleChange?.(nextVisible);

    if (!nextVisible) {
      skipNextCloseEffectRef.current = true;
      onClose?.();
    }
  };

  const renderVariantSign = () => {
    if (!showVariantSign) {
      return null;
    }

    const defaultSignNode = (
      <span
        {...buildSlotAttrs(DialogBase.getSlotProps('signIcon', { 'aria-hidden': 'true', 'data-variant': variant }), resolvedSlotProps, 'signIcon', resolvedClassNames?.signIcon)}
      >
        {renderIconSymbol(getVariantIcon(variant), 'tk-dialog-sign-icon-symbol')}
      </span>
    );

    return renderSignIcon ? renderSignIcon(defaultSignNode) : defaultSignNode;
  };

  const renderHeader = () => {
    if (hasContainerSlot || !showHeader) {
      return null;
    }

    if (hasHeaderSlot) {
      return headerSlot;
    }

    return (
      <div
        {...buildSlotAttrs(
          DialogBase.getSlotProps('header', { 'className': headerTypeClassNames[headerType], 'data-header-type': headerType }),
          resolvedSlotProps,
          'header',
          resolvedClassNames?.header,
        )}
      >
        <div {...buildSlotAttrs(DialogBase.getSlotProps('headerContent'), resolvedSlotProps, 'headerContent', resolvedClassNames?.headerContent)}>
          {renderVariantSign()}
          {(shouldRenderVisibleTitle || shouldRenderVisibleSubtitle) && (
            <div {...buildSlotAttrs(DialogBase.getSlotProps('titleContainer'), resolvedSlotProps, 'titleContainer', resolvedClassNames?.titleContainer)}>
              {shouldRenderVisibleSubtitle ? (
                <SparDialog.Description as="span" {...buildSlotAttrs(DialogBase.getSlotProps('subtitle'), resolvedSlotProps, 'subtitle', resolvedClassNames?.subtitle)}>
                  {subheader}
                </SparDialog.Description>
              ) : null}
              {shouldRenderVisibleTitle ? (
                <SparDialog.Title as="span" {...buildSlotAttrs(DialogBase.getSlotProps('title'), resolvedSlotProps, 'title', resolvedClassNames?.title)}>
                  {header}
                </SparDialog.Title>
              ) : null}
            </div>
          )}
        </div>

        {showCloseButton
          ? (() => {
              const closeButtonAttrs = buildSlotAttrs(DialogBase.getSlotProps('closeButton'), resolvedSlotProps, 'closeButton', resolvedClassNames?.closeButton);
              const closeIconAttrs = buildSlotAttrs(DialogBase.getSlotProps('closeIcon', { 'aria-hidden': 'true' }), resolvedSlotProps, 'closeIcon', resolvedClassNames?.closeIcon);
              // TODO(takeoff-icons): Replace placeholder close SVG with Takeoff icon.
              const defaultIconContent = renderIconSymbol(<PlaceholderClose />, 'tk-dialog-close-icon-symbol');
              const iconContent = renderCloseIcon ? renderCloseIcon(defaultIconContent) : defaultIconContent;

              return (
                <button aria-label="Close dialog" {...closeButtonAttrs} onClick={() => handleVisibleChange(false)} type="button">
                  <span {...closeIconAttrs}>{iconContent}</span>
                </button>
              );
            })()
          : null}
      </div>
    );
  };

  const renderHiddenAccessibleNodes = () => (
    <>
      {hasRenderableContent(hiddenTitle) ? (
        <SparDialog.Title as="span" style={visuallyHiddenStyle}>
          {hiddenTitle}
        </SparDialog.Title>
      ) : null}
      {hasRenderableContent(hiddenDescription) ? (
        <SparDialog.Description as="span" style={visuallyHiddenStyle}>
          {hiddenDescription}
        </SparDialog.Description>
      ) : null}
    </>
  );

  const renderContent = () => {
    if (hasContainerSlot) {
      return containerSlot;
    }

    const contentAttrs = buildSlotAttrs(DialogBase.getSlotProps('content'), resolvedSlotProps, 'content', resolvedClassNames?.content);

    if (hasContentSlot) {
      return <div {...contentAttrs}>{contentSlot}</div>;
    }

    if (hasChildren) {
      return <div {...contentAttrs}>{children}</div>;
    }

    return null;
  };

  const renderFooter = () => {
    if (hasContainerSlot) {
      return null;
    }

    if (hasFooterSlot) {
      return footerSlot;
    }

    if (hasFooterActions) {
      return (
        <div {...buildSlotAttrs(DialogBase.getSlotProps('footer'), resolvedSlotProps, 'footer', resolvedClassNames?.footer)}>
          <div {...buildSlotAttrs(DialogBase.getSlotProps('footerActions'), resolvedSlotProps, 'footerActions', resolvedClassNames?.footerActions)}>{footerActions}</div>
        </div>
      );
    }

    return null;
  };

  return (
    <SparDialog id={baseId} modal open={currentVisible} onOpenChange={handleVisibleChange}>
      {mounted && currentVisible && resolvedPortalContainer
        ? createPortal(
            <div
              {...buildSlotAttrs(
                DialogBase.getSlotProps('mask', {
                  'className': clsx(maskVariantClassNames[maskVariant], {
                    'tk-dialog-mask-hidden': hideBackdrop,
                    'tk-dialog-mask-blur': isMaskBlur,
                  }),
                  'aria-hidden': 'true',
                  'data-mask-variant': maskVariant,
                  'data-backdrop-hidden': hideBackdrop ? '' : undefined,
                  'data-mask-blur': isMaskBlur ? '' : undefined,
                }),
                resolvedSlotProps,
                'mask',
                resolvedClassNames?.mask,
              )}
            />,
            resolvedPortalContainer,
          )
        : null}

      <SparDialog.Content
        {...restProps}
        {...buildSlotAttrs(
          DialogBase.getSlotProps('root', {
            'className': clsx(className, dialogVariantClassNames[variant]),
            'style': {
              ...(containerStyle ?? {}),
              ...(style ?? {}),
            },
            'aria-label': ariaLabel,
            'data-variant': variant,
            'data-header-type': headerType,
            'data-mask-variant': maskVariant,
            'data-backdrop-hidden': hideBackdrop ? '' : undefined,
            'data-mask-blur': isMaskBlur ? '' : undefined,
          }),
          resolvedSlotProps,
          'root',
          resolvedClassNames?.root,
        )}
        container={resolvedPortalContainer ?? undefined}
        onInteractOutside={event => {
          if (preventDismiss) {
            event.preventDefault();
          }
        }}
      >
        {renderHiddenAccessibleNodes()}
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </SparDialog.Content>
    </SparDialog>
  );
}

Dialog.displayName = 'Dialog';

const DialogHeader = ({ children, className }: DialogHeaderPartProps) => <div {...DialogBase.getSlotProps('header', { className })}>{children}</div>;
DialogHeader.displayName = 'Dialog.Header';

const DialogContent = ({ children, className }: DialogContentPartProps) => <div {...DialogBase.getSlotProps('content', { className })}>{children}</div>;
DialogContent.displayName = 'Dialog.Content';

const DialogFooter = ({ children, className }: DialogFooterPartProps) => <div {...DialogBase.getSlotProps('footer', { className })}>{children}</div>;
DialogFooter.displayName = 'Dialog.Footer';

const DialogFooterActions = ({ children, className }: DialogFooterActionsPartProps) => <div {...DialogBase.getSlotProps('footerActions', { className })}>{children}</div>;
DialogFooterActions.displayName = 'Dialog.FooterActions';

const DialogTitle = ({ children, className }: DialogTitlePartProps) => (
  <SparDialog.Title as="span" {...DialogBase.getSlotProps('title', { className })}>
    {children}
  </SparDialog.Title>
);
DialogTitle.displayName = 'Dialog.Title';

const DialogDescription = ({ children, className }: DialogDescriptionPartProps) => (
  <SparDialog.Description as="span" {...DialogBase.getSlotProps('subtitle', { className })}>
    {children}
  </SparDialog.Description>
);
DialogDescription.displayName = 'Dialog.Description';

const DialogCompound = Object.assign(Dialog, {
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Content: DialogContent,
  Footer: DialogFooter,
  FooterActions: DialogFooterActions,
});

export { DialogCompound as Dialog };
