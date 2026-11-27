import { useEffect, useState, type MouseEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { ColorPickerEyeDropperBase } from './base';
import { useColorPickerContext } from './context';
import { EyeDropperIcon } from './icons';
import type { ColorPickerEyeDropperProps } from './types';

interface EyeDropperApi {
  open: () => Promise<{ sRGBHex: string }>;
}

type EyeDropperWindow = Window & { EyeDropper?: new () => EyeDropperApi };

const getEyeDropper = () => (typeof window === 'undefined' ? undefined : (window as EyeDropperWindow).EyeDropper);

export const ColorPickerEyeDropper = (props: ColorPickerEyeDropperProps) => {
  const theme = useComponentTheme('ColorPickerEyeDropper');
  const ctx = useColorPickerContext('ColorPicker.EyeDropper');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerEyeDropperBase, props, theme);
  const { children, onClick, disabled, ref, ...nativeProps } = rest;

  // Detected after mount so server and first client render agree.
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(getEyeDropper() !== undefined), []);

  if (!supported) return null;

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    const EyeDropper = getEyeDropper();
    if (event.defaultPrevented || !EyeDropper) return;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      ctx.commitText(sRGBHex);
    } catch {
      // The user dismissed the picker (AbortError): nothing to commit.
    }
  };

  return (
    <Button
      type="button"
      variant="neutral"
      appearance="outlined"
      size="small"
      aria-label={ctx.labels.eyeDropper}
      {...nativeProps}
      {...rootAttrs}
      ref={ref}
      disabled={disabled ?? (ctx.disabled || ctx.readOnly)}
      onClick={handleClick}
    >
      {children ?? <EyeDropperIcon />}
    </Button>
  );
};

ColorPickerEyeDropper.displayName = 'ColorPicker.EyeDropper';
