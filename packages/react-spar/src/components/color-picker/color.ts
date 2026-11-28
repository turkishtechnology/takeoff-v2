// Color math for ColorPicker. Pure functions, no DOM.
//
// The picker edits in HSVA: the area is saturation × value (brightness) and the
// hue slider is hue, so HSV is the space the controls actually move in. Keeping
// it as the internal model is also what lets hue survive a trip through grey or
// black — RGB and HSL both lose it there, and a picker that round-trips through
// them snaps the area back to red whenever saturation touches zero.

import type { ColorPickerFormat } from './types';

/** Hue 0–360, saturation and value 0–100, alpha 0–1. */
export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export const BLACK: Hsva = { h: 0, s: 0, v: 0, a: 1 };

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const hsvaToRgb = ({ h, s, v }: Hsva): Rgb => {
  const sat = s / 100;
  const val = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
};

export const rgbToHsva = ({ r, g, b }: Rgb, a = 1): Hsva => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100, a };
};

export const hsvaToHsl = ({ h, s, v }: Hsva): Hsl => {
  const sat = s / 100;
  const val = v / 100;
  const l = val * (1 - sat / 2);
  const sl = l === 0 || l === 1 ? 0 : (val - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100 };
};

export const hslToHsva = ({ h, s, l }: Hsl, a = 1): Hsva => {
  const sat = s / 100;
  const light = l / 100;
  const v = light + sat * Math.min(light, 1 - light);
  const sv = v === 0 ? 0 : 2 * (1 - light / v);
  return { h, s: sv * 100, v: v * 100, a };
};

const hex2 = (value: number): string => value.toString(16).padStart(2, '0');

export const toHex = (hsva: Hsva, withAlpha: boolean): string => {
  const { r, g, b } = hsvaToRgb(hsva);
  const alpha = withAlpha && hsva.a < 1 ? hex2(Math.round(hsva.a * 255)) : '';
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${alpha}`;
};

/**
 * Serializes a color in `format`. Alpha is written only when it is below 1, so
 * an opaque color reads the way it is usually typed (`#326fd1`, `rgb(…)`).
 */
export const formatColor = (hsva: Hsva, format: ColorPickerFormat): string => {
  const a = round2(hsva.a);
  if (format === 'rgb') {
    const { r, g, b } = hsvaToRgb(hsva);
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }
  if (format === 'hsl') {
    const { h, s, l } = hsvaToHsl(hsva);
    const parts = `${Math.round(h) % 360}, ${Math.round(s)}%, ${Math.round(l)}%`;
    return a < 1 ? `hsla(${parts}, ${a})` : `hsl(${parts})`;
  }
  return toHex(hsva, true);
};

/** `rgb()` / `rgba()` string for CSS painting (previews, gradients), whatever the active format. */
export const toCssRgba = (hsva: Hsva): string => {
  const { r, g, b } = hsvaToRgb(hsva);
  return `rgba(${r}, ${g}, ${b}, ${round2(hsva.a)})`;
};

const parseNumber = (token: string): number | null => {
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(token)) return null;
  return Number(token);
};

// Alpha as `0–1` or `0–100%`.
const parseAlpha = (token: string | undefined): number | null => {
  if (token === undefined) return 1;
  const percent = token.endsWith('%');
  const value = parseNumber(percent ? token.slice(0, -1) : token);
  if (value === null) return null;
  return clamp(percent ? value / 100 : value, 0, 1);
};

// Splits the inside of `rgb(…)` / `hsl(…)` into three channels plus an optional
// alpha. Accepts the legacy comma form (`1, 2, 3, 0.5`) and the modern space
// form (`1 2 3 / 0.5`).
const splitArgs = (body: string): string[] | null => {
  const trimmed = body.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(part => part.trim());
    return parts.length === 3 || parts.length === 4 ? parts : null;
  }
  const [channels, alpha, ...extra] = trimmed.split('/').map(part => part.trim());
  if (extra.length > 0 || alpha === '') return null;
  const parts = channels.split(/\s+/);
  if (parts.length !== 3) return null;
  return alpha === undefined ? parts : [...parts, alpha];
};

const parseHex = (input: string): Hsva | null => {
  const match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input);
  if (!match) return null;
  let hex = match[1];
  if (hex.length <= 4) hex = [...hex].map(char => char + char).join('');
  const channel = (index: number) => parseInt(hex.slice(index, index + 2), 16);
  const a = hex.length === 8 ? channel(6) / 255 : 1;
  return rgbToHsva({ r: channel(0), g: channel(2), b: channel(4) }, a);
};

const parseRgb = (input: string): Hsva | null => {
  const match = /^rgba?\((.*)\)$/i.exec(input);
  if (!match) return null;
  const args = splitArgs(match[1]);
  if (!args) return null;
  const channels = args.slice(0, 3).map(token => {
    if (token.endsWith('%')) {
      const value = parseNumber(token.slice(0, -1));
      return value === null ? null : (value / 100) * 255;
    }
    return parseNumber(token);
  });
  const a = parseAlpha(args[3]);
  if (channels.some(value => value === null) || a === null) return null;
  const [r, g, b] = (channels as number[]).map(value => Math.round(clamp(value, 0, 255)));
  return rgbToHsva({ r, g, b }, a);
};

const parseHsl = (input: string): Hsva | null => {
  const match = /^hsla?\((.*)\)$/i.exec(input);
  if (!match) return null;
  const args = splitArgs(match[1]);
  if (!args) return null;
  const h = parseNumber(args[0].replace(/deg$/i, ''));
  const s = parseNumber(args[1].replace(/%$/, ''));
  const l = parseNumber(args[2].replace(/%$/, ''));
  const a = parseAlpha(args[3]);
  if (h === null || s === null || l === null || a === null) return null;
  return hslToHsva({ h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100) }, a);
};

/**
 * Parses a hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `#` optional),
 * `rgb[a]()` or `hsl[a]()` string, case-insensitively and in any of the three
 * notations regardless of the picker's format. Returns `null` for anything
 * else, so a typo is rejected rather than read as black.
 */
export const parseColor = (input: string): Hsva | null => {
  const value = input.trim();
  if (value === '') return null;
  return parseHex(value) ?? parseRgb(value) ?? parseHsl(value);
};

/**
 * Carries the hue (and, at black, the saturation) of `previous` over to `next`
 * when `next` cannot express it. A grey has no hue and black has neither hue
 * nor saturation, so without this the area thumb and hue slider would jump
 * whenever a typed or controlled value passes through them.
 */
export const keepHue = (next: Hsva, previous: Hsva): Hsva => {
  if (next.v === 0) return { ...next, h: previous.h, s: previous.s };
  if (next.s === 0) return { ...next, h: previous.h };
  return next;
};

/** Whether two colors serialize identically in `format` (the precision the value is committed at). */
export const sameColor = (a: Hsva, b: Hsva, format: ColorPickerFormat): boolean => formatColor(a, format) === formatColor(b, format);
