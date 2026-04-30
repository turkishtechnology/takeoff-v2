import { describe, expect, it } from 'vitest';

import { composeRootAttrs } from './composeRootAttrs';
import { createComponentBase } from './createComponentBase';
import type { ClassNamesMap, SlotPropsMap } from './types';

interface FixtureProps {
  className?: string;
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
  id?: string;
  type?: 'a' | 'b';
  children?: string;
}

const FixtureBase = createComponentBase<FixtureProps, 'root'>({
  name: 'Fixture',
  slots: ['root'] as const,
  classes: { root: 'tk-fixture' },
  defaultProps: { type: 'a' },
});

describe('composeRootAttrs', () => {
  it('resolves defaults into rest and strips customization layering props', () => {
    const { rootAttrs, rest } = composeRootAttrs(FixtureBase, { className: 'local', children: 'content' }, { defaultProps: { type: 'b' } });

    expect(rootAttrs).toEqual({ 'data-slot': 'root', 'className': 'tk-fixture local' });
    expect(rest).toEqual({ type: 'b', children: 'content' });
    expect('className' in rest).toBe(false);
    expect('classNames' in rest).toBe(false);
    expect('slotProps' in rest).toBe(false);
  });

  it('composes canonical, theme, and instance classes without dropping tk-*', () => {
    const { rootAttrs } = composeRootAttrs(
      FixtureBase,
      {
        className: 'local',
        classNames: { root: 'instance-root' },
      },
      {
        className: 'theme-shortcut',
        classNames: { root: 'theme-root' },
      },
    );

    expect(rootAttrs.className).toBe('tk-fixture local theme-root instance-root');
  });

  it('keeps canonical attrs above provider and instance slotProps', () => {
    const { rootAttrs } = composeRootAttrs(
      FixtureBase,
      {
        slotProps: {
          root: {
            'data-slot': 'instance-bogus',
            'aria-label': 'instance label',
          },
        } as never,
      },
      {
        slotProps: {
          root: {
            'data-slot': 'theme-bogus',
            'aria-label': 'theme label',
          },
        } as never,
      },
    );

    expect(rootAttrs['data-slot']).toBe('root');
    expect(rootAttrs['aria-label']).toBe('instance label');
  });
});
