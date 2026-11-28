import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';
import { Popover } from '../popover';

import { toCssRgba } from './color';
import { ColorPickerInputBase } from './base';
import { useColorPickerContext } from './context';
import { slotAttrs, swatchStyle } from './helpers';
import { ChevronDownIcon } from './icons';
import type { ColorPickerInputProps } from './types';

export const ColorPickerInput = (props: ColorPickerInputProps) => {
  const theme = useComponentTheme('ColorPickerInput');
  const ctx = useColorPickerContext('ColorPicker.Input');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerInputBase, props, theme);
  const { ref, ...nativeProps } = rest;
  const previewAttrs = slotAttrs(ColorPickerInputBase, 'preview', theme, props);

  // Text being typed; `null` while the field shows the committed value.
  const [draft, setDraft] = useState<string | null>(null);
  // A value committed elsewhere (the panel, a swatch) replaces stale text.
  useEffect(() => setDraft(null), [ctx.value]);

  const interactive = !ctx.disabled && !ctx.readOnly;

  const commit = () => {
    if (draft === null) return;
    // Unparseable text is rejected: the value stays, and the field shows it again.
    if (draft.trim() !== '') ctx.commitText(draft);
    setDraft(null);
  };

  const openFromField = () => {
    if (!interactive || ctx.open) return;
    // Opened by typing or clicking in the text: focus stays in the field.
    ctx.keepFieldFocusRef.current = true;
    ctx.setOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape' && draft !== null) {
      // Revert the text only. Marking the event handled keeps the open popover
      // (which listens on the document) from also closing and restoring.
      event.preventDefault();
      setDraft(null);
    } else if (event.key === 'ArrowDown' && interactive && !ctx.open) {
      event.preventDefault();
      ctx.setOpen(true);
    }
  };

  const color = ctx.value === '' ? undefined : toCssRgba(ctx.hsva);

  return (
    <Input
      {...nativeProps}
      {...rootAttrs}
      ref={(node: HTMLDivElement | null) => {
        ctx.inputRootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      size={ctx.size}
      disabled={ctx.disabled}
      readOnly={ctx.readOnly}
      invalid={ctx.invalid}
      required={ctx.required}
    >
      <Input.LeadingIcon>
        <span {...previewAttrs} style={color ? swatchStyle(color) : undefined} />
      </Input.LeadingIcon>
      <Input.Field
        value={draft ?? ctx.value}
        placeholder={ctx.placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={event => setDraft(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        onClick={(event: MouseEvent<HTMLInputElement>) => {
          if (event.button === 0) openFromField();
        }}
      />
      <Popover.Trigger aria-label={ctx.labels.trigger} classNames={{ root: 'tk-input-action' }}>
        <ChevronDownIcon />
      </Popover.Trigger>
    </Input>
  );
};

ColorPickerInput.displayName = 'ColorPicker.Input';
