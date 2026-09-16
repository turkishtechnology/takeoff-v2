import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SelectItemRenderProps, SelectTriggerRenderProps } from '@turkish-technology/spar';
import { createRef, useState, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest';

import { DEFAULT_DISCLOSURE_COLLAPSE_ICON, DEFAULT_DISCLOSURE_EXPAND_ICON } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Select, type SelectIndicatorRenderState } from './index';

// jsdom ships no ResizeObserver. Select.Content observes the trigger for the
// default `contentWidth="trigger"` mode and Floating UI's autoUpdate observes
// the anchor, so stub it for this file and put the original back afterwards.
const OriginalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
});

type User = ReturnType<typeof userEvent.setup>;

const PLACEHOLDER = 'Pick a cabin';

// The middle cabin is disabled so navigation and typeahead have something to skip.
const cabinItems = (
  <>
    <Select.Item value="economy" label="Economy">
      Economy
    </Select.Item>
    <Select.Item value="business" label="Business" disabled>
      Business
    </Select.Item>
    <Select.Item value="first" label="First class">
      First class
    </Select.Item>
  </>
);

const rootOf = (container: HTMLElement) => container.querySelector<HTMLElement>('.tk-select');

const triggerSlot = (slot: 'value' | 'indicator') => screen.getByRole('combobox').querySelector(`[data-slot="${slot}"]`);

const openByClick = async (user: User) => {
  await user.click(screen.getByRole('combobox'));
  return screen.getByRole('listbox');
};

const highlightedOption = () => {
  const id = screen.getByRole('listbox').getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

// `d` of the path a disclosure glyph paints — tells the expand chevron from the collapse one.
const glyphPath = (glyph: ReactNode) => {
  const { container, unmount } = render(<>{glyph}</>);
  const d = container.querySelector('path')?.getAttribute('d');
  unmount();
  return d;
};

const rectOfWidth = (width: number) => ({ x: 0, y: 0, top: 0, left: 0, right: width, bottom: 40, width, height: 40, toJSON: () => ({}) }) as DOMRect;

describe('Select (compound)', () => {
  describe('rendering and anatomy', () => {
    it('renders the root slot with a collapsed combobox trigger and no listbox', () => {
      const { container } = render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const root = rootOf(container);
      expect(root?.tagName).toBe('DIV');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('data-required');
      expect(root).not.toHaveAttribute('data-readonly');

      const trigger = screen.getByRole('combobox');
      expect(root).toContainElement(trigger);
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveClass('tk-select-trigger');
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('data-state', 'closed');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('renders every open-state part with its canonical class and data-slot', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Viewport>
              <Select.Group>
                <Select.Label>Türkiye</Select.Label>
                <Select.Item value="ist" label="Istanbul">
                  Istanbul
                </Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Item value="lhr" label="London">
                London
              </Select.Item>
            </Select.Viewport>
            <Select.Arrow />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveClass('tk-select-content');
      expect(listbox).toHaveAttribute('data-slot', 'root');

      const viewport = listbox.querySelector('.tk-select-viewport');
      expect(viewport).toHaveAttribute('data-slot', 'root');
      expect(viewport).toHaveAttribute('role', 'presentation');
      expect(viewport?.parentElement).toBe(listbox);

      const group = within(listbox).getByRole('group');
      expect(group).toHaveClass('tk-select-group');
      expect(group).toHaveAttribute('data-slot', 'root');
      expect(group.parentElement).toBe(viewport);

      const label = within(group).getByText('Türkiye');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('tk-select-label');
      expect(label).toHaveAttribute('data-slot', 'root');

      const istanbul = within(group).getByRole('option', { name: 'Istanbul' });
      const london = within(listbox).getByRole('option', { name: 'London' });
      for (const option of [istanbul, london]) {
        expect(option).toHaveClass('tk-select-item');
        expect(option).toHaveAttribute('data-slot', 'root');
      }
      expect(group).not.toContainElement(london);

      const separator = listbox.querySelector('.tk-select-separator');
      expect(separator).toHaveAttribute('data-slot', 'root');
      // Presentational (Spar default): a listbox may only own option / group children.
      expect(separator).toHaveAttribute('role', 'presentation');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).not.toHaveAttribute('aria-orientation');

      const arrow = listbox.querySelector('.tk-select-arrow');
      expect(arrow?.tagName.toLowerCase()).toBe('svg');
      expect(arrow).toHaveAttribute('data-slot', 'root');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow?.parentElement).toBe(listbox);
    });

    it('portals the open content to document.body, outside the root', () => {
      const { container } = render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(container).not.toContainElement(listbox);
      expect(listbox.parentElement).toBe(document.body);
    });

    it('portals the content into a custom container', () => {
      const portalTarget = document.createElement('div');
      document.body.appendChild(portalTarget);
      onTestFinished(() => portalTarget.remove());

      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content container={portalTarget}>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox').parentElement).toBe(portalTarget);
    });

    it('wraps the value and the indicator in dedicated trigger slots', () => {
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      const value = triggerSlot('value');
      const indicator = triggerSlot('indicator');

      expect(value).toHaveClass('tk-select-value');
      expect(value).toHaveTextContent(PLACEHOLDER);
      expect(indicator).toHaveClass('tk-select-indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      // Value first, indicator pinned as the trailing child.
      expect(trigger.firstElementChild).toBe(value);
      expect(trigger.lastElementChild).toBe(indicator);
    });

    it('renders the bordered pointer glyph by default and custom arrow children instead', () => {
      const { unmount } = render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            {cabinItems}
            <Select.Arrow />
          </Select.Content>
        </Select>,
      );

      const defaultArrow = screen.getByRole('listbox').querySelector('.tk-select-arrow');
      expect(defaultArrow?.querySelector('polygon.tk-arrow-border')).not.toBeNull();
      expect(defaultArrow?.querySelector('polygon.tk-arrow-fill')).not.toBeNull();
      unmount();

      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            {cabinItems}
            <Select.Arrow>
              <circle className="custom-shape" cx="5" cy="2" r="2" />
            </Select.Arrow>
          </Select.Content>
        </Select>,
      );

      const customArrow = screen.getByRole('listbox').querySelector('.tk-select-arrow');
      expect(customArrow?.querySelector('circle.custom-shape')).not.toBeNull();
      expect(customArrow?.querySelector('.tk-arrow-border')).toBeNull();
    });

    it('renders polymorphic parts through the as prop', () => {
      const { container } = render(
        <Select as="section" defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Group as="section">
              <Select.Label as="span">Cabins</Select.Label>
              {cabinItems}
            </Select.Group>
          </Select.Content>
        </Select>,
      );

      expect(rootOf(container)?.tagName).toBe('SECTION');
      expect(screen.getByRole('group').tagName).toBe('SECTION');
      expect(screen.getByText('Cabins').tagName).toBe('SPAN');
    });

    it('renders the open-state parts through the as prop while keeping their roles and hooks', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content as="section">
            <Select.Viewport as="section">
              <Select.Item as="section" value="economy" label="Economy">
                Economy
              </Select.Item>
              <Select.Separator as="section" />
            </Select.Viewport>
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox.tagName).toBe('SECTION');
      expect(listbox).toHaveClass('tk-select-content');
      expect(listbox.querySelector('.tk-select-viewport')?.tagName).toBe('SECTION');

      const option = screen.getByRole('option', { name: 'Economy' });
      expect(option.tagName).toBe('SECTION');
      expect(option).toHaveClass('tk-select-item');

      const separator = listbox.querySelector('.tk-select-separator');
      expect(separator?.tagName).toBe('SECTION');
    });

    it('forwards refs to the DOM node each part renders', () => {
      const rootRef = createRef<HTMLDivElement>();
      const triggerRef = createRef<HTMLButtonElement>();
      const contentRef = createRef<HTMLDivElement>();
      const viewportRef = createRef<HTMLDivElement>();
      const groupRef = createRef<HTMLDivElement>();
      const labelRef = createRef<HTMLLabelElement>();
      const itemRef = createRef<HTMLDivElement>();
      const separatorRef = createRef<HTMLDivElement>();
      const arrowRef = createRef<SVGSVGElement>();

      const { container } = render(
        <Select ref={rootRef} defaultOpen>
          <Select.Trigger ref={triggerRef} placeholder={PLACEHOLDER} />
          <Select.Content ref={contentRef}>
            <Select.Viewport ref={viewportRef}>
              <Select.Group ref={groupRef}>
                <Select.Label ref={labelRef}>Cabins</Select.Label>
                <Select.Item ref={itemRef} value="economy" label="Economy">
                  Economy
                </Select.Item>
              </Select.Group>
              <Select.Separator ref={separatorRef} />
            </Select.Viewport>
            <Select.Arrow ref={arrowRef} />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(rootRef.current).toBe(rootOf(container));
      expect(triggerRef.current).toBe(screen.getByRole('combobox'));
      expect(contentRef.current).toBe(listbox);
      expect(viewportRef.current).toBe(listbox.querySelector('.tk-select-viewport'));
      expect(groupRef.current).toBe(screen.getByRole('group'));
      expect(labelRef.current).toBe(screen.getByText('Cabins'));
      expect(itemRef.current).toBe(screen.getByRole('option', { name: 'Economy' }));
      expect(separatorRef.current).toBe(listbox.querySelector('.tk-select-separator'));
      expect(arrowRef.current).toBe(listbox.querySelector('.tk-select-arrow'));
    });
  });

  describe('default props and data attributes', () => {
    it('emits data-size="base" on the root, trigger and portalled content by default', () => {
      const { container } = render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(rootOf(container)).toHaveAttribute('data-size', 'base');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-size', 'base');
      expect(screen.getByRole('listbox')).toHaveAttribute('data-size', 'base');
      expect(screen.getByRole('combobox')).not.toHaveAttribute('data-invalid');
    });

    it.each(['small', 'large'] as const)('cascades size="%s" from the root to the trigger and the portalled content', size => {
      const { container } = render(
        <Select size={size} defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(rootOf(container)).toHaveAttribute('data-size', size);
      expect(screen.getByRole('combobox')).toHaveAttribute('data-size', size);
      expect(screen.getByRole('listbox')).toHaveAttribute('data-size', size);
    });

    it('mirrors invalid onto the trigger as data-invalid', () => {
      render(
        <Select invalid>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('data-invalid', '');
    });

    it('marks the root invalid and hands invalid to Spar, so the trigger reports aria-invalid', () => {
      const { container } = render(
        <Select invalid>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(rootOf(container)).toHaveAttribute('data-invalid', '');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows the placeholder with data-placeholder until a value is selected, then the item label', () => {
      const { unmount } = render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('data-placeholder', '');
      expect(triggerSlot('value')).toHaveTextContent(PLACEHOLDER);
      unmount();

      render(
        <Select defaultValue="first">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('combobox')).not.toHaveAttribute('data-placeholder');
      expect(triggerSlot('value')).toHaveTextContent('First class');
    });

    it('reflects the open state on the trigger and wires it to the listbox through the root id', async () => {
      const user = userEvent.setup();
      render(
        <Select id="cabin">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('id', 'cabin-trigger');
      expect(trigger).toHaveAttribute('aria-controls', 'cabin-content');

      const listbox = await openByClick(user);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(listbox).toHaveAttribute('id', 'cabin-content');
      expect(listbox).toHaveAttribute('data-state', 'open');
      expect(listbox).toHaveAttribute('aria-labelledby', 'cabin-trigger');
    });

    it('reports the default bottom/center placement on the content and the arrow', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            {cabinItems}
            <Select.Arrow />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('data-side', 'bottom');
      expect(listbox).toHaveAttribute('data-align', 'center');
      expect(listbox.querySelector('.tk-select-arrow')).toHaveAttribute('data-placement', 'bottom');
    });

    it('forwards side and align to the positioning of the content and the arrow', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content side="top" align="start">
            {cabinItems}
            <Select.Arrow />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('data-side', 'top');
      expect(listbox).toHaveAttribute('data-align', 'start');
      expect(listbox.querySelector('.tk-select-arrow')).toHaveAttribute('data-placement', 'top-start');
    });

    it('emits item state hooks for the selected, highlighted and disabled options', async () => {
      const user = userEvent.setup();
      render(
        <Select defaultValue="economy">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      const economy = screen.getByRole('option', { name: 'Economy' });
      const business = screen.getByRole('option', { name: 'Business' });
      const first = screen.getByRole('option', { name: 'First class' });

      expect(economy).toHaveAttribute('aria-selected', 'true');
      expect(economy).toHaveAttribute('data-state', 'checked');
      // Opening with a value highlights the selected option.
      expect(economy).toHaveAttribute('data-highlighted', '');
      expect(economy).not.toHaveAttribute('data-disabled');

      expect(first).toHaveAttribute('aria-selected', 'false');
      expect(first).toHaveAttribute('data-state', 'unchecked');
      expect(first).not.toHaveAttribute('data-highlighted');

      expect(business).toHaveAttribute('aria-disabled', 'true');
      expect(business).toHaveAttribute('data-disabled', '');

      await user.hover(first);
      expect(first).toHaveAttribute('data-highlighted', '');
      expect(economy).not.toHaveAttribute('data-highlighted');
      expect(highlightedOption()).toBe(first);
    });
  });

  describe('value (uncontrolled and controlled)', () => {
    it('selects a clicked item, shows its label, closes and restores focus to the trigger', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <Select onChange={onChange} onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveFocus();
      expect(trigger).not.toHaveAttribute('data-placeholder');
      expect(triggerSlot('value')).toHaveTextContent('First class');
    });

    it('marks the newly selected item as checked when the panel reopens', async () => {
      const user = userEvent.setup();
      render(
        <Select defaultValue="economy">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));
      await openByClick(user);

      expect(screen.getByRole('option', { name: 'First class' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'Economy' })).toHaveAttribute('aria-selected', 'false');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));
    });

    it('controlled value: reports the selection without changing the display until the parent updates', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const ui = (value: string) => (
        <Select value={value} onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>
      );
      const { rerender } = render(ui('economy'));

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(triggerSlot('value')).toHaveTextContent('Economy');

      rerender(ui('first'));
      expect(triggerSlot('value')).toHaveTextContent('First class');
    });

    it('controlled value: follows parent state through a full selection round-trip', async () => {
      const user = userEvent.setup();
      const ControlledCabin = () => {
        const [cabin, setCabin] = useState('economy');
        return (
          <>
            <p>Selected: {cabin}</p>
            <Select value={cabin} onChange={setCabin}>
              <Select.Trigger placeholder={PLACEHOLDER} />
              <Select.Content>{cabinItems}</Select.Content>
            </Select>
          </>
        );
      };
      render(<ControlledCabin />);

      expect(screen.getByText('Selected: economy')).toBeInTheDocument();
      expect(triggerSlot('value')).toHaveTextContent('Economy');

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(screen.getByText('Selected: first')).toBeInTheDocument();
      expect(triggerSlot('value')).toHaveTextContent('First class');
    });
  });

  describe('open state (uncontrolled and controlled)', () => {
    it('toggles from trigger clicks and reports each transition', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onPointerDownOutside = vi.fn();
      render(
        <Select onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content onPointerDownOutside={onPointerDownOutside}>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      await user.click(screen.getByRole('combobox'));
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      // The trigger belongs to the select, so pressing it is never an outside interaction.
      expect(onPointerDownOutside).not.toHaveBeenCalled();
    });

    it('composes a consumer onClick on the trigger with the built-in toggle', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} onClick={onClick} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('runs a consumer onKeyDown on the trigger first and lets preventDefault veto keyboard opening', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown') event.preventDefault();
      });
      render(
        <Select onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} onKeyDown={onKeyDown} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'ArrowDown' }));
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      await user.keyboard('{ArrowUp}');

      expect(onKeyDown).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('listbox')).toHaveFocus();
    });

    it('starts open with defaultOpen without reporting a change', () => {
      const onOpenChange = vi.fn();
      render(
        <Select defaultOpen onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('focuses the listbox of an initially open select so keyboard dismissal works without reopening', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Select defaultOpen onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus());

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('controlled open: stays open after a selection until the parent flips the open prop', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onChange = vi.fn();
      const ui = (open: boolean) => (
        <Select open={open} onOpenChange={onOpenChange} onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>
      );
      const { rerender } = render(ui(true));

      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onChange).toHaveBeenCalledWith('first');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      rerender(ui(false));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('controlled closed: requests opening from the trigger without opening on its own', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const ui = (open: boolean) => (
        <Select open={open} onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>
      );
      const { rerender } = render(ui(false));

      await user.click(screen.getByRole('combobox'));

      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      rerender(ui(true));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes on a pointer-down outside and forwards the event to onPointerDownOutside', async () => {
      const user = userEvent.setup();
      const onPointerDownOutside = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <>
          <button type="button">Elsewhere</button>
          <Select defaultOpen onOpenChange={onOpenChange}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content onPointerDownOutside={onPointerDownOutside}>{cabinItems}</Select.Content>
          </Select>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

      expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
      expect(onPointerDownOutside).toHaveBeenCalledWith(expect.any(PointerEvent));
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('stays open when onPointerDownOutside prevents default', async () => {
      const user = userEvent.setup();
      const onPointerDownOutside = vi.fn((event: PointerEvent) => event.preventDefault());
      const onOpenChange = vi.fn();
      render(
        <>
          <button type="button">Elsewhere</button>
          <Select defaultOpen onOpenChange={onOpenChange}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content onPointerDownOutside={onPointerDownOutside}>{cabinItems}</Select.Content>
          </Select>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

      expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes on Escape without changing the value, refocuses the trigger and forwards the event', async () => {
      const user = userEvent.setup();
      const onEscapeKeyDown = vi.fn();
      const onChange = vi.fn();
      render(
        <Select defaultValue="economy" onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content onEscapeKeyDown={onEscapeKeyDown}>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.keyboard('{ArrowDown}');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));
      await user.keyboard('{Escape}');

      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      expect(onEscapeKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
      expect(onEscapeKeyDown).toHaveBeenCalledWith(expect.any(KeyboardEvent));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox')).toHaveFocus();
      expect(triggerSlot('value')).toHaveTextContent('Economy');
    });

    it('stays open when onEscapeKeyDown prevents default', async () => {
      const user = userEvent.setup();
      const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault());
      const onOpenChange = vi.fn();
      render(
        <Select defaultOpen onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content onEscapeKeyDown={onEscapeKeyDown}>{cabinItems}</Select.Content>
        </Select>,
      );

      await user.keyboard('{Escape}');

      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('calls onCloseAutoFocus before focus returns to the trigger on Escape and on item selection', async () => {
      const user = userEvent.setup();
      const onCloseAutoFocus = vi.fn();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content onCloseAutoFocus={onCloseAutoFocus}>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.keyboard('{Escape}');

      expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
      expect(onCloseAutoFocus).toHaveBeenCalledWith(expect.any(FocusEvent));
      expect(screen.getByRole('combobox')).toHaveFocus();

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onCloseAutoFocus).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('keeps focus where it is when onCloseAutoFocus prevents default, and skips it for outside-pointer dismissal', async () => {
      const user = userEvent.setup();
      const onCloseAutoFocus = vi.fn((event: FocusEvent) => event.preventDefault());
      render(
        <>
          <button type="button">Elsewhere</button>
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content onCloseAutoFocus={onCloseAutoFocus}>{cabinItems}</Select.Content>
          </Select>
        </>,
      );

      await openByClick(user);
      await user.keyboard('{Escape}');

      expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).not.toHaveFocus();

      await openByClick(user);
      await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      // Outside dismissal moves no focus, so the close-focus hook is not consulted.
      expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
    });

    it('closes when Tab leaves the panel', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Select onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.tab();

      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('keyboard interaction', () => {
    it.each([
      ['ArrowDown', '{ArrowDown}'],
      ['ArrowUp', '{ArrowUp}'],
    ])('opens from the focused trigger with %s, focusing the listbox on the first enabled item', async (_name, key) => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Select onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
      await user.keyboard(key);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('listbox')).toHaveFocus();
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'Economy' }));
      expect(screen.getByRole('option', { name: 'Economy' })).toHaveAttribute('data-highlighted', '');
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('opens from the focused trigger with %s, highlighting the selected item', async (_name, key) => {
      const user = userEvent.setup();
      render(
        <Select defaultValue="first">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await user.tab();
      await user.keyboard(key);

      expect(screen.getByRole('listbox')).toHaveFocus();
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));
    });

    it('moves the highlight with ArrowDown/ArrowUp, skipping disabled items and wrapping around', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      const economy = screen.getByRole('option', { name: 'Economy' });
      const first = screen.getByRole('option', { name: 'First class' });
      expect(highlightedOption()).toBe(economy);

      await user.keyboard('{ArrowDown}');
      expect(highlightedOption()).toBe(first);

      await user.keyboard('{ArrowDown}');
      expect(highlightedOption()).toBe(economy);

      await user.keyboard('{ArrowUp}');
      expect(highlightedOption()).toBe(first);
    });

    it('jumps to the last and first enabled items with End and Home', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);

      await user.keyboard('{End}');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));

      await user.keyboard('{Home}');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'Economy' }));
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('selects the highlighted item with %s and returns focus to the trigger', async (_name, key) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.keyboard('{ArrowDown}');
      await user.keyboard(key);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveFocus();
      expect(triggerSlot('value')).toHaveTextContent('First class');
    });

    it('typeahead highlights the enabled item whose label starts with the typed character', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.keyboard('f');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));

      await user.keyboard('{Escape}');
      await openByClick(user);
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'Economy' }));

      // "Business" is disabled, so typeahead has nothing to land on.
      await user.keyboard('b');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'Economy' }));
    });
  });

  describe('disabled, readOnly, required and form integration', () => {
    it('disabled: disables the trigger, blocks opening and emits data-disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { container } = render(
        <Select disabled onOpenChange={onOpenChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(rootOf(container)).toHaveAttribute('data-disabled', '');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled', '');

      await user.click(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('disabled: skips the trigger in the tab order, ignores opening keys and leaves the value out of the form', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <form aria-label="Booking">
          <button type="button">Before</button>
          <Select disabled name="cabin" defaultValue="economy" onOpenChange={onOpenChange}>
            <Select.Trigger aria-label="Cabin" />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
          <button type="button">After</button>
        </form>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();

      // Even with focus forced onto the trigger, none of the opening keys do anything.
      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      act(() => trigger.focus());
      await user.keyboard('{ArrowDown}{ArrowUp}{Enter} ');

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(new FormData(screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement).has('cabin')).toBe(false);
    });

    it('disabled item: ignores clicks and keeps the panel open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Select onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'Business' }));

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Business' })).toHaveAttribute('aria-selected', 'false');

      // Hovering a disabled item never moves the highlight onto it.
      await user.hover(screen.getByRole('option', { name: 'Business' }));
      expect(screen.getByRole('option', { name: 'Business' })).not.toHaveAttribute('data-highlighted');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'Economy' }));
    });

    it('readOnly: opens for inspection but never commits a new value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <Select readOnly defaultValue="economy" onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(rootOf(container)).toHaveAttribute('data-readonly', '');
      expect(trigger).toHaveAttribute('aria-readonly', 'true');
      expect(trigger).toHaveAttribute('data-readonly', '');

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onChange).not.toHaveBeenCalled();
      expect(triggerSlot('value')).toHaveTextContent('Economy');
    });

    it('readOnly: keyboard selection never commits a value or changes the submitted form value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <form aria-label="Booking">
          <Select readOnly name="cabin" defaultValue="economy" onChange={onChange} onOpenChange={onOpenChange}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </form>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('listbox')).toHaveFocus();

      await user.keyboard('{End}');
      expect(highlightedOption()).toBe(screen.getByRole('option', { name: 'First class' }));
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(triggerSlot('value')).toHaveTextContent('Economy');
      expect(new FormData(screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement).get('cabin')).toBe('economy');
    });

    it('required: marks the root and exposes aria-required on the trigger', () => {
      const { container } = render(
        <Select required>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(rootOf(container)).toHaveAttribute('data-required', '');
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-required', '');
    });

    it('submits the selected value under name with the owning form', async () => {
      const user = userEvent.setup();
      render(
        <form aria-label="Booking">
          <Select name="cabin" defaultValue="economy">
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </form>,
      );

      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
      expect(new FormData(form).get('cabin')).toBe('economy');

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(new FormData(form).get('cabin')).toBe('first');
    });

    it('contributes nothing to the form while no value is selected', () => {
      render(
        <form aria-label="Booking">
          <Select name="cabin">
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </form>,
      );

      const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement;
      expect(new FormData(form).has('cabin')).toBe(false);
    });

    it('autoFocus focuses the trigger on mount', async () => {
      const { container } = render(
        <Select autoFocus>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(rootOf(container)).toHaveAttribute('data-autofocus', '');
      await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    });
  });

  describe('Field integration', () => {
    it('takes its accessible name and description from the Field and inherits required', () => {
      render(
        <Field required>
          <Field.Label>Cabin</Field.Label>
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
          <Field.Description>Select the cabin for this itinerary.</Field.Description>
        </Field>,
      );

      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      expect(trigger).toHaveAccessibleDescription('Select the cabin for this itinerary.');
      expect(trigger).toHaveAttribute('aria-required', 'true');
    });

    it('inherits invalid from the Field and describes the trigger with the error message', () => {
      render(
        <Field invalid>
          <Field.Label>Cabin</Field.Label>
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
          <Field.Description>Select the cabin for this itinerary.</Field.Description>
          <Field.ErrorMessage>Please choose a cabin to continue.</Field.ErrorMessage>
        </Field>,
      );

      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
      expect(trigger).toHaveAttribute('data-invalid', '');
      expect(trigger).toHaveAccessibleDescription('Please choose a cabin to continue.');
    });

    it('inherits disabled from the Field', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Field disabled>
          <Field.Label>Cabin</Field.Label>
          <Select onOpenChange={onOpenChange}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </Field>,
      );

      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      expect(trigger).toBeDisabled();

      await user.click(trigger);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('inherits readOnly from the Field: opens for inspection but blocks committing a value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <Field readOnly>
          <Field.Label>Cabin</Field.Label>
          <Select defaultValue="economy" onChange={onChange}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </Field>,
      );

      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      expect(rootOf(container)).toHaveAttribute('data-readonly', '');
      expect(trigger).toHaveAttribute('aria-readonly', 'true');

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'First class' }));

      expect(onChange).not.toHaveBeenCalled();
      expect(triggerSlot('value')).toHaveTextContent('Economy');
    });
  });

  describe('Select.Trigger indicator', () => {
    it('renders the default chevron and flips it with the open state', async () => {
      const user = userEvent.setup();
      const expandPath = glyphPath(DEFAULT_DISCLOSURE_EXPAND_ICON);
      const collapsePath = glyphPath(DEFAULT_DISCLOSURE_COLLAPSE_ICON);
      expect(expandPath).toMatch(/\S/);
      expect(collapsePath).not.toBe(expandPath);

      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(triggerSlot('indicator')?.querySelector('path')).toHaveAttribute('d', expandPath);

      await openByClick(user);
      expect(triggerSlot('indicator')?.querySelector('path')).toHaveAttribute('d', collapsePath);
    });

    it('treats indicator={true} as the default chevron', () => {
      const expandPath = glyphPath(DEFAULT_DISCLOSURE_EXPAND_ICON);

      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} indicator />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(triggerSlot('indicator')?.querySelector('path')).toHaveAttribute('d', expandPath);
    });

    it.each([false, null])('indicator={%s} renders neither the indicator nor the value wrapper', indicator => {
      const { unmount } = render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} indicator={indicator} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      expect(triggerSlot('indicator')).toBeNull();
      expect(triggerSlot('value')).toBeNull();
      expect(trigger.querySelector('svg')).toBeNull();
      expect(trigger).toHaveTextContent(PLACEHOLDER);
      unmount();

      render(
        <Select defaultValue="first">
          <Select.Trigger placeholder={PLACEHOLDER} indicator={indicator} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(triggerSlot('indicator')).toBeNull();
      expect(screen.getByRole('combobox')).toHaveTextContent('First class');
    });

    it('renders a custom indicator node in every open state', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} indicator={<span data-testid="caret">▾</span>} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(triggerSlot('indicator')).toContainElement(screen.getByTestId('caret'));
      expect(triggerSlot('indicator')?.querySelector('svg')).toBeNull();

      await openByClick(user);
      expect(triggerSlot('indicator')).toContainElement(screen.getByTestId('caret'));
    });

    it('calls a render-function indicator with the live { isOpen } state', async () => {
      const user = userEvent.setup();
      const renderIndicator = vi.fn(({ isOpen }: SelectIndicatorRenderState) => (isOpen ? 'Collapse' : 'Expand'));
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} indicator={renderIndicator} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(triggerSlot('indicator')).toHaveTextContent('Expand');
      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: false });

      await openByClick(user);
      expect(triggerSlot('indicator')).toHaveTextContent('Collapse');
      expect(renderIndicator).toHaveBeenLastCalledWith({ isOpen: true });
    });

    it('wraps explicit node children in the value slot, over the selected label, and keeps the indicator', () => {
      render(
        <Select defaultValue="economy">
          <Select.Trigger placeholder={PLACEHOLDER}>
            <strong>Custom value</strong>
          </Select.Trigger>
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const value = triggerSlot('value');
      expect(value).toHaveTextContent('Custom value');
      expect(value).not.toHaveTextContent('Economy');
      expect(value?.querySelector('strong')).not.toBeNull();
      expect(triggerSlot('indicator')).not.toBeNull();
    });

    it.each([true, false])('falls back to the placeholder when the selected item label is empty (indicator=%s)', indicator => {
      render(
        <Select defaultValue="lounge">
          <Select.Trigger placeholder={PLACEHOLDER} indicator={indicator} />
          <Select.Content>
            <Select.Item value="lounge" label="">
              Lounge
            </Select.Item>
          </Select.Content>
        </Select>,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent(PLACEHOLDER);
    });

    it('hands render-prop children the trigger state and skips the built-in value and indicator', async () => {
      const user = userEvent.setup();
      const renderTrigger = vi.fn(({ label }: SelectTriggerRenderProps) => <span>{label ?? 'Choose'}</span>);
      render(
        <Select defaultValue="economy">
          <Select.Trigger indicator={<span data-testid="ignored-indicator" />}>{renderTrigger}</Select.Trigger>
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(renderTrigger).toHaveBeenLastCalledWith({
        isOpen: false,
        value: 'economy',
        label: 'Economy',
        disabled: false,
        open: expect.any(Function),
        close: expect.any(Function),
        toggle: expect.any(Function),
      });

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Economy');
      expect(triggerSlot('value')).toBeNull();
      expect(triggerSlot('indicator')).toBeNull();
      // A render-prop children owns the layout, so the indicator prop is ignored.
      expect(screen.queryByTestId('ignored-indicator')).not.toBeInTheDocument();

      await openByClick(user);
      expect(renderTrigger).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: true }));
    });

    it('hands render-prop children working open, close and toggle helpers', () => {
      const onOpenChange = vi.fn();
      let triggerState: SelectTriggerRenderProps | undefined;
      const captureTriggerState = (state: SelectTriggerRenderProps) => {
        triggerState = state;
        return state.isOpen ? 'Open' : 'Closed';
      };
      render(
        <Select onOpenChange={onOpenChange}>
          <Select.Trigger aria-label="Cabin">{captureTriggerState}</Select.Trigger>
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox', { name: 'Cabin' });
      expect(trigger).toHaveTextContent('Closed');

      act(() => triggerState?.open());
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open');
      expect(onOpenChange.mock.calls).toEqual([[true]]);

      act(() => triggerState?.toggle());
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(trigger).toHaveTextContent('Closed');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);

      act(() => triggerState?.toggle());
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      act(() => triggerState?.close());
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
    });
  });

  describe('Select.Indicator', () => {
    const renderWithStandaloneIndicator = (indicator: ReactNode) =>
      render(
        <Select>
          <Select.Trigger>
            {({ label }) => (
              <>
                <span className="tk-select-value">{label || PLACEHOLDER}</span>
                {indicator}
              </>
            )}
          </Select.Trigger>
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

    it('renders an aria-hidden span with the canonical slot and the collapsed-state chevron by default', () => {
      const expandPath = glyphPath(DEFAULT_DISCLOSURE_EXPAND_ICON);

      renderWithStandaloneIndicator(<Select.Indicator />);

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator?.tagName).toBe('SPAN');
      expect(indicator).toHaveAttribute('data-slot', 'root');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator?.querySelector('path')).toHaveAttribute('d', expandPath);
    });

    it('keeps aria-hidden when slotProps.root tries to lift it', () => {
      // The indicator is decorative; neither the instance nor a provider theme
      // can expose it to assistive tech through slotProps.
      renderWithStandaloneIndicator(<Select.Indicator slotProps={{ root: { 'aria-hidden': 'false' } }} />);

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders static children in place of the chevron', () => {
      renderWithStandaloneIndicator(<Select.Indicator>▼</Select.Indicator>);

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator).toHaveTextContent('▼');
      expect(indicator?.querySelector('svg')).toBeNull();
    });

    it('renders the output of render-function children in place of the chevron', () => {
      const renderGlyph = vi.fn(() => '▾');

      renderWithStandaloneIndicator(<Select.Indicator>{renderGlyph}</Select.Indicator>);

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(renderGlyph).toHaveBeenCalled();
      expect(indicator).toHaveTextContent('▾');
      expect(indicator?.querySelector('svg')).toBeNull();
    });

    it('flips the default chevron to the collapse glyph while the list is open', async () => {
      const user = userEvent.setup();
      const collapsePath = glyphPath(DEFAULT_DISCLOSURE_COLLAPSE_ICON);

      renderWithStandaloneIndicator(<Select.Indicator />);
      await openByClick(user);

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator?.querySelector('path')).toHaveAttribute('d', collapsePath);
    });

    it('calls render-function children with the live { isOpen } state', async () => {
      const user = userEvent.setup();
      const renderGlyph = vi.fn(({ isOpen }: SelectIndicatorRenderState) => (isOpen ? '▴' : '▾'));

      renderWithStandaloneIndicator(<Select.Indicator>{renderGlyph}</Select.Indicator>);
      expect(renderGlyph).toHaveBeenLastCalledWith({ isOpen: false });

      await openByClick(user);

      expect(renderGlyph).toHaveBeenLastCalledWith({ isOpen: true });
      expect(screen.getByRole('combobox').querySelector('.tk-select-indicator')).toHaveTextContent('▴');
    });

    it('renders as a custom element, forwards its ref and merges classNames and slotProps', () => {
      const ref = createRef<HTMLSpanElement>();

      renderWithStandaloneIndicator(
        <Select.Indicator as="i" ref={ref} className="instance-indicator" classNames={{ root: 'slot-indicator' }} slotProps={{ root: { title: 'Toggle' } }} />,
      );

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator?.tagName).toBe('I');
      expect(ref.current).toBe(indicator);
      expect(indicator).toHaveClass('tk-select-indicator', 'instance-indicator', 'slot-indicator');
      expect(indicator).toHaveAttribute('title', 'Toggle');
    });

    it('layers provider theme className and slotProps under the instance overrides', () => {
      render(
        <TakeoffSparProvider components={{ SelectIndicator: { className: 'theme-indicator', slotProps: { root: { title: 'Theme title', id: 'theme-indicator-id' } } } }}>
          <Select>
            <Select.Trigger aria-label="Cabin">{() => <Select.Indicator className="instance-indicator" slotProps={{ root: { title: 'Instance title' } }} />}</Select.Trigger>
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      const indicator = screen.getByRole('combobox').querySelector('.tk-select-indicator');
      expect(indicator).toHaveClass('tk-select-indicator', 'theme-indicator', 'instance-indicator');
      expect(indicator).toHaveAttribute('data-slot', 'root');
      expect(indicator).toHaveAttribute('title', 'Instance title');
      expect(indicator).toHaveAttribute('id', 'theme-indicator-id');
    });
  });

  describe('Select.Item', () => {
    it('hands render-prop children the item state', async () => {
      const user = userEvent.setup();
      const renderEconomy = vi.fn(({ isSelected }: SelectItemRenderProps) => (isSelected ? 'Economy (current)' : 'Economy'));
      const renderBusiness = vi.fn(() => 'Business');
      render(
        <Select defaultValue="economy">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Item value="economy" label="Economy">
              {renderEconomy}
            </Select.Item>
            <Select.Item value="business" label="Business" disabled>
              {renderBusiness}
            </Select.Item>
          </Select.Content>
        </Select>,
      );

      await openByClick(user);

      expect(renderEconomy).toHaveBeenLastCalledWith({ isSelected: true, isHighlighted: true, select: expect.any(Function), disabled: false });
      expect(renderBusiness).toHaveBeenLastCalledWith({ isSelected: false, isHighlighted: false, select: expect.any(Function), disabled: true });
      expect(screen.getByRole('option', { name: 'Economy (current)' })).toBeInTheDocument();
    });

    it('shows the plain-text label in the trigger when the item children are rich content', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Item value="economy" label="Economy">
              <span aria-hidden="true">✈</span> Economy seat
            </Select.Item>
          </Select.Content>
        </Select>,
      );

      await openByClick(user);
      await user.click(screen.getByRole('option', { name: 'Economy seat' }));

      expect(triggerSlot('value')).toHaveTextContent(/^Economy$/);
    });

    it('hands render-prop children a select() that commits enabled items and ignores disabled ones', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      let businessState: SelectItemRenderProps | undefined;
      let firstClassState: SelectItemRenderProps | undefined;
      const captureBusiness = (state: SelectItemRenderProps) => {
        businessState = state;
        return 'Business';
      };
      const captureFirstClass = (state: SelectItemRenderProps) => {
        firstClassState = state;
        return 'First class';
      };
      render(
        <Select defaultValue="economy" onChange={onChange}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Item value="economy" label="Economy">
              Economy
            </Select.Item>
            <Select.Item value="business" label="Business" disabled>
              {captureBusiness}
            </Select.Item>
            <Select.Item value="first" label="First class">
              {captureFirstClass}
            </Select.Item>
          </Select.Content>
        </Select>,
      );

      await openByClick(user);

      act(() => businessState?.select());
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      expect(firstClassState?.isSelected).toBe(false);
      act(() => firstClassState?.select());

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveFocus();
      expect(triggerSlot('value')).toHaveTextContent('First class');
      expect(firstClassState?.isSelected).toBe(true);
    });
  });

  describe('Select.Group and Select.Label', () => {
    it('names each group with its Select.Label', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder="Choose origin" />
          <Select.Content>
            <Select.Group>
              <Select.Label>Türkiye</Select.Label>
              <Select.Item value="ist" label="Istanbul">
                Istanbul
              </Select.Item>
              <Select.Item value="ank" label="Ankara">
                Ankara
              </Select.Item>
            </Select.Group>
            <Select.Group>
              <Select.Label>Europe</Select.Label>
              <Select.Item value="lhr" label="London Heathrow">
                London Heathrow
              </Select.Item>
            </Select.Group>
          </Select.Content>
        </Select>,
      );

      const turkiye = screen.getByRole('group', { name: 'Türkiye' });
      expect(
        within(turkiye)
          .getAllByRole('option')
          .map(option => option.textContent),
      ).toEqual(['Istanbul', 'Ankara']);

      const europe = screen.getByRole('group', { name: 'Europe' });
      expect(
        within(europe)
          .getAllByRole('option')
          .map(option => option.textContent),
      ).toEqual(['London Heathrow']);
    });
  });

  describe('Select.Content width', () => {
    it('matches the measured trigger width by default', () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectOfWidth(240));

      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toHaveStyle({ width: '240px' });
    });

    it.each([
      [280, '280px'],
      ['20rem', '20rem'],
    ] as const)('applies contentWidth=%j as the panel width', (contentWidth, width) => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectOfWidth(240));

      render(
        <Select defaultOpen contentWidth={contentWidth}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toHaveStyle({ width });
    });

    it('leaves the width to the content when contentWidth="content"', () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectOfWidth(240));

      render(
        <Select defaultOpen contentWidth="content">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox').style.width).toBe('');
    });

    it('layers the computed width under theme slotProps style, instance slotProps style and the style prop', () => {
      const { unmount } = render(
        <Select defaultOpen contentWidth={280}>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content slotProps={{ root: { style: { color: 'rgb(1, 2, 3)' } } }}>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toHaveStyle({ width: '280px', color: 'rgb(1, 2, 3)' });
      unmount();

      render(
        <TakeoffSparProvider components={{ SelectContent: { slotProps: { root: { style: { backgroundColor: 'rgb(4, 5, 6)' } } } } }}>
          <Select defaultOpen contentWidth={280}>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content style={{ width: '100px', color: 'rgb(1, 2, 3)' }}>{cabinItems}</Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      // The direct style prop wins over the computed width; the theme style still lands.
      expect(screen.getByRole('listbox')).toHaveStyle({ width: '100px', color: 'rgb(1, 2, 3)', backgroundColor: 'rgb(4, 5, 6)' });
    });

    it('applies slotProps and style channels even when no width is computed', () => {
      const { unmount } = render(
        <Select defaultOpen contentWidth="content">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content slotProps={{ root: { style: { color: 'rgb(1, 2, 3)' } } }}>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toHaveStyle({ color: 'rgb(1, 2, 3)' });
      unmount();

      render(
        <Select defaultOpen contentWidth="content">
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content style={{ color: 'rgb(7, 8, 9)' }}>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(screen.getByRole('listbox')).toHaveStyle({ color: 'rgb(7, 8, 9)' });
    });
  });

  describe('classNames, className and slotProps', () => {
    it('merges instance className and classNames.root onto every part without dropping the canonical class', () => {
      const { container } = render(
        <Select defaultOpen className="i-root" classNames={{ root: 'slot-root' }}>
          <Select.Trigger className="i-trigger" classNames={{ root: 'slot-trigger' }} placeholder={PLACEHOLDER} />
          <Select.Content className="i-content" classNames={{ root: 'slot-content' }}>
            <Select.Viewport className="i-viewport" classNames={{ root: 'slot-viewport' }}>
              <Select.Group className="i-group" classNames={{ root: 'slot-group' }}>
                <Select.Label className="i-label" classNames={{ root: 'slot-label' }}>
                  Cabins
                </Select.Label>
                <Select.Item className="i-item" classNames={{ root: 'slot-item' }} value="economy" label="Economy">
                  Economy
                </Select.Item>
              </Select.Group>
              <Select.Separator className="i-separator" classNames={{ root: 'slot-separator' }} />
            </Select.Viewport>
            <Select.Arrow className="i-arrow" classNames={{ root: 'slot-arrow' }} />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(rootOf(container)).toHaveClass('tk-select', 'i-root', 'slot-root');
      expect(screen.getByRole('combobox')).toHaveClass('tk-select-trigger', 'i-trigger', 'slot-trigger');
      expect(listbox).toHaveClass('tk-select-content', 'i-content', 'slot-content');
      expect(listbox.querySelector('.tk-select-viewport')).toHaveClass('i-viewport', 'slot-viewport');
      expect(screen.getByRole('group')).toHaveClass('tk-select-group', 'i-group', 'slot-group');
      expect(screen.getByText('Cabins')).toHaveClass('tk-select-label', 'i-label', 'slot-label');
      expect(screen.getByRole('option', { name: 'Economy' })).toHaveClass('tk-select-item', 'i-item', 'slot-item');
      expect(document.querySelector('.tk-select-separator')).toHaveClass('tk-select-separator', 'i-separator', 'slot-separator');
      expect(listbox.querySelector('.tk-select-arrow')).toHaveClass('i-arrow', 'slot-arrow');
    });

    it('spreads slotProps.root onto the node each part renders', () => {
      const { container } = render(
        <Select defaultOpen slotProps={{ root: { title: 'root' } }}>
          <Select.Trigger slotProps={{ root: { title: 'trigger' } }} placeholder={PLACEHOLDER} />
          <Select.Content slotProps={{ root: { title: 'content' } }}>
            <Select.Viewport slotProps={{ root: { title: 'viewport' } }}>
              <Select.Group slotProps={{ root: { title: 'group' } }}>
                <Select.Label slotProps={{ root: { title: 'label' } }}>Cabins</Select.Label>
                <Select.Item slotProps={{ root: { title: 'item' } }} value="economy" label="Economy">
                  Economy
                </Select.Item>
              </Select.Group>
              <Select.Separator slotProps={{ root: { title: 'separator' } }} />
            </Select.Viewport>
            <Select.Arrow slotProps={{ root: { title: 'arrow' } }} />
          </Select.Content>
        </Select>,
      );

      const listbox = screen.getByRole('listbox');
      expect(rootOf(container)).toHaveAttribute('title', 'root');
      expect(screen.getByRole('combobox')).toHaveAttribute('title', 'trigger');
      expect(listbox).toHaveAttribute('title', 'content');
      expect(listbox.querySelector('.tk-select-viewport')).toHaveAttribute('title', 'viewport');
      expect(screen.getByRole('group')).toHaveAttribute('title', 'group');
      expect(screen.getByText('Cabins')).toHaveAttribute('title', 'label');
      expect(screen.getByRole('option', { name: 'Economy' })).toHaveAttribute('title', 'item');
      expect(document.querySelector('.tk-select-separator')).toHaveAttribute('title', 'separator');
      expect(listbox.querySelector('.tk-select-arrow')).toHaveAttribute('title', 'arrow');
    });

    it('lands trigger classNames and slotProps on the owning root, value and indicator nodes', () => {
      render(
        <Select>
          <Select.Trigger
            placeholder={PLACEHOLDER}
            classNames={{ root: 'slot-root', value: 'slot-value', indicator: 'slot-indicator' }}
            slotProps={{ root: { title: 'Trigger title' }, value: { title: 'Value title' }, indicator: { id: 'cabin-indicator' } }}
          />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      const trigger = screen.getByRole('combobox');
      const value = triggerSlot('value');
      const indicator = triggerSlot('indicator');

      expect(trigger).toHaveClass('tk-select-trigger', 'slot-root');
      expect(trigger).not.toHaveClass('slot-value');
      expect(trigger).not.toHaveClass('slot-indicator');
      expect(trigger).toHaveAttribute('title', 'Trigger title');

      expect(value).toHaveClass('tk-select-value', 'slot-value');
      expect(value).not.toHaveClass('slot-root');
      expect(value).toHaveAttribute('title', 'Value title');

      expect(indicator).toHaveClass('tk-select-indicator', 'slot-indicator');
      expect(indicator).toHaveAttribute('id', 'cabin-indicator');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps the canonical data-slot, class and state attributes when slotProps try to override them', () => {
      const hijack = { 'data-slot': 'hijacked', 'data-size': 'bogus' } as HTMLAttributes<HTMLElement>;
      const { container } = render(
        <Select size="large" defaultOpen slotProps={{ root: hijack }}>
          <Select.Trigger slotProps={{ root: hijack }} placeholder={PLACEHOLDER} />
          <Select.Content slotProps={{ root: hijack }}>{cabinItems}</Select.Content>
        </Select>,
      );

      for (const [node, canonicalClass] of [
        [rootOf(container), 'tk-select'],
        [screen.getByRole('combobox'), 'tk-select-trigger'],
        [screen.getByRole('listbox'), 'tk-select-content'],
      ] as const) {
        expect(node).toHaveClass(canonicalClass);
        expect(node).toHaveAttribute('data-slot', 'root');
        expect(node).toHaveAttribute('data-size', 'large');
      }
    });

    it('applies provider theme className, classNames and slotProps below instance overrides', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Select: { className: 'theme-root' },
            SelectTrigger: {
              className: 'theme-trigger',
              classNames: { value: 'theme-value', indicator: 'theme-indicator' },
              slotProps: { root: { title: 'Theme trigger' }, value: { title: 'Theme value' } },
            },
            SelectContent: { classNames: { root: 'theme-content' } },
            SelectViewport: { className: 'theme-viewport' },
            SelectGroup: { className: 'theme-group' },
            SelectLabel: { className: 'theme-label' },
            SelectItem: { className: 'theme-item', slotProps: { root: { title: 'Theme item' } } },
            SelectSeparator: { className: 'theme-separator' },
            SelectArrow: { className: 'theme-arrow' },
          }}
        >
          <Select defaultOpen>
            <Select.Trigger placeholder={PLACEHOLDER} slotProps={{ root: { title: 'Instance trigger' } }} />
            <Select.Content>
              <Select.Viewport>
                <Select.Group>
                  <Select.Label>Cabins</Select.Label>
                  <Select.Item value="economy" label="Economy" className="instance-item">
                    Economy
                  </Select.Item>
                </Select.Group>
                <Select.Separator />
              </Select.Viewport>
              <Select.Arrow />
            </Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      const trigger = screen.getByRole('combobox');
      const listbox = screen.getByRole('listbox');

      expect(rootOf(container)).toHaveClass('tk-select', 'theme-root');

      expect(trigger).toHaveClass('tk-select-trigger', 'theme-trigger');
      expect(trigger).toHaveAttribute('title', 'Instance trigger');
      // The provider `className` shorthand targets the root slot only.
      expect(triggerSlot('value')).toHaveClass('tk-select-value', 'theme-value');
      expect(triggerSlot('value')).not.toHaveClass('theme-trigger');
      expect(triggerSlot('value')).toHaveAttribute('title', 'Theme value');
      expect(triggerSlot('indicator')).toHaveClass('tk-select-indicator', 'theme-indicator');

      expect(listbox).toHaveClass('tk-select-content', 'theme-content');
      expect(listbox.querySelector('.tk-select-viewport')).toHaveClass('theme-viewport');
      expect(screen.getByRole('group')).toHaveClass('tk-select-group', 'theme-group');
      expect(screen.getByText('Cabins')).toHaveClass('tk-select-label', 'theme-label');

      const item = screen.getByRole('option', { name: 'Economy' });
      expect(item).toHaveClass('tk-select-item', 'theme-item', 'instance-item');
      expect(item).toHaveAttribute('title', 'Theme item');

      expect(document.querySelector('.tk-select-separator')).toHaveClass('tk-select-separator', 'theme-separator');
      expect(listbox.querySelector('.tk-select-arrow')).toHaveClass('theme-arrow');
    });

    it('lets instance slotProps win over provider theme slotProps on the trigger value and indicator slots', () => {
      render(
        <TakeoffSparProvider components={{ SelectTrigger: { slotProps: { value: { title: 'Theme value', lang: 'tr' }, indicator: { title: 'Theme indicator', lang: 'tr' } } } }}>
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} slotProps={{ value: { title: 'Instance value' }, indicator: { title: 'Instance indicator' } }} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      const value = triggerSlot('value');
      const indicator = triggerSlot('indicator');

      expect(value).toHaveAttribute('title', 'Instance value');
      expect(indicator).toHaveAttribute('title', 'Instance indicator');
      // Theme entries the instance leaves untouched still land on the slot.
      expect(value).toHaveAttribute('lang', 'tr');
      expect(indicator).toHaveAttribute('lang', 'tr');
    });

    it('resolves provider defaultProps below instance props and cascades the resolved size', () => {
      const components = { Select: { defaultProps: { size: 'large' as const } }, SelectTrigger: { defaultProps: { indicator: false } } };
      const { container, unmount } = render(
        <TakeoffSparProvider components={components}>
          <Select defaultOpen>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      expect(rootOf(container)).toHaveAttribute('data-size', 'large');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-size', 'large');
      expect(screen.getByRole('listbox')).toHaveAttribute('data-size', 'large');
      expect(triggerSlot('indicator')).toBeNull();
      unmount();

      const { container: overridden } = render(
        <TakeoffSparProvider components={components}>
          <Select size="small" defaultOpen>
            <Select.Trigger placeholder={PLACEHOLDER} indicator />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
        </TakeoffSparProvider>,
      );

      expect(rootOf(overridden)).toHaveAttribute('data-size', 'small');
      expect(screen.getByRole('combobox')).toHaveAttribute('data-size', 'small');
      expect(screen.getByRole('listbox')).toHaveAttribute('data-size', 'small');
      expect(triggerSlot('indicator')).not.toBeNull();
    });
  });

  describe('context boundaries', () => {
    it('throws when Select.Trigger renders outside Select', () => {
      expect(() => render(<Select.Trigger placeholder={PLACEHOLDER} />)).toThrow(/Select\.Trigger must be used within SelectProvider/);
    });

    it('throws when Select.Content renders outside Select', () => {
      expect(() => render(<Select.Content>{cabinItems}</Select.Content>)).toThrow(/Select\.Content must be used within SelectProvider/);
    });

    it('throws when Select.Indicator renders outside Select', () => {
      expect(() => render(<Select.Indicator />)).toThrow(/Select components must be used within a Select/);
    });

    it('throws when Select.Item renders outside Select', () => {
      expect(() =>
        render(
          <Select.Item value="economy" label="Economy">
            Economy
          </Select.Item>,
        ),
      ).toThrow(/Select components must be used within a Select/);
    });

    it('throws when Select.Item or Select.Viewport render inside Select but outside Select.Content', () => {
      expect(() =>
        render(
          <Select>
            <Select.Item value="economy" label="Economy">
              Economy
            </Select.Item>
          </Select>,
        ),
      ).toThrow(/Select items must be rendered within SelectContent/);

      expect(() =>
        render(
          <Select>
            <Select.Viewport />
          </Select>,
        ),
      ).toThrow(/Select items must be rendered within SelectContent/);
    });

    it('throws when Select.Arrow renders outside Select.Content', () => {
      expect(() => render(<Select.Arrow />)).toThrow(/Select components must be used within a Select/);

      expect(() =>
        render(
          <Select>
            <Select.Arrow />
          </Select>,
        ),
      ).toThrow(/SelectArrow must be used within SelectContent/);
    });

    it('throws when Select.Label renders outside Select.Group', () => {
      expect(() =>
        render(
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>
              <Select.Label>Loose</Select.Label>
              {cabinItems}
            </Select.Content>
          </Select>,
        ),
      ).toThrow(/SelectGroup components must be used within a SelectGroup/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations when closed inside a Field', async () => {
      const { container } = render(
        <Field required>
          <Field.Label>Cabin</Field.Label>
          <Select defaultValue="economy">
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
          <Field.Description>Select the cabin for this itinerary.</Field.Description>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for a standalone select named through aria-label', async () => {
      const { container } = render(
        <Select>
          <Select.Trigger aria-label="Cabin" placeholder={PLACEHOLDER} />
          <Select.Content>{cabinItems}</Select.Content>
        </Select>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations in the invalid state inside a Field', async () => {
      const { container } = render(
        <Field invalid>
          <Field.Label>Cabin</Field.Label>
          <Select>
            <Select.Trigger placeholder={PLACEHOLDER} />
            <Select.Content>{cabinItems}</Select.Content>
          </Select>
          <Field.ErrorMessage>Please choose a cabin to continue.</Field.ErrorMessage>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for the documented anatomy with a Select.Separator inside the viewport', async () => {
      const user = userEvent.setup();
      render(
        <Field>
          <Field.Label>Origin</Field.Label>
          <Select defaultValue="ist">
            <Select.Trigger placeholder="Choose origin" />
            <Select.Content>
              <Select.Viewport>
                <Select.Group>
                  <Select.Label>Türkiye</Select.Label>
                  <Select.Item value="ist" label="Istanbul">
                    Istanbul
                  </Select.Item>
                </Select.Group>
                <Select.Separator />
                <Select.Item value="lhr" label="London Heathrow">
                  London Heathrow
                </Select.Item>
              </Select.Viewport>
              <Select.Arrow />
            </Select.Content>
          </Select>
        </Field>,
      );

      const listbox = await openByClick(user);
      const separator = listbox.querySelector('.tk-select-separator');

      // Presentational and hidden so the listbox only owns option / group children.
      expect(separator).toHaveAttribute('role', 'presentation');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).not.toHaveAttribute('aria-orientation');
      expect(screen.queryByRole('separator', { hidden: true })).toBeNull();
      expect(await axe(listbox)).toHaveNoViolations();
    });

    it('lets a consumer restore separator semantics with role="separator"', () => {
      render(
        <Select defaultOpen>
          <Select.Trigger placeholder={PLACEHOLDER} />
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="economy" label="Economy">
                Economy
              </Select.Item>
              <Select.Separator role="separator" aria-hidden={false} />
              <Select.Item value="first" label="First class">
                First class
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select>,
      );

      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('tk-select-separator');
      expect(separator).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('has no axe violations for the open listbox with groups, a disabled item and an arrow', async () => {
      const user = userEvent.setup();
      render(
        <Field>
          <Field.Label>Origin</Field.Label>
          <Select defaultValue="ist">
            <Select.Trigger placeholder="Choose origin" />
            <Select.Content>
              <Select.Viewport>
                <Select.Group>
                  <Select.Label>Türkiye</Select.Label>
                  <Select.Item value="ist" label="Istanbul">
                    Istanbul
                  </Select.Item>
                  <Select.Item value="ank" label="Ankara">
                    Ankara
                  </Select.Item>
                </Select.Group>
                <Select.Group>
                  <Select.Label>Europe</Select.Label>
                  <Select.Item value="lhr" label="London Heathrow">
                    London Heathrow
                  </Select.Item>
                  <Select.Item value="fra" label="Frankfurt (unavailable)" disabled>
                    Frankfurt (unavailable)
                  </Select.Item>
                </Select.Group>
              </Select.Viewport>
              <Select.Arrow />
            </Select.Content>
          </Select>
        </Field>,
      );

      const listbox = await openByClick(user);

      expect(await axe(listbox)).toHaveNoViolations();
    });
  });
});
