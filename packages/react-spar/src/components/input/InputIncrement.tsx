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

  const { children, onClick, ref, 'type': _type, 'disabled': _disabled, 'aria-label': ariaLabel = 'Increment value', ...buttonProps } = rest;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    stepField(fieldRef.current, 'up');
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
      startContent={children ?? <PlaceholderChevronUp />}
    />
  );
};

InputIncrement.displayName = 'Input.Increment';
