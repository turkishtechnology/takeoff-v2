import { Dialog as SparDialog } from '@turkish-technology/spar';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { useComponentTheme } from '../../provider';
import { renderIconSymbol } from '../../utils';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from '../../customization';
// TODO(takeoff-icons): Variant sign + close icons use Lucide-sourced SVG
// placeholders. Replace with the official Takeoff icon components before the
// first public release.
import { PlaceholderClose, PlaceholderError, PlaceholderInfo, PlaceholderSuccess, PlaceholderWarning } from '../../utils/placeholderIcons';
import { DialogBase, DialogProvider, useDialogContext } from './DialogBase';
import type {
  DialogBodyProps,
  DialogCloseButtonProps,
  DialogDescriptionProps,
  DialogFooterActionsProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogHeaderType,
  DialogMaskProps,
  DialogMaskVariant,
  DialogPanelProps,
  DialogProps,
  DialogSignIconProps,
  DialogTitleGroupProps,
  DialogTitleProps,
  DialogVariant,
} from './types';

let activeBodyScrollLocks = 0;
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';

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
    id: baseId,
    visible,
    defaultVisible = false,
    onVisibleChange,
    onOpen,
    onClose,
    headerType = 'basic',
    variant = 'info',
    hideBackdrop = false,
    maskVariant = 'base',
    isMaskBlur = false,
    preventDismiss = false,
    portalContainer,
    children,
    classNames: instanceClassNames,
    slotProps: instanceSlotProps,
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

  const commitVisibility = (nextVisible: boolean) => {
    if (!isControlled) {
      setUncontrolledVisible(nextVisible);
    }

    onVisibleChange?.(nextVisible);

    if (!nextVisible) {
      skipNextCloseEffectRef.current = true;
      onClose?.();
    }
  };

  // Spar invokes this when its dismissal paths fire
  // (`SparDialog.Content`'s `useInteractOutside` and Escape handler). When
  // `preventDismiss` is set we swallow the dismissal here, which keeps the
  // close-button path (explicit user action) working since it routes through
  // `requestClose` below.
  const handleVisibleChange = (nextVisible: boolean) => {
    if (preventDismiss && !nextVisible) {
      return;
    }
    commitVisibility(nextVisible);
  };

  const requestClose = () => commitVisibility(false);

  const contextValue = useMemo(
    () => ({
      visible: currentVisible,
      variant,
      headerType,
      maskVariant,
      hideBackdrop,
      isMaskBlur,
      portalContainer: resolvedPortalContainer,
      requestClose,
      classNames: resolvedClassNames,
      slotProps: resolvedSlotProps,
    }),
    [currentVisible, variant, headerType, maskVariant, hideBackdrop, isMaskBlur, resolvedPortalContainer, resolvedClassNames, resolvedSlotProps, requestClose],
  );

  return (
    <DialogProvider value={contextValue}>
      <SparDialog id={baseId} modal open={currentVisible} onOpenChange={handleVisibleChange}>
        {children}
      </SparDialog>
    </DialogProvider>
  );
}

Dialog.displayName = 'Dialog';

function DialogMask(rest: DialogMaskProps) {
  const context = useDialogContext('Dialog.Mask');
  if (!context.visible || !context.portalContainer) {
    return null;
  }
  const attrs = buildSlotAttrs(
    DialogBase.getSlotProps('mask', {
      'className': clsx(maskVariantClassNames[context.maskVariant], {
        'tk-dialog-mask-hidden': context.hideBackdrop,
        'tk-dialog-mask-blur': context.isMaskBlur,
      }),
      'aria-hidden': 'true',
      'data-mask-variant': context.maskVariant,
      'data-backdrop-hidden': context.hideBackdrop ? '' : undefined,
      'data-mask-blur': context.isMaskBlur ? '' : undefined,
    }),
    context.slotProps,
    'mask',
    context.classNames?.mask,
  );

  return createPortal(<div {...attrs} {...rest} />, context.portalContainer);
}
DialogMask.displayName = 'Dialog.Mask';

function DialogPanel({ children, className, ...rest }: DialogPanelProps) {
  const context = useDialogContext('Dialog.Panel');
  const attrs = buildSlotAttrs(
    DialogBase.getSlotProps('root', {
      'className': clsx(className, dialogVariantClassNames[context.variant]),
      'data-variant': context.variant,
      'data-header-type': context.headerType,
      'data-mask-variant': context.maskVariant,
      'data-backdrop-hidden': context.hideBackdrop ? '' : undefined,
      'data-mask-blur': context.isMaskBlur ? '' : undefined,
    }),
    context.slotProps,
    'root',
    context.classNames?.root,
  );

  return (
    <SparDialog.Content {...attrs} {...rest} container={context.portalContainer ?? undefined}>
      {children}
    </SparDialog.Content>
  );
}
DialogPanel.displayName = 'Dialog.Panel';

function DialogHeader({ children, className, ...rest }: DialogHeaderProps) {
  const context = useDialogContext('Dialog.Header');
  const attrs = buildSlotAttrs(
    DialogBase.getSlotProps('header', { 'className': clsx(className, headerTypeClassNames[context.headerType]), 'data-header-type': context.headerType }),
    context.slotProps,
    'header',
    context.classNames?.header,
  );
  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
DialogHeader.displayName = 'Dialog.Header';

function DialogTitleGroup({ children, className, ...rest }: DialogTitleGroupProps) {
  const context = useDialogContext('Dialog.TitleGroup');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('titleContainer', { className }), context.slotProps, 'titleContainer', context.classNames?.titleContainer);
  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
DialogTitleGroup.displayName = 'Dialog.TitleGroup';

function DialogTitle({ children, className, ...rest }: DialogTitleProps) {
  const context = useDialogContext('Dialog.Title');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('title', { className }), context.slotProps, 'title', context.classNames?.title);
  return (
    <SparDialog.Title as="span" {...attrs} {...rest}>
      {children}
    </SparDialog.Title>
  );
}
DialogTitle.displayName = 'Dialog.Title';

function DialogDescription({ children, className, ...rest }: DialogDescriptionProps) {
  const context = useDialogContext('Dialog.Description');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('subtitle', { className }), context.slotProps, 'subtitle', context.classNames?.subtitle);
  return (
    <SparDialog.Description as="span" {...attrs} {...rest}>
      {children}
    </SparDialog.Description>
  );
}
DialogDescription.displayName = 'Dialog.Description';

function DialogSignIcon({ children, className, ...rest }: DialogSignIconProps) {
  const context = useDialogContext('Dialog.SignIcon');
  const attrs = buildSlotAttrs(
    DialogBase.getSlotProps('signIcon', { 'aria-hidden': 'true', 'data-variant': context.variant, className }),
    context.slotProps,
    'signIcon',
    context.classNames?.signIcon,
  );
  return (
    <span {...attrs} {...rest}>
      {renderIconSymbol(children ?? getVariantIcon(context.variant), 'tk-dialog-sign-icon-symbol')}
    </span>
  );
}
DialogSignIcon.displayName = 'Dialog.SignIcon';

function DialogCloseButton({ children, className, ...rest }: DialogCloseButtonProps) {
  const context = useDialogContext('Dialog.CloseButton');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('closeButton', { className }), context.slotProps, 'closeButton', context.classNames?.closeButton);
  const iconAttrs = buildSlotAttrs(DialogBase.getSlotProps('closeIcon', { 'aria-hidden': 'true' }), context.slotProps, 'closeIcon', context.classNames?.closeIcon);
  const defaultIcon = renderIconSymbol(<PlaceholderClose />, 'tk-dialog-close-icon-symbol');

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    context.requestClose();
  };

  return (
    <button aria-label="Close dialog" {...attrs} {...rest} onClick={handleClick} type="button">
      <span {...iconAttrs}>{children ?? defaultIcon}</span>
    </button>
  );
}
DialogCloseButton.displayName = 'Dialog.CloseButton';

function DialogBody({ children, className, ...rest }: DialogBodyProps) {
  const context = useDialogContext('Dialog.Body');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('content', { className }), context.slotProps, 'content', context.classNames?.content);
  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
DialogBody.displayName = 'Dialog.Body';

function DialogFooter({ children, className, ...rest }: DialogFooterProps) {
  const context = useDialogContext('Dialog.Footer');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('footer', { className }), context.slotProps, 'footer', context.classNames?.footer);
  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
DialogFooter.displayName = 'Dialog.Footer';

function DialogFooterActions({ children, className, ...rest }: DialogFooterActionsProps) {
  const context = useDialogContext('Dialog.FooterActions');
  const attrs = buildSlotAttrs(DialogBase.getSlotProps('footerActions', { className }), context.slotProps, 'footerActions', context.classNames?.footerActions);
  return (
    <div {...attrs} {...rest}>
      {children}
    </div>
  );
}
DialogFooterActions.displayName = 'Dialog.FooterActions';

const DialogCompound = Object.assign(Dialog, {
  Mask: DialogMask,
  Panel: DialogPanel,
  Header: DialogHeader,
  TitleGroup: DialogTitleGroup,
  Title: DialogTitle,
  Description: DialogDescription,
  SignIcon: DialogSignIcon,
  CloseButton: DialogCloseButton,
  Body: DialogBody,
  Footer: DialogFooter,
  FooterActions: DialogFooterActions,
});

export { DialogCompound as Dialog };
