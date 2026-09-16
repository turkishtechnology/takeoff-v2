import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, isValidElement, useState, type HTMLAttributes, type ReactElement } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen, within } from '../../test-utils';

import { Accordion, type AccordionCurrentValue, type AccordionHeadingLevel, type AccordionIndicatorRenderState, type AccordionProps } from './index';

const sections = (rootProps: AccordionProps = {}) => (
  <Accordion {...rootProps}>
    <Accordion.Item value="fare">
      <Accordion.Header>
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Refund windows and change fees.</Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="baggage">
      <Accordion.Header>
        <Accordion.Trigger>
          Baggage allowance
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Carry-on and checked baggage.</Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="check-in">
      <Accordion.Header>
        <Accordion.Trigger>
          Online check-in
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Check in from 24 hours before departure.</Accordion.Content>
    </Accordion.Item>
  </Accordion>
);

const renderSections = (rootProps?: AccordionProps) => render(sections(rootProps));

/** Renders one item whose header hosts the supplied trigger element. */
const renderSingleItem = (trigger: ReactElement) =>
  render(
    <Accordion>
      <Accordion.Item value="fare">
        <Accordion.Header>{trigger}</Accordion.Header>
        <Accordion.Content>Refund windows and change fees.</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  );

const getRoot = (container: HTMLElement) => container.querySelector('.tk-accordion') as HTMLElement;
const getItems = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.tk-accordion-item'));
const getTrigger = (container: HTMLElement) => container.querySelector('.tk-accordion-item-header') as HTMLElement;
const getIndicator = (container: HTMLElement) => container.querySelector('.tk-accordion-item-indicator') as HTMLElement;

/** Mounts an icon on its own so its DOM can be compared node-for-node. */
const renderIconNode = (icon: ReactElement) => render(icon).container.firstElementChild as Element;

describe('Accordion (compound)', () => {
  // Vitest does not surface console output for passing tests, so React act()
  // warnings or runtime errors would go unnoticed. Fail the test instead. The
  // context-boundary suite intentionally throws during render, so React may
  // log there.
  let consoleError: MockInstance<typeof console.error>;
  let consoleWarn: MockInstance<typeof console.warn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error');
    consoleWarn = vi.spyOn(console, 'warn');
  });

  afterEach(({ task }) => {
    try {
      if (task.suite?.name !== 'context boundaries') {
        expect(consoleError).not.toHaveBeenCalled();
      }
      expect(consoleWarn).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
      consoleWarn.mockRestore();
    }
  });

  describe('Accordion (root)', () => {
    it('renders a div root with the canonical class, data-slot and default data hooks', () => {
      const { container } = renderSections();
      const root = getRoot(container);

      expect(root).not.toBeNull();
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-mode', 'default');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).not.toHaveAttribute('data-disabled');
    });

    it('reflects non-default mode and size into the root data hooks', () => {
      const { container } = renderSections({ mode: 'compact', size: 'large' });
      const root = getRoot(container);

      expect(root).toHaveAttribute('data-mode', 'compact');
      expect(root).toHaveAttribute('data-size', 'large');
    });

    it('keeps the grouped/divided vocabulary on the items instead of the root', () => {
      const { container } = renderSections({ type: 'divided' });

      expect(getRoot(container)).not.toHaveAttribute('data-type', 'divided');
      expect(getItems(container)[0]).toHaveAttribute('data-type', 'divided');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(
        <Accordion as="section">
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const root = getRoot(container);
      expect(root.tagName).toBe('SECTION');
      expect(root).toHaveAttribute('data-slot', 'root');
    });

    it('disables every item from the root and blocks activation', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ disabled: true, onValueChange });

      expect(getRoot(container)).toHaveAttribute('data-disabled', '');
      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-disabled', '');
      }

      const triggers = screen.getAllByRole('button');
      expect(triggers).toHaveLength(3);
      for (const trigger of triggers) {
        expect(trigger).toBeDisabled();
      }

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'closed');
    });

    it('forwards refs to the rendered element of every part', () => {
      const rootRef = createRef<HTMLDivElement>();
      const itemRef = createRef<HTMLDivElement>();
      const headerRef = createRef<HTMLHeadingElement>();
      const triggerRef = createRef<HTMLButtonElement>();
      const indicatorRef = createRef<HTMLSpanElement>();
      const contentRef = createRef<HTMLDivElement>();

      const { container } = render(
        <Accordion ref={rootRef} defaultValue="fare">
          <Accordion.Item ref={itemRef} value="fare">
            <Accordion.Header ref={headerRef}>
              <Accordion.Trigger ref={triggerRef}>
                Fare conditions
                <Accordion.Indicator ref={indicatorRef} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content ref={contentRef}>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(rootRef.current).toBe(getRoot(container));
      expect(itemRef.current).toBe(getItems(container)[0]);
      expect(headerRef.current).toBe(screen.getByRole('heading', { name: 'Fare conditions' }));
      expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Fare conditions' }));
      expect(indicatorRef.current).toBe(getIndicator(container));
      expect(contentRef.current).toBe(screen.getByRole('region', { name: 'Fare conditions' }));
    });
  });

  describe('Accordion.Item', () => {
    it('renders the item root slot with the cascaded default data hooks', () => {
      const { container } = renderSections();
      const root = getRoot(container);
      const items = getItems(container);

      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(item.tagName).toBe('DIV');
        expect(item.parentElement).toBe(root);
        expect(item).toHaveAttribute('data-slot', 'root');
        expect(item).toHaveAttribute('data-type', 'grouped');
        expect(item).toHaveAttribute('data-mode', 'default');
        expect(item).toHaveAttribute('data-size', 'base');
        expect(item).toHaveAttribute('data-state', 'closed');
        expect(item).not.toHaveAttribute('data-disabled');
      }
    });

    it('cascades type, mode and size from the root to every item', () => {
      const { container } = renderSections({ type: 'divided', mode: 'compact', size: 'large' });

      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-type', 'divided');
        expect(item).toHaveAttribute('data-mode', 'compact');
        expect(item).toHaveAttribute('data-size', 'large');
      }
    });

    it('uses id only to derive the trigger and panel ids, never on the item element', () => {
      const { container } = render(
        <Accordion defaultValue="fare">
          <Accordion.Item value="fare" id="fare-item">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: 'Fare conditions' })).toHaveAttribute('id', 'fare-item-trigger');
      expect(screen.getByRole('region', { name: 'Fare conditions' })).toHaveAttribute('id', 'fare-item-content');
      expect(getItems(container)[0]).not.toHaveAttribute('id');
      expect(container.querySelector('#fare-item')).toBeNull();
    });

    it('stamps data-state="open" on the expanded item only', () => {
      const { container } = renderSections({ defaultValue: 'baggage' });
      const [fare, baggage, checkIn] = getItems(container);

      expect(fare).toHaveAttribute('data-state', 'closed');
      expect(baggage).toHaveAttribute('data-state', 'open');
      expect(checkIn).toHaveAttribute('data-state', 'closed');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(
        <Accordion>
          <Accordion.Item as="section" value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const item = getItems(container)[0];
      expect(item.tagName).toBe('SECTION');
      expect(item).toHaveAttribute('data-slot', 'root');
      expect(item).toHaveAttribute('data-type', 'grouped');
    });

    it('derives stable trigger and panel ids from the item id', () => {
      render(
        <Accordion defaultValue="fare">
          <Accordion.Item id="fare-section" value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: 'Fare conditions' });
      const panel = screen.getByRole('region', { name: 'Fare conditions' });

      expect(trigger).toHaveAttribute('id', 'fare-section-trigger');
      expect(trigger).toHaveAttribute('aria-controls', 'fare-section-content');
      expect(panel).toHaveAttribute('id', 'fare-section-content');
      expect(panel).toHaveAttribute('aria-labelledby', 'fare-section-trigger');
    });

    it('disables a single item without affecting its siblings', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <Accordion onValueChange={onValueChange}>
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="upgrades" disabled>
            <Accordion.Header>
              <Accordion.Trigger>Loyalty upgrades</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Coming soon.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="baggage">
            <Accordion.Header>
              <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Carry-on and checked baggage.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const [fareItem, upgradesItem] = getItems(container);
      const upgrades = screen.getByRole('button', { name: 'Loyalty upgrades' });

      expect(upgradesItem).toHaveAttribute('data-disabled', '');
      expect(fareItem).not.toHaveAttribute('data-disabled');
      expect(getRoot(container)).not.toHaveAttribute('data-disabled');
      expect(upgrades).toBeDisabled();

      await user.click(upgrades);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(upgradesItem).toHaveAttribute('data-state', 'closed');
      expect(screen.queryByText('Coming soon.')).not.toBeInTheDocument();

      // Keyboard: the disabled trigger drops out of the tab sequence entirely.
      await user.tab();
      expect(screen.getByRole('button', { name: 'Fare conditions' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Baggage allowance' })).toHaveFocus();
    });
  });

  describe('Accordion.Header', () => {
    it('renders an h3 heading by default that carries only the data-slot hook', () => {
      const { container } = renderSections();
      const heading = screen.getByRole('heading', { level: 3, name: 'Fare conditions' });

      expect(heading.parentElement).toBe(getItems(container)[0]);
      expect(heading).toHaveAttribute('data-slot', 'root');
      // No takeoff-v2 recipe targets the header, so no (empty or tk-*) class is emitted.
      expect(heading).not.toHaveAttribute('class');
    });

    it('renders the heading level from the level prop', () => {
      render(
        <Accordion>
          <Accordion.Item value="fare">
            <Accordion.Header level={2}>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Fare conditions' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });

    it('only accepts the AccordionHeadingLevel union for level', () => {
      // Type-level contract: `level` is narrowed from Spar's `number` to 1..6 so
      // an invalid heading tag (e.g. <h7>) cannot type-check. The invalid
      // element is only created, never rendered.
      const valid: AccordionHeadingLevel = 6;
      const invalid = (
        // @ts-expect-error 7 is not a valid heading level
        <Accordion.Header level={7}>Invalid</Accordion.Header>
      );
      expect(isValidElement(invalid)).toBe(true);

      render(
        <Accordion>
          <Accordion.Item value="fare">
            <Accordion.Header level={valid}>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(screen.getByRole('heading', { level: 6, name: 'Fare conditions' })).toBeInTheDocument();
    });

    it('mirrors the item open state on data-state', async () => {
      const user = userEvent.setup();
      renderSections();
      const heading = screen.getByRole('heading', { name: 'Fare conditions' });

      expect(heading).toHaveAttribute('data-state', 'closed');

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(heading).toHaveAttribute('data-state', 'open');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(
        <Accordion>
          <Accordion.Item value="fare">
            <Accordion.Header as="div">
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const header = getTrigger(container).parentElement as HTMLElement;
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Accordion.Trigger', () => {
    it('renders a native button named by its title with the collapsed disclosure state', () => {
      renderSections();
      const trigger = screen.getByRole('button', { name: 'Fare conditions' });

      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveClass('tk-accordion-item-header');
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger.getAttribute('aria-controls')).toBeTruthy();
    });

    it('toggles aria-expanded and data-state when pressed', async () => {
      const user = userEvent.setup();
      renderSections();
      const trigger = screen.getByRole('button', { name: 'Fare conditions' });

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-state', 'open');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('calls a consumer onClick alongside the toggle', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderSingleItem(<Accordion.Trigger onClick={onClick}>Fare conditions</Accordion.Trigger>);
      const trigger = screen.getByRole('button', { name: 'Fare conditions' });

      await user.click(trigger);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders as a custom element through the as prop while keeping button semantics', async () => {
      const user = userEvent.setup();
      const { container } = renderSingleItem(<Accordion.Trigger as="div">Fare conditions</Accordion.Trigger>);
      const trigger = screen.getByRole('button', { name: 'Fare conditions' });

      expect(trigger.tagName).toBe('DIV');
      expect(trigger).toBe(getTrigger(container));
      expect(trigger).toHaveAttribute('data-slot', 'root');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    describe('title slot', () => {
      it('wraps plain children in the title slot and keeps a trailing indicator outside it', () => {
        const { container } = renderSingleItem(
          <Accordion.Trigger>
            Fare conditions
            <Accordion.Indicator />
          </Accordion.Trigger>,
        );
        const trigger = getTrigger(container);
        const [title, indicator] = Array.from(trigger.children);

        expect(trigger.children).toHaveLength(2);
        expect(title.tagName).toBe('SPAN');
        expect(title).toHaveClass('tk-accordion-item-title');
        expect(title).toHaveAttribute('data-slot', 'title');
        expect(title).toHaveTextContent('Fare conditions');
        expect(title.querySelector('.tk-accordion-item-indicator')).toBeNull();
        expect(indicator).toHaveClass('tk-accordion-item-indicator');
      });

      it('keeps a leading indicator before the title slot', () => {
        const { container } = renderSingleItem(
          <Accordion.Trigger>
            <Accordion.Indicator />
            Fare conditions
          </Accordion.Trigger>,
        );
        const trigger = getTrigger(container);
        const [indicator, title] = Array.from(trigger.children);

        expect(trigger.children).toHaveLength(2);
        expect(indicator).toHaveClass('tk-accordion-item-indicator');
        expect(title).toHaveClass('tk-accordion-item-title');
        expect(title).toHaveTextContent('Fare conditions');
      });

      it('splits text on both sides of an indicator into separate title slots', () => {
        const { container } = renderSingleItem(
          <Accordion.Trigger>
            Istanbul
            <Accordion.Indicator />
            London
          </Accordion.Trigger>,
        );
        const trigger = getTrigger(container);
        const [before, indicator, after] = Array.from(trigger.children);

        expect(trigger.children).toHaveLength(3);
        expect(before).toHaveClass('tk-accordion-item-title');
        expect(before).toHaveTextContent('Istanbul');
        expect(indicator).toHaveClass('tk-accordion-item-indicator');
        expect(after).toHaveClass('tk-accordion-item-title');
        expect(after).toHaveTextContent('London');
      });

      it('keeps non-indicator elements inside the title slot', () => {
        const { container } = renderSingleItem(
          <Accordion.Trigger>
            <strong>Fare</strong> conditions
            <Accordion.Indicator />
          </Accordion.Trigger>,
        );
        const titles = getTrigger(container).querySelectorAll('.tk-accordion-item-title');

        expect(titles).toHaveLength(1);
        expect(titles[0].querySelector('strong')).toHaveTextContent('Fare');
        expect(titles[0]).toHaveTextContent('Fare conditions');
      });

      it('renders no title slot when the only child is an indicator', () => {
        const { container } = renderSingleItem(
          <Accordion.Trigger aria-label="Fare conditions">
            <Accordion.Indicator />
          </Accordion.Trigger>,
        );
        const trigger = getTrigger(container);

        expect(trigger.children).toHaveLength(1);
        expect(trigger.querySelector('.tk-accordion-item-title')).toBeNull();
        expect(trigger.firstElementChild).toHaveClass('tk-accordion-item-indicator');
      });
    });

    describe('startContent slot', () => {
      it('renders startContent in its invariant wrapper ahead of the title', () => {
        const { container } = renderSingleItem(<Accordion.Trigger startContent={<svg aria-hidden="true" data-testid="plane-icon" />}>Fare conditions</Accordion.Trigger>);
        const trigger = getTrigger(container);
        const [start, title] = Array.from(trigger.children);

        expect(trigger.children).toHaveLength(2);
        expect(start.tagName).toBe('SPAN');
        expect(start).toHaveClass('tk-accordion-item-start-content');
        expect(start).toHaveAttribute('data-slot', 'start-content');
        expect(within(start as HTMLElement).getByTestId('plane-icon')).toBeInTheDocument();
        expect(title).toHaveClass('tk-accordion-item-title');
        expect(screen.getByRole('button', { name: 'Fare conditions' })).toBe(trigger);
      });

      it('skips the startContent wrapper when startContent is undefined or null', () => {
        const { container } = render(
          <Accordion>
            <Accordion.Item value="fare">
              <Accordion.Header>
                <Accordion.Trigger>Fare conditions</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Refund windows and change fees.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="baggage">
              <Accordion.Header>
                <Accordion.Trigger startContent={null}>Baggage allowance</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Carry-on and checked baggage.</Accordion.Content>
            </Accordion.Item>
          </Accordion>,
        );

        expect(container.querySelector('.tk-accordion-item-start-content')).toBeNull();
        for (const trigger of screen.getAllByRole('button')) {
          expect(trigger.children).toHaveLength(1);
          expect(trigger.firstElementChild).toHaveClass('tk-accordion-item-title');
        }
      });
    });
  });

  describe('Accordion.Indicator', () => {
    it('renders a decorative span root with the canonical class and data-slot', () => {
      const { container } = renderSections();
      const indicator = getIndicator(container);

      expect(indicator.tagName).toBe('SPAN');
      expect(indicator).toHaveAttribute('data-slot', 'root');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator.parentElement).toBe(screen.getByRole('button', { name: 'Fare conditions' }));
    });

    it('stays out of the trigger accessible name even when it renders text', () => {
      renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator>Show details</Accordion.Indicator>
        </Accordion.Trigger>,
      );

      expect(screen.getByRole('button')).toHaveAccessibleName('Fare conditions');
    });

    it('shows the expand chevron while closed and flips to the collapse chevron when open', async () => {
      const user = userEvent.setup();
      const { container } = renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator />
        </Accordion.Trigger>,
      );
      const expandIcon = renderIconNode(<ChevronBottomIconOutlinedRounded />);
      const collapseIcon = renderIconNode(<ChevronTopIconOutlinedRounded />);
      // Guard: the two glyphs must be distinguishable for the flip assertion to mean anything.
      expect(expandIcon.isEqualNode(collapseIcon)).toBe(false);

      expect(getIndicator(container).children).toHaveLength(1);
      expect(getIndicator(container).firstElementChild?.isEqualNode(expandIcon)).toBe(true);

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(getIndicator(container).children).toHaveLength(1);
      expect(getIndicator(container).firstElementChild?.isEqualNode(collapseIcon)).toBe(true);
    });

    it('renders node children verbatim in every state instead of the default chevron', async () => {
      const user = userEvent.setup();
      const { container } = renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator>
            <span data-testid="plus-glyph">+</span>
          </Accordion.Indicator>
        </Accordion.Trigger>,
      );

      expect(within(getIndicator(container)).getByTestId('plus-glyph')).toBeInTheDocument();
      expect(getIndicator(container).querySelector('svg')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(within(getIndicator(container)).getByTestId('plus-glyph')).toBeInTheDocument();
      expect(getIndicator(container).querySelector('svg')).toBeNull();
    });

    it('resolves a render-prop child with the live isOpen state', async () => {
      const user = userEvent.setup();
      const renderIndicator = vi.fn(({ isOpen }: AccordionIndicatorRenderState) => (isOpen ? 'Hide' : 'Show'));
      const { container } = renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator>{renderIndicator}</Accordion.Indicator>
        </Accordion.Trigger>,
      );

      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: false });
      expect(getIndicator(container)).toHaveTextContent('Show');
      expect(getIndicator(container).querySelector('svg')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: true });
      expect(getIndicator(container)).toHaveTextContent('Hide');
    });

    it('keeps aria-hidden locked to true when a prop tries to override it', () => {
      const { container } = renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator aria-hidden={false} />
        </Accordion.Trigger>,
      );

      expect(getIndicator(container)).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps aria-hidden locked to true when instance or provider slotProps.root try to override it', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ AccordionIndicator: { slotProps: { root: { 'aria-hidden': false } } } }}>
          <Accordion>
            <Accordion.Item value="fare">
              <Accordion.Header>
                <Accordion.Trigger>
                  Fare conditions
                  <Accordion.Indicator slotProps={{ root: { 'aria-hidden': false, 'title': 'indicator-slot' } }}>Show details</Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Refund windows and change fees.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </TakeoffSparProvider>,
      );

      const indicator = getIndicator(container);
      // Other slotProps still land; only the decorative invariant is protected.
      expect(indicator).toHaveAttribute('title', 'indicator-slot');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('button')).toHaveAccessibleName('Fare conditions');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = renderSingleItem(
        <Accordion.Trigger>
          Fare conditions
          <Accordion.Indicator as="i" />
        </Accordion.Trigger>,
      );
      const indicator = getIndicator(container);

      expect(indicator.tagName).toBe('I');
      expect(indicator).toHaveAttribute('data-slot', 'root');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      // Still recognised as an indicator: it sits outside the title slot.
      expect(indicator.parentElement).toBe(getTrigger(container));
    });
  });

  describe('Accordion.Content', () => {
    it('exposes the open panel as a region labelled by its trigger', () => {
      const { container } = renderSections({ defaultValue: 'fare' });
      const trigger = screen.getByRole('button', { name: 'Fare conditions' });
      const panel = screen.getByRole('region', { name: 'Fare conditions' });

      expect(panel.tagName).toBe('DIV');
      expect(panel).toHaveClass('tk-accordion-item-content');
      expect(panel).toHaveAttribute('data-slot', 'root');
      expect(panel).toHaveAttribute('data-state', 'open');
      expect(panel.parentElement).toBe(getItems(container)[0]);
      expect(panel).toHaveTextContent('Refund windows and change fees.');
      expect(panel.id).not.toBe('');
      expect(trigger).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    });

    it('does not mount collapsed panels by default', () => {
      const { container } = renderSections({ defaultValue: 'fare' });

      expect(container.querySelectorAll('.tk-accordion-item-content')).toHaveLength(1);
      expect(screen.queryByText('Carry-on and checked baggage.')).not.toBeInTheDocument();
      expect(screen.queryByText('Check in from 24 hours before departure.')).not.toBeInTheDocument();
    });

    it('keeps a force-mounted panel in the DOM but hidden while collapsed', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Accordion>
          <Accordion.Item value="search">
            <Accordion.Header>
              <Accordion.Trigger>Search-friendly content</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount>Reachable by in-page search.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="default">
            <Accordion.Header>
              <Accordion.Trigger>Default mounting</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Mounted only while open.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const panels = container.querySelectorAll<HTMLElement>('.tk-accordion-item-content');
      expect(panels).toHaveLength(1);
      const panel = panels[0];
      expect(panel).toHaveTextContent('Reachable by in-page search.');
      expect(panel).toHaveAttribute('hidden');
      expect(panel).toHaveAttribute('data-state', 'closed');
      expect(panel).toHaveAttribute('data-slot', 'root');
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.queryByText('Mounted only while open.')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Search-friendly content' }));

      expect(panel).not.toHaveAttribute('hidden');
      expect(panel).toHaveAttribute('data-state', 'open');
      expect(screen.getByRole('region', { name: 'Search-friendly content' })).toBe(panel);
    });

    it('opens a force-mounted panel on beforematch and forwards the event to onBeforeMatch', () => {
      const onBeforeMatch = vi.fn();
      const onValueChange = vi.fn();
      const { container } = render(
        <Accordion onValueChange={onValueChange}>
          <Accordion.Item value="search">
            <Accordion.Header>
              <Accordion.Trigger>Search-friendly content</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount onBeforeMatch={onBeforeMatch}>
              Reachable by in-page search.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );
      const panel = container.querySelector('.tk-accordion-item-content') as HTMLElement;
      const event = new Event('beforematch');

      fireEvent(panel, event);

      expect(onBeforeMatch).toHaveBeenCalledExactlyOnceWith(event);
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('search');
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');
      expect(panel).not.toHaveAttribute('hidden');
    });

    it('renders as a custom element through the as prop', () => {
      render(
        <Accordion defaultValue="fare">
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content as="section">Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const panel = screen.getByRole('region', { name: 'Fare conditions' });
      expect(panel.tagName).toBe('SECTION');
      expect(panel).toHaveClass('tk-accordion-item-content');
    });
  });

  describe('uncontrolled behavior', () => {
    it('opens the defaultValue item on mount', () => {
      renderSections({ defaultValue: 'baggage' });

      expect(screen.getByRole('button', { name: 'Baggage allowance' })).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Fare conditions' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('region', { name: 'Baggage allowance' })).toHaveTextContent('Carry-on and checked baggage.');
    });

    it('switches the open item in single mode and reports the scalar value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ defaultValue: 'fare', onValueChange });

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('baggage');
      const [fare, baggage] = getItems(container);
      expect(fare).toHaveAttribute('data-state', 'closed');
      expect(baggage).toHaveAttribute('data-state', 'open');
      expect(screen.queryByText('Refund windows and change fees.')).not.toBeInTheDocument();
    });

    it('collapses the open item when pressed again and reports an empty value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ defaultValue: 'fare', onValueChange });

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('');
      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-state', 'closed');
      }
    });

    it('keeps the open item expanded when collapsible is false', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ defaultValue: 'fare', collapsible: false, onValueChange });

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');

      // Switching to another item still works.
      await user.click(screen.getByRole('button', { name: 'Online check-in' }));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('check-in');
    });

    it('toggles items independently in multiple mode and reports arrays', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ multiple: true, defaultValue: ['fare'], onValueChange });

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      expect(onValueChange).toHaveBeenLastCalledWith(['fare', 'baggage']);
      const [fare, baggage, checkIn] = getItems(container);
      expect(fare).toHaveAttribute('data-state', 'open');
      expect(baggage).toHaveAttribute('data-state', 'open');
      expect(checkIn).toHaveAttribute('data-state', 'closed');

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(onValueChange).toHaveBeenLastCalledWith(['baggage']);
      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(fare).toHaveAttribute('data-state', 'closed');
      expect(baggage).toHaveAttribute('data-state', 'open');
    });

    it('preserves numeric item identities in the payload', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Accordion defaultValue={1} onValueChange={onValueChange}>
          <Accordion.Item value={1}>
            <Accordion.Header>
              <Accordion.Trigger>Outbound flight</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>IST to LHR.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value={2}>
            <Accordion.Header>
              <Accordion.Trigger>Return flight</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>LHR to IST.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: 'Outbound flight' })).toHaveAttribute('aria-expanded', 'true');

      await user.click(screen.getByRole('button', { name: 'Return flight' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
    });
  });

  describe('controlled behavior', () => {
    it('keeps the controlled value until the prop changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container, rerender } = renderSections({ value: 'fare', onValueChange });

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('baggage');
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');
      expect(getItems(container)[1]).toHaveAttribute('data-state', 'closed');

      rerender(sections({ value: 'baggage', onValueChange }));

      expect(getItems(container)[0]).toHaveAttribute('data-state', 'closed');
      expect(getItems(container)[1]).toHaveAttribute('data-state', 'open');
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('follows parent state wired through onValueChange', async () => {
      const user = userEvent.setup();

      function ControlledAccordion() {
        const [value, setValue] = useState<AccordionCurrentValue>('fare');
        return (
          <>
            <p>{`Open panel: ${String(value)}`}</p>
            {sections({ value, onValueChange: setValue })}
          </>
        );
      }

      const { container } = render(<ControlledAccordion />);

      expect(screen.getByText('Open panel: fare')).toBeInTheDocument();
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');

      await user.click(screen.getByRole('button', { name: 'Online check-in' }));

      expect(screen.getByText('Open panel: check-in')).toBeInTheDocument();
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'closed');
      expect(getItems(container)[2]).toHaveAttribute('data-state', 'open');

      await user.click(screen.getByRole('button', { name: 'Online check-in' }));

      expect(screen.getByText('Open panel:')).toBeInTheDocument();
      expect(getItems(container)[2]).toHaveAttribute('data-state', 'closed');
    });

    it('reports array payloads for a controlled multiple accordion without mutating the DOM', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ multiple: true, value: ['fare'], onValueChange });

      await user.click(screen.getByRole('button', { name: 'Online check-in' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['fare', 'check-in']);
      expect(getItems(container)[2]).toHaveAttribute('data-state', 'closed');
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');
    });
  });

  describe('keyboard interaction', () => {
    it('skips a disabled middle item with the arrow keys and lands Home/End on the enabled edges', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="upgrades" disabled>
            <Accordion.Header>
              <Accordion.Trigger>Upgrades</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Not available on this fare.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="check-in">
            <Accordion.Header>
              <Accordion.Trigger>Online check-in</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Check in from 24 hours before departure.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="baggage" disabled>
            <Accordion.Header>
              <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Carry-on and checked baggage.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );
      const fare = screen.getByRole('button', { name: 'Fare conditions' });
      const upgrades = screen.getByRole('button', { name: 'Upgrades' });
      const checkIn = screen.getByRole('button', { name: 'Online check-in' });

      await user.tab();
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(checkIn).toHaveFocus();
      expect(upgrades).not.toHaveFocus();

      // Wraps past the disabled last item back to the first enabled trigger.
      await user.keyboard('{ArrowDown}');
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(checkIn).toHaveFocus();

      await user.keyboard('{Home}');
      expect(fare).toHaveFocus();

      await user.keyboard('{End}');
      expect(checkIn).toHaveFocus();
    });

    it('moves focus between triggers with the vertical arrow keys, Home and End', async () => {
      const user = userEvent.setup();
      renderSections();
      const fare = screen.getByRole('button', { name: 'Fare conditions' });
      const baggage = screen.getByRole('button', { name: 'Baggage allowance' });
      const checkIn = screen.getByRole('button', { name: 'Online check-in' });

      await user.tab();
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(baggage).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(checkIn).toHaveFocus();

      // Wraps at the edges.
      await user.keyboard('{ArrowDown}');
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(checkIn).toHaveFocus();

      await user.keyboard('{Home}');
      expect(fare).toHaveFocus();

      await user.keyboard('{End}');
      expect(checkIn).toHaveFocus();

      // Cross-axis keys are ignored in the default vertical orientation.
      await user.keyboard('{ArrowLeft}');
      expect(checkIn).toHaveFocus();
    });

    it('follows orientation="horizontal" for the arrow axis', async () => {
      const user = userEvent.setup();
      renderSections({ orientation: 'horizontal' });
      const fare = screen.getByRole('button', { name: 'Fare conditions' });
      const baggage = screen.getByRole('button', { name: 'Baggage allowance' });
      const checkIn = screen.getByRole('button', { name: 'Online check-in' });

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(baggage).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(fare).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(checkIn).toHaveFocus();
    });

    it('toggles the focused trigger with Enter and Space', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSections({ onValueChange });
      const fare = screen.getByRole('button', { name: 'Fare conditions' });

      await user.tab();
      await user.keyboard('{Enter}');

      expect(onValueChange).toHaveBeenLastCalledWith('fare');
      expect(fare).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard(' ');

      expect(onValueChange).toHaveBeenLastCalledWith('');
      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(fare).toHaveAttribute('aria-expanded', 'false');
    });

    it('still calls a consumer onKeyDown on the trigger', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <Accordion>
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger onKeyDown={onKeyDown}>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="baggage">
            <Accordion.Header>
              <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Carry-on and checked baggage.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown.mock.calls[0][0]).toMatchObject({ key: 'ArrowDown' });
      expect(screen.getByRole('button', { name: 'Baggage allowance' })).toHaveFocus();
    });
  });

  describe('customization surfaces', () => {
    it('lands instance className, classNames and slotProps on each part owner node', () => {
      const { container } = render(
        <Accordion defaultValue="fare" className="root-class" classNames={{ root: 'root-slot-class' }} slotProps={{ root: { id: 'faq' } }}>
          <Accordion.Item value="fare" className="item-class" classNames={{ root: 'item-slot-class' }} slotProps={{ root: { title: 'item-slot' } }}>
            <Accordion.Header className="header-class" slotProps={{ root: { title: 'header-slot' } }}>
              <Accordion.Trigger
                startContent={<svg aria-hidden="true" />}
                className="trigger-class"
                classNames={{ root: 'trigger-slot-class', startContent: 'start-slot-class', title: 'title-slot-class' }}
                slotProps={{ root: { title: 'trigger-slot' }, startContent: { title: 'start-slot' }, title: { title: 'title-slot' } }}
              >
                Fare conditions
                <Accordion.Indicator className="indicator-class" slotProps={{ root: { title: 'indicator-slot' } }} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="content-class" classNames={{ root: 'content-slot-class' }} slotProps={{ root: { title: 'content-slot' } }}>
              Refund windows and change fees.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const root = getRoot(container);
      expect(root).toHaveClass('tk-accordion', 'root-class', 'root-slot-class');
      expect(root).toHaveAttribute('id', 'faq');

      const item = getItems(container)[0];
      expect(item).toHaveClass('tk-accordion-item', 'item-class', 'item-slot-class');
      expect(item).toHaveAttribute('title', 'item-slot');
      expect(item).not.toHaveClass('root-class');

      const header = container.querySelector('h3') as HTMLElement;
      expect(header).toHaveClass('header-class');
      expect(header).toHaveAttribute('title', 'header-slot');

      const trigger = getTrigger(container);
      expect(trigger).toHaveClass('tk-accordion-item-header', 'trigger-class', 'trigger-slot-class');
      expect(trigger).toHaveAttribute('title', 'trigger-slot');

      const start = container.querySelector('.tk-accordion-item-start-content') as HTMLElement;
      expect(start).toHaveClass('start-slot-class');
      expect(start).toHaveAttribute('title', 'start-slot');
      expect(start).not.toHaveClass('trigger-class', 'trigger-slot-class', 'title-slot-class');

      const title = container.querySelector('.tk-accordion-item-title') as HTMLElement;
      expect(title).toHaveClass('title-slot-class');
      expect(title).toHaveAttribute('title', 'title-slot');
      expect(title).not.toHaveClass('trigger-class', 'trigger-slot-class', 'start-slot-class');

      const indicator = getIndicator(container);
      expect(indicator).toHaveClass('tk-accordion-item-indicator', 'indicator-class');
      expect(indicator).toHaveAttribute('title', 'indicator-slot');

      const content = container.querySelector('.tk-accordion-item-content') as HTMLElement;
      expect(content).toHaveClass('content-class', 'content-slot-class');
      expect(content).toHaveAttribute('title', 'content-slot');
    });

    it('keeps the canonical data hooks when slotProps tries to override them', () => {
      const hijack = { 'data-slot': 'hijacked', 'data-type': 'hijacked', 'data-mode': 'hijacked', 'data-size': 'hijacked' } as HTMLAttributes<HTMLElement>;
      const { container } = render(
        <Accordion slotProps={{ root: hijack }}>
          <Accordion.Item value="fare" slotProps={{ root: hijack }}>
            <Accordion.Header>
              <Accordion.Trigger>Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-mode', 'default');
      expect(root).toHaveAttribute('data-size', 'base');

      const item = getItems(container)[0];
      expect(item).toHaveAttribute('data-slot', 'root');
      expect(item).toHaveAttribute('data-type', 'grouped');
      expect(item).toHaveAttribute('data-mode', 'default');
      expect(item).toHaveAttribute('data-size', 'base');
    });
  });

  describe('provider theme', () => {
    it('lets provider defaultProps drive the root and item data hooks', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ Accordion: { defaultProps: { type: 'divided', mode: 'compact', size: 'large' } } }}>{sections()}</TakeoffSparProvider>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-mode', 'compact');
      expect(root).toHaveAttribute('data-size', 'large');
      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-type', 'divided');
        expect(item).toHaveAttribute('data-mode', 'compact');
        expect(item).toHaveAttribute('data-size', 'large');
      }
    });

    it('lets instance props win over provider defaultProps', () => {
      const { container } = render(
        <TakeoffSparProvider components={{ Accordion: { defaultProps: { type: 'divided', mode: 'compact', size: 'large' } } }}>
          {sections({ type: 'grouped', mode: 'default', size: 'base' })}
        </TakeoffSparProvider>,
      );

      const root = getRoot(container);
      expect(root).toHaveAttribute('data-mode', 'default');
      expect(root).toHaveAttribute('data-size', 'base');
      const item = getItems(container)[0];
      expect(item).toHaveAttribute('data-type', 'grouped');
      expect(item).toHaveAttribute('data-mode', 'default');
      expect(item).toHaveAttribute('data-size', 'base');
    });

    it('feeds provider behavior defaults through to the open-state model', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <TakeoffSparProvider components={{ Accordion: { defaultProps: { multiple: true } } }}>{sections({ defaultValue: ['fare'], onValueChange })}</TakeoffSparProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['fare', 'baggage']);
      expect(getItems(container)[0]).toHaveAttribute('data-state', 'open');
      expect(getItems(container)[1]).toHaveAttribute('data-state', 'open');
    });

    it('merges provider class and slot layers under the instance layers on every part', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Accordion: { className: 'theme-root' },
            AccordionItem: { classNames: { root: 'theme-item' }, slotProps: { root: { title: 'theme-item-slot' } } },
            AccordionHeader: { className: 'theme-header' },
            AccordionTrigger: {
              classNames: { root: 'theme-trigger', startContent: 'theme-start', title: 'theme-title' },
              slotProps: { startContent: { title: 'theme-start-slot' }, title: { title: 'theme-title-slot' } },
            },
            AccordionIndicator: { classNames: { root: 'theme-indicator' } },
            AccordionContent: { classNames: { root: 'theme-content' } },
          }}
        >
          <Accordion defaultValue="fare" className="instance-root">
            <Accordion.Item value="fare" className="instance-item" slotProps={{ root: { title: 'instance-item-slot' } }}>
              <Accordion.Header>
                <Accordion.Trigger startContent={<svg aria-hidden="true" />} classNames={{ title: 'instance-title' }}>
                  Fare conditions
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Refund windows and change fees.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveClass('tk-accordion', 'theme-root', 'instance-root');

      const item = getItems(container)[0];
      expect(item).toHaveClass('tk-accordion-item', 'theme-item', 'instance-item');
      expect(item).toHaveAttribute('title', 'instance-item-slot');

      expect(container.querySelector('h3')).toHaveClass('theme-header');
      expect(getTrigger(container)).toHaveClass('tk-accordion-item-header', 'theme-trigger');

      const start = container.querySelector('.tk-accordion-item-start-content') as HTMLElement;
      expect(start).toHaveClass('theme-start');
      expect(start).toHaveAttribute('title', 'theme-start-slot');

      const title = container.querySelector('.tk-accordion-item-title') as HTMLElement;
      expect(title).toHaveClass('theme-title', 'instance-title');
      expect(title).toHaveAttribute('title', 'theme-title-slot');

      expect(getIndicator(container)).toHaveClass('tk-accordion-item-indicator', 'theme-indicator');
      expect(container.querySelector('.tk-accordion-item-content')).toHaveClass('tk-accordion-item-content', 'theme-content');
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Accordion.Item renders outside the root', () => {
      expect(() =>
        render(
          <Accordion.Item value="loose">
            <Accordion.Header>
              <Accordion.Trigger>Loose</Accordion.Trigger>
            </Accordion.Header>
          </Accordion.Item>,
        ),
      ).toThrow(/Accordion\.Item must be used within AccordionProvider/);
    });

    it('throws when Accordion.Header renders outside the root', () => {
      expect(() => render(<Accordion.Header>Loose</Accordion.Header>)).toThrow(/Accordion\.Header must be used within AccordionProvider/);
    });

    it('throws when Accordion.Header renders inside the root but outside an item', () => {
      expect(() =>
        render(
          <Accordion>
            <Accordion.Header>Loose</Accordion.Header>
          </Accordion>,
        ),
      ).toThrow('AccordionItem components must be used within an AccordionItem');
    });

    it('throws when Accordion.Trigger renders outside the root', () => {
      expect(() => render(<Accordion.Trigger>Loose</Accordion.Trigger>)).toThrow(/Accordion\.Trigger must be used within AccordionProvider/);
    });

    it('throws when Accordion.Trigger renders inside the root but outside an item', () => {
      expect(() =>
        render(
          <Accordion>
            <Accordion.Trigger>Loose</Accordion.Trigger>
          </Accordion>,
        ),
      ).toThrow('AccordionItem components must be used within an AccordionItem');
    });

    it('throws when Accordion.Indicator renders outside the root', () => {
      expect(() => render(<Accordion.Indicator />)).toThrow(/Accordion\.Indicator must be used within AccordionProvider/);
    });

    it('throws when Accordion.Indicator renders inside the root but outside an item', () => {
      expect(() =>
        render(
          <Accordion>
            <Accordion.Indicator />
          </Accordion>,
        ),
      ).toThrow('AccordionItem components must be used within an AccordionItem');
    });

    it('throws when Accordion.Content renders outside the root', () => {
      expect(() => render(<Accordion.Content>Loose</Accordion.Content>)).toThrow(/Accordion\.Content must be used within AccordionProvider/);
    });

    it('throws an Accordion-branded error when Accordion.Content renders inside the root but outside an item', () => {
      expect(() =>
        render(
          <Accordion>
            <Accordion.Content>Loose</Accordion.Content>
          </Accordion>,
        ),
      ).toThrow('AccordionItem components must be used within an AccordionItem');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the default anatomy with an open panel', async () => {
      const { container } = renderSections({ defaultValue: 'fare' });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for multiple, disabled, startContent, custom indicator and force-mounted variants', async () => {
      const { container } = render(
        <Accordion multiple defaultValue={['fare']} type="divided" mode="compact" size="large">
          <Accordion.Item value="fare">
            <Accordion.Header level={2}>
              <Accordion.Trigger startContent={<svg aria-hidden="true" />}>
                <Accordion.Indicator>{({ isOpen }) => (isOpen ? '-' : '+')}</Accordion.Indicator>
                Fare conditions
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="baggage">
            <Accordion.Header level={2}>
              <Accordion.Trigger>Baggage allowance</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount>Carry-on and checked baggage.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="upgrades" disabled>
            <Accordion.Header level={2}>
              <Accordion.Trigger>
                Loyalty upgrades
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Coming soon.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when triggers render as non-button elements in a horizontal accordion', async () => {
      const { container } = render(
        <Accordion orientation="horizontal" defaultValue="fare">
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger as="div">
                Fare conditions
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="upgrades" disabled>
            <Accordion.Header>
              <Accordion.Trigger as="div">Loyalty upgrades</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Coming soon.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );

      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('root data vocabulary', () => {
    it('never stamps the grouped/divided vocabulary on the root, whatever the resolved type', () => {
      const cases: Array<{ props: AccordionProps; expected: 'grouped' | 'divided' }> = [
        { props: {}, expected: 'grouped' },
        { props: { type: 'grouped' }, expected: 'grouped' },
        { props: { type: 'divided' }, expected: 'divided' },
      ];

      for (const { props, expected } of cases) {
        const { container, unmount } = renderSections(props);

        expect(['grouped', 'divided']).not.toContain(getRoot(container).getAttribute('data-type'));
        for (const item of getItems(container)) {
          expect(item).toHaveAttribute('data-type', expected);
        }

        unmount();
      }
    });
  });

  describe('disabled semantics', () => {
    it('removes every trigger from the tab sequence and ignores activation keys when the root is disabled', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ disabled: true, onValueChange });

      await user.tab();

      for (const trigger of screen.getAllByRole('button')) {
        expect(trigger).not.toHaveFocus();
      }
      expect(document.body).toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onValueChange).not.toHaveBeenCalled();
      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-state', 'closed');
      }
    });

    it('keeps Enter/Space activation and disabled semantics when triggers render as non-button elements', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Accordion onValueChange={onValueChange}>
          <Accordion.Item value="fare">
            <Accordion.Header>
              <Accordion.Trigger as="div">Fare conditions</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Refund windows and change fees.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="upgrades" disabled>
            <Accordion.Header>
              <Accordion.Trigger as="div">Loyalty upgrades</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Coming soon.</Accordion.Content>
          </Accordion.Item>
        </Accordion>,
      );
      const fare = screen.getByRole('button', { name: 'Fare conditions' });
      const upgrades = screen.getByRole('button', { name: 'Loyalty upgrades' });

      expect(fare.tagName).toBe('DIV');
      expect(fare).not.toHaveAttribute('aria-disabled');
      expect(upgrades).toHaveAttribute('aria-disabled', 'true');

      await user.tab();
      expect(fare).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('fare');
      expect(fare).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard(' ');
      expect(onValueChange).toHaveBeenLastCalledWith('');
      expect(fare).toHaveAttribute('aria-expanded', 'false');
      expect(onValueChange).toHaveBeenCalledTimes(2);

      // The disabled non-button trigger is not tabbable and ignores pointer activation.
      await user.tab();
      expect(upgrades).not.toHaveFocus();

      await user.click(upgrades);
      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(upgrades).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Coming soon.')).not.toBeInTheDocument();
    });
  });

  describe('multiple mode payloads', () => {
    it('normalizes a scalar defaultValue into the array payload shape', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSections({ multiple: true, defaultValue: 'fare', onValueChange });

      expect(screen.getByRole('button', { name: 'Fare conditions' })).toHaveAttribute('aria-expanded', 'true');

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['fare', 'baggage']);
    });

    it('ignores collapsible={false} so the last open item can still close, reporting an empty array', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = renderSections({ multiple: true, collapsible: false, defaultValue: ['fare'], onValueChange });

      await user.click(screen.getByRole('button', { name: 'Fare conditions' }));

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith([]);
      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-state', 'closed');
      }
    });

    it('follows a new controlled array from the parent without re-emitting onValueChange', () => {
      const onValueChange = vi.fn();
      const { container, rerender } = renderSections({ multiple: true, value: ['fare'], onValueChange });

      rerender(sections({ multiple: true, value: ['baggage', 'check-in'], onValueChange }));

      const [fare, baggage, checkIn] = getItems(container);
      expect(fare).toHaveAttribute('data-state', 'closed');
      expect(baggage).toHaveAttribute('data-state', 'open');
      expect(checkIn).toHaveAttribute('data-state', 'open');

      rerender(sections({ multiple: true, value: [], onValueChange }));

      for (const item of getItems(container)) {
        expect(item).toHaveAttribute('data-state', 'closed');
      }
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('callback discipline', () => {
    it('does not report the initial uncontrolled or controlled value on mount', () => {
      const onValueChange = vi.fn();
      renderSections({ defaultValue: 'fare', onValueChange });
      render(sections({ multiple: true, value: ['baggage'], onValueChange }));

      const regions = screen.getAllByRole('region');
      expect(regions).toHaveLength(2);
      expect(regions[0]).toHaveTextContent('Refund windows and change fees.');
      expect(regions[1]).toHaveTextContent('Carry-on and checked baggage.');
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Accordion.Indicator state isolation', () => {
    it('flips only the indicator of the item whose open state changed', async () => {
      const user = userEvent.setup();
      const { container } = renderSections({ multiple: true });
      const expandIcon = renderIconNode(<ChevronBottomIconOutlinedRounded />);
      const collapseIcon = renderIconNode(<ChevronTopIconOutlinedRounded />);
      const glyphs = () => Array.from(container.querySelectorAll('.tk-accordion-item-indicator')).map(indicator => indicator.firstElementChild);

      await user.click(screen.getByRole('button', { name: 'Baggage allowance' }));

      const [fare, baggage, checkIn] = glyphs();
      expect(fare?.isEqualNode(expandIcon)).toBe(true);
      expect(baggage?.isEqualNode(collapseIcon)).toBe(true);
      expect(checkIn?.isEqualNode(expandIcon)).toBe(true);
    });
  });

  describe('provider theme (sub-parts)', () => {
    const subPartDefaults = {
      AccordionHeader: { defaultProps: { level: 2 } },
      AccordionContent: { defaultProps: { forceMount: true } },
    } as const;

    it('applies sub-part defaultProps for the heading level and content mounting', () => {
      const { container } = render(<TakeoffSparProvider components={subPartDefaults}>{sections()}</TakeoffSparProvider>);

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();

      const panels = Array.from(container.querySelectorAll('.tk-accordion-item-content'));
      expect(panels).toHaveLength(3);
      for (const panel of panels) {
        expect(panel).toHaveAttribute('hidden');
      }
    });

    it('lets instance level and forceMount win over sub-part defaultProps', () => {
      const { container } = render(
        <TakeoffSparProvider components={subPartDefaults}>
          <Accordion>
            <Accordion.Item value="fare">
              <Accordion.Header level={4}>
                <Accordion.Trigger>Fare conditions</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount={false}>Refund windows and change fees.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('heading', { level: 4, name: 'Fare conditions' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
      expect(container.querySelector('.tk-accordion-item-content')).toBeNull();
    });

    it('concatenates canonical, theme and instance classes on the same owner node and lets instance slotProps win', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Accordion: { classNames: { root: 'theme-root' } },
            AccordionItem: { className: 'theme-item' },
            AccordionHeader: { classNames: { root: 'theme-header' }, slotProps: { root: { title: 'theme-header-slot' } } },
            AccordionTrigger: {
              className: 'theme-trigger',
              classNames: { startContent: 'theme-start', title: 'theme-title' },
              slotProps: { root: { title: 'theme-trigger-slot' }, startContent: { title: 'theme-start-slot' }, title: { title: 'theme-title-slot' } },
            },
            AccordionIndicator: { className: 'theme-indicator', slotProps: { root: { title: 'theme-indicator-slot' } } },
            AccordionContent: { className: 'theme-content', slotProps: { root: { title: 'theme-content-slot' } } },
          }}
        >
          <Accordion defaultValue="fare" classNames={{ root: 'instance-root' }}>
            <Accordion.Item value="fare" classNames={{ root: 'instance-item' }}>
              <Accordion.Header className="instance-header">
                <Accordion.Trigger
                  startContent={<svg aria-hidden="true" />}
                  className="instance-trigger"
                  classNames={{ startContent: 'instance-start', title: 'instance-title' }}
                  slotProps={{ startContent: { title: 'instance-start-slot' } }}
                >
                  Fare conditions
                  <Accordion.Indicator classNames={{ root: 'instance-indicator' }} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="instance-content" slotProps={{ root: { title: 'instance-content-slot' } }}>
                Refund windows and change fees.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </TakeoffSparProvider>,
      );

      expect(getRoot(container)).toHaveClass('tk-accordion', 'theme-root', 'instance-root');
      expect(getItems(container)[0]).toHaveClass('tk-accordion-item', 'theme-item', 'instance-item');

      const header = screen.getByRole('heading', { level: 3 });
      expect(header).toHaveClass('theme-header', 'instance-header');
      expect(header).toHaveAttribute('title', 'theme-header-slot');

      const trigger = screen.getByRole('button', { name: 'Fare conditions' });
      expect(trigger).toHaveClass('tk-accordion-item-header', 'theme-trigger', 'instance-trigger');
      expect(trigger).toHaveAttribute('title', 'theme-trigger-slot');
      expect(trigger).not.toHaveClass('theme-start', 'theme-title', 'instance-start', 'instance-title');

      const start = container.querySelector('.tk-accordion-item-start-content') as HTMLElement;
      expect(start).toHaveClass('theme-start', 'instance-start');
      expect(start).toHaveAttribute('title', 'instance-start-slot');
      expect(start).not.toHaveClass('theme-trigger', 'instance-trigger');

      const title = container.querySelector('.tk-accordion-item-title') as HTMLElement;
      expect(title).toHaveClass('theme-title', 'instance-title');
      expect(title).toHaveAttribute('title', 'theme-title-slot');

      const indicator = getIndicator(container);
      expect(indicator).toHaveClass('tk-accordion-item-indicator', 'theme-indicator', 'instance-indicator');
      expect(indicator).toHaveAttribute('title', 'theme-indicator-slot');
      expect(indicator).not.toHaveClass('theme-trigger', 'instance-trigger');

      const content = screen.getByRole('region', { name: 'Fare conditions' });
      expect(content).toHaveClass('tk-accordion-item-content', 'theme-content', 'instance-content');
      expect(content).toHaveAttribute('title', 'instance-content-slot');
    });
  });

  describe('canonical hooks under overrides', () => {
    it('keeps canonical data-slot and tk-* classes on every sub-part slot when theme and instance overrides target them', () => {
      const hijack = { 'data-slot': 'hijacked' } as HTMLAttributes<HTMLElement>;
      const { container } = render(
        <TakeoffSparProvider components={{ AccordionTrigger: { slotProps: { title: hijack, startContent: hijack } } }}>
          <Accordion defaultValue="fare">
            <Accordion.Item value="fare">
              <Accordion.Header classNames={{ root: 'header-slot-class' }} slotProps={{ root: hijack }}>
                <Accordion.Trigger
                  startContent={<svg aria-hidden="true" />}
                  classNames={{ title: 'custom-title' }}
                  slotProps={{ root: hijack, startContent: hijack, title: hijack }}
                >
                  Fare conditions
                  <Accordion.Indicator slotProps={{ root: hijack }} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content slotProps={{ root: hijack }}>Refund windows and change fees.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </TakeoffSparProvider>,
      );

      const header = screen.getByRole('heading', { level: 3 });
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header).toHaveClass('header-slot-class');

      const trigger = getTrigger(container);
      expect(trigger).toHaveAttribute('data-slot', 'root');

      const [start, title, indicator] = Array.from(trigger.children);
      expect(start).toHaveClass('tk-accordion-item-start-content');
      expect(start).toHaveAttribute('data-slot', 'start-content');
      expect(title).toHaveClass('tk-accordion-item-title', 'custom-title');
      expect(title).toHaveAttribute('data-slot', 'title');
      expect(indicator).toHaveClass('tk-accordion-item-indicator');
      expect(indicator).toHaveAttribute('data-slot', 'root');

      const content = screen.getByRole('region', { name: 'Fare conditions' });
      expect(content).toHaveClass('tk-accordion-item-content');
      expect(content).toHaveAttribute('data-slot', 'root');
      expect(container.querySelector('[data-slot="hijacked"]')).toBeNull();
    });
  });
});
