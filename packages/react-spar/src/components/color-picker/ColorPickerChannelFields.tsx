import { useEffect, useState, type KeyboardEvent } from 'react';
import { FieldReset } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';

import { clamp, hslToHsva, hsvaToHsl, hsvaToRgb, keepHue, parseColor, rgbToHsva, toHex, type Hsva } from './color';
import { ColorPickerChannelFieldsBase } from './base';
import { useColorPickerContext } from './context';
import { AREA_PAGE_STEP } from './defaults';
import { slotAttrs } from './helpers';
import type { ColorPickerChannelFieldsProps } from './types';

interface ChannelInputProps {
  label: string;
  /** Committed text the field shows when it is not being edited. */
  display: string;
  /** Commits typed text; returns `false` to reject it (the field reverts). */
  onCommit: (text: string) => boolean;
  /** Numeric channels step with ArrowUp/ArrowDown (Shift ×10) inside these bounds. */
  range?: { min: number; max: number; value: number; onStep: (next: number) => void };
  prefix?: string;
  suffix?: string;
  disabled: boolean;
  readOnly: boolean;
  attrs: Record<string, unknown>;
}

const ChannelInput = ({ label, display, onCommit, range, prefix, suffix, disabled, readOnly, attrs }: ChannelInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  // A change made elsewhere (area, slider, swatch) replaces stale text.
  useEffect(() => setDraft(null), [display]);

  const commit = () => {
    if (draft === null) return;
    if (draft.trim() !== '') onCommit(draft.trim());
    setDraft(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape' && draft !== null) {
      // Revert this field only; a handled Escape does not close the popover.
      event.preventDefault();
      setDraft(null);
    } else if (range && !readOnly && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const step = (event.shiftKey ? AREA_PAGE_STEP : 1) * (event.key === 'ArrowUp' ? 1 : -1);
      setDraft(null);
      range.onStep(clamp(range.value + step, range.min, range.max));
    }
  };

  return (
    <Input {...attrs} size="small" disabled={disabled} readOnly={readOnly}>
      {prefix && <Input.Prefix aria-hidden="true">{prefix}</Input.Prefix>}
      <Input.Field
        aria-label={label}
        value={draft ?? display}
        inputMode={range ? 'numeric' : 'text'}
        autoComplete="off"
        spellCheck={false}
        onChange={event => setDraft(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
      {suffix && <Input.Suffix aria-hidden="true">{suffix}</Input.Suffix>}
    </Input>
  );
};

const parseChannel = (text: string, min: number, max: number): number | null => {
  const cleaned = text.replace(/[%°]$/, '').trim();
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  return clamp(Math.round(Number(cleaned)), min, max);
};

export const ColorPickerChannelFields = (props: ColorPickerChannelFieldsProps) => {
  const theme = useComponentTheme('ColorPickerChannelFields');
  const ctx = useColorPickerContext('ColorPicker.ChannelFields');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerChannelFieldsBase, props, theme);
  const { ref, ...nativeProps } = rest;
  const fieldAttrs = slotAttrs(ColorPickerChannelFieldsBase, 'field', theme, props);

  const { hsva, labels, format } = ctx;
  const common = { disabled: ctx.disabled, readOnly: ctx.readOnly, attrs: fieldAttrs };

  // `explicitHue`: the H field set the hue itself, so a grey must not undo it.
  const commit = (next: Hsva, explicitHue = false) => {
    ctx.update(explicitHue ? next : keepHue(next, hsva), true);
    return true;
  };

  // One numeric channel: parses, clamps and rebuilds the color from it.
  const numeric = (label: string, value: number, max: number, build: (channel: number) => Hsva, suffix?: string, explicitHue = false) => (
    <ChannelInput
      key={label}
      {...common}
      label={label}
      display={String(value)}
      suffix={suffix}
      range={{ min: 0, max, value, onStep: channel => commit(build(channel), explicitHue) }}
      onCommit={text => {
        const channel = parseChannel(text, 0, max);
        return channel === null ? false : commit(build(channel), explicitHue);
      }}
    />
  );

  let channels;
  if (format === 'rgb') {
    const rgb = hsvaToRgb(hsva);
    const build = (key: 'r' | 'g' | 'b') => (channel: number) => rgbToHsva({ ...rgb, [key]: channel }, hsva.a);
    channels = [numeric(labels.red, rgb.r, 255, build('r')), numeric(labels.green, rgb.g, 255, build('g')), numeric(labels.blue, rgb.b, 255, build('b'))];
  } else if (format === 'hsl') {
    const hsl = hsvaToHsl(hsva);
    const build = (key: 'h' | 's' | 'l') => (channel: number) => hslToHsva({ ...hsl, [key]: channel }, hsva.a);
    channels = [
      // Hue typed into H must stick even on a grey, where it has no visible effect.
      numeric(labels.hue, Math.round(hsl.h) % 360, 360, build('h'), undefined, true),
      numeric(labels.saturation, Math.round(hsl.s), 100, build('s')),
      numeric(labels.lightness, Math.round(hsl.l), 100, build('l')),
    ];
  } else {
    channels = [
      <ChannelInput
        key="hex"
        {...common}
        label={labels.hex}
        prefix="#"
        display={toHex(hsva, false).slice(1)}
        onCommit={text => {
          const parsed = /^#?[0-9a-f]+$/i.test(text) ? parseColor(text.startsWith('#') ? text : `#${text}`) : null;
          if (!parsed) return false;
          // Three or six digits leave alpha alone; four or eight set it.
          const digits = text.replace('#', '').length;
          return commit(digits === 4 || digits === 8 ? parsed : { ...parsed, a: hsva.a });
        }}
      />,
    ];
  }

  const alphaPercent = Math.round(hsva.a * 100);

  return (
    <FieldReset>
      <div {...nativeProps} {...rootAttrs} ref={ref}>
        {channels}
        {/* Four fields leave no room for the `%` suffix (Core shows none); the field's name says what it is. */}
        {ctx.alpha && numeric(labels.alpha, alphaPercent, 100, percent => ({ ...hsva, a: percent / 100 }), format === 'hex' ? '%' : undefined)}
      </div>
    </FieldReset>
  );
};

ColorPickerChannelFields.displayName = 'ColorPicker.ChannelFields';
