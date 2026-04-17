import { describe, it, expect } from 'vitest';

import type { SlotProps } from '../base/createComponentBase';
import { applyThemeDefaults, buildSlotAttrs, mergeClassNames, mergeSlotProps } from './merge';

type FakeProps = { variant?: 'primary' | 'danger'; size?: 'base' | 'large' };

type FakeSlotProps = {
  root?: { 'id'?: string; 'className'?: string; 'aria-label'?: string };
  label?: { id?: string; className?: string };
};

type FakeClassNames = { root?: string; label?: string };

describe('applyThemeDefaults', () => {
  it('returns instance props unchanged when defaults are undefined', () => {
    const instance: FakeProps = { variant: 'primary' };
    expect(applyThemeDefaults(undefined, instance)).toBe(instance);
  });

  it('fills unset fields from defaults', () => {
    const defaults: Partial<FakeProps> = { variant: 'danger', size: 'large' };
    const instance: FakeProps = { variant: 'primary' };
    const result = applyThemeDefaults(defaults, instance);
    expect(result).toEqual({ variant: 'primary', size: 'large' });
  });

  it('lets instance value win even when the instance value is explicitly undefined', () => {
    const defaults: Partial<FakeProps> = { variant: 'danger' };
    const instance: FakeProps = { variant: undefined };
    const result = applyThemeDefaults(defaults, instance);
    // An explicit `undefined` from the consumer is still a choice — object spread honors it.
    expect(result).toEqual({ variant: undefined });
  });
});

describe('mergeSlotProps', () => {
  it('returns undefined when both inputs are undefined', () => {
    expect(mergeSlotProps<FakeSlotProps>(undefined, undefined)).toBeUndefined();
  });

  it('returns instance when theme is undefined', () => {
    const instance: FakeSlotProps = { root: { id: 'my-root' } };
    expect(mergeSlotProps<FakeSlotProps>(undefined, instance)).toBe(instance);
  });

  it('returns theme when instance is undefined', () => {
    const theme: FakeSlotProps = { root: { id: 'theme-root' } };
    expect(mergeSlotProps<FakeSlotProps>(theme, undefined)).toBe(theme);
  });

  it('shallow-merges slot props with instance winning', () => {
    const theme: FakeSlotProps = { root: { 'id': 'theme', 'aria-label': 'theme' } };
    const instance: FakeSlotProps = { root: { id: 'instance' } };
    const result = mergeSlotProps<FakeSlotProps>(theme, instance);
    expect(result?.root).toEqual({ 'id': 'instance', 'aria-label': 'theme' });
  });

  it('concatenates className values within a slot', () => {
    const theme: FakeSlotProps = { root: { className: 'theme-cls' } };
    const instance: FakeSlotProps = { root: { className: 'instance-cls' } };
    const result = mergeSlotProps<FakeSlotProps>(theme, instance);
    expect(result?.root?.className).toBe('theme-cls instance-cls');
  });

  it('merges different slots from theme and instance', () => {
    const theme: FakeSlotProps = { root: { id: 'r' } };
    const instance: FakeSlotProps = { label: { id: 'l' } };
    const result = mergeSlotProps<FakeSlotProps>(theme, instance);
    expect(result).toEqual({ root: { id: 'r' }, label: { id: 'l' } });
  });
});

describe('mergeClassNames', () => {
  it('returns undefined when both inputs are undefined', () => {
    expect(mergeClassNames<keyof FakeClassNames & string>(undefined, undefined)).toBeUndefined();
  });

  it('returns instance when theme is undefined', () => {
    const instance: FakeClassNames = { root: 'my-class' };
    expect(mergeClassNames(undefined, instance)).toBe(instance);
  });

  it('returns theme when instance is undefined', () => {
    const theme: FakeClassNames = { root: 'theme-class' };
    expect(mergeClassNames(theme, undefined)).toBe(theme);
  });

  it('concatenates class values for the same slot', () => {
    const theme: FakeClassNames = { root: 'theme-root' };
    const instance: FakeClassNames = { root: 'inst-root' };
    const result = mergeClassNames(theme, instance);
    expect(result?.root).toBe('theme-root inst-root');
  });

  it('merges different slots', () => {
    const theme: FakeClassNames = { root: 'a' };
    const instance: FakeClassNames = { label: 'b' };
    const result = mergeClassNames(theme, instance);
    expect(result).toEqual({ root: 'a', label: 'b' });
  });
});

describe('buildSlotAttrs', () => {
  const makeBase = (extras: Record<string, unknown> = {}): SlotProps => ({
    'className': 'tk-fake',
    'data-slot': 'root',
    ...extras,
  });

  it('returns base attrs untouched when no slotProps or override are supplied', () => {
    const base = makeBase();
    const result = buildSlotAttrs(base, undefined, 'root', undefined);
    expect(result).toEqual({ 'className': 'tk-fake', 'data-slot': 'root' });
  });

  it('concatenates className as base → slotProps → override', () => {
    const base = makeBase();
    const resolved: FakeSlotProps = { root: { className: 'slot-cls' } };
    const result = buildSlotAttrs(base, resolved, 'root', 'override-cls');
    expect(result.className).toBe('tk-fake slot-cls override-cls');
  });

  it('uses base className alone when neither slotProps.className nor override is supplied', () => {
    const base = makeBase();
    const result = buildSlotAttrs(base, { root: { id: 'x' } }, 'root', undefined);
    expect(result.className).toBe('tk-fake');
  });

  it('keeps the canonical data-slot anchor even when slotProps tries to override it', () => {
    const base = makeBase();
    const resolved = { root: { 'data-slot': 'consumer-lied' } } as unknown;
    const result = buildSlotAttrs(base, resolved, 'root', undefined);
    expect(result['data-slot']).toBe('root');
  });

  it('keeps a wrapper-supplied canonical attribute over a conflicting consumer slot-prop', () => {
    // Protects accessibility invariants like `aria-hidden: "true"` on icon slots.
    const base = makeBase({ 'aria-hidden': 'true' });
    const resolved = { root: { 'aria-hidden': 'false' } } as unknown;
    const result = buildSlotAttrs(base, resolved, 'root', undefined);
    expect(result['aria-hidden']).toBe('true');
  });

  it('lets consumer slotProps win on attributes the wrapper did not set', () => {
    const base = makeBase();
    const resolved: FakeSlotProps = { root: { 'id': 'from-consumer', 'aria-label': 'hi' } };
    const result = buildSlotAttrs(base, resolved, 'root', undefined);
    expect(result.id).toBe('from-consumer');
    expect(result['aria-label']).toBe('hi');
  });

  it('ignores slotProps entries for a different slot', () => {
    const base = makeBase();
    const resolved: FakeSlotProps = { label: { id: 'label-only' } };
    const result = buildSlotAttrs(base, resolved, 'root', undefined);
    expect(result.id).toBeUndefined();
    expect(result.className).toBe('tk-fake');
  });
});
