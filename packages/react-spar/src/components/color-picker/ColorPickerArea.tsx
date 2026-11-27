import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { clamp } from './color';
import { ColorPickerAreaBase } from './base';
import { useColorPickerContext } from './context';
import { AREA_PAGE_STEP, AREA_STEP } from './defaults';
import { slotAttrs } from './helpers';
import type { ColorPickerAreaProps } from './types';

export const ColorPickerArea = (props: ColorPickerAreaProps) => {
  const theme = useComponentTheme('ColorPickerArea');
  const ctx = useColorPickerContext('ColorPicker.Area');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerAreaBase, props, theme);
  const { ref, onPointerDown, ...nativeProps } = rest;
  const thumbAttrs = slotAttrs(ColorPickerAreaBase, 'thumb', theme, props);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);

  const interactive = !ctx.disabled && !ctx.readOnly;
  const { h, s, v } = ctx.hsva;

  const moveTo = (clientX: number, clientY: number) => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0;
    const y = rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0;
    ctx.patch({ s: Math.round(x * 100), v: Math.round((1 - y) * 100) });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || !interactive || event.button !== 0) return;
    event.preventDefault();
    pointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    thumbRef.current?.focus();
    moveTo(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    moveTo(event.clientX, event.clientY);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
    ctx.settle();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const step = event.shiftKey ? AREA_PAGE_STEP : AREA_STEP;
    let next: { s: number; v: number };
    switch (event.key) {
      case 'ArrowLeft':
        next = { s: s - step, v };
        break;
      case 'ArrowRight':
        next = { s: s + step, v };
        break;
      case 'ArrowUp':
        next = { s, v: v + step };
        break;
      case 'ArrowDown':
        next = { s, v: v - step };
        break;
      case 'PageUp':
        next = { s, v: v + AREA_PAGE_STEP };
        break;
      case 'PageDown':
        next = { s, v: v - AREA_PAGE_STEP };
        break;
      case 'Home':
        next = { s: 0, v };
        break;
      case 'End':
        next = { s: 100, v };
        break;
      default:
        return;
    }
    event.preventDefault();
    ctx.patch({ s: clamp(Math.round(next.s), 0, 100), v: clamp(Math.round(next.v), 0, 100) }, true);
  };

  const saturation = Math.round(s);
  const brightness = Math.round(v);

  return (
    <div
      {...nativeProps}
      {...rootAttrs}
      data-disabled={ctx.disabled ? '' : undefined}
      data-readonly={ctx.readOnly ? '' : undefined}
      // The plane paints the pure hue; the white and black gradients over it
      // live in the recipe.
      style={{ ...nativeProps.style, '--tk-color-picker-hue': `hsl(${Math.round(h)}, 100%, 50%)` } as CSSProperties}
      ref={node => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={event => {
        if (pointerRef.current === event.pointerId) endDrag(event);
      }}
    >
      <div
        {...thumbAttrs}
        ref={thumbRef}
        role="slider"
        tabIndex={ctx.disabled ? -1 : 0}
        aria-label={ctx.labels.area}
        aria-roledescription={ctx.labels.areaRoleDescription}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={saturation}
        aria-valuetext={formatLabel(ctx.labels.areaValue, { saturation, brightness })}
        aria-disabled={ctx.disabled || undefined}
        aria-readonly={ctx.readOnly || undefined}
        data-dragging={dragging ? '' : undefined}
        data-focus={focused ? '' : undefined}
        style={{ left: `${s}%`, top: `${100 - v}%` }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

ColorPickerArea.displayName = 'ColorPicker.Area';
