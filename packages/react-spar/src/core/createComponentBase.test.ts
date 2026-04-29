import { describe, expect, it } from 'vitest';

import { createComponentBase } from './createComponentBase';

interface FixtureProps {
  type?: 'a' | 'b';
  size?: 'base' | 'large';
}
type FixtureSlot = 'root' | 'arrow';

const buildFixture = () =>
  createComponentBase<FixtureProps, FixtureSlot>({
    name: 'Fixture',
    slots: ['root', 'arrow'] as const,
    classes: { root: 'tk-fixture', arrow: 'tk-fixture-arrow' },
    defaultProps: { type: 'a', size: 'base' },
  });

describe('createComponentBase — getSlotProps', () => {
  it('returns canonical class + data-slot when no instance attrs are passed', () => {
    const Base = buildFixture();
    expect(Base.getSlotProps('root')).toEqual({ 'data-slot': 'root', 'className': 'tk-fixture' });
  });

  it('appends instance className onto the canonical class', () => {
    const Base = buildFixture();
    expect(Base.getSlotProps('root', { className: 'custom' })).toEqual({ 'data-slot': 'root', 'className': 'tk-fixture custom' });
  });

  it('forwards extra attrs (style, aria-*) verbatim', () => {
    const Base = buildFixture();
    const out = Base.getSlotProps('arrow', { 'className': 'x', 'aria-hidden': 'true' });
    expect(out).toEqual({ 'data-slot': 'arrow', 'className': 'tk-fixture-arrow x', 'aria-hidden': 'true' });
  });

  it('returns className=undefined when both canonical and instance are empty', () => {
    const Base = createComponentBase<FixtureProps, 'root'>({
      name: 'Empty',
      slots: ['root'] as const,
      classes: { root: '' },
    });
    expect(Base.getSlotProps('root')).toEqual({ 'data-slot': 'root', 'className': undefined });
  });
});

describe('createComponentBase — resolveProps', () => {
  it('layers author defaults below theme defaults below instance', () => {
    const Base = buildFixture();
    const merged = Base.resolveProps({ size: 'large' }, { type: 'b' });
    expect(merged).toEqual({ type: 'b', size: 'large' });
  });

  it('lets instance props override theme defaults', () => {
    const Base = buildFixture();
    const merged = Base.resolveProps({ type: 'a' }, { type: 'b' });
    expect(merged.type).toBe('a');
  });

  it('returns author defaults when no theme or instance is supplied', () => {
    const Base = buildFixture();
    expect(Base.resolveProps({})).toEqual({ type: 'a', size: 'base' });
  });
});

describe('createComponentBase — surface', () => {
  it('exposes name, slots, and classes verbatim', () => {
    const Base = buildFixture();
    expect(Base.name).toBe('Fixture');
    expect(Base.slots).toEqual(['root', 'arrow']);
    expect(Base.classes).toEqual({ root: 'tk-fixture', arrow: 'tk-fixture-arrow' });
  });

  it('cx is a clsx passthrough that drops falsy inputs', () => {
    const Base = buildFixture();
    expect(Base.cx('a', undefined, 'b', false, '')).toBe('a b');
  });
});
