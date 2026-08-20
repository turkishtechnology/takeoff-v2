import type { ElementType, KeyboardEvent, MouseEvent } from 'react';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputClearButtonBase } from './base';
import { useInputOwnContext } from './context';
import { setNativeValue } from './dom';
import type { InputClearButtonProps } from './types';

export const InputClearButton = <T extends ElementType = 'button'>(props: InputClearButtonProps<T>) => {
  const theme = useComponentTheme('InputClearButton');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef, fieldValue, setFieldValue, hasAuxContent, clearAux } = useInputOwnContext('Input.ClearButton');

  const { rootAttrs, rest } = composeRootAttrs(InputClearButtonBase, props as InputClearButtonProps<'button'>, theme);
  // Compose `slotProps.root` handlers rather than letting the explicit
  // `onClick`/`onKeyDown` (spread last) silently drop them.
  const {
    onClick: slotOnClick,
    onKeyDown: slotOnKeyDown,
    ...clearRootAttrs
  } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  };

  const { children, onClear, onClick, onKeyDown, ref, 'type': _type, 'aria-label': ariaLabel = 'Clear input', ...buttonProps } = rest;

  // Show whenever the field has typed text OR a content-owning part (e.g.
  // Input.Chips) holds clearable content, so the clear affordance doesn't
  // vanish the moment a tag is committed and the text field is emptied.
  if (disabled || readOnly || (fieldValue === '' && !hasAuxContent)) return null;

  const clear = () => {
    // A single clear wipes the whole field: typed text plus any registered
    // content-owning parts (chips, …).
    clearAux();
    const field = fieldRef.current;
    if (field) {
      setNativeValue(field, '');
      setFieldValue('');
    }
    onClear?.();
    field?.focus();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    slotOnClick?.(event);
    if (event.defaultPrevented) return;
    clear();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    slotOnKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;
    event.preventDefault();
    clear();
  };

  return (
    <Button
      {...buttonProps}
      {...clearRootAttrs}
      ref={ref}
      type="button"
      appearance="text"
      rounded
      size={size}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      startContent={children ?? <CloseIconOutlinedRounded />}
    />
  );
};

InputClearButton.displayName = 'Input.ClearButton';
