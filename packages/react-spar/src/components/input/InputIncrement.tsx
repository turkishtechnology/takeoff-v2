import type { ElementType, MouseEvent } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { PlaceholderChevronUp } from '../../icons';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputIncrementBase } from './base';
import { useInputOwnContext } from './context';
import { stepField } from './dom';
import type { InputIncrementProps } from './types';

export const InputIncrement = <T extends ElementType = 'button'>(props: InputIncrementProps<T>) => {
  const theme = useComponentTheme('InputIncrement');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef } = useInputOwnContext('Input.Increment');

  const { rootAttrs, rest } = composeRootAttrs(InputIncrementBase, props as InputIncrementProps<'button'>, theme);
  // Compose a `slotProps.root.onClick` rather than letting the explicit
  // `onClick={handleClick}` (spread last) silently drop it.
  const { onClick: slotOnClick, ...incrementRootAttrs } = rootAttrs as typeof rootAttrs & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  };

  const { children, onClick, ref, 'type': _type, 'disabled': _disabled, 'aria-label': ariaLabel = 'Increment value', ...buttonProps } = rest;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    slotOnClick?.(event);
    if (event.defaultPrevented) return;
    stepField(fieldRef.current, 'up');
  };

  return (
    <Button
      {...buttonProps}
      {...incrementRootAttrs}
      ref={ref}
      type="button"
      appearance="text"
      rounded
      size={size}
      disabled={disabled || readOnly}
      aria-label={ariaLabel}
      onClick={handleClick}
      startContent={children ?? <PlaceholderChevronUp />}
    />
  );
};

InputIncrement.displayName = 'Input.Increment';
