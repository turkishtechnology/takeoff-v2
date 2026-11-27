import { describe, expect, it } from 'vitest';

import { BLACK, clamp, formatColor, hslToHsva, hsvaToHsl, hsvaToRgb, keepHue, parseColor, rgbToHsva, sameColor, toCssRgba, toHex } from './color';

const BLUE = '#326fd1';

describe('color', () => {
  describe('parseColor', () => {
    it.each([
      ['#326FD1', BLUE],
      ['326fd1', BLUE],
      ['#fff', '#ffffff'],
      ['#ffff', '#ffffff'],
      ['#ff000080', '#ff000080'],
      ['#f008', '#ff000088'],
      ['rgb(50, 111, 209)', BLUE],
      ['RGB(50 111 209)', BLUE],
      ['rgba(255, 0, 0, 0.5)', '#ff000080'],
      ['rgb(255 0 0 / 50%)', '#ff000080'],
      ['rgb(100%, 0%, 0%)', '#ff0000'],
      ['rgb(300, -5, 0)', '#ff0000'],
      ['hsl(0, 100%, 50%)', '#ff0000'],
      ['hsl(120deg 100% 25%)', '#008000'],
      ['hsla(240, 100%, 50%, 0.25)', '#0000ff40'],
      ['hsl(-120, 100, 50)', '#0000ff'],
      ['  #000  ', '#000000'],
    ])('reads %s', (input, hex) => {
      const parsed = parseColor(input);
      expect(parsed).not.toBeNull();
      expect(toHex(parsed!, true)).toBe(hex);
    });

    it.each([
      '',
      '   ',
      '#12',
      '#12345',
      '#ggg',
      'red',
      'rgb(1, 2)',
      'rgb(1, 2, 3, 4, 5)',
      'rgb(a, b, c)',
      'rgb(1 2 3 /)',
      'rgb(1 2 3 / 4 / 5)',
      'rgb(1 2)',
      'hsl(x, 1%, 1%)',
      'hsl(1, 1%, 1%, z)',
      'rgba(1, 2, 3, q%)',
      'cmyk(1,2,3)',
    ])('rejects %j', input => {
      expect(parseColor(input)).toBeNull();
    });

    it('clamps alpha', () => {
      expect(parseColor('rgba(0, 0, 0, 2)')!.a).toBe(1);
      expect(parseColor('rgba(0, 0, 0, 150%)')!.a).toBe(1);
    });
  });

  describe('formatColor', () => {
    const color = parseColor(BLUE)!;

    it('writes each format, opaque and translucent', () => {
      expect(formatColor(color, 'hex')).toBe(BLUE);
      expect(formatColor(color, 'rgb')).toBe('rgb(50, 111, 209)');
      expect(formatColor(color, 'hsl')).toBe('hsl(217, 63%, 51%)');
      const half = { ...color, a: 0.5 };
      expect(formatColor(half, 'hex')).toBe('#326fd180');
      expect(formatColor(half, 'rgb')).toBe('rgba(50, 111, 209, 0.5)');
      expect(formatColor(half, 'hsl')).toBe('hsla(217, 63%, 51%, 0.5)');
    });

    it('round-trips what it writes', () => {
      for (const format of ['hex', 'rgb', 'hsl'] as const) {
        const written = formatColor({ ...color, a: 0.3 }, format);
        expect(formatColor(parseColor(written)!, format)).toBe(written);
      }
    });

    it('wraps a full turn of hue to 0', () => {
      expect(formatColor({ h: 360, s: 100, v: 100, a: 1 }, 'hsl')).toBe('hsl(0, 100%, 50%)');
    });
  });

  describe('conversions', () => {
    it('maps the primaries both ways', () => {
      expect(hsvaToRgb({ h: 0, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 0, b: 0 });
      expect(hsvaToRgb({ h: 120, s: 100, v: 100, a: 1 })).toEqual({ r: 0, g: 255, b: 0 });
      expect(hsvaToRgb({ h: 240, s: 100, v: 100, a: 1 })).toEqual({ r: 0, g: 0, b: 255 });
      expect(rgbToHsva({ r: 255, g: 0, b: 255 }).h).toBe(300);
      expect(rgbToHsva({ r: 0, g: 255, b: 0 }).h).toBe(120);
      expect(rgbToHsva({ r: 0, g: 0, b: 255 }).h).toBe(240);
      expect(rgbToHsva({ r: 0, g: 0, b: 0 })).toEqual(BLACK);
    });

    it('converts HSV and HSL at the extremes', () => {
      expect(hsvaToHsl({ h: 0, s: 0, v: 100, a: 1 })).toEqual({ h: 0, s: 0, l: 100 });
      expect(hsvaToHsl(BLACK)).toEqual({ h: 0, s: 0, l: 0 });
      expect(hslToHsva({ h: 0, s: 0, l: 0 })).toEqual(BLACK);
    });

    it('paints rgba for CSS', () => {
      expect(toCssRgba({ h: 0, s: 100, v: 100, a: 0.456 })).toBe('rgba(255, 0, 0, 0.46)');
    });

    it('clamps', () => {
      expect(clamp(5, 0, 3)).toBe(3);
      expect(clamp(-1, 0, 3)).toBe(0);
    });
  });

  describe('keepHue', () => {
    const previous = { h: 200, s: 40, v: 60, a: 1 };

    it('keeps hue and saturation through black', () => {
      expect(keepHue({ h: 0, s: 0, v: 0, a: 1 }, previous)).toEqual({ h: 200, s: 40, v: 0, a: 1 });
    });

    it('keeps hue through a grey', () => {
      expect(keepHue({ h: 0, s: 0, v: 50, a: 1 }, previous)).toEqual({ h: 200, s: 0, v: 50, a: 1 });
    });

    it('leaves a chromatic color alone', () => {
      const next = { h: 10, s: 50, v: 50, a: 1 };
      expect(keepHue(next, previous)).toBe(next);
    });
  });

  it('compares at the committed precision', () => {
    expect(sameColor(parseColor('#326fd1')!, parseColor('rgb(50, 111, 209)')!, 'hex')).toBe(true);
    expect(sameColor(parseColor('#326fd1')!, parseColor('#326fd2')!, 'hex')).toBe(false);
  });
});
