import type { ElementType, MouseEvent, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button, type ButtonAppearance, type ButtonVariant } from '../button';

import { UploadTriggerBase } from './base';
import { useUploadContext } from './context';
import type { UploadTriggerOwnProps, UploadTriggerProps } from './types';

type UploadTriggerResolvedProps = Omit<UploadTriggerOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<HTMLButtonElement>;
  disabled?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

// The design's browse button is a plain outlined/neutral Button at base size, and
// `Upload.Submit` meets it here rather than outranking it: the two stand beside
// each other in the zone, so they read as one pair instead of two weights.
// Defaults, not fixed values, on both: a consumer is expected to re-point them
// (a filled Trigger standing alone, or a filled Submit where sending the batch is
// the page's primary action).
const DEFAULT_TRIGGER_APPEARANCE: ButtonAppearance = 'outlined';
const DEFAULT_TRIGGER_VARIANT: ButtonVariant = 'neutral';

export const UploadTrigger = <T extends ElementType = 'button'>(props: UploadTriggerProps<T>) => {
  const theme = useComponentTheme('UploadTrigger');
  const { disabled, readOnly, openFileDialog } = useUploadContext('Upload.Trigger');

  const { rootAttrs, rest } = composeRootAttrs(UploadTriggerBase, props as UploadTriggerProps<'button'>, theme);
  // Compose `slotProps.root`'s onClick rather than letting the explicit
  // `onClick` below (spread last) silently drop it.
  const { onClick: slotOnClick, ...triggerRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  const {
    as,
    children,
    ref,
    disabled: ownDisabled,
    href,
    onClick,
    appearance = DEFAULT_TRIGGER_APPEARANCE,
    variant = DEFAULT_TRIGGER_VARIANT,
    ...buttonProps
  } = rest as UploadTriggerResolvedProps;

  const isDisabled = disabled || readOnly || ownDisabled;
  // Spar's Button marks a disabled non-button but leaves its `href` navigable,
  // so the link form drops the target while inert — the ItemAction rule, and the
  // one route by which a read-only Trigger could still take the user somewhere.
  const isButton = (as ?? 'button') === 'button';
  const linkProps = isButton ? undefined : ({ href: isDisabled ? undefined : href } as { href?: string });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    slotOnClick?.(event);
    if (event.defaultPrevented) return;
    openFileDialog();
  };

  return (
    // Read-only freezes the Trigger rather than unmounting it, which is the
    // opposite of what the ItemAction's remove does under the same state. The
    // asymmetry is the point: a file row without its remove still reads as a
    // whole row, but the zone's browse button is most of what the zone shows —
    // drop it and a dashed box is left offering a drop that never lands.
    <Button {...buttonProps} {...linkProps} {...triggerRootAttrs} as={as} appearance={appearance} variant={variant} disabled={isDisabled} onClick={handleClick} ref={ref}>
      {children}
    </Button>
  );
};

UploadTrigger.displayName = 'Upload.Trigger';
