import { useState, type KeyboardEvent } from 'react';

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
    tabIndex,
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

  const showRemoveButton = removable;
  const isInteractive = removable || clickable;
  const resolvedTabIndex = disabled ? -1 : isInteractive ? (tabIndex ?? 0) : undefined;

  if (dismissed) {
    return null;
  }

  const remove = () => {
    if (disabled || !removable) return;
    onRemove?.();
    if (!autoDismiss) return;
    setDismissed(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    nativeProps.onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (removable && (event.key === 'Backspace' || event.key === 'Delete')) {
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
      onKeyDown={handleKeyDown}
      ref={ref}
      role={clickable ? 'button' : undefined}
      tabIndex={resolvedTabIndex}
    >
      {children && <span {...labelSlotAttrs}>{children}</span>}
      {showRemoveButton && (
        <button {...removeSlotAttrs} aria-label={removeLabel} disabled={disabled} onClick={remove} tabIndex={-1} type="button">
          <PlaceholderClose />
        </button>
      )}
    </span>
  );
};

Chip.displayName = 'Chip';
