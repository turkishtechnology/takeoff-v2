import type { HTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../test-utils';

import { buildSlotAttrs } from './buildSlotAttrs';
import { composeRootAttrs, type ComposeRootOptions } from './composeRootAttrs';
import { createComponentBase } from './createComponentBase';
import type { ComponentThemeConfig } from './theme';
import type { ClassNamesMap, SlotPropsMap } from './types';

type DemoSlot = 'root' | 'icon';

interface DemoProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  id?: string;
  children?: ReactNode;
  className?: string;
  classNames?: ClassNamesMap<DemoSlot>;
  slotProps?: SlotPropsMap<DemoSlot>;
}

type DemoTheme = ComponentThemeConfig<DemoProps, DemoSlot>;

const DemoBase = createComponentBase<DemoProps, DemoSlot>({
  name: 'Demo',
  slots: ['root', 'icon'],
  classes: { root: 'tk-demo', icon: 'tk-demo-icon' },
  defaultProps: { size: 'medium' },
});

const compose = (props: DemoProps, theme?: DemoTheme, options?: ComposeRootOptions<DemoProps>) => composeRootAttrs(DemoBase, props, theme, options);

const withDataAttrs = (attrs: Record<string, string>) => attrs as HTMLAttributes<HTMLElement>;

/** Minimal multi-slot wrapper following the documented composition pattern. */
const Demo = ({ theme, ...props }: DemoProps & { theme?: DemoTheme }) => {
  const { rootAttrs, rest } = composeRootAttrs(DemoBase, props, theme, {
    stateAttrs: ({ variant = 'primary', disabled }) => ({
      'data-variant': variant,
      'data-disabled': disabled ? '' : undefined,
    }),
  });
  const { children, variant: _variant, size: _size, disabled: _disabled, ...native } = rest;

  const iconAttrs = buildSlotAttrs(DemoBase.getSlotProps<HTMLAttributes<HTMLSpanElement>>('icon', { 'aria-hidden': true }), 'icon', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <div {...native} {...rootAttrs}>
      <span {...iconAttrs} />
      {children}
    </div>
  );
};

describe('composeRootAttrs', () => {
  describe('root slot contract', () => {
    it('emits the root data-slot and the canonical tk-* class without a theme', () => {
      expect(compose({}).rootAttrs).toEqual({ 'data-slot': 'root', 'className': 'tk-demo' });
      expect(compose({}, undefined, {}).rootAttrs).toEqual({ 'data-slot': 'root', 'className': 'tk-demo' });
    });

    it('strips className, classNames and slotProps from rest and keeps every other resolved prop', () => {
      const { rest } = compose({
        className: 'instance-class',
        classNames: { root: 'instance-root' },
        slotProps: { root: { title: 'Root title' } },
        variant: 'secondary',
        id: 'demo',
        children: 'Content',
      });

      expect(rest).toEqual({ size: 'medium', variant: 'secondary', id: 'demo', children: 'Content' });
    });

    it('does not mutate the props or theme it receives', () => {
      const props: DemoProps = { className: 'instance-class', variant: 'secondary' };
      const theme: DemoTheme = { defaultProps: { size: 'large' }, className: 'theme-class' };

      compose(props, theme, { stateAttrs: () => ({ 'data-variant': 'secondary' }) });

      expect(props).toEqual({ className: 'instance-class', variant: 'secondary' });
      expect(theme).toEqual({ defaultProps: { size: 'large' }, className: 'theme-class' });
    });
  });

  describe('prop resolution', () => {
    it('resolves author defaults, then theme defaults, then instance props into rest', () => {
      const theme: DemoTheme = { defaultProps: { size: 'large', variant: 'secondary' } };

      expect(compose({}).rest).toEqual({ size: 'medium' });
      expect(compose({}, theme).rest).toEqual({ size: 'large', variant: 'secondary' });
      expect(compose({ size: 'small' }, theme).rest).toEqual({ size: 'small', variant: 'secondary' });
    });
  });

  describe('className merging', () => {
    it('concatenates the canonical class, theme classNames.root and instance classNames.root in order', () => {
      const { rootAttrs } = compose({ classNames: { root: 'instance-root' } }, { classNames: { root: 'theme-root' } });

      expect(rootAttrs.className).toBe('tk-demo theme-root instance-root');
    });

    it('keeps the canonical class first and adds both the provider className shortcut and the instance className', () => {
      const { rootAttrs } = compose({ className: 'instance-class' }, { className: 'provider-class' });
      const classes = rootAttrs.className?.split(' ') ?? [];

      expect(classes[0]).toBe('tk-demo');
      expect(classes).toHaveLength(3);
      expect(classes).toEqual(expect.arrayContaining(['provider-class', 'instance-class']));
    });

    it('keeps the instance className and both classNames.root layers, with the theme layer before the instance layer', () => {
      const { rootAttrs } = compose({ className: 'instance-class', classNames: { root: 'instance-root' } }, { classNames: { root: 'theme-root' } });
      const classes = rootAttrs.className?.split(' ') ?? [];

      expect(classes[0]).toBe('tk-demo');
      expect(classes).toHaveLength(4);
      expect(classes).toEqual(expect.arrayContaining(['instance-class', 'theme-root', 'instance-root']));
      expect(classes.indexOf('theme-root')).toBeLessThan(classes.indexOf('instance-root'));
    });

    it('orders the instance className after the provider className shortcut', () => {
      const { rootAttrs } = compose({ className: 'instance-class' }, { className: 'provider-class' });

      expect(rootAttrs.className).toBe('tk-demo provider-class instance-class');
    });

    it('leaves className undefined when the root has no canonical class and no layer adds one', () => {
      const BareBase = createComponentBase<Pick<DemoProps, 'className' | 'classNames'>, 'root'>({ name: 'Bare', slots: ['root'], classes: { root: '' } });

      const bare = composeRootAttrs(BareBase, {}, undefined).rootAttrs;
      expect(bare['data-slot']).toBe('root');
      expect(bare.className).toBeUndefined();

      expect(composeRootAttrs(BareBase, { classNames: { root: 'instance-root' } }, undefined).rootAttrs.className).toBe('instance-root');
    });

    it('does not apply classNames declared for non-root slots to the root', () => {
      const { rootAttrs } = compose({ classNames: { icon: 'instance-icon' } }, { classNames: { icon: 'theme-icon' } });

      expect(rootAttrs.className).toBe('tk-demo');
    });
  });

  describe('slotProps merging', () => {
    it('applies theme slotProps.root with instance slotProps.root winning on conflict', () => {
      const { rootAttrs } = compose({ slotProps: { root: { title: 'Instance title' } } }, { slotProps: { root: { 'title': 'Theme title', 'aria-describedby': 'help' } } });

      expect(rootAttrs).toMatchObject({ 'title': 'Instance title', 'aria-describedby': 'help', 'data-slot': 'root' });
    });

    it('drops a theme slotProps.root key the instance sets as a prop', () => {
      const { rootAttrs } = compose({ id: 'instance-id' }, { slotProps: { root: { id: 'theme-id', title: 'Theme title' } } });

      expect(rootAttrs).not.toHaveProperty('id');
      expect(rootAttrs).toMatchObject({ title: 'Theme title' });
    });

    it('renders the instance id over the theme slotProps id', () => {
      const { container } = render(<Demo id="instance-id" theme={{ slotProps: { root: { id: 'theme-id' } } }} />);

      expect(container.firstElementChild).toHaveAttribute('id', 'instance-id');
    });

    it('keeps data-slot="root" when theme or instance slotProps try to override it', () => {
      const hijack = withDataAttrs({ 'data-slot': 'hijacked' });
      const { rootAttrs } = compose({ slotProps: { root: hijack } }, { slotProps: { root: hijack } });

      expect(rootAttrs['data-slot']).toBe('root');
    });

    it('does not apply slotProps declared for non-root slots to the root', () => {
      const { rootAttrs } = compose({ slotProps: { icon: { title: 'Icon title' } } }, { slotProps: { icon: { id: 'theme-icon' } } });

      expect(rootAttrs).toEqual({ 'data-slot': 'root', 'className': 'tk-demo' });
    });
  });

  describe('stateAttrs', () => {
    it('is called exactly once with the post-merge props', () => {
      const stateAttrs = vi.fn((_merged: DemoProps) => ({}));

      compose({ variant: 'secondary', className: 'instance-class' }, { defaultProps: { size: 'large', disabled: true } }, { stateAttrs });

      expect(stateAttrs).toHaveBeenCalledTimes(1);
      expect(stateAttrs).toHaveBeenCalledWith({ size: 'large', disabled: true, variant: 'secondary', className: 'instance-class' });
    });

    it('feeds theme defaultProps into the state attrs when the instance leaves the prop unset', () => {
      const options: ComposeRootOptions<DemoProps> = { stateAttrs: ({ variant = 'primary' }) => ({ 'data-variant': variant }) };

      expect(compose({}, undefined, options).rootAttrs['data-variant']).toBe('primary');
      expect(compose({}, { defaultProps: { variant: 'secondary' } }, options).rootAttrs['data-variant']).toBe('secondary');
    });

    it('layers the state attrs on top of slotProps.root so theme and instance cannot override them', () => {
      const { rootAttrs } = compose(
        { variant: 'secondary', slotProps: { root: withDataAttrs({ 'id': 'demo', 'data-variant': 'instance' }) } },
        { slotProps: { root: withDataAttrs({ 'data-variant': 'theme' }) } },
        { stateAttrs: ({ variant = 'primary' }) => ({ 'data-variant': variant }) },
      );

      expect(rootAttrs['data-variant']).toBe('secondary');
      expect(rootAttrs.id).toBe('demo');
    });

    it('drops undefined entries and keeps empty-string presence entries', () => {
      const { rootAttrs } = compose({ disabled: true }, undefined, {
        stateAttrs: ({ disabled, size }) => ({
          'data-disabled': disabled ? '' : undefined,
          'data-loading': undefined,
          'data-size': size,
        }),
      });

      expect(rootAttrs['data-disabled']).toBe('');
      expect(rootAttrs['data-size']).toBe('medium');
      expect(Object.keys(rootAttrs)).not.toContain('data-loading');
    });

    it('adds no state keys when every state attr resolves to undefined', () => {
      const { rootAttrs } = compose({ className: 'instance-class' }, undefined, {
        stateAttrs: () => ({ 'data-disabled': undefined, 'data-loading': undefined }),
      });

      expect(Object.keys(rootAttrs).sort()).toEqual(['className', 'data-slot']);
      expect(rootAttrs.className).toBe('tk-demo instance-class');
    });
  });

  describe('rendered owner nodes', () => {
    it('lands root and icon customization on their own owner nodes', () => {
      const { container } = render(
        <Demo
          theme={{ className: 'theme-root', classNames: { icon: 'theme-icon' }, slotProps: { icon: { id: 'theme-icon-id' } } }}
          className="instance-root"
          classNames={{ icon: 'instance-icon' }}
          slotProps={{ root: { title: 'Root title' }, icon: { title: 'Icon title' } }}
        >
          Label
        </Demo>,
      );

      const root = container.querySelector('.tk-demo');
      const icon = container.querySelector('.tk-demo-icon');

      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveClass('theme-root', 'instance-root');
      expect(root).toHaveAttribute('title', 'Root title');
      expect(root).not.toHaveClass('theme-icon');
      expect(root).not.toHaveClass('instance-icon');
      expect(root).not.toHaveAttribute('id');

      expect(icon).toHaveAttribute('data-slot', 'icon');
      expect(icon).toHaveClass('theme-icon', 'instance-icon');
      expect(icon).toHaveAttribute('id', 'theme-icon-id');
      expect(icon).toHaveAttribute('title', 'Icon title');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).not.toHaveClass('theme-root');
      expect(icon).not.toHaveClass('instance-root');
    });

    it('renders boolean state hooks as presence attributes and removes them when inactive', () => {
      const { container, rerender } = render(<Demo disabled>Label</Demo>);
      const root = container.querySelector('[data-slot="root"]');

      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-variant', 'primary');

      rerender(<Demo variant="secondary">Label</Demo>);

      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).toHaveAttribute('data-variant', 'secondary');
    });

    it('emits the theme default as the DOM state hook until the instance sets the prop', () => {
      const theme: DemoTheme = { defaultProps: { variant: 'secondary', disabled: true } };
      const { container, rerender } = render(<Demo theme={theme}>Label</Demo>);
      const root = container.querySelector('[data-slot="root"]');

      expect(root).toHaveAttribute('data-variant', 'secondary');
      expect(root).toHaveAttribute('data-disabled', '');

      rerender(
        <Demo theme={theme} variant="primary" disabled={false}>
          Label
        </Demo>,
      );

      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).not.toHaveAttribute('data-disabled');
    });

    it('passes the remaining props through to the root node', () => {
      const { container } = render(<Demo id="demo">Label</Demo>);

      expect(screen.getByText('Label')).toBe(container.querySelector('#demo'));
      expect(container.querySelector('#demo')).toHaveAttribute('data-slot', 'root');
    });
  });
});
