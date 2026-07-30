import type { ElementType, MouseEvent, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button, type ButtonAppearance, type ButtonVariant } from '../button';

import { UploadSubmitBase } from './base';
import { useUploadContext } from './context';
import type { UploadSubmitOwnProps, UploadSubmitProps } from './types';

type UploadSubmitResolvedProps = Omit<UploadSubmitOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<HTMLButtonElement>;
  disabled?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

// The Trigger's treatment rather than Button's own: the two stand beside each
// other in the zone, so they read as one pair instead of two weights. A default,
// not a fixed value — where the send really is the page's primary action, the call
// site re-points it.
const DEFAULT_SUBMIT_APPEARANCE: ButtonAppearance = 'outlined';
const DEFAULT_SUBMIT_VARIANT: ButtonVariant = 'neutral';

export const UploadSubmit = <T extends ElementType = 'button'>(props: UploadSubmitProps<T>) => {
  const theme = useComponentTheme('UploadSubmit');
  const { disabled, files } = useUploadContext('Upload.Submit');

  const { rootAttrs, rest } = composeRootAttrs(UploadSubmitBase, props as UploadSubmitProps<'button'>, theme);
  // Compose `slotProps.root`'s onClick rather than letting the explicit
  // `onClick` below (spread last) silently drop it.
  const { onClick: slotOnClick, ...submitRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  const {
    as,
    children,
    ref,
    disabled: ownDisabled,
    href,
    onClick,
    appearance = DEFAULT_SUBMIT_APPEARANCE,
    variant = DEFAULT_SUBMIT_VARIANT,
    ...buttonProps
  } = rest as UploadSubmitResolvedProps;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    slotOnClick?.(event);
  };

  // The component does not perform the upload (out of scope) — the consumer's
  // `onClick` does. Nothing to submit while empty, so it disables itself.
  //
  // `readOnly` is deliberately not in that list, unlike the Trigger's: view mode
  // fixes the file list, and handing a fixed list upstream does not change it.
  // A review step that shows what is attached and lets you send it is the whole
  // point of the state, so only `disabled` — the inert root — takes Submit down.
  const isDisabled = disabled || ownDisabled || files.length === 0;

  // Spar's Button marks a disabled non-button (`aria-disabled`, `tabindex="-1"`,
  // `data-disabled`) but leaves its `href` navigable, so the link form drops the
  // target while disabled — a click or a screen-reader activation must not
  // navigate away from a control the anatomy has declared inert. On the default
  // button form there is nowhere for an `href` to go at all (the ItemAction
  // rule).
  const isButton = (as ?? 'button') === 'button';
  const linkProps = isButton ? undefined : ({ href: isDisabled ? undefined : href } as { href?: string });

  // `as` is forwarded, not consumed — Button is polymorphic too, so
  // `<Upload.Submit as="a">` keeps the Button treatment.
  return (
    <Button {...buttonProps} {...linkProps} {...submitRootAttrs} as={as} appearance={appearance} variant={variant} disabled={isDisabled} onClick={handleClick} ref={ref}>
      {children}
    </Button>
  );
};

UploadSubmit.displayName = 'Upload.Submit';
