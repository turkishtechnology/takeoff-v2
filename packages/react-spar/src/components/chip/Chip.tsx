import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';

import { buildSlotAttrs, composeRootAttrs, isRenderableNode } from '../../core';
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
  // `role` / `tabIndex` / the action handlers from `slotProps.root` describe
  // the click action, so they are resolved together with the instance props
  // below and land on the action node rather than being spread verbatim.
  const {
    onClick: rootSlotOnClick,
    onKeyDown: rootSlotOnKeyDown,
    role: rootSlotRole,
    tabIndex: rootSlotTabIndex,
    ...chipRootAttrs
  } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLSpanElement>) => void;
    role?: string;
    tabIndex?: number;
  };

  const {
    variant: _variant,
    appearance: _appearance,
    size: _size,
    autoDismiss = true,
    clickable = false,
    disabled = false,
    removable = false,
    onRemove,
    children,
    ref,
    role,
    tabIndex,
    onClick,
    onKeyDown,
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
  const { onClick: removeSlotOnClick, ...removeButtonAttrs } = removeSlotAttrs as typeof removeSlotAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };

  // Only a clickable chip turns the chip into a focusable widget. A
  // removable-only chip keeps the root non-interactive and exposes the
  // labeled remove <button> as the tab stop, so assistive tech reaches a
  // control that announces the remove affordance.
  //
  // A chip that is both clickable and removable must not nest that <button>
  // inside a role="button" root: ARIA treats a button's children as
  // presentational (assistive tech may never expose the remove control) and
  // axe reports nested-interactive. The click action therefore moves onto the
  // label slot, which sits next to the remove button as a sibling control,
  // while the root stays a plain visual container.
  const actionOnLabel = clickable && removable;

  // `role` / `tabIndex` describe the action node wherever it lives: instance
  // prop → `slotProps.root` → wrapper default. A disabled chip is always kept
  // out of the tab order, even when a static chip was opted in with a tabIndex.
  const requestedTabIndex = tabIndex ?? rootSlotTabIndex;
  const enabledTabIndex = clickable ? (requestedTabIndex ?? 0) : requestedTabIndex;
  const resolvedTabIndex = disabled && enabledTabIndex !== undefined ? -1 : enabledTabIndex;
  const resolvedRole = role ?? rootSlotRole ?? (clickable ? 'button' : undefined);

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
    // The remove button reports through `onRemove` only. Stop the click here
    // so it never doubles as the chip's own onClick (root or slot handler) or
    // reaches ancestor delegation as if the chip itself had been clicked.
    event.stopPropagation();
    removeSlotOnClick?.(event);
    if (event.defaultPrevented) return;
    remove();
  };

  const handleRootClick = (event: MouseEvent<HTMLSpanElement>) => {
    // The root is a <span>, so the platform never blocks clicks the way it
    // does for a disabled <button>; enforce disabled in JS instead of relying
    // solely on the recipe's `pointer-events: none`.
    if (disabled) return;
    onClick?.(event);
    rootSlotOnClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    // Only keys pressed on the action node itself belong to the chip. A
    // keydown bubbling up from nested content — e.g. an interactive element a
    // consumer placed in the label — must keep its own default (Enter/Space
    // activating that element) rather than being re-routed to the chip.
    if (event.target !== event.currentTarget) return;
    // Gate on `disabled` before any handler so a disabled chip never runs the
    // consumer's slot/native keydown handler — symmetric with `handleRootClick`.
    if (disabled) return;

    onKeyDown?.(event);
    rootSlotOnKeyDown?.(event);
    // Only an explicit cancel by the consumer's own keydown handlers blocks the
    // built-in activation. The chip's keys (Enter/Space/Backspace/Delete) are
    // rarely intercepted, so a slot handler that `preventDefault`s for an
    // unrelated key still leaves activation working for the relevant keys.
    if (event.defaultPrevented) return;

    if (clickable && removable && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      remove();
      return;
    }

    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      // The click bubbles to the root, which owns `onClick` in both layouts.
      event.currentTarget.click();
    }
  };

  const actionAttrs = {
    'role': resolvedRole,
    'tabIndex': resolvedTabIndex,
    'aria-disabled': disabled || undefined,
    'onKeyDown': handleKeyDown,
  };

  return (
    <span {...nativeProps} {...chipRootAttrs} aria-disabled={disabled || undefined} onClick={handleRootClick} ref={ref} {...(actionOnLabel ? undefined : actionAttrs)}>
      {(isRenderableNode(children) || actionOnLabel) && (
        <span {...labelSlotAttrs} {...(actionOnLabel ? actionAttrs : undefined)}>
          {children}
        </span>
      )}
      {removable && (
        // The icon-only remove control needs an accessible name. Default it,
        // but let `slotProps.remove` (spread after) override via `aria-label`.
        <button aria-label={DEFAULT_REMOVE_LABEL} {...removeButtonAttrs} disabled={disabled} onClick={handleRemoveClick} type="button">
          <CloseIconOutlinedRounded />
        </button>
      )}
    </span>
  );
};

Chip.displayName = 'Chip';
