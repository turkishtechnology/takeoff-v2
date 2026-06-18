import type { ElementType, KeyboardEvent, MouseEvent } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { PlaceholderClose } from '../../icons';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputClearButtonBase } from './base';
import { useInputOwnContext } from './context';
import { setNativeValue } from './dom';
import type { InputClearButtonProps } from './types';

export const InputClearButton = <T extends ElementType = 'button'>(props: InputClearButtonProps<T>) => {
  const theme = useComponentTheme('InputClearButton');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef, fieldValue, setFieldValue } = useInputOwnContext('Input.ClearButton');

  const { rootAttrs, rest } = composeRootAttrs(InputClearButtonBase, props as InputClearButtonProps<'button'>, theme);

  const { children, onClear, onClick, onKeyDown, ref, 'type': _type, 'aria-label': ariaLabel = 'Clear input', ...buttonProps } = rest;

  if (disabled || readOnly || fieldValue === '') return null;

  const clear = () => {
    const field = fieldRef.current;
    if (!field) return;
    setNativeValue(field, '');
    setFieldValue('');
    onClear?.();
    field.focus();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    clear();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;
    event.preventDefault();
    clear();
  };

  return (
    <Button
      {...buttonProps}
      {...rootAttrs}
      ref={ref}
      type="button"
      appearance="text"
      rounded
      size={size}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      startContent={children ?? <PlaceholderClose />}
    />
  );
};

InputClearButton.displayName = 'Input.ClearButton';
