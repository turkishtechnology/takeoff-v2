import { createRef, useRef, useState } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { SparReactProvider } from '../../provider';

import { Accordion } from './index';

const renderItem = (itemKey: string | number, label = `Item ${itemKey}`) => (
  <Accordion.Item key={itemKey} itemKey={itemKey} data-testid={`item-${itemKey}`}>
    <Accordion.Header>
      <Accordion.Trigger data-testid={`trigger-${itemKey}`}>{label}</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content data-testid={`content-${itemKey}`}>{label} body</Accordion.Content>
  </Accordion.Item>
);

const renderItems = (keys: ReadonlyArray<string | number>) => keys.map(k => renderItem(k));

describe('Accordion — type / mode contract', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('emits root mode/size and item visual type/mode/size hooks', () => {
    const { container, getByTestId } = render(<Accordion>{renderItem('one')}</Accordion>);
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'default');
    expect(root).toHaveAttribute('data-size', 'base');

    const item = getByTestId('item-one');
    expect(item).toHaveAttribute('data-type', 'grouped');
    expect(item).toHaveAttribute('data-mode', 'default');
    expect(item).toHaveAttribute('data-size', 'base');
  });

  it('forwards an explicit mode="compact" without warning', () => {
    const { container, getByTestId } = render(<Accordion mode="compact">{renderItem('one')}</Accordion>);
    expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item-one')).toHaveAttribute('data-mode', 'compact');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('maps legacy type="compact" to mode="compact" and warns once per instance', () => {
    const { container, getByTestId, rerender } = render(<Accordion type="compact">{renderItem('one')}</Accordion>);

    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-mode', 'compact');
    expect(getByTestId('item-one')).toHaveAttribute('data-type', 'grouped');
    expect(getByTestId('item-one')).toHaveAttribute('data-mode', 'compact');

    rerender(<Accordion type="compact">{renderItem('one')}</Accordion>);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('type="compact"');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('mode="compact"');
  });

  it('respects an explicit mode when legacy type="compact" is also passed', () => {
    render(
      <Accordion type="compact" mode="default">
        {renderItem('one')}
      </Accordion>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps non-compact type values unchanged and silent', () => {
    const { getByTestId } = render(<Accordion type="divided">{renderItem('one')}</Accordion>);
    expect(getByTestId('item-one')).toHaveAttribute('data-type', 'divided');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('reflects disabled root state for styling while disabling item triggers', () => {
    const { container, getByTestId } = render(<Accordion disabled>{renderItem('one')}</Accordion>);
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-disabled', '');
    expect(getByTestId('item-one')).toHaveAttribute('data-disabled', '');
    expect(getByTestId('trigger-one')).toBeDisabled();
  });
});

describe('Accordion — Takeoff state API', () => {
  it('uses defaultActiveIndex for uncontrolled initial state (single mode)', () => {
    const { getByTestId } = render(<Accordion defaultActiveIndex="b">{renderItems(['a', 'b', 'c'])}</Accordion>);
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('trigger-c')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not reset uncontrolled state when defaultActiveIndex changes after mount', () => {
    const { getByTestId, rerender } = render(<Accordion defaultActiveIndex="a">{renderItems(['a', 'b'])}</Accordion>);
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');

    rerender(<Accordion defaultActiveIndex="b">{renderItems(['a', 'b'])}</Accordion>);

    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'false');
  });

  it('normalizes an array activeIndex to the last item in single mode', () => {
    const { getByTestId } = render(<Accordion activeIndex={['a', 'c']}>{renderItems(['a', 'b', 'c'])}</Accordion>);
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('trigger-c')).toHaveAttribute('aria-expanded', 'true');
  });

  it('normalizes a scalar activeIndex to an active item in allowMultiple mode', () => {
    const { getByTestId } = render(
      <Accordion allowMultiple activeIndex="b">
        {renderItems(['a', 'b', 'c'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('trigger-c')).toHaveAttribute('aria-expanded', 'false');
  });

  it('lets single-mode items collapse by default (matches Takeoff Core)', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-a'));
    expect(onChange).toHaveBeenCalledWith('');
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
  });

  it('blocks single-mode collapse when preventCollapse is set', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a" preventCollapse onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-a'));
    expect(onChange).not.toHaveBeenCalled();
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');
  });

  it('treats activeIndex as controlled and forwards the Takeoff-shaped payload on change', () => {
    const onChange = vi.fn();
    const { getByTestId, rerender } = render(
      <Accordion activeIndex="a" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(getByTestId('trigger-b'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <Accordion activeIndex="b" onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
  });

  it('treats allowMultiple activeIndex as controlled and waits for the parent array update', () => {
    const onChange = vi.fn();
    const { getByTestId, rerender } = render(
      <Accordion allowMultiple activeIndex={['a']} onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );

    fireEvent.click(getByTestId('trigger-b'));

    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <Accordion allowMultiple activeIndex={['a', 'b']} onActiveIndexChange={onChange}>
        {renderItems(['a', 'b'])}
      </Accordion>,
    );
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');
  });

  it('preserves numeric itemKey shape on the onActiveIndexChange payload', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion defaultActiveIndex={0} onActiveIndexChange={onChange}>
        {renderItems([0, 1, 2])}
      </Accordion>,
    );

    fireEvent.click(getByTestId('trigger-1'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(typeof onChange.mock.calls[0]?.[0]).toBe('number');
  });

  it('emits an array payload in allowMultiple mode and toggles items independently', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion allowMultiple defaultActiveIndex={['a']} onActiveIndexChange={onChange}>
        {renderItems(['a', 'b', 'c'])}
      </Accordion>,
    );
    fireEvent.click(getByTestId('trigger-b'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);

    fireEvent.click(getByTestId('trigger-a'));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
  });

  it('does not toggle a disabled item', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion onActiveIndexChange={onChange}>
        <Accordion.Item itemKey="a" disabled data-testid="disabled-item">
          <Accordion.Header>
            <Accordion.Trigger data-testid="disabled-trigger">Disabled</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="disabled-content">Disabled body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    fireEvent.click(getByTestId('disabled-trigger'));

    expect(onChange).not.toHaveBeenCalled();
    expect(getByTestId('disabled-trigger')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('disabled-item')).toHaveAttribute('data-disabled', '');
  });

  it('does not crash when a currently active dynamic child is removed', () => {
    const { getByTestId, queryByTestId, rerender } = render(<Accordion defaultActiveIndex="b">{renderItems(['a', 'b'])}</Accordion>);
    expect(getByTestId('trigger-b')).toHaveAttribute('aria-expanded', 'true');

    rerender(<Accordion defaultActiveIndex="b">{renderItems(['a'])}</Accordion>);

    expect(queryByTestId('trigger-b')).toBeNull();
    expect(getByTestId('trigger-a')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps nested accordion state independent from its parent', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="outer">
        <Accordion.Item itemKey="outer" data-testid="outer-item">
          <Accordion.Header>
            <Accordion.Trigger data-testid="outer-trigger">Outer</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <Accordion defaultActiveIndex="inner-a">
              <Accordion.Item itemKey="inner-a">
                <Accordion.Header>
                  <Accordion.Trigger data-testid="inner-trigger-a">Inner A</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>Inner A body</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item itemKey="inner-b">
                <Accordion.Header>
                  <Accordion.Trigger data-testid="inner-trigger-b">Inner B</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>Inner B body</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    fireEvent.click(getByTestId('inner-trigger-b'));

    expect(getByTestId('outer-trigger')).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('inner-trigger-a')).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('inner-trigger-b')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion — arrow visual contract', () => {
  it('auto-renders an arrow span inside every trigger with the canonical class', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        {renderItem('a')}
        {renderItem('b')}
      </Accordion>,
    );
    const triggerA = getByTestId('trigger-a');
    const arrowA = triggerA.querySelector('.tk-accordion-item-arrow');
    expect(arrowA).not.toBeNull();
    expect(arrowA).toHaveAttribute('data-state', 'open');
    expect(arrowA).toHaveAttribute('data-position', 'right');

    const triggerB = getByTestId('trigger-b');
    expect(triggerB.querySelector('.tk-accordion-item-arrow')).toHaveAttribute('data-state', 'closed');
  });

  it('honors arrowPosition="left" and emits the matching data attribute', () => {
    const { container, getByTestId } = render(<Accordion arrowPosition="left">{renderItem('a')}</Accordion>);
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('data-arrow-position', 'left');

    const trigger = getByTestId('trigger-a');
    const arrow = trigger.querySelector('.tk-accordion-item-arrow');
    expect(arrow).toHaveAttribute('data-position', 'left');
    // When positioned left, the arrow should be the trigger's first child.
    expect(trigger.firstElementChild).toBe(arrow);
  });

  it('omits the arrow entirely when hideArrows is set', () => {
    const { getByTestId } = render(<Accordion hideArrows>{renderItem('a')}</Accordion>);
    expect(getByTestId('trigger-a').querySelector('.tk-accordion-item-arrow')).toBeNull();
  });

  it('renders custom expandIcon / collapseIcon when supplied', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="open" expandIcon={<span data-testid="expand-icon">+</span>} collapseIcon={<span data-testid="collapse-icon">-</span>}>
        {renderItem('open')}
        {renderItem('closed')}
      </Accordion>,
    );
    expect(getByTestId('trigger-open').querySelector('[data-testid="collapse-icon"]')).not.toBeNull();
    expect(getByTestId('trigger-closed').querySelector('[data-testid="expand-icon"]')).not.toBeNull();
  });
});

describe('Accordion — compound anatomy', () => {
  it('renders the canonical tk-* class and data-slot for every subcomponent', () => {
    const { container, getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        <Accordion.Item itemKey="a" data-testid="anatomy-item">
          <Accordion.Header data-testid="anatomy-header">
            <Accordion.Trigger data-testid="anatomy-trigger">Toggle</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="anatomy-content">Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveClass('tk-accordion');

    const item = getByTestId('anatomy-item');
    expect(item).toHaveClass('tk-accordion-item');
    expect(item).toHaveClass('grouped');
    expect(item).toHaveClass('default');
    expect(item).toHaveClass('base');
    expect(item).toHaveClass('open');
    expect(item).toHaveAttribute('data-slot', 'root');

    const trigger = getByTestId('anatomy-trigger');
    expect(trigger).toHaveClass('tk-accordion-item-header');
    expect(trigger.querySelector('.tk-accordion-item-title')).not.toBeNull();

    const content = getByTestId('anatomy-content');
    expect(content).toHaveClass('tk-accordion-item-content');
  });

  it('renders valid heading levels and safely falls back to h3 for invalid levels', () => {
    const { getByRole } = render(
      <Accordion>
        <Accordion.Item itemKey="valid">
          <Accordion.Header level={2}>
            <Accordion.Trigger>Valid heading</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Valid body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item itemKey="invalid">
          <Accordion.Header level={9 as never}>
            <Accordion.Trigger>Invalid heading</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Invalid body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(getByRole('heading', { level: 2, name: 'Valid heading' })).toBeInTheDocument();
    expect(getByRole('heading', { level: 3, name: 'Invalid heading' })).toBeInTheDocument();
  });

  it('exposes dotted displayName on every public subcomponent for DevTools', () => {
    expect((Accordion as unknown as { displayName?: string }).displayName).toBe('Accordion');
    expect(Accordion.Item.displayName).toBe('Accordion.Item');
    expect(Accordion.Header.displayName).toBe('Accordion.Header');
    expect(Accordion.Trigger.displayName).toBe('Accordion.Trigger');
    expect(Accordion.Content.displayName).toBe('Accordion.Content');
  });
});

describe('Accordion — takeoff-design data-open contract', () => {
  it('marks the active item and its content with data-open so [data-open] CSS rules apply', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        {renderItem('a')}
        {renderItem('b')}
      </Accordion>,
    );

    const itemA = getByTestId('item-a');
    expect(itemA).toHaveAttribute('data-open', '');
    const contentA = getByTestId('content-a');
    expect(contentA).toHaveAttribute('data-open', '');

    const itemB = getByTestId('item-b');
    expect(itemB).not.toHaveAttribute('data-open');
  });

  it('updates data-open when a new item is selected', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        {renderItem('a')}
        {renderItem('b')}
      </Accordion>,
    );

    fireEvent.click(getByTestId('trigger-b'));

    expect(getByTestId('item-a')).not.toHaveAttribute('data-open');
    expect(getByTestId('item-b')).toHaveAttribute('data-open', '');
  });

  it('flags every active item in allowMultiple mode', () => {
    const { getByTestId } = render(
      <Accordion allowMultiple defaultActiveIndex={['a', 'b']}>
        {renderItems(['a', 'b', 'c'])}
      </Accordion>,
    );

    expect(getByTestId('item-a')).toHaveAttribute('data-open', '');
    expect(getByTestId('item-b')).toHaveAttribute('data-open', '');
    expect(getByTestId('item-c')).not.toHaveAttribute('data-open');
  });

  it('keeps force-mounted closed content in the DOM without data-open', () => {
    const { getByTestId } = render(
      <Accordion>
        <Accordion.Item itemKey="a" data-testid="force-item">
          <Accordion.Header>
            <Accordion.Trigger data-testid="force-trigger">Force mounted</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount data-testid="force-content">
            Force body
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(getByTestId('force-item')).not.toHaveAttribute('data-open');
    expect(getByTestId('force-content')).toBeInTheDocument();
    expect(getByTestId('force-content')).not.toHaveAttribute('data-open');
  });
});

describe('Accordion — customization', () => {
  it('lands instance classNames and slotProps on the canonical owner node', () => {
    const { container } = render(
      <Accordion classNames={{ root: 'instance-extra' }} slotProps={{ root: { 'aria-label': 'Inst label' } }}>
        {renderItem('a')}
      </Accordion>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveClass('tk-accordion');
    expect(root).toHaveClass('instance-extra');
    expect(root).toHaveAttribute('aria-label', 'Inst label');
  });

  it('merges item className without dropping canonical or variant classes', () => {
    const { getByTestId } = render(
      <Accordion type="divided" defaultActiveIndex="a">
        <Accordion.Item itemKey="a" className="item-extra" data-testid="custom-item">
          <Accordion.Header>
            <Accordion.Trigger>Custom item</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    const item = getByTestId('custom-item');
    expect(item).toHaveClass('tk-accordion-item');
    expect(item).toHaveClass('divided');
    expect(item).toHaveClass('open');
    expect(item).toHaveClass('item-extra');
  });

  it('appends instance classNames after theme classNames so instance wins on order', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { classNames: { root: 'theme-class' } } }}>
        <Accordion classNames={{ root: 'instance-class' }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]') as HTMLElement;
    const className = root.className;
    expect(className).toContain('tk-accordion');
    expect(className.indexOf('theme-class')).toBeLessThan(className.indexOf('instance-class'));
  });

  it('lets instance slotProps override theme slotProps for non-canonical keys', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { slotProps: { root: { 'aria-label': 'theme' } } } }}>
        <Accordion slotProps={{ root: { 'aria-label': 'instance' } }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).toHaveAttribute('aria-label', 'instance');
  });

  it('never lets a theme or instance override drop the canonical data-slot', () => {
    const { container } = render(
      <SparReactProvider components={{ Accordion: { slotProps: { root: { 'data-slot': 'bogus' } as never } } }}>
        <Accordion slotProps={{ root: { 'data-slot': 'instance-bogus' } as never }}>{renderItem('a')}</Accordion>
      </SparReactProvider>,
    );
    const root = container.querySelector('[data-slot="root"]');
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-slot')).toBe('root');
  });
});

describe('Accordion — accessibility wiring', () => {
  it('wires trigger aria-expanded, aria-controls, and content role/labelling', () => {
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        {renderItem('a')}
        {renderItem('b')}
      </Accordion>,
    );

    const triggerA = getByTestId('trigger-a');
    expect(triggerA).toHaveAttribute('type', 'button');
    expect(triggerA).toHaveAttribute('aria-expanded', 'true');

    const contentA = getByTestId('content-a');
    expect(contentA).toHaveAttribute('role', 'region');
    expect(contentA).toHaveAttribute('aria-labelledby', triggerA.id);
    expect(triggerA).toHaveAttribute('aria-controls', contentA.id);

    const triggerB = getByTestId('trigger-b');
    expect(triggerB).toHaveAttribute('aria-expanded', 'false');
  });

  it('produces unique trigger/content ids across two Accordion instances', () => {
    const { getAllByRole } = render(
      <>
        <Accordion>{renderItem('a')}</Accordion>
        <Accordion>{renderItem('a')}</Accordion>
      </>,
    );
    const triggers = getAllByRole('button');
    expect(triggers).toHaveLength(2);
    expect(triggers[0]?.id).not.toBe(triggers[1]?.id);
    expect(triggers[0]?.getAttribute('aria-controls')).not.toBe(triggers[1]?.getAttribute('aria-controls'));
  });

  it('passes axe with default rendering', async () => {
    const { container } = render(<Accordion defaultActiveIndex="a">{renderItems(['a', 'b'])}</Accordion>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Accordion — keyboard interaction', () => {
  it('toggles a panel with Enter and with Space', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Accordion>{renderItems(['a', 'b'])}</Accordion>);

    const triggerA = getByTestId('trigger-a');
    triggerA.focus();
    await user.keyboard('{Enter}');
    expect(triggerA).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(triggerA).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves focus through triggers with ArrowDown/ArrowUp in vertical orientation', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Accordion>{renderItems(['a', 'b', 'c'])}</Accordion>);

    const triggerA = getByTestId('trigger-a');
    const triggerB = getByTestId('trigger-b');
    const triggerC = getByTestId('trigger-c');

    triggerA.focus();
    await user.keyboard('{ArrowDown}');
    expect(triggerB).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(triggerC).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(triggerB).toHaveFocus();
  });

  it('moves focus with ArrowRight/ArrowLeft in horizontal orientation', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Accordion orientation="horizontal">{renderItems(['a', 'b'])}</Accordion>);

    const triggerA = getByTestId('trigger-a');
    const triggerB = getByTestId('trigger-b');

    triggerA.focus();
    await user.keyboard('{ArrowRight}');
    expect(triggerB).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(triggerA).toHaveFocus();
  });

  it('jumps to first/last trigger with Home/End', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Accordion>{renderItems(['a', 'b', 'c'])}</Accordion>);

    const triggerA = getByTestId('trigger-a');
    const triggerB = getByTestId('trigger-b');
    const triggerC = getByTestId('trigger-c');

    triggerB.focus();
    await user.keyboard('{Home}');
    expect(triggerA).toHaveFocus();

    await user.keyboard('{End}');
    expect(triggerC).toHaveFocus();
  });

  it('does not toggle a disabled item via keyboard activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion onActiveIndexChange={onChange}>
        <Accordion.Item itemKey="a" disabled>
          <Accordion.Header>
            <Accordion.Trigger data-testid="disabled-trigger">Disabled</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const trigger = getByTestId('disabled-trigger');
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion — ref forwarding', () => {
  it('exposes object refs on every public part with the canonical owner element', () => {
    const rootRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLHeadingElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Accordion ref={rootRef} defaultActiveIndex="a">
        <Accordion.Item itemKey="a" ref={itemRef}>
          <Accordion.Header ref={headerRef} level={2}>
            <Accordion.Trigger ref={triggerRef}>Title</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content ref={contentRef}>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(itemRef.current).toBeInstanceOf(HTMLDivElement);
    expect(headerRef.current).toBeInstanceOf(HTMLHeadingElement);
    expect(headerRef.current?.tagName).toBe('H2');
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('invokes callback refs for every public part', () => {
    const rootCb = vi.fn();
    const itemCb = vi.fn();
    const triggerCb = vi.fn();
    const contentCb = vi.fn();

    render(
      <Accordion ref={rootCb} defaultActiveIndex="a">
        <Accordion.Item itemKey="a" ref={itemCb}>
          <Accordion.Header>
            <Accordion.Trigger ref={triggerCb}>Title</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content ref={contentCb}>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(rootCb).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(itemCb).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(triggerCb).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    expect(contentCb).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('keeps internal trigger registry working when consumer also passes a ref', async () => {
    // If the consumer ref clobbered the internal trigger registry, ArrowDown
    // would have nothing to focus. This test pins that contract.
    const user = userEvent.setup();
    const ConsumerRefHarness = () => {
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <Accordion>
          <Accordion.Item itemKey="a">
            <Accordion.Header>
              <Accordion.Trigger ref={triggerRef} data-testid="trigger-a">
                A
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>A body</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item itemKey="b">
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger-b">B</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>B body</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    };
    const { getByTestId } = render(<ConsumerRefHarness />);

    const triggerA = getByTestId('trigger-a');
    triggerA.focus();
    await user.keyboard('{ArrowDown}');
    expect(getByTestId('trigger-b')).toHaveFocus();
  });
});

describe('Accordion — passthrough composition', () => {
  it('composes consumer onClick with internal toggle on the trigger', () => {
    const consumerClick = vi.fn();
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Accordion onActiveIndexChange={onChange}>
        <Accordion.Item itemKey="a">
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger-a" onClick={consumerClick}>
              A
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>A body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    fireEvent.click(getByTestId('trigger-a'));
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('composes consumer onKeyDown with internal arrow-key navigation', async () => {
    const user = userEvent.setup();
    const consumerKeyDown = vi.fn();
    const { getByTestId } = render(
      <Accordion>
        <Accordion.Item itemKey="a">
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger-a" onKeyDown={consumerKeyDown}>
              A
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>A body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item itemKey="b">
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger-b">B</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>B body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    getByTestId('trigger-a').focus();
    await user.keyboard('{ArrowDown}');

    // Consumer handler still fires; internal navigation moves focus to the next trigger.
    expect(consumerKeyDown).toHaveBeenCalled();
    expect(getByTestId('trigger-b')).toHaveFocus();
  });

  it('lets consumers stamp a stable id by setting it on Accordion.Item, keeping aria wiring consistent', () => {
    // The supported way to give the trigger/content stable ids is to set
    // `id` on `Accordion.Item`. Spar derives `${id}-trigger` and
    // `${id}-content` from that and threads both through the Collapsible
    // context, so aria-labelledby and aria-controls stay in sync.
    const { getByTestId } = render(
      <Accordion defaultActiveIndex="a">
        <Accordion.Item id="faq-1" itemKey="a">
          <Accordion.Header>
            <Accordion.Trigger data-testid="trigger-a">A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="content-a">A body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const trigger = getByTestId('trigger-a');
    const content = getByTestId('content-a');
    expect(trigger.id).toBe('faq-1-trigger');
    expect(content.id).toBe('faq-1-content');
    expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
  });

  it('forwards data-* and aria-* on every part', () => {
    const { getByTestId } = render(
      <Accordion data-testid="root" data-analytics="acc-root" aria-label="FAQ" defaultActiveIndex="a">
        <Accordion.Item itemKey="a" data-testid="item" data-analytics="acc-item">
          <Accordion.Header data-testid="header">
            <Accordion.Trigger data-testid="trigger" data-analytics="acc-trigger" aria-describedby="hint">
              A
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="content" data-analytics="acc-content">
            Body
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(getByTestId('root')).toHaveAttribute('aria-label', 'FAQ');
    expect(getByTestId('root')).toHaveAttribute('data-analytics', 'acc-root');
    expect(getByTestId('item')).toHaveAttribute('data-analytics', 'acc-item');
    expect(getByTestId('trigger')).toHaveAttribute('data-analytics', 'acc-trigger');
    expect(getByTestId('trigger')).toHaveAttribute('aria-describedby', 'hint');
    expect(getByTestId('content')).toHaveAttribute('data-analytics', 'acc-content');
  });
});

describe('Accordion — robustness', () => {
  it('renders an empty Accordion without crashing', () => {
    const { container } = render(<Accordion />);
    expect(container.querySelector('[data-slot="root"]')).toHaveClass('tk-accordion');
  });

  it('survives an item being added after mount and toggling it', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [items, setItems] = useState(['a']);
      return (
        <>
          <button type="button" data-testid="add" onClick={() => setItems(prev => [...prev, 'b'])}>
            Add
          </button>
          <Accordion>{items.map(k => renderItem(k))}</Accordion>
        </>
      );
    };
    const { getByTestId, queryByTestId } = render(<Harness />);

    expect(queryByTestId('trigger-b')).toBeNull();
    await user.click(getByTestId('add'));

    const triggerB = getByTestId('trigger-b');
    await user.click(triggerB);
    expect(triggerB).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion — SSR safety', () => {
  it('renders to a string with default props', () => {
    const html = renderToString(
      <Accordion defaultActiveIndex="a">
        {renderItem('a')}
        {renderItem('b')}
      </Accordion>,
    );
    expect(html).toContain('tk-accordion');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-open=""');
  });

  it('renders force-mounted closed content during SSR without crashing', () => {
    const html = renderToString(
      <Accordion>
        <Accordion.Item itemKey="a">
          <Accordion.Header>
            <Accordion.Trigger>Title</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );
    expect(html).toContain('Body');
  });
});
