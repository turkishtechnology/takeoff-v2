import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, createRef, useState, type ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Tabs, type TabsProps, type TabsTriggerRenderProps } from './index';

const spyOnConsoleError = () => vi.spyOn(console, 'error');

const TabSet = (props: TabsProps) => (
  <Tabs defaultValue="overview" {...props}>
    <Tabs.List aria-label="Booking details">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
      <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
    <Tabs.Content value="passengers">2 passengers</Tabs.Content>
    <Tabs.Content value="payments">Paid</Tabs.Content>
  </Tabs>
);

const getTab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs (compound)', () => {
  let consoleError: ReturnType<typeof spyOnConsoleError>;

  beforeEach(() => {
    consoleError = spyOnConsoleError();
  });

  afterEach(() => {
    // React act() warnings and invalid-markup warnings surface through console.error.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  describe('rendering', () => {
    it('renders the canonical anatomy with a tk-* class and data-slot on every part', () => {
      const { container } = render(<TabSet />);

      const root = container.querySelector('div.tk-tabs');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const list = container.querySelector('div.tk-tabs-list');
      expect(list).toHaveAttribute('data-slot', 'root');
      expect(list?.parentElement).toBe(root);

      const triggers = container.querySelectorAll('button.tk-tabs-trigger');
      expect(triggers).toHaveLength(3);
      triggers.forEach(trigger => {
        expect(trigger).toHaveAttribute('data-slot', 'root');
        expect(trigger).toHaveAttribute('type', 'button');
        expect(trigger.parentElement).toBe(list);
      });

      const content = container.querySelector('div.tk-tabs-content');
      expect(content).toHaveAttribute('data-slot', 'root');
      expect(content?.parentElement).toBe(root);
    });

    it('emits the default size, variant, appearance and orientation on the root', () => {
      const { container } = render(<TabSet />);
      const root = container.querySelector('.tk-tabs') as HTMLElement;

      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).toHaveAttribute('data-type', 'basic');
      expect(root).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('reflects non-default root props into data attributes', () => {
      const { container } = render(<TabSet size="small" variant="info" appearance="divided" orientation="vertical" />);
      const root = container.querySelector('.tk-tabs') as HTMLElement;

      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-variant', 'info');
      expect(root).toHaveAttribute('data-type', 'divided');
      expect(root).toHaveAttribute('data-orientation', 'vertical');
    });

    it('cascades size, variant and appearance to the list and every trigger', () => {
      const { container } = render(<TabSet size="large" variant="neutral" appearance="expanded" />);
      const parts = [container.querySelector('.tk-tabs-list'), ...Array.from(container.querySelectorAll('.tk-tabs-trigger'))];

      expect(parts).toHaveLength(4);
      parts.forEach(part => {
        expect(part).toHaveAttribute('data-size', 'large');
        expect(part).toHaveAttribute('data-variant', 'neutral');
        expect(part).toHaveAttribute('data-type', 'expanded');
      });
    });

    it('updates the cascaded attributes when root props change', () => {
      const { container, rerender } = render(<TabSet size="small" />);
      const list = container.querySelector('.tk-tabs-list') as HTMLElement;
      const trigger = getTab('Overview');

      expect(list).toHaveAttribute('data-size', 'small');
      expect(trigger).toHaveAttribute('data-type', 'basic');

      rerender(<TabSet size="large" appearance="compact" />);

      expect(list).toHaveAttribute('data-size', 'large');
      expect(trigger).toHaveAttribute('data-size', 'large');
      expect(trigger).toHaveAttribute('data-type', 'compact');
    });

    it('stamps the resolved orientation on the list, triggers and panels', () => {
      const { container } = render(<TabSet orientation="vertical" />);

      expect(screen.getByRole('tablist')).toHaveAttribute('data-orientation', 'vertical');
      container.querySelectorAll('.tk-tabs-trigger').forEach(trigger => expect(trigger).toHaveAttribute('data-orientation', 'vertical'));
      expect(screen.getByRole('tabpanel')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('renders the root, list and content as custom elements through the as prop', () => {
      const { container } = render(
        <Tabs as="section" defaultValue="overview">
          <Tabs.List as="span" aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content as="article" value="overview">
            Istanbul to London
          </Tabs.Content>
        </Tabs>,
      );

      expect(container.querySelector('.tk-tabs')?.tagName).toBe('SECTION');
      expect(screen.getByRole('tablist').tagName).toBe('SPAN');
      expect(screen.getByRole('tabpanel').tagName).toBe('ARTICLE');
      expect(screen.getByRole('tabpanel')).toHaveClass('tk-tabs-content');
    });

    it('keeps tab semantics and a simulated disabled state when a trigger renders as a custom element', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger as="div" value="overview">
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger as="div" value="passengers" disabled>
              Passengers
            </Tabs.Trigger>
            <Tabs.Trigger as="div" value="payments">
              Payments
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );
      const disabledTab = getTab('Passengers');

      expect(disabledTab.tagName).toBe('DIV');
      expect(disabledTab).toHaveClass('tk-tabs-trigger');
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toHaveAttribute('data-disabled', '');
      expect(disabledTab).not.toHaveAttribute('disabled');

      await user.click(disabledTab);
      expect(onValueChange).not.toHaveBeenCalled();

      await user.click(getTab('Payments'));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('payments');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');
    });

    it('derives trigger and panel ids from the root id prop', () => {
      render(<TabSet id="booking" />);
      const tab = getTab('Overview');
      const panel = screen.getByRole('tabpanel');

      expect(tab).toHaveAttribute('id', 'booking-trigger-overview');
      expect(tab).toHaveAttribute('aria-controls', 'booking-panel-overview');
      expect(getTab('Payments')).toHaveAttribute('aria-controls', 'booking-panel-payments');
      expect(panel).toHaveAttribute('id', 'booking-panel-overview');
      expect(panel).toHaveAttribute('aria-labelledby', 'booking-trigger-overview');
    });

    it('links each tab to its panel with generated ids when no id is provided', () => {
      render(<TabSet />);
      const tab = getTab('Overview');
      const panel = screen.getByRole('tabpanel');

      expect(tab.id).not.toBe('');
      expect(panel.id).not.toBe('');
      expect(tab).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      expect(panel).toHaveAccessibleName('Overview');
    });

    it('forwards refs to the rendered DOM node of every part', () => {
      const rootRef = createRef<HTMLDivElement>();
      const listRef = createRef<HTMLDivElement>();
      const triggerRef = createRef<HTMLButtonElement>();
      const contentRef = createRef<HTMLDivElement>();

      const { container } = render(
        <Tabs ref={rootRef} defaultValue="overview">
          <Tabs.List ref={listRef} aria-label="Booking details">
            <Tabs.Trigger ref={triggerRef} value="overview">
              Overview
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content ref={contentRef} value="overview">
            Istanbul to London
          </Tabs.Content>
        </Tabs>,
      );

      expect(rootRef.current).toBe(container.querySelector('.tk-tabs'));
      expect(listRef.current).toBe(screen.getByRole('tablist'));
      expect(triggerRef.current).toBe(getTab('Overview'));
      expect(contentRef.current).toBe(screen.getByRole('tabpanel'));
    });

    it('focuses a trigger rendered with autoFocus', async () => {
      render(
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers" autoFocus>
              Passengers
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await waitFor(() => expect(getTab('Passengers')).toHaveFocus());
    });

    it('stamps the default horizontal orientation on the list, triggers and panel', () => {
      const { container } = render(<TabSet />);

      expect(screen.getByRole('tablist')).toHaveAttribute('data-orientation', 'horizontal');
      const triggers = container.querySelectorAll('.tk-tabs-trigger');
      expect(triggers).toHaveLength(3);
      triggers.forEach(trigger => expect(trigger).toHaveAttribute('data-orientation', 'horizontal'));
      expect(screen.getByRole('tabpanel')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('still calls consumer onClick, onFocus and onBlur handlers on a trigger', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers" onClick={onClick} onFocus={onFocus} onBlur={onBlur}>
              Passengers
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await user.click(getTab('Passengers'));

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
      expect(onBlur).not.toHaveBeenCalled();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');

      await user.click(getTab('Overview'));

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls).toEqual([['passengers'], ['overview']]);
    });
  });

  describe('uncontrolled selection', () => {
    it('selects the defaultValue tab and mounts only its panel', () => {
      render(<TabSet defaultValue="passengers" />);

      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Passengers')).toHaveAttribute('data-state', 'active');
      expect(getTab('Passengers')).toHaveAttribute('tabindex', '0');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Overview')).toHaveAttribute('data-state', 'inactive');
      expect(getTab('Overview')).toHaveAttribute('tabindex', '-1');

      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveTextContent('2 passengers');
      expect(panel).toHaveAttribute('data-state', 'active');
      expect(screen.queryByText('Istanbul to London')).not.toBeInTheDocument();
      expect(screen.queryByText('Paid')).not.toBeInTheDocument();
    });

    it('selects the first tab when neither value nor defaultValue is provided', () => {
      render(
        <Tabs>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="passengers">2 passengers</Tabs.Content>
        </Tabs>,
      );

      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Istanbul to London');
    });

    it('selects a tab on click, swaps the mounted panel and reports the new value once', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet onValueChange={onValueChange} />);

      await user.click(getTab('Passengers'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('passengers');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Passengers')).toHaveAttribute('data-state', 'active');
      expect(getTab('Passengers')).toHaveAttribute('tabindex', '0');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Overview')).toHaveAttribute('data-state', 'inactive');
      expect(getTab('Overview')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');
      expect(screen.queryByText('Istanbul to London')).not.toBeInTheDocument();
    });

    it('does not select a disabled trigger', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="payments" disabled>
              Payments
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="payments">Paid</Tabs.Content>
        </Tabs>,
      );
      const payments = getTab('Payments');

      expect(payments).toBeDisabled();
      expect(payments).toHaveAttribute('data-disabled', '');
      expect(getTab('Overview')).not.toHaveAttribute('data-disabled');

      await user.click(payments);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(payments).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByText('Paid')).not.toBeInTheDocument();
    });

    it('treats defaultValue as the initial selection only and ignores later changes to it', () => {
      const { rerender } = render(<TabSet defaultValue="overview" />);

      rerender(<TabSet defaultValue="payments" />);

      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Istanbul to London');
    });

    it('still selects a tab on click in manual activation mode', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet activationMode="manual" onValueChange={onValueChange} />);

      await user.click(getTab('Payments'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('payments');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Paid');
    });
  });

  describe('controlled selection', () => {
    it('renders the value prop and waits for the parent to commit a requested change', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      const { rerender } = render(<TabSet value="overview" onValueChange={onValueChange} />);

      await user.click(getTab('Payments'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('payments');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Istanbul to London');

      rerender(<TabSet value="payments" onValueChange={onValueChange} />);

      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Paid');
      // A prop-driven change is not echoed back through the callback.
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('stays in sync with parent state wired through onValueChange', async () => {
      const user = userEvent.setup();
      const ControlledTabs = () => {
        const [value, setValue] = useState('overview');
        return (
          <>
            <output>{value}</output>
            <TabSet value={value} onValueChange={setValue} />
          </>
        );
      };
      render(<ControlledTabs />);

      await user.click(getTab('Passengers'));

      expect(screen.getByRole('status')).toHaveTextContent('passengers');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');
    });

    it('moves focus on arrow keys but keeps the controlled selection until the parent commits', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      const { rerender } = render(<TabSet value="overview" onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(getTab('Passengers')).toHaveFocus();
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('passengers');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Istanbul to London');

      rerender(<TabSet value="passengers" onValueChange={onValueChange} />);

      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Passengers')).toHaveAttribute('tabindex', '0');
      expect(getTab('Overview')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('keeps a controlled value without onValueChange fixed when tabs are clicked or navigated to', async () => {
      const user = userEvent.setup();
      render(<TabSet value="passengers" />);

      await user.click(getTab('Payments'));

      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');

      await user.keyboard('{ArrowRight}');

      expect(getTab('Overview')).toHaveFocus();
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');
    });
  });

  describe('keyboard navigation', () => {
    it('moves focus and selection with ArrowRight/ArrowLeft, wrapping at both ends, and ignores vertical arrows', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet onValueChange={onValueChange} />);

      await user.tab();
      expect(getTab('Overview')).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(getTab('Overview')).toHaveFocus();
      expect(onValueChange).not.toHaveBeenCalled();

      await user.keyboard('{ArrowRight}');
      expect(getTab('Passengers')).toHaveFocus();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      expect(getTab('Overview')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');

      expect(onValueChange.mock.calls).toEqual([['passengers'], ['payments'], ['overview'], ['payments']]);
    });

    it('skips disabled triggers during arrow navigation', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers" disabled>
              Passengers
            </Tabs.Trigger>
            <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(getTab('Payments')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(getTab('Overview')).toHaveFocus();

      expect(onValueChange.mock.calls).toEqual([['payments'], ['overview']]);
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'false');
    });

    it('jumps to the first and last enabled tabs with Home and End', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="passengers" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
            <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
            <Tabs.Trigger value="archive" disabled>
              Archive
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await user.tab();
      expect(getTab('Passengers')).toHaveFocus();

      await user.keyboard('{End}');
      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{Home}');
      expect(getTab('Overview')).toHaveFocus();
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');

      expect(onValueChange.mock.calls).toEqual([['payments'], ['overview']]);
    });

    it('navigates with ArrowDown/ArrowUp in vertical orientation and ignores horizontal arrows', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet orientation="vertical" onValueChange={onValueChange} />);

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(getTab('Overview')).toHaveFocus();
      expect(onValueChange).not.toHaveBeenCalled();

      await user.keyboard('{ArrowDown}');
      expect(getTab('Passengers')).toHaveFocus();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowUp}');
      expect(getTab('Overview')).toHaveFocus();

      expect(onValueChange.mock.calls).toEqual([['passengers'], ['overview']]);
    });

    it('moves focus without selecting in manual mode until Enter or Space activates the tab', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet activationMode="manual" onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(getTab('Passengers')).toHaveFocus();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(onValueChange).not.toHaveBeenCalled();

      await user.keyboard('{Enter}');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');

      await user.keyboard('{ArrowRight}');
      await user.keyboard(' ');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');

      expect(onValueChange.mock.calls).toEqual([['passengers'], ['payments']]);
    });

    it('moves Tab focus from the active tab into the active panel', async () => {
      const user = userEvent.setup();
      render(<TabSet defaultValue="passengers" />);

      await user.tab();
      expect(getTab('Passengers')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('tabpanel')).toHaveFocus();
    });

    it('still calls a consumer onKeyDown on the list', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Booking details" onKeyDown={onKeyDown}>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(getTab('Passengers')).toHaveFocus();
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'ArrowRight' }));
    });

    it('moves focus with Home and End without selecting in manual mode', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(<TabSet defaultValue="passengers" activationMode="manual" onValueChange={onValueChange} />);

      await user.tab();
      expect(getTab('Passengers')).toHaveFocus();

      await user.keyboard('{End}');
      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{Home}');
      expect(getTab('Overview')).toHaveFocus();
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('2 passengers');

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('lands Home on the first enabled tab and wraps past a disabled leading tab', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      render(
        <Tabs defaultValue="payments" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview" disabled>
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
            <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      await user.tab();
      expect(getTab('Payments')).toHaveFocus();

      await user.keyboard('{Home}');
      expect(getTab('Passengers')).toHaveFocus();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowLeft}');
      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');

      expect(onValueChange.mock.calls).toEqual([['passengers'], ['payments']]);
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
    });

    it('stops navigating to a trigger once it unmounts', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      const DynamicTabs = ({ showPayments }: { showPayments: boolean }) => (
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
            {showPayments && <Tabs.Trigger value="payments">Payments</Tabs.Trigger>}
          </Tabs.List>
        </Tabs>
      );
      const { rerender } = render(<DynamicTabs showPayments />);

      rerender(<DynamicTabs showPayments={false} />);
      expect(screen.queryByRole('tab', { name: 'Payments' })).not.toBeInTheDocument();

      await user.tab();
      await user.keyboard('{End}');
      expect(getTab('Passengers')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(getTab('Overview')).toHaveFocus();

      expect(onValueChange.mock.calls).toEqual([['passengers'], ['overview']]);
    });
  });

  describe('trigger render props', () => {
    it('passes { isSelected, disabled, isFocused, orientation, select } to render-function children', () => {
      const renderOverview = vi.fn<(state: TabsTriggerRenderProps) => ReactNode>(() => 'Overview');
      const renderPayments = vi.fn<(state: TabsTriggerRenderProps) => ReactNode>(() => 'Payments');
      render(
        <Tabs defaultValue="overview" orientation="vertical">
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">{renderOverview}</Tabs.Trigger>
            <Tabs.Trigger value="payments" disabled>
              {renderPayments}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      expect(renderOverview).toHaveBeenLastCalledWith({
        isSelected: true,
        disabled: false,
        isFocused: false,
        orientation: 'vertical',
        select: expect.any(Function),
      });
      expect(renderPayments).toHaveBeenLastCalledWith({
        isSelected: false,
        disabled: true,
        isFocused: false,
        orientation: 'vertical',
        select: expect.any(Function),
      });
      expect(getTab('Overview')).toBeInTheDocument();
    });

    it('reports keyboard focus through isFocused', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">{({ isFocused }) => (isFocused ? 'Overview (focused)' : 'Overview')}</Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );

      expect(getTab('Overview')).not.toHaveFocus();

      await user.tab();
      expect(getTab('Overview (focused)')).toHaveFocus();

      await user.tab();
      expect(getTab('Overview')).not.toHaveFocus();
    });

    it('selects the tab through the select() helper', () => {
      const onValueChange = vi.fn<(value: string) => void>();
      let selectPayments: (() => void) | undefined;
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="payments">
              {({ select }) => {
                selectPayments = select;
                return 'Payments';
              }}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="payments">Paid</Tabs.Content>
        </Tabs>,
      );

      act(() => selectPayments?.());

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith('payments');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Paid');
    });

    it('ignores the select() helper on a disabled trigger', () => {
      const onValueChange = vi.fn<(value: string) => void>();
      let selectPayments: (() => void) | undefined;
      render(
        <Tabs defaultValue="overview" onValueChange={onValueChange}>
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="payments" disabled>
              {({ select }) => {
                selectPayments = select;
                return 'Payments';
              }}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="payments">Paid</Tabs.Content>
        </Tabs>,
      );

      expect(selectPayments).toBeInstanceOf(Function);
      act(() => selectPayments?.());

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Istanbul to London');
      expect(screen.queryByText('Paid')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('lazy-mounts panels: only the active panel is in the DOM', async () => {
      const user = userEvent.setup();
      render(<TabSet />);

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
      expect(screen.queryByText('Paid')).not.toBeInTheDocument();

      await user.click(getTab('Payments'));

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.queryByText('Istanbul to London')).not.toBeInTheDocument();
    });

    it('keeps a forceMount panel mounted but hidden and inactive until it is selected', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="passengers" forceMount>
            2 passengers
          </Tabs.Content>
        </Tabs>,
      );
      const forcedPanel = screen.getByText('2 passengers');

      expect(forcedPanel).toHaveClass('tk-tabs-content');
      expect(forcedPanel).not.toBeVisible();
      expect(forcedPanel).toHaveAttribute('data-state', 'inactive');
      // Hidden panels stay out of the accessibility tree.
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);

      await user.click(getTab('Passengers'));

      expect(forcedPanel).toBeVisible();
      expect(forcedPanel).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tabpanel', { name: 'Passengers' })).toBe(forcedPanel);
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto every part owner node', () => {
      const { container } = render(
        <Tabs defaultValue="overview" className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'root-title' } }}>
          <Tabs.List aria-label="Booking details" className="list-extra" classNames={{ root: 'list-slot' }} slotProps={{ root: { title: 'list-title' } }}>
            <Tabs.Trigger value="overview" className="trigger-extra" classNames={{ root: 'trigger-slot' }} slotProps={{ root: { title: 'trigger-title' } }}>
              Overview
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="content-extra" classNames={{ root: 'content-slot' }} slotProps={{ root: { title: 'content-title' } }}>
            Istanbul to London
          </Tabs.Content>
        </Tabs>,
      );

      const owners = [
        ['tk-tabs', 'root'],
        ['tk-tabs-list', 'list'],
        ['tk-tabs-trigger', 'trigger'],
        ['tk-tabs-content', 'content'],
      ] as const;

      for (const [canonicalClass, prefix] of owners) {
        const node = container.querySelector(`.${canonicalClass}`);
        expect(node).toHaveClass(canonicalClass, `${prefix}-extra`, `${prefix}-slot`);
        expect(node).toHaveAttribute('title', `${prefix}-title`);
        expect(node).toHaveAttribute('data-slot', 'root');
      }
    });

    it('keeps the canonical data-slot and cascaded variant hooks when slotProps try to override them', () => {
      const { container } = render(
        <Tabs defaultValue="overview" size="large" slotProps={{ root: { 'data-slot': 'hijacked', 'data-size': 'small' } as never }}>
          <Tabs.List aria-label="Booking details" slotProps={{ root: { 'data-variant': 'info' } as never }}>
            <Tabs.Trigger value="overview" slotProps={{ root: { 'data-slot': 'hijacked', 'data-type': 'compact' } as never }}>
              Overview
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>,
      );
      const root = container.querySelector('.tk-tabs') as HTMLElement;

      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'primary');
      expect(getTab('Overview')).toHaveAttribute('data-slot', 'root');
      expect(getTab('Overview')).toHaveAttribute('data-type', 'basic');
    });

    it('applies provider theme defaultProps, classes and slotProps to every part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Tabs: { defaultProps: { size: 'small', variant: 'info', appearance: 'compact' }, className: 'theme-root' },
            TabsList: { className: 'theme-list' },
            TabsTrigger: { classNames: { root: 'theme-trigger' } },
            TabsContent: { className: 'theme-content', slotProps: { root: { title: 'theme-content-title' } } },
          }}
        >
          <TabSet />
        </TakeoffSparProvider>,
      );
      const root = container.querySelector('.tk-tabs') as HTMLElement;
      const list = screen.getByRole('tablist');
      const trigger = getTab('Overview');
      const panel = screen.getByRole('tabpanel');

      expect(root).toHaveClass('theme-root');
      expect(list).toHaveClass('tk-tabs-list', 'theme-list');
      expect(trigger).toHaveClass('tk-tabs-trigger', 'theme-trigger');
      expect(panel).toHaveClass('tk-tabs-content', 'theme-content');
      expect(panel).toHaveAttribute('title', 'theme-content-title');

      // Theme defaultProps resolve on the root and cascade through context to the list and triggers.
      for (const node of [root, list, trigger]) {
        expect(node).toHaveAttribute('data-size', 'small');
        expect(node).toHaveAttribute('data-variant', 'info');
        expect(node).toHaveAttribute('data-type', 'compact');
      }
    });

    it('lets instance props and slotProps win over provider theme layers', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Tabs: { defaultProps: { size: 'small' } },
            TabsTrigger: { className: 'theme-trigger', slotProps: { root: { title: 'theme-title' } } },
          }}
        >
          <Tabs size="large" defaultValue="overview">
            <Tabs.List aria-label="Booking details">
              <Tabs.Trigger value="overview" className="instance-trigger" slotProps={{ root: { title: 'instance-title' } }}>
                Overview
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </TakeoffSparProvider>,
      );
      const trigger = getTab('Overview');

      expect(container.querySelector('.tk-tabs')).toHaveAttribute('data-size', 'large');
      expect(screen.getByRole('tablist')).toHaveAttribute('data-size', 'large');
      expect(trigger).toHaveAttribute('data-size', 'large');
      expect(trigger).toHaveClass('tk-tabs-trigger', 'theme-trigger', 'instance-trigger');
      expect(trigger).toHaveAttribute('title', 'instance-title');
    });

    it('concatenates theme classNames with instance classes and shallow-merges theme and instance slotProps on a sub-part', () => {
      render(
        <TakeoffSparProvider
          components={{
            TabsTrigger: { classNames: { root: 'theme-slot' }, slotProps: { root: { title: 'theme-title', lang: 'tr' } } },
          }}
        >
          <Tabs defaultValue="overview">
            <Tabs.List aria-label="Booking details">
              <Tabs.Trigger value="overview" className="instance-extra" classNames={{ root: 'instance-slot' }} slotProps={{ root: { title: 'instance-title' } }}>
                Overview
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </TakeoffSparProvider>,
      );
      const trigger = getTab('Overview');

      expect(trigger).toHaveClass('tk-tabs-trigger', 'theme-slot', 'instance-extra', 'instance-slot');
      expect(trigger).toHaveAttribute('title', 'instance-title');
      expect(trigger).toHaveAttribute('lang', 'tr');
      expect(trigger).toHaveAttribute('data-slot', 'root');
      // Trigger-level theme layers stay on the trigger and do not leak to the list.
      expect(screen.getByRole('tablist')).not.toHaveClass('theme-slot');
      expect(screen.getByRole('tablist')).not.toHaveAttribute('lang');
    });

    it('forwards provider theme defaultProps for Spar behaviour props and lets instance props override them', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: string) => void>();
      const theme = { Tabs: { defaultProps: { id: 'themed', orientation: 'vertical', activationMode: 'manual' } as const } };
      const { rerender } = render(
        <TakeoffSparProvider components={theme}>
          <TabSet onValueChange={onValueChange} />
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
      expect(getTab('Overview')).toHaveAttribute('id', 'themed-trigger-overview');

      await user.tab();
      await user.keyboard('{ArrowDown}');

      // Theme orientation drives the arrow axis and theme manual mode defers selection.
      expect(getTab('Passengers')).toHaveFocus();
      expect(getTab('Passengers')).toHaveAttribute('aria-selected', 'false');
      expect(onValueChange).not.toHaveBeenCalled();

      rerender(
        <TakeoffSparProvider components={theme}>
          <TabSet id="instance" orientation="horizontal" activationMode="automatic" onValueChange={onValueChange} />
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
      expect(getTab('Overview')).toHaveAttribute('id', 'instance-trigger-overview');

      await user.keyboard('{ArrowRight}');

      expect(getTab('Payments')).toHaveFocus();
      expect(getTab('Payments')).toHaveAttribute('aria-selected', 'true');
      expect(onValueChange.mock.calls).toEqual([['payments']]);
    });
  });

  describe('accessibility', () => {
    it('wires the tablist, tab and tabpanel roles', () => {
      render(<TabSet />);

      const tablist = screen.getByRole('tablist', { name: 'Booking details' });
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

      const tabs = within(tablist).getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      expect(tabs.map(tab => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);

      expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveTextContent('Istanbul to London');
    });

    it('has no a11y violations for a horizontal set with a disabled tab', async () => {
      const { container } = render(
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Booking details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
            <Tabs.Trigger value="payments" disabled>
              Payments
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">Istanbul to London</Tabs.Content>
          <Tabs.Content value="passengers">2 passengers</Tabs.Content>
        </Tabs>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for a vertical, manual set with a force-mounted panel', async () => {
      const { container } = render(
        <Tabs defaultValue="fare" orientation="vertical" activationMode="manual" size="large" appearance="divided">
          <Tabs.List aria-label="Fare details">
            <Tabs.Trigger value="fare">Fare</Tabs.Trigger>
            <Tabs.Trigger value="baggage">Baggage</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="fare">Flexible economy fare.</Tabs.Content>
          <Tabs.Content value="baggage" forceMount>
            One checked bag up to 23 kg.
          </Tabs.Content>
        </Tabs>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Tabs.List renders outside the root', () => {
      expect(() => render(<Tabs.List aria-label="Booking details">Loose</Tabs.List>)).toThrow(/Tabs\.List must be used within Tabs/);
      expect(() => render(<Tabs.List aria-label="Booking details">Loose</Tabs.List>)).toThrow(/^Tabs\.List must be used within Tabs$/);
    });

    it('throws a descriptive error when Tabs.Trigger renders outside the root', () => {
      expect(() => render(<Tabs.Trigger value="overview">Overview</Tabs.Trigger>)).toThrow(/Tabs\.Trigger must be used within Tabs/);
      expect(() => render(<Tabs.Trigger value="overview">Overview</Tabs.Trigger>)).toThrow(/^Tabs\.Trigger must be used within Tabs$/);
    });

    it('throws a descriptive error when Tabs.Content renders outside the root', () => {
      expect(() => render(<Tabs.Content value="overview">Istanbul to London</Tabs.Content>)).toThrow(/must be used within a Tabs/);
      expect(() => render(<Tabs.Content value="overview">Istanbul to London</Tabs.Content>)).toThrow(/^Tabs components must be used within a Tabs$/);
    });
  });
});
