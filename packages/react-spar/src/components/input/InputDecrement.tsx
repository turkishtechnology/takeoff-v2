import type { ElementType, MouseEvent } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { PlaceholderChevronDown } from '../../icons';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputDecrementBase } from './base';
import { useInputOwnContext } from './context';
import type { InputDecrementProps } from './types';

export const InputDecrement = <T extends ElementType = 'button'>(props: InputDecrementProps<T>) => {
  const theme = useComponentTheme('InputDecrement');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef } = useInputOwnContext('Input.Decrement');

  const { rootAttrs, rest } = composeRootAttrs(InputDecrementBase, props as InputDecrementProps<'button'>, theme);

  const { children, onClick, ref, 'type': _type, 'disabled': _disabled, 'aria-label': ariaLabel = 'Decrement value', ...buttonProps } = rest;

  const decrement = () => {
    const field = fieldRef.current;
    if (!(field instanceof HTMLInputElement)) return;
    field.stepDown();
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.focus();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    decrement();
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
      disabled={disabled || readOnly}
      aria-label={ariaLabel}
      onClick={handleClick}
      startContent={children ?? <PlaceholderChevronDown />}
    />
  );
};

InputDecrement.displayName = 'Input.Decrement';
