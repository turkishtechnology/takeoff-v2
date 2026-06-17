import { useState, type KeyboardEvent, type MouseEvent } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { PlaceholderClose } from '../../icons';
import { useComponentTheme } from '../../provider';

import { ChipBase } from './base';
import { DEFAULT_APPEARANCE, DEFAULT_REMOVE_LABEL, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import type { ChipProps, ChipSlot } from './types';

export const Chip = (props: ChipProps) => {
  const theme = useComponentTheme('Chip');
  const [dismissed, setDismissed] = useState(false);

  const { rootAttrs, rest } = composeRootAttrs<ChipProps, ChipSlot>(ChipBase, props, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT, appearance = DEFAULT_APPEARANCE, size = DEFAULT_SIZE, clickable = false, disabled = false, removable = false }) => ({
      'data-variant': variant,
      'data-type': appearance,
      'data-size': size,
      'data-clickable': clickable ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-removable': removable ? '' : undefined,
    }),
  });

  const {
    variant: _variant,
    appearance: _appearance,
    size: _size,
    autoDismiss = true,
    clickable = false,
    disabled = false,
    removable = false,
    onRemove,
    removeLabel = DEFAULT_REMOVE_LABEL,
    children,
    ref,
    role,
    tabIndex,
    onClick,
    ...nativeProps
  } = rest;

  const labelSlotAttrs = buildSlotAttrs(ChipBase.getSlotProps('label'), 'label' as ChipSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const removeSlotAttrs = buildSlotAttrs(ChipBase.getSlotProps('remove'), 'remove' as ChipSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // Only a clickable chip turns the root into a focusable widget. A
  // removable-only chip keeps the root non-interactive and exposes the
  // labeled remove <button> as the tab stop, so assistive tech reaches a
  // control that announces the remove affordance.
  const resolvedTabIndex = clickable ? (disabled ? -1 : (tabIndex ?? 0)) : tabIndex;
  const resolvedRole = role ?? (clickable ? 'button' : undefined);

  if (dismissed) {
    return null;
  }

  const remove = () => {
    if (disabled || !removable) return;
    onRemove?.();
    if (!autoDismiss) return;
    setDismissed(true);
  };

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Keep a click on the remove button from also reaching a clickable
    // chip's root onClick (which would both remove and activate the chip).
    event.stopPropagation();
    remove();
  };

  const handleRootClick = (event: MouseEvent<HTMLSpanElement>) => {
    // The root is a <span>, so the platform never blocks clicks the way it
    // does for a disabled <button>; enforce disabled in JS instead of relying
    // solely on the recipe's `pointer-events: none`.
    if (disabled) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    nativeProps.onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (clickable && removable && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      remove();
      return;
    }

    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <span
      {...nativeProps}
      {...rootAttrs}
      aria-disabled={disabled || undefined}
      onClick={handleRootClick}
      onKeyDown={handleKeyDown}
      ref={ref}
      role={resolvedRole}
      tabIndex={resolvedTabIndex}
    >
      {children != null && <span {...labelSlotAttrs}>{children}</span>}
      {removable && (
        <button {...removeSlotAttrs} aria-label={removeLabel} disabled={disabled} onClick={handleRemoveClick} type="button">
          <PlaceholderClose />
        </button>
      )}
    </span>
  );
};

Chip.displayName = 'Chip';
