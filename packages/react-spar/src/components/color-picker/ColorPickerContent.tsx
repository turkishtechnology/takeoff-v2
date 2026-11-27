import type { ElementType } from 'react';
import { clsx } from 'clsx';

import { PopoverContent } from '../popover/PopoverContent';

import { ColorPickerContentBase } from './base';
import { ColorPickerPanel } from './ColorPickerPanel';
import { useColorPickerContext } from './context';
import type { ColorPickerContentProps } from './types';

const isInside = (node: HTMLElement | null, target: EventTarget | null) => !!node && target instanceof Node && node.contains(target);

export const ColorPickerContent = <T extends ElementType = 'div'>(props: ColorPickerContentProps<T>) => {
  const ctx = useColorPickerContext('ColorPicker.Content');
  const { children, classNames, onOpenAutoFocus, onInteractOutside, onEscapeKeyDown, ...rest } = props as ColorPickerContentProps<'div'>;

  return (
    <PopoverContent
      align="end"
      {...rest}
      classNames={{ ...classNames, root: clsx(ColorPickerContentBase.classes.root, classNames?.root) }}
      onOpenAutoFocus={event => {
        onOpenAutoFocus?.(event);
        // Opened from the text field: the user is typing, so focus stays there.
        if (ctx.keepFieldFocusRef.current) event.preventDefault();
        ctx.keepFieldFocusRef.current = false;
      }}
      onInteractOutside={event => {
        onInteractOutside?.(event);
        // The text field belongs to the picker: clicking or focusing it keeps
        // the panel open rather than dismissing and reopening it.
        if (isInside(ctx.inputRootRef.current, event.target)) event.preventDefault();
      }}
      onEscapeKeyDown={event => {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) ctx.restoreOpenedValue();
      }}
    >
      {children ?? <ColorPickerPanel />}
    </PopoverContent>
  );
};

ColorPickerContent.displayName = 'ColorPicker.Content';
