import type { ElementType, MouseEvent } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { PlaceholderChevronDown } from '../../icons';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputDecrementBase } from './base';
import { useInputOwnContext } from './context';
import { stepField } from './dom';
import type { InputDecrementProps } from './types';

export const InputDecrement = <T extends ElementType = 'button'>(props: InputDecrementProps<T>) => {
  const theme = useComponentTheme('InputDecrement');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef } = useInputOwnContext('Input.Decrement');

  const { rootAttrs, rest } = composeRootAttrs(InputDecrementBase, props as InputDecrementProps<'button'>, theme);
  // Compose a `slotProps.root.onClick` rather than letting the explicit
  // `onClick={handleClick}` (spread last) silently drop it.
  const { onClick: slotOnClick, ...decrementRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };

  const { children, onClick, ref, 'type': _type, 'disabled': _disabled, 'aria-label': ariaLabel = 'Decrement value', ...buttonProps } = rest;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    slotOnClick?.(event);
    if (event.defaultPrevented) return;
    stepField(fieldRef.current, 'down');
  };

  return (
    <Button
      {...buttonProps}
      {...decrementRootAttrs}
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
