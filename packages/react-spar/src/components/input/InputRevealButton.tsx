import { useEffect, type ElementType, type MouseEvent } from 'react';
import { useInputContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { PlaceholderEye, PlaceholderEyeOff } from '../../icons';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { InputRevealButtonBase } from './base';
import { useInputOwnContext } from './context';
import type { InputRevealButtonProps } from './types';

export const InputRevealButton = <T extends ElementType = 'button'>(props: InputRevealButtonProps<T>) => {
  const theme = useComponentTheme('InputRevealButton');
  const { disabled, readOnly } = useInputContext();
  const { size, fieldRef, revealed, setRevealed, toggleReveal } = useInputOwnContext('Input.RevealButton');

  const { rootAttrs, rest } = composeRootAttrs(InputRevealButtonBase, props as InputRevealButtonProps<'button'>, theme);

  const { children, onClick, ref, 'type': _type, 'aria-label': _ariaLabel, 'aria-pressed': _ariaPressed, ...buttonProps } = rest;

  // Re-hide the password on form submit. Re-running on every `revealed` change
  // re-resolves the form, so a form/field that mounts after this button (or
  // remounts) still gets the listener, and we only listen while revealed.
  useEffect(() => {
    if (!revealed) return;
    const form = fieldRef.current?.form;
    if (!form) return;
    const handleSubmit = () => setRevealed(false);
    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [revealed, fieldRef, setRevealed]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    toggleReveal();
    fieldRef.current?.focus();
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
      aria-label="Toggle password visibility"
      aria-pressed={revealed}
      onClick={handleClick}
      startContent={children ?? (revealed ? <PlaceholderEyeOff /> : <PlaceholderEye />)}
    />
  );
};

InputRevealButton.displayName = 'Input.RevealButton';
