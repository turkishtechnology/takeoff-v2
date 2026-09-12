import { createRef } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Badge } from './index';

const getRoot = (container: HTMLElement) => container.querySelector('.tk-badge') as HTMLElement;
const slotNames = (element: HTMLElement) => Array.from(element.children, child => child.getAttribute('data-slot'));

const StartIcon = () => <svg aria-hidden="true" data-testid="start-icon" />;
const EndIcon = () => <svg aria-hidden="true" data-testid="end-icon" />;

describe('Badge', () => {
  describe('rendering', () => {
    it('renders a span root carrying the canonical class and data-slot', () => {
      const { container } = render(<Badge>Active</Badge>);
      const root = getRoot(container);

      expect(root).not.toBeNull();
      expect(root.parentElement).toBe(container);
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('wraps children in the label slot', () => {
      const { container } = render(<Badge>Active</Badge>);
      const label = screen.getByText('Active');

      expect(label).toHaveClass('tk-badge-label');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(label.parentElement).toBe(getRoot(container));
    });

    it('wraps startContent and endContent in icon slots around the label', () => {
      const { container } = render(
        <Badge startContent={<StartIcon />} endContent={<EndIcon />}>
          Verified
        </Badge>,
      );
      const root = getRoot(container);

      expect(slotNames(root)).toEqual(['icon', 'label', 'icon']);

      const [start, label, end] = Array.from(root.children);
      expect(start).toHaveClass('tk-badge-icon');
      expect(start).toContainElement(screen.getByTestId('start-icon'));
      expect(label).toHaveClass('tk-badge-label');
      expect(label).toHaveTextContent('Verified');
      expect(end).toHaveClass('tk-badge-icon');
      expect(end).toContainElement(screen.getByTestId('end-icon'));
    });

    it('renders only the slots whose content is provided', () => {
      const { container, rerender } = render(<Badge startContent={<StartIcon />} />);
      expect(slotNames(getRoot(container))).toEqual(['icon']);

      rerender(<Badge endContent={<EndIcon />}>New</Badge>);
      expect(slotNames(getRoot(container))).toEqual(['label', 'icon']);
      expect(screen.queryByTestId('start-icon')).toBeNull();
    });

    it('renders a numeric zero as label content', () => {
      const { container } = render(<Badge rounded>{0}</Badge>);
      const label = container.querySelector('[data-slot="label"]');

      expect(label).toHaveClass('tk-badge-label');
      expect(label).toHaveTextContent('0');
    });

    it('skips slot wrappers for non-renderable content', () => {
      const { container } = render(
        <Badge startContent={null} endContent={false}>
          {''}
        </Badge>,
      );

      expect(getRoot(container)).toBeEmptyDOMElement();
    });

    it('forwards native attributes and the ref to the root span', () => {
      const ref = createRef<HTMLSpanElement>();
      const { container } = render(
        <Badge ref={ref} id="unread-count" title="Unread messages">
          3
        </Badge>,
      );
      const root = getRoot(container);

      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute('id', 'unread-count');
      expect(root).toHaveAttribute('title', 'Unread messages');
    });

    it('keeps visual props off the DOM', () => {
      const { container } = render(
        <Badge variant="danger" appearance="outlined" size="large" rounded>
          9
        </Badge>,
      );
      const root = getRoot(container);

      for (const attribute of ['variant', 'appearance', 'size', 'rounded', 'dot']) {
        expect(root).not.toHaveAttribute(attribute);
      }
    });
  });

  describe('data attributes', () => {
    it('emits the default variant, appearance and size', () => {
      const { container } = render(<Badge>Active</Badge>);
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).toHaveAttribute('data-type', 'filled');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).not.toHaveAttribute('data-rounded');
      expect(root).not.toHaveAttribute('data-dot');
    });

    it('reflects non-default props into data attributes', () => {
      const { container } = render(
        <Badge variant="verified" appearance="filledLight" size="small" rounded>
          Verified
        </Badge>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-variant', 'verified');
      expect(root).toHaveAttribute('data-type', 'filledLight');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-rounded', '');
    });
  });

  describe('dot', () => {
    it('renders an empty dot that ignores children, startContent and endContent', () => {
      const { container } = render(
        <Badge dot variant="success" startContent={<StartIcon />} endContent={<EndIcon />}>
          Online
        </Badge>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-dot', '');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('data-type', 'filled');
      expect(root).toBeEmptyDOMElement();
      expect(screen.queryByText('Online')).toBeNull();
      expect(screen.queryByTestId('start-icon')).toBeNull();
      expect(screen.queryByTestId('end-icon')).toBeNull();
    });

    it('omits data-size in dot mode even when a size is set', () => {
      const { container } = render(<Badge dot size="large" />);

      expect(getRoot(container)).not.toHaveAttribute('data-size');
    });

    it('keeps className, classNames.root, slotProps.root, native attributes and the ref on the dot root', () => {
      const ref = createRef<HTMLSpanElement>();
      const { container } = render(
        <Badge
          dot
          ref={ref}
          id="presence"
          className="status-dot"
          classNames={{ root: 'custom-root', label: 'custom-label' }}
          slotProps={{ root: { title: 'Online now' }, label: { title: 'Never rendered' } }}
        >
          Online
        </Badge>,
      );
      const root = getRoot(container);

      expect(ref.current).toBe(root);
      expect(root).toHaveClass('tk-badge', 'status-dot', 'custom-root');
      expect(root).toHaveAttribute('id', 'presence');
      expect(root).toHaveAttribute('title', 'Online now');
      expect(container.querySelector('.custom-label')).toBeNull();
      expect(container.querySelector('[title="Never rendered"]')).toBeNull();
    });

    it('restores the content slots and data-size when dot is turned off', () => {
      const { container, rerender } = render(
        <Badge dot size="small" startContent={<StartIcon />}>
          3
        </Badge>,
      );
      expect(getRoot(container)).toBeEmptyDOMElement();

      rerender(
        <Badge size="small" startContent={<StartIcon />}>
          3
        </Badge>,
      );
      const root = getRoot(container);

      expect(root).not.toHaveAttribute('data-dot');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(slotNames(root)).toEqual(['icon', 'label']);
      expect(screen.getByText('3')).toHaveClass('tk-badge-label');
    });
  });

  describe('classNames and slotProps', () => {
    it('merges className and classNames onto their owner nodes', () => {
      const { container } = render(
        <Badge className="instance-root" classNames={{ root: 'custom-root', label: 'custom-label', icon: 'custom-icon' }} startContent={<StartIcon />} endContent={<EndIcon />}>
          Verified
        </Badge>,
      );
      const root = getRoot(container);
      const [start, label, end] = Array.from(root.children);

      expect(root).toHaveClass('tk-badge', 'instance-root', 'custom-root');
      expect(root).not.toHaveClass('custom-label');
      expect(root).not.toHaveClass('custom-icon');
      expect(label).toHaveClass('tk-badge-label', 'custom-label');
      expect(label).not.toHaveClass('custom-root');
      expect(label).not.toHaveClass('custom-icon');
      expect(start).toHaveClass('tk-badge-icon', 'custom-icon');
      expect(start).not.toHaveClass('custom-label');
      expect(end).toHaveClass('tk-badge-icon', 'custom-icon');
    });

    it('forwards slotProps to their owner nodes', () => {
      const { container } = render(
        <Badge slotProps={{ root: { title: 'Root title' }, label: { title: 'Label title' }, icon: { title: 'Icon title' } }} startContent={<StartIcon />} endContent={<EndIcon />}>
          Verified
        </Badge>,
      );
      const root = getRoot(container);
      const [start, label, end] = Array.from(root.children);

      expect(root).toHaveAttribute('title', 'Root title');
      expect(label).toHaveAttribute('title', 'Label title');
      expect(start).toHaveAttribute('title', 'Icon title');
      expect(end).toHaveAttribute('title', 'Icon title');
    });

    it('keeps canonical slot hooks and state attributes over slotProps overrides', () => {
      const rootOverrides = { 'title': 'Root title', 'data-slot': 'hijacked', 'data-variant': 'hijacked' };
      const labelOverrides = { 'title': 'Label title', 'data-slot': 'hijacked' };
      const iconOverrides = { 'title': 'Icon title', 'data-slot': 'hijacked' };

      const { container } = render(
        <Badge variant="teal" slotProps={{ root: rootOverrides, label: labelOverrides, icon: iconOverrides }} startContent={<StartIcon />}>
          Verified
        </Badge>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('title', 'Root title');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-variant', 'teal');
      expect(slotNames(root)).toEqual(['icon', 'label']);
      expect(screen.getByText('Verified')).toHaveAttribute('title', 'Label title');
    });
  });

  describe('provider theme', () => {
    it('applies theme defaultProps below instance props', () => {
      const components: ComponentsThemeMap = { Badge: { defaultProps: { variant: 'danger', rounded: true } } };

      const { container, rerender } = render(
        <TakeoffSparProvider components={components}>
          <Badge>3</Badge>
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'danger');
      expect(getRoot(container)).toHaveAttribute('data-rounded', '');

      rerender(
        <TakeoffSparProvider components={components}>
          <Badge variant="info" rounded={false}>
            3
          </Badge>
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveAttribute('data-variant', 'info');
      expect(getRoot(container)).not.toHaveAttribute('data-rounded');
    });

    it('honours a theme-level dot default for both the data hook and the rendered content', () => {
      const components: ComponentsThemeMap = { Badge: { defaultProps: { dot: true } } };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Badge size="large">Online</Badge>
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-dot', '');
      expect(root).not.toHaveAttribute('data-size');
      expect(root).toBeEmptyDOMElement();
    });

    it('concatenates canonical, theme and instance classes and layers instance slotProps over theme slotProps', () => {
      const components: ComponentsThemeMap = {
        Badge: {
          className: 'theme-root',
          classNames: { label: 'theme-label', icon: 'theme-icon' },
          slotProps: { label: { id: 'theme-label-id', title: 'Theme label' } },
        },
      };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Badge className="instance-root" classNames={{ label: 'instance-label' }} slotProps={{ label: { title: 'Instance label' } }} startContent={<StartIcon />}>
            Verified
          </Badge>
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);
      const [icon, label] = Array.from(root.children);

      expect(root).toHaveClass('tk-badge', 'theme-root', 'instance-root');
      expect(label).toHaveClass('tk-badge-label', 'theme-label', 'instance-label');
      expect(label).toHaveAttribute('title', 'Instance label');
      expect(label).toHaveAttribute('id', 'theme-label-id');
      expect(icon).toHaveClass('tk-badge-icon', 'theme-icon');
      expect(icon).not.toHaveClass('theme-label');
    });

    it('lets an instance dot={false} override a theme dot default', () => {
      const components: ComponentsThemeMap = { Badge: { defaultProps: { dot: true } } };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Badge dot={false} size="small" startContent={<StartIcon />}>
            Online
          </Badge>
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);

      expect(root).not.toHaveAttribute('data-dot');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(slotNames(root)).toEqual(['icon', 'label']);
      expect(screen.getByText('Online')).toHaveClass('tk-badge-label');
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('layers instance slotProps.root over theme slotProps.root and keeps the theme className off inner slots', () => {
      const components: ComponentsThemeMap = {
        Badge: {
          className: 'theme-root',
          slotProps: { root: { title: 'Theme root', lang: 'tr' }, icon: { title: 'Theme icon' } },
        },
      };

      const { container } = render(
        <TakeoffSparProvider components={components}>
          <Badge slotProps={{ root: { title: 'Instance root' } }} startContent={<StartIcon />} endContent={<EndIcon />}>
            Verified
          </Badge>
        </TakeoffSparProvider>,
      );
      const root = getRoot(container);
      const [start, label, end] = Array.from(root.children);

      expect(root).toHaveAttribute('title', 'Instance root');
      expect(root).toHaveAttribute('lang', 'tr');
      expect(root).toHaveClass('tk-badge', 'theme-root');
      for (const inner of [start, label, end]) {
        expect(inner).not.toHaveClass('theme-root');
      }
      expect(start).toHaveAttribute('title', 'Theme icon');
      expect(end).toHaveAttribute('title', 'Theme icon');
      expect(label).not.toHaveAttribute('title');
    });
  });

  describe('accessibility', () => {
    it('stays a non-interactive element without a live-region role', () => {
      const { container } = render(<Badge>New</Badge>);
      const root = getRoot(container);

      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('tabindex');
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('has no axe violations for a text badge with icons', async () => {
      const { container } = render(
        <Badge variant="success" startContent={<StartIcon />} endContent={<EndIcon />}>
          Verified
        </Badge>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for a dot badge beside its visible meaning', async () => {
      const { container } = render(
        <p>
          <Badge dot variant="success" />
          <span>Online</span>
        </p>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
