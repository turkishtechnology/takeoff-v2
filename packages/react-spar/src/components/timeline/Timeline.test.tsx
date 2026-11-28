import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen, within } from '../../test-utils';

import { Timeline } from './index';

const renderTimeline = (rootProps: Parameters<typeof Timeline>[0] = {}) =>
  render(
    <Timeline aria-label="Release history" {...rootProps}>
      <Timeline.Item>
        <Timeline.Title>First Commit</Timeline.Title>
        <Timeline.Time dateTime="2024-07-07">07.07.2024</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Title>Prod</Timeline.Title>
        <Timeline.Description>Live release</Timeline.Description>
        <Timeline.Time dateTime="2024-12-16">16.12.2024</Timeline.Time>
      </Timeline.Item>
    </Timeline>,
  );

describe('Timeline (compound)', () => {
  describe('rendering', () => {
    it('renders an ordered list of items', () => {
      renderTimeline();

      const list = screen.getByRole('list', { name: 'Release history' });
      expect(list.tagName).toBe('OL');
      expect(list).toHaveClass('tk-timeline');
      expect(list).toHaveAttribute('data-slot', 'root');

      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveClass('tk-timeline-item');
      expect(items[0]).toHaveAttribute('data-slot', 'root');
    });

    it('emits the default orientation and placement on the root', () => {
      renderTimeline();

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('data-orientation', 'horizontal');
      expect(list).toHaveAttribute('data-placement', 'alternate');
    });

    it.each([
      ['vertical', 'start'],
      ['horizontal', 'end'],
    ] as const)('emits orientation=%s and placement=%s', (orientation, placement) => {
      renderTimeline({ orientation, placement });

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('data-orientation', orientation);
      expect(list).toHaveAttribute('data-placement', placement);
    });

    it('does not forward orientation or placement as DOM attributes', () => {
      renderTimeline({ orientation: 'vertical', placement: 'end' });

      const list = screen.getByRole('list');
      expect(list).not.toHaveAttribute('orientation');
      expect(list).not.toHaveAttribute('placement');
    });

    it('renders the item anatomy with a decorative separator and a content box', () => {
      renderTimeline();

      const [item] = screen.getAllByRole('listitem');
      const separator = item!.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('tk-timeline-separator');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator!.querySelector('[data-slot="indicator"]')).toHaveClass('tk-timeline-indicator');
      expect(separator!.querySelector('[data-slot="connector"]')).toHaveClass('tk-timeline-connector');

      const content = item!.querySelector('[data-slot="content"]');
      expect(content).toHaveClass('tk-timeline-content');
      expect(content).toContainElement(screen.getByText('First Commit'));
    });

    it('renders the content parts with their canonical classes and tags', () => {
      renderTimeline();

      const title = screen.getByText('Prod');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('tk-timeline-title');
      expect(title).toHaveAttribute('data-slot', 'root');

      const description = screen.getByText('Live release');
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('tk-timeline-description');

      const time = screen.getByText('16.12.2024');
      expect(time.tagName).toBe('TIME');
      expect(time).toHaveClass('tk-timeline-time');
      expect(time).toHaveAttribute('dateTime', '2024-12-16');
    });

    it('leaves the indicator empty by default so the recipe paints the dot', () => {
      renderTimeline();

      const [item] = screen.getAllByRole('listitem');
      expect(item!.querySelector('[data-slot="indicator"]')).toBeEmptyDOMElement();
    });

    it('renders custom indicator content', () => {
      render(
        <Timeline>
          <Timeline.Item indicator={<svg data-testid="icon" />}>
            <Timeline.Title>Launch</Timeline.Title>
          </Timeline.Item>
        </Timeline>,
      );

      const indicator = screen.getByRole('listitem').querySelector('[data-slot="indicator"]');
      expect(indicator).toContainElement(screen.getByTestId('icon'));
    });

    it('renders arbitrary children beside the content parts', () => {
      render(
        <Timeline>
          <Timeline.Item>
            <Timeline.Title>Custom</Timeline.Title>
            <button type="button">Details</button>
          </Timeline.Item>
        </Timeline>,
      );

      const content = screen.getByRole('listitem').querySelector('[data-slot="content"]');
      expect(content).toContainElement(screen.getByRole('button', { name: 'Details' }));
    });
  });

  describe('polymorphism', () => {
    it('renders the root, items and parts as other elements via `as`', () => {
      render(
        <Timeline as="div">
          <Timeline.Item as="div">
            <Timeline.Title as="h3">Heading</Timeline.Title>
            <Timeline.Description as="p">Paragraph</Timeline.Description>
            <Timeline.Time as="span">Today</Timeline.Time>
          </Timeline.Item>
        </Timeline>,
      );

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Heading' })).toHaveClass('tk-timeline-title');
      expect(screen.getByText('Paragraph').tagName).toBe('P');
      expect(screen.getByText('Today').tagName).toBe('SPAN');
      expect(document.querySelector('.tk-timeline')!.tagName).toBe('DIV');
      expect(document.querySelector('.tk-timeline-item')!.tagName).toBe('DIV');
    });

    it('forwards refs to the rendered elements', () => {
      let rootNode: HTMLOListElement | null = null;
      let itemNode: HTMLLIElement | null = null;
      let timeNode: HTMLTimeElement | null = null;
      render(
        <Timeline ref={node => void (rootNode = node)}>
          <Timeline.Item ref={node => void (itemNode = node)}>
            <Timeline.Time ref={node => void (timeNode = node)}>Now</Timeline.Time>
          </Timeline.Item>
        </Timeline>,
      );

      expect(rootNode).toBe(screen.getByRole('list'));
      expect(itemNode).toBe(screen.getByRole('listitem'));
      expect(timeNode).toBe(screen.getByText('Now'));
    });
  });

  describe('customization', () => {
    it('applies theme default props, with instance props winning', () => {
      render(
        <TakeoffSparProvider components={{ Timeline: { defaultProps: { orientation: 'vertical', placement: 'start' } } }}>
          <Timeline placement="end">
            <Timeline.Item />
          </Timeline>
        </TakeoffSparProvider>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('data-orientation', 'vertical');
      expect(list).toHaveAttribute('data-placement', 'end');
    });

    it('merges theme and instance classNames and slotProps on the item slots', () => {
      render(
        <TakeoffSparProvider
          components={{
            TimelineItem: {
              classNames: { root: 'theme-item', indicator: 'theme-indicator' },
              slotProps: { content: { title: 'theme-title' }, connector: { id: 'theme-connector' } },
            },
          }}
        >
          <Timeline>
            <Timeline.Item
              className="instance-item"
              classNames={{ separator: 'instance-separator', content: 'instance-content' }}
              slotProps={{ content: { title: 'instance-title' } }}
            >
              <Timeline.Title>Item</Timeline.Title>
            </Timeline.Item>
          </Timeline>
        </TakeoffSparProvider>,
      );

      const item = screen.getByRole('listitem');
      expect(item).toHaveClass('tk-timeline-item', 'theme-item', 'instance-item');
      expect(item.querySelector('[data-slot="separator"]')).toHaveClass('tk-timeline-separator', 'instance-separator');
      expect(item.querySelector('[data-slot="indicator"]')).toHaveClass('tk-timeline-indicator', 'theme-indicator');
      expect(item.querySelector('[data-slot="connector"]')).toHaveAttribute('id', 'theme-connector');

      const content = item.querySelector('[data-slot="content"]');
      expect(content).toHaveClass('tk-timeline-content', 'instance-content');
      expect(content).toHaveAttribute('title', 'instance-title');
    });

    it('keeps the separator hidden from assistive technology over slotProps', () => {
      render(
        <Timeline>
          <Timeline.Item slotProps={{ separator: { 'aria-hidden': false } }} />
        </Timeline>,
      );

      expect(screen.getByRole('listitem').querySelector('[data-slot="separator"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies root and part classNames / slotProps', () => {
      render(
        <TakeoffSparProvider components={{ TimelineTitle: { classNames: { root: 'theme-title' } } }}>
          <Timeline classNames={{ root: 'custom-root' }} slotProps={{ root: { id: 'history' } }}>
            <Timeline.Item>
              <Timeline.Title className="instance-title">Title</Timeline.Title>
              <Timeline.Description slotProps={{ root: { id: 'desc' } }}>Description</Timeline.Description>
              <Timeline.Time classNames={{ root: 'custom-time' }}>Time</Timeline.Time>
            </Timeline.Item>
          </Timeline>
        </TakeoffSparProvider>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('tk-timeline', 'custom-root');
      expect(list).toHaveAttribute('id', 'history');
      expect(screen.getByText('Title')).toHaveClass('tk-timeline-title', 'theme-title', 'instance-title');
      expect(screen.getByText('Description')).toHaveAttribute('id', 'desc');
      expect(screen.getByText('Time')).toHaveClass('tk-timeline-time', 'custom-time');
    });

    it('keeps the canonical data-* hooks over root slotProps', () => {
      render(
        <Timeline orientation="vertical" slotProps={{ root: { 'data-orientation': 'horizontal' } as Record<string, string> }}>
          <Timeline.Item />
        </Timeline>,
      );

      expect(screen.getByRole('list')).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('context boundaries', () => {
    it('throws when Timeline.Item renders outside the root', () => {
      expect(() => render(<Timeline.Item />)).toThrow(/Timeline\.Item must be used within TimelineProvider/);
    });

    it.each([
      ['Title', () => <Timeline.Title>Loose</Timeline.Title>],
      ['Description', () => <Timeline.Description>Loose</Timeline.Description>],
      ['Time', () => <Timeline.Time>Loose</Timeline.Time>],
    ] as const)('throws when Timeline.%s renders outside an item', (name, Part) => {
      expect(() =>
        render(
          <Timeline>
            <Part />
          </Timeline>,
        ),
      ).toThrow(new RegExp(`Timeline\\.${name} must be used within Timeline\\.Item`));
    });
  });

  describe('display names', () => {
    it('sets dotted display names on every part', () => {
      expect(Timeline.displayName).toBe('Timeline');
      expect(Timeline.Item.displayName).toBe('Timeline.Item');
      expect(Timeline.Title.displayName).toBe('Timeline.Title');
      expect(Timeline.Description.displayName).toBe('Timeline.Description');
      expect(Timeline.Time.displayName).toBe('Timeline.Time');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations', async () => {
      const { container } = renderTimeline({ orientation: 'vertical' });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations with a custom indicator and heading titles', async () => {
      const { container } = render(
        <Timeline aria-label="Milestones">
          <Timeline.Item indicator={<svg />}>
            <Timeline.Title as="h3">Launch</Timeline.Title>
            <Timeline.Description>Shipped to everyone</Timeline.Description>
          </Timeline.Item>
        </Timeline>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
